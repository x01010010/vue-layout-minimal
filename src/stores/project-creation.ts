/**
 * Pinia store for Project Creation form state management
 * Handles form data, navigation, validation, draft persistence, and API execution
 */

import { defineStore } from 'pinia'
import { ref, computed, reactive, readonly } from 'vue'
import DraftManager from '../services/draft-manager'
import type {
  ProjectFormData,
  ProjectCreationState,
  NavigationState,
  StepValidationResult,
  GlobalValidationResult,
  DraftState,
  ExecutionState,
  StepDefinition,
  ProjectCreationDraft,
  DraftRestorationOptions,
  ProjectCreationResult,
  ExecutionOptions,
  ProgressEvent,
  ConnectionTestResult,
  DatabaseConfig,
  ProjectCreationConfig
} from '../types/project-creation'

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_CONFIG: ProjectCreationConfig = {
  enabledSteps: [1, 2, 3, 4],
  defaultStep: 1,
  stepDefinitions: [
    {
      id: 1,
      title: 'Project Basics',
      subtitle: 'Name, description, and type',
      icon: 'mdi-folder-outline',
      component: 'StepProjectBasics',
      required: true,
      completed: false,
      valid: false
    },
    {
      id: 2,
      title: 'Database Configuration',
      subtitle: 'Connection and schema setup',
      icon: 'mdi-database',
      component: 'StepDatabaseConfig',
      required: true,
      completed: false,
      valid: false
    },
    {
      id: 3,
      title: 'Parameters',
      subtitle: 'Dynamic configuration',
      icon: 'mdi-cog',
      component: 'StepDynamicParams',
      required: false,
      completed: false,
      valid: true
    },
    {
      id: 4,
      title: 'Review & Execute',
      subtitle: 'Finalize and create project',
      icon: 'mdi-check-circle',
      component: 'StepReviewExecute',
      required: true,
      completed: false,
      valid: false
    }
  ],
  validateOnChange: true,
  validateOnStepChange: true,
  autoSaveInterval: 30000, // 30 seconds
  maxDrafts: 10,
  draftStorageKey: 'vue-layout-project-creation-drafts',
  defaultTimeout: 300000, // 5 minutes
  maxRetries: 3,
  showStepNumbers: true,
  allowStepSkipping: false,
  showProgressBar: true,
  horizontalLayout: true
}

// =============================================================================
// Default Form Data
// =============================================================================

const createDefaultFormData = (): ProjectFormData => ({
  basics: {
    name: '',
    description: '',
    type: 'web-app',
    template: '',
    tags: []
  },
  database: {
    type: 'none',
    connectionString: '',
    schema: '',
    options: {
      ssl: false,
      poolSize: 10,
      timeout: 30000,
      charset: 'utf8',
      timezone: 'UTC'
    }
  },
  parameters: {},
  metadata: {
    version: '1.0.0',
    author: '',
    license: 'MIT',
    repository: '',
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
})

// =============================================================================
// Store Definition
// =============================================================================

export const useProjectCreationStore = defineStore('projectCreation', () => {
  // Configuration
  const config = reactive<ProjectCreationConfig>(DEFAULT_CONFIG)

  // Form Data
  const formData = reactive<ProjectFormData>(createDefaultFormData())

  // Navigation State
  const navigation = reactive<NavigationState>({
    currentStep: 1,
    completedSteps: [],
    totalSteps: config.stepDefinitions.length,
    canNavigateBack: false,
    canNavigateForward: false
  })

  // Validation State
  const validation = reactive({
    stepValidation: {} as Record<number, StepValidationResult>,
    globalValidation: {
      valid: false,
      completedSteps: [],
      totalErrors: 0,
      totalWarnings: 0,
      canProceed: false
    } as GlobalValidationResult,
    isDirty: false
  })

  // Enhanced Draft State
  const draft = reactive<DraftState & {
    saving: boolean
    saveError: string | null
    lastSaveAttempt: number
    saveStatus: 'idle' | 'saving' | 'saved' | 'error'
    currentDraftId: string | null
    availableDrafts: any[]
    storageInfo: any
  }>({
    hasDraft: false,
    lastSaved: 0,
    autoSaveEnabled: true,
    autoSaveInterval: config.autoSaveInterval,
    saving: false,
    saveError: null,
    lastSaveAttempt: 0,
    saveStatus: 'idle',
    currentDraftId: null,
    availableDrafts: [],
    storageInfo: null
  })

  // Execution State
  const execution = reactive<ExecutionState>({
    status: 'idle',
    progress: 0,
    message: '',
    result: undefined,
    error: undefined
  })

  // Enhanced Auto-save Management
  let autoSaveTimer: number | null = null
  let debounceTimer: number | null = null
  const draftManager = new DraftManager({
    storageKey: config.draftStorageKey,
    maxDrafts: config.maxDrafts,
    compressionEnabled: true,
    crossTabSyncEnabled: true
  })

  // =============================================================================
  // Computed Properties (Getters)
  // =============================================================================

  const currentStepDefinition = computed(() => 
    config.stepDefinitions.find(step => step.id === navigation.currentStep)
  )

  const canNavigateToStep = computed(() => (stepId: number) => {
    if (stepId < 1 || stepId > navigation.totalSteps) return false
    if (stepId <= navigation.currentStep) return true
    
    // Check if all previous required steps are completed
    for (let i = 1; i < stepId; i++) {
      const stepDef = config.stepDefinitions.find(s => s.id === i)
      if (stepDef?.required && !navigation.completedSteps.includes(i)) {
        return false
      }
    }
    return true
  })

  const highestValidStep = computed(() => {
    let highest = 1
    for (const stepId of navigation.completedSteps) {
      if (stepId > highest) highest = stepId
    }
    return Math.min(highest + 1, navigation.totalSteps)
  })

  const isFormValid = computed(() => validation.globalValidation.valid)

  const canExecuteProject = computed(() => 
    isFormValid.value && 
    execution.status === 'idle' &&
    navigation.completedSteps.length >= config.stepDefinitions.filter(s => s.required).length
  )

  // =============================================================================
  // Navigation Actions
  // =============================================================================

  function goToStep(stepId: number): void {
    if (!canNavigateToStep.value(stepId)) {
      console.warn(`Cannot navigate to step ${stepId}`)
      return
    }

    navigation.currentStep = stepId
    updateNavigationState()
  }

  function nextStep(): void {
    if (navigation.currentStep < navigation.totalSteps) {
      goToStep(navigation.currentStep + 1)
    }
  }

  function previousStep(): void {
    if (navigation.currentStep > 1) {
      goToStep(navigation.currentStep - 1)
    }
  }

  function updateNavigationState(): void {
    navigation.canNavigateBack = navigation.currentStep > 1
    navigation.canNavigateForward = canNavigateToStep.value(navigation.currentStep + 1)
  }

  // =============================================================================
  // Form Data Actions
  // =============================================================================

  function updateFormData<T extends keyof ProjectFormData>(
    section: T, 
    data: Partial<ProjectFormData[T]>
  ): void {
    Object.assign(formData[section], data)
    formData.metadata.updatedAt = Date.now()
    validation.isDirty = true

    if (config.validateOnChange) {
      validateCurrentStep()
    }

    if (draft.autoSaveEnabled) {
      scheduleAutoSave()
    }
  }

  function resetForm(): void {
    Object.assign(formData, createDefaultFormData())
    navigation.currentStep = 1
    navigation.completedSteps = []
    validation.stepValidation = {}
    validation.isDirty = false
    clearAutoSave()
    updateNavigationState()
  }

  // =============================================================================
  // Validation Actions
  // =============================================================================

  async function validateStep(stepId: number): Promise<boolean> {
    // This is a placeholder implementation
    // In a real application, this would contain actual validation logic
    const stepDef = config.stepDefinitions.find(s => s.id === stepId)
    if (!stepDef) return false

    let isValid = true
    const errors: any[] = []
    const warnings: any[] = []

    // Basic validation based on step
    switch (stepId) {
      case 1: // Project Basics
        if (!formData.basics.name.trim()) {
          errors.push({
            field: 'name',
            message: 'Project name is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        if (!formData.basics.description.trim()) {
          warnings.push({
            field: 'description',
            message: 'Project description is recommended',
            code: 'RECOMMENDED'
          })
        }
        break

      case 2: // Database Configuration
        if (!formData.database.connectionString.trim()) {
          errors.push({
            field: 'connectionString',
            message: 'Database connection string is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        break

      case 3: // Parameters (optional step)
        isValid = true
        break

      case 4: // Review & Execute
        isValid = validation.globalValidation.valid
        break
    }

    const result: StepValidationResult = {
      valid: isValid,
      errors,
      warnings,
      touched: true
    }

    validation.stepValidation[stepId] = result
    
    // Update step definition
    stepDef.valid = isValid
    if (isValid && !navigation.completedSteps.includes(stepId)) {
      navigation.completedSteps.push(stepId)
      stepDef.completed = true
    }

    updateGlobalValidation()
    updateNavigationState()

    return isValid
  }

  async function validateCurrentStep(): Promise<boolean> {
    return validateStep(navigation.currentStep)
  }

  async function validateForm(): Promise<boolean> {
    let allValid = true
    
    for (const stepDef of config.stepDefinitions) {
      if (stepDef.required) {
        const isValid = await validateStep(stepDef.id)
        if (!isValid) allValid = false
      }
    }

    return allValid
  }

  function updateGlobalValidation(): void {
    const completedRequired = config.stepDefinitions
      .filter(s => s.required)
      .every(s => navigation.completedSteps.includes(s.id))

    const totalErrors = Object.values(validation.stepValidation)
      .reduce((sum, step) => sum + step.errors.length, 0)

    const totalWarnings = Object.values(validation.stepValidation)
      .reduce((sum, step) => sum + step.warnings.length, 0)

    validation.globalValidation = {
      valid: completedRequired && totalErrors === 0,
      completedSteps: [...navigation.completedSteps],
      totalErrors,
      totalWarnings,
      canProceed: completedRequired
    }
  }

  function getStepValidation(stepId: number): StepValidationResult {
    return validation.stepValidation[stepId] || {
      valid: false,
      errors: [],
      warnings: [],
      touched: false
    }
  }

  // =============================================================================
  // Enhanced Draft Management Actions
  // =============================================================================

  function scheduleAutoSave(): void {
    // Clear existing timers
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    
    // Debounce rapid changes (2 seconds)
    debounceTimer = window.setTimeout(() => {
      if (validation.isDirty && draft.autoSaveEnabled) {
        performAutoSave()
      }
    }, 2000)
    
    // Fallback timer for periodic saves
    autoSaveTimer = window.setTimeout(() => {
      if (validation.isDirty && draft.autoSaveEnabled) {
        performAutoSave()
      }
    }, draft.autoSaveInterval)
  }

  async function performAutoSave(): Promise<void> {
    if (draft.saving) return // Prevent concurrent saves
    
    try {
      draft.saving = true
      draft.saveStatus = 'saving'
      draft.lastSaveAttempt = Date.now()
      draft.saveError = null

      const draftId = await draftManager.saveDraft(
        formData,
        {
          currentStep: navigation.currentStep,
          totalSteps: navigation.totalSteps
        },
        {
          title: formData.basics.name || 'Untitled Project',
          description: formData.basics.description,
          draftId: draft.currentDraftId || undefined
        }
      )

      draft.currentDraftId = draftId
      draft.lastSaved = Date.now()
      draft.hasDraft = true
      draft.saveStatus = 'saved'
      validation.isDirty = false

      // Update available drafts list
      await refreshDraftsList()
      
    } catch (error) {
      draft.saveError = error instanceof Error ? error.message : 'Unknown error'
      draft.saveStatus = 'error'
      console.error('Auto-save failed:', error)
    } finally {
      draft.saving = false
    }
  }

  function clearAutoSave(): void {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      autoSaveTimer = null
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }

  async function saveDraftToStorage(title?: string, description?: string): Promise<string> {
    try {
      draft.saving = true
      draft.saveStatus = 'saving'
      draft.saveError = null

      const draftId = await draftManager.saveDraft(
        formData,
        {
          currentStep: navigation.currentStep,
          totalSteps: navigation.totalSteps
        },
        {
          title: title || formData.basics.name || 'Untitled Project',
          description: description || formData.basics.description,
          draftId: draft.currentDraftId || undefined
        }
      )

      draft.currentDraftId = draftId
      draft.lastSaved = Date.now()
      draft.hasDraft = true
      draft.saveStatus = 'saved'
      validation.isDirty = false

      await refreshDraftsList()
      return draftId
      
    } catch (error) {
      draft.saveError = error instanceof Error ? error.message : 'Unknown error'
      draft.saveStatus = 'error'
      throw error
    } finally {
      draft.saving = false
    }
  }

  async function getDraftsFromStorage(): Promise<any[]> {
    try {
      return await draftManager.getDraftMetadata()
    } catch (error) {
      console.warn('Failed to load drafts:', error)
      return []
    }
  }

  async function loadDraft(draftId: string, options: DraftRestorationOptions = {
    restoreFormData: true,
    restoreStepPosition: true,
    mergeWithCurrent: false
  }): Promise<void> {
    try {
      const draftData = await draftManager.loadDraft(draftId, options)
      
      if (options.restoreFormData) {
        if (options.mergeWithCurrent) {
          // Merge logic - preserve existing data where new data is empty
          Object.keys(draftData.formData).forEach(key => {
            const section = key as keyof ProjectFormData
            Object.assign(formData[section], draftData.formData[section])
          })
        } else {
          Object.assign(formData, draftData.formData)
        }
      }

      if (options.restoreStepPosition) {
        navigation.currentStep = draftData.navigationState.currentStep
      }

      draft.currentDraftId = draftId
      validation.isDirty = false
      updateNavigationState()
      
      // Refresh validation after loading
      await validateCurrentStep()
      
    } catch (error) {
      console.error('Failed to load draft:', error)
      throw error
    }
  }

  async function deleteDraft(draftId: string): Promise<void> {
    try {
      await draftManager.deleteDraft(draftId)
      
      // Clear current draft if it was deleted
      if (draft.currentDraftId === draftId) {
        draft.currentDraftId = null
        draft.hasDraft = false
      }
      
      await refreshDraftsList()
    } catch (error) {
      console.warn('Failed to delete draft:', error)
      throw error
    }
  }

  async function refreshDraftsList(): Promise<void> {
    try {
      draft.availableDrafts = await draftManager.getDraftMetadata()
      draft.storageInfo = await draftManager.getStorageInfo()
    } catch (error) {
      console.warn('Failed to refresh drafts list:', error)
    }
  }

  async function exportDraft(draftId: string, format: 'json' | 'compressed' | 'encrypted' = 'json'): Promise<string> {
    return await draftManager.exportDraft(draftId, {
      format,
      includeVersions: true,
      includeMetadata: true
    })
  }

  async function importDraft(data: string, format: 'json' | 'compressed' | 'encrypted' = 'json'): Promise<string> {
    const draftId = await draftManager.importDraft(data, format)
    await refreshDraftsList()
    return draftId
  }

  function enableAutoSave(): void {
    draft.autoSaveEnabled = true
    if (validation.isDirty) {
      scheduleAutoSave()
    }
  }

  function disableAutoSave(): void {
    draft.autoSaveEnabled = false
    clearAutoSave()
  }

  function triggerManualSave(): Promise<string> {
    return saveDraftToStorage()
  }

  // =============================================================================
  // Execution Actions
  // =============================================================================

  async function executeProject(
    options: Partial<ExecutionOptions> = {}
  ): Promise<ProjectCreationResult> {
    if (!canExecuteProject.value) {
      throw new Error('Cannot execute project: form is not valid')
    }

    const execOptions: ExecutionOptions = {
      timeout: options.timeout || config.defaultTimeout,
      retryAttempts: options.retryAttempts || config.maxRetries,
      retryDelay: options.retryDelay || 1000,
      validateBeforeExecution: options.validateBeforeExecution ?? true
    }

    execution.status = 'preparing'
    execution.progress = 0
    execution.message = 'Preparing project creation...'

    try {
      if (execOptions.validateBeforeExecution) {
        const isValid = await validateForm()
        if (!isValid) {
          throw new Error('Form validation failed')
        }
      }

      execution.status = 'executing'
      execution.message = 'Creating project...'

      // Simulate API call with progress updates
      for (let i = 0; i <= 100; i += 10) {
        execution.progress = i
        execution.message = `Creating project... ${i}%`
        await new Promise(resolve => setTimeout(resolve, 200))
      }

      const result: ProjectCreationResult = {
        projectId: `project-${Date.now()}`,
        status: 'created',
        url: `https://example.com/projects/project-${Date.now()}`,
        metadata: {
          createdAt: Date.now(),
          duration: 2000,
          steps: [
            {
              name: 'Validation',
              status: 'completed',
              startTime: Date.now() - 2000,
              endTime: Date.now() - 1800,
              duration: 200,
              message: 'Form validation completed'
            },
            {
              name: 'Project Creation',
              status: 'completed',
              startTime: Date.now() - 1800,
              endTime: Date.now(),
              duration: 1800,
              message: 'Project created successfully'
            }
          ]
        }
      }

      execution.status = 'success'
      execution.result = result
      execution.message = 'Project created successfully!'

      return result
    } catch (error) {
      execution.status = 'error'
      execution.error = error as Error
      execution.message = `Failed to create project: ${(error as Error).message}`
      throw error
    }
  }

  function cancelExecution(): void {
    execution.status = 'cancelled'
    execution.message = 'Project creation cancelled'
  }

  function clearExecutionResult(): void {
    execution.status = 'idle'
    execution.progress = 0
    execution.message = ''
    execution.result = undefined
    execution.error = undefined
  }

  // =============================================================================
  // Database Testing
  // =============================================================================

  async function testDatabaseConnection(config: DatabaseConfig): Promise<ConnectionTestResult> {
    // Simulate database connection test
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (!config.connectionString.trim()) {
      return {
        success: false,
        message: 'Connection string is required',
        error: 'MISSING_CONNECTION_STRING'
      }
    }

    // Simulate successful connection
    return {
      success: true,
      message: 'Database connection successful',
      details: {
        latency: 45,
        version: '14.2',
        features: ['SSL', 'Transactions', 'JSON']
      }
    }
  }

  // =============================================================================
  // Initialization and Cleanup
  // =============================================================================

  async function initializeStore(): Promise<void> {
    try {
      // Check for existing drafts
      const drafts = await getDraftsFromStorage()
      draft.hasDraft = drafts.length > 0
      draft.availableDrafts = drafts

      // Get storage info
      draft.storageInfo = await draftManager.getStorageInfo()

      // Initialize auto-save if enabled
      if (draft.autoSaveEnabled) {
        scheduleAutoSave()
      }

      updateNavigationState()
      console.log('Project Creation Store initialized')
    } catch (error) {
      console.warn('Failed to initialize store:', error)
    }
  }

  function cleanupStore(): void {
    clearAutoSave()
    console.log('Project Creation Store cleaned up')
  }

  // =============================================================================
  // Store Return Object
  // =============================================================================

  return {
    // State (readonly)
    formData: readonly(formData),
    navigation: readonly(navigation),
    validation: readonly(validation),
    draft: readonly(draft),
    execution: readonly(execution),
    config: readonly(config),

    // Computed properties
    currentStepDefinition,
    canNavigateToStep,
    highestValidStep,
    isFormValid,
    canExecuteProject,

    // Navigation actions
    goToStep,
    nextStep,
    previousStep,

    // Form actions
    updateFormData,
    resetForm,

    // Validation actions
    validateStep,
    validateCurrentStep,
    validateForm,
    getStepValidation,

    // Enhanced Draft actions
    saveDraftToStorage,
    loadDraft,
    deleteDraft,
    getDraftsFromStorage,
    refreshDraftsList,
    exportDraft,
    importDraft,
    enableAutoSave,
    disableAutoSave,
    triggerManualSave,

    // Execution actions
    executeProject,
    cancelExecution,
    clearExecutionResult,

    // Database actions
    testDatabaseConnection,

    // Lifecycle
    initializeStore,
    cleanupStore
  }
})