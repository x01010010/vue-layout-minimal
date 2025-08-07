/**
 * Pinia store for Project Creation form state management
 * Handles form data, navigation, validation, draft persistence, and API execution
 */

import { defineStore } from 'pinia'
import { ref, computed, reactive, readonly } from 'vue'
import DraftManager from '../services/draft-manager'
import type {
  NewProjectFormData,
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
  ProjectCreationConfig,
  ConditionalNavigation,
  NavigationContext
} from '../types/project-creation'

// =============================================================================
// Default Configuration
// =============================================================================

const DEFAULT_CONFIG: ProjectCreationConfig = {
  enabledSteps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  defaultStep: 1,
  stepDefinitions: [
    {
      id: 1,
      title: 'General Info',
      subtitle: 'Project name, owner, and description',
      icon: 'mdi-information-outline',
      component: 'StepGeneralInfo',
      required: true,
      completed: false,
      valid: false
    },
    {
      id: 2,
      title: 'Setup Type',
      subtitle: 'Choose OAD or Classic approach',
      icon: 'mdi-cog-outline',
      component: 'StepSetupType',
      required: true,
      completed: false,
      valid: false
    },
    {
      id: 3,
      title: 'Database Selection',
      subtitle: 'Choose existing or create new database',
      icon: 'mdi-database-outline',
      component: 'StepDatabaseSelection',
      required: true,
      completed: false,
      valid: false
    },
    {
      id: 3.5, // Step 3a - conditional step
      title: 'New Database',
      subtitle: 'Configure new database creation',
      icon: 'mdi-database-plus',
      component: 'StepNewDatabase',
      required: false, // Conditional requirement
      completed: false,
      valid: false
    },
    {
      id: 4,
      title: 'Environments',
      subtitle: 'Select target environments',
      icon: 'mdi-server-network',
      component: 'StepEnvironments',
      required: true,
      completed: false,
      valid: false
    },
    {
      id: 5,
      title: 'Database Authorization',
      subtitle: 'QA and Production authentication',
      icon: 'mdi-key-variant',
      component: 'StepDatabaseAuth',
      required: true,
      completed: false,
      valid: false
    },
    {
      id: 6,
      title: 'Notifications',
      subtitle: 'Support group and email setup',
      icon: 'mdi-bell-outline',
      component: 'StepNotifications',
      required: true,
      completed: false,
      valid: false
    },
    {
      id: 7,
      title: 'GitHub Setup',
      subtitle: 'Repository and team configuration',
      icon: 'mdi-github',
      component: 'StepGitHub',
      required: true,
      completed: false,
      valid: false
    },
    {
      id: 8,
      title: 'Entitlements',
      subtitle: 'Ownership assignment',
      icon: 'mdi-account-key',
      component: 'StepEntitlements',
      required: true,
      completed: false,
      valid: false
    },
    {
      id: 9,
      title: 'Review & Create',
      subtitle: 'Final review and project creation',
      icon: 'mdi-check-circle-outline',
      component: 'StepReviewCreate',
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


const createDefaultNewProjectFormData = (): NewProjectFormData => ({
  generalInfo: {
    name: '',
    owner: '',
    description: '',
    tags: []
  },
  setupType: {
    setupType: 'OAD'
  },
  databaseSelection: {
    createNewDatabase: false
  },
  environments: {
    environments: ['DEV']
  },
  databaseAuth: {
    qaAuth: {
      method: 'service_account'
    },
    prodAuth: {
      method: 'service_account'
    }
  },
  notifications: {
    supportGroup: '',
    primaryContactEmail: '',
    secondaryContactEmail: '',
    notificationEvents: [],
    escalationLevel: 'medium',
    communicationChannels: ['email'],
    emailDistribution: ''
  },
  github: {
    githubTeam: '',
    repositoryName: '',
    privateRepo: true
  },
  entitlements: {
    entitlementOwner: '',
    technicalOwner: ''
  },
  review: {
    reviewed: false
  }
})

// =============================================================================
// Store Definition
// =============================================================================

export const useProjectCreationStore = defineStore('projectCreation', () => {
  // Configuration
  const config = reactive<ProjectCreationConfig>(DEFAULT_CONFIG)

  // Form Data (9-step workflow)
  const newFormData = reactive<NewProjectFormData>(createDefaultNewProjectFormData())

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

  const canExecuteProject = computed(() => {
    // Get all steps that are currently visible and required
    const requiredVisibleSteps = visibleSteps.value.filter(step => {
      // Step 3.5 is only required if it's visible
      if (step.id === 3.5) {
        return shouldShowStep3a.value
      }
      return step.required
    })

    // Check if all of these required steps are marked as valid
    const allRequiredStepsValid = requiredVisibleSteps.every(step => step.valid)

    console.log('canExecuteProject check:', {
      allRequiredStepsValid,
      executionStatus: execution.status,
      requiredSteps: visibleSteps.value.filter(step => step.required).map(step => ({
        id: step.id,
        valid: step.valid,
        completed: step.completed
      }))
    })
    return allRequiredStepsValid && execution.status === 'idle'
  })

  // =============================================================================
  // Conditional Navigation Logic
  // =============================================================================

  // Determine if Step 3a should be visible based on database selection
  const shouldShowStep3a = computed(() =>
    newFormData.databaseSelection?.createNewDatabase === true
  )

  // Get visible steps (filtering out Step 3a when not needed)
  const visibleSteps = computed(() =>
    config.stepDefinitions.filter(step =>
      step.id !== 3.5 || shouldShowStep3a.value
    )
  )

  // Get current step index within visible steps
  const currentStepIndex = computed(() =>
    visibleSteps.value.findIndex(step => step.id === navigation.currentStep)
  )

  // Get total count of visible steps
  const totalVisibleSteps = computed(() => visibleSteps.value.length)

  // Check if current step can proceed (validation + conditional logic)
  const canProceed = computed(() => {
    const currentStep = visibleSteps.value[currentStepIndex.value]
    if (!currentStep) return false
    
    // Step 3a is only required if it's visible
    if (currentStep.id === 3.5) {
      return shouldShowStep3a.value && currentStep.valid
    }
    
    return currentStep.required ? currentStep.valid : true
  })

  // =============================================================================
  // Navigation Actions
  // =============================================================================

  function goToStep(stepId: number): void {
    // Check if the step exists in visible steps
    const targetStep = visibleSteps.value.find(step => step.id === stepId)
    if (!targetStep) {
      console.warn(`Cannot navigate to step ${stepId} - step not visible`)
      return
    }

    if (!canNavigateToStep.value(stepId)) {
      console.warn(`Cannot navigate to step ${stepId} - navigation not allowed`)
      return
    }

    navigation.currentStep = stepId
    updateNavigationState()
  }

  function nextStep(): void {
    const currentIndex = currentStepIndex.value
    if (currentIndex >= 0 && currentIndex < visibleSteps.value.length - 1) {
      const nextStepId = visibleSteps.value[currentIndex + 1].id
      goToStep(nextStepId)
    }
  }

  function previousStep(): void {
    const currentIndex = currentStepIndex.value
    if (currentIndex > 0) {
      const prevStepId = visibleSteps.value[currentIndex - 1].id
      goToStep(prevStepId)
    }
  }

  function updateNavigationState(): void {
    const currentIndex = currentStepIndex.value
    navigation.canNavigateBack = currentIndex > 0
    navigation.canNavigateForward = currentIndex >= 0 && currentIndex < visibleSteps.value.length - 1
    
    // Update total steps to reflect visible steps
    navigation.totalSteps = totalVisibleSteps.value
  }

  // =============================================================================
  // Form Data Actions
  // =============================================================================

  function updateNewFormData<T extends keyof NewProjectFormData>(
    section: T,
    data: Partial<NewProjectFormData[T]>
  ): void {
    if (newFormData[section]) {
      Object.assign(newFormData[section], data)
    } else {
      // If the section doesn't exist, create it. This is crucial for conditional steps
      // like NewDatabase, which aren't in the initial state.
      (newFormData as any)[section] = data;
    }
    validation.isDirty = true

    if (config.validateOnChange) {
      // Debounce validation to prevent rapid re-renders
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = window.setTimeout(() => {
        validateCurrentStep()
      }, 500) // 500ms debounce delay
    }

    if (draft.autoSaveEnabled) {
      scheduleAutoSave()
    }
  }

  function resetForm(): void {
    Object.assign(newFormData, createDefaultNewProjectFormData())
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
    const stepDef = config.stepDefinitions.find(s => s.id === stepId)
    if (!stepDef) return false

    let isValid = true
    const errors: any[] = []
    const warnings: any[] = []

    // Validation logic for new 9-step workflow
    switch (stepId) {
      case 1: // General Info
        if (!newFormData.generalInfo.name.trim()) {
          errors.push({
            field: 'name',
            message: 'Project name is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        if (!newFormData.generalInfo.owner.trim()) {
          errors.push({
            field: 'owner',
            message: 'Project owner is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        if (!newFormData.generalInfo.description.trim()) {
          warnings.push({
            field: 'description',
            message: 'Project description is recommended',
            code: 'RECOMMENDED'
          })
        }
        break

      case 2: // Setup Type
        if (!newFormData.setupType.setupType) {
          errors.push({
            field: 'setupType',
            message: 'Setup type selection is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        break

      case 3: // Database Selection
        if (newFormData.databaseSelection.createNewDatabase === undefined) {
          errors.push({
            field: 'createNewDatabase',
            message: 'Database selection is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        if (!newFormData.databaseSelection.createNewDatabase && !newFormData.databaseSelection.existingDatabase?.trim()) {
          errors.push({
            field: 'existingDatabase',
            message: 'Existing database name is required when not creating new database',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        break

      case 3.5: // New Database (conditional)
        if (shouldShowStep3a.value) {
          if (!newFormData.newDatabase?.businessArea) {
            errors.push({
              field: 'businessArea',
              message: 'Business area is required',
              code: 'REQUIRED',
              severity: 'error'
            })
            isValid = false
          }
          if (!newFormData.newDatabase?.environments?.length) {
            errors.push({
              field: 'environments',
              message: 'At least one environment is required',
              code: 'REQUIRED',
              severity: 'error'
            })
            isValid = false
          }
          if (!newFormData.newDatabase?.databases?.length) {
            errors.push({
              field: 'databases',
              message: 'At least one database configuration is required',
              code: 'REQUIRED',
              severity: 'error'
            })
            isValid = false
          } else {
            // Validate each database configuration
            newFormData.newDatabase.databases.forEach((database, dbIndex) => {
              if (!database.name?.trim()) {
                errors.push({
                  field: `databases[${dbIndex}].name`,
                  message: `Database ${dbIndex + 1} name is required`,
                  code: 'REQUIRED',
                  severity: 'error'
                })
                isValid = false
              }
              
              if (!database.entitlementBases?.length) {
                errors.push({
                  field: `databases[${dbIndex}].entitlementBases`,
                  message: `Database ${dbIndex + 1} requires at least one entitlement base`,
                  code: 'REQUIRED',
                  severity: 'error'
                })
                isValid = false
              }
              
              // Validate schemas if any are present
              database.schemas?.forEach((schema, schemaIndex) => {
                if (!schema.name?.trim()) {
                  errors.push({
                    field: `databases[${dbIndex}].schemas[${schemaIndex}].name`,
                    message: `Schema ${schemaIndex + 1} in Database ${dbIndex + 1} name is required`,
                    code: 'REQUIRED',
                    severity: 'error'
                  })
                  isValid = false
                }
                
                if (!schema.purpose) {
                  errors.push({
                    field: `databases[${dbIndex}].schemas[${schemaIndex}].purpose`,
                    message: `Schema ${schemaIndex + 1} in Database ${dbIndex + 1} purpose is required`,
                    code: 'REQUIRED',
                    severity: 'error'
                  })
                  isValid = false
                }
                
                if (!schema.dataRetentionDays || schema.dataRetentionDays < 1) {
                  errors.push({
                    field: `databases[${dbIndex}].schemas[${schemaIndex}].dataRetentionDays`,
                    message: `Schema ${schemaIndex + 1} in Database ${dbIndex + 1} data retention must be at least 1 day`,
                    code: 'INVALID_VALUE',
                    severity: 'error'
                  })
                  isValid = false
                }
              })
            })
          }
        }
        break

      case 4: // Environments
        if (!newFormData.environments.environments?.length) {
          errors.push({
            field: 'environments',
            message: 'At least one environment is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        break

      case 5: // Database Authorization
        if (!newFormData.databaseAuth.qaAuth.method) {
          errors.push({
            field: 'qaAuth.method',
            message: 'QA authentication method is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        if (!newFormData.databaseAuth.prodAuth.method) {
          errors.push({
            field: 'prodAuth.method',
            message: 'Production authentication method is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        break

      case 6: // Notifications
        if (!newFormData.notifications.supportGroup.trim()) {
          errors.push({
            field: 'supportGroup',
            message: 'Support group is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        // Email distribution is optional according to the UI implementation
        // Only validate email distribution format if provided
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (newFormData.notifications.emailDistribution?.trim() && !emailRegex.test(newFormData.notifications.emailDistribution)) {
          errors.push({
            field: 'emailDistribution',
            message: 'Email distribution format is invalid',
            code: 'INVALID_FORMAT',
            severity: 'error'
          })
          isValid = false
        }
        break

      case 7: // GitHub Setup
        if (!newFormData.github.githubTeam.trim()) {
          errors.push({
            field: 'githubTeam',
            message: 'GitHub team is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        if (!newFormData.github.repositoryName.trim()) {
          errors.push({
            field: 'repositoryName',
            message: 'Repository name is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        break

      case 8: // Entitlements
        const { entitlementOwner, technicalOwner } = newFormData.entitlements
        if (!entitlementOwner.trim()) {
          errors.push({
            field: 'entitlementOwner',
            message: 'Entitlement owner is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        if (!technicalOwner.trim()) {
          errors.push({
            field: 'technicalOwner',
            message: 'Technical owner is required',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        // Cross-field validation
        if (entitlementOwner.trim() && technicalOwner.trim() && entitlementOwner === technicalOwner) {
          errors.push({
            field: 'entitlementOwner',
            message: 'Entitlement and technical owners must be different',
            code: 'UNIQUE',
            severity: 'error'
          })
          errors.push({
            field: 'technicalOwner',
            message: 'Entitlement and technical owners must be different',
            code: 'UNIQUE',
            severity: 'error'
          })
          isValid = false
        }
        break

      case 9: // Review & Create
        if (!newFormData.review.reviewed) {
          errors.push({
            field: 'reviewed',
            message: 'Please review all information before proceeding',
            code: 'REQUIRED',
            severity: 'error'
          })
          isValid = false
        }
        break
    }

    const result: StepValidationResult = {
      valid: isValid,
      errors,
      warnings,
      touched: true
    }

    validation.stepValidation[stepId] = result
    
    console.log(`Validating Step ${stepId}:`, {
      isValid,
      errors: result.errors,
      warnings: result.warnings,
      completedSteps: navigation.completedSteps,
      stepDefinition: {
        id: stepDef.id,
        title: stepDef.title,
        previousValid: stepDef.valid,
        newValid: isValid
      }
    })
    
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
        newFormData,
        {
          currentStep: navigation.currentStep,
          totalSteps: navigation.totalSteps
        },
        {
          title: newFormData.generalInfo.name || 'Untitled Project',
          description: newFormData.generalInfo.description,
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
        newFormData,
        {
          currentStep: navigation.currentStep,
          totalSteps: navigation.totalSteps
        },
        {
          title: title || newFormData.generalInfo.name || 'Untitled Project',
          description: description || newFormData.generalInfo.description,
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
            const section = key as keyof NewProjectFormData
            if (newFormData[section]) {
              Object.assign(newFormData[section], draftData.formData[section])
            }
          })
        } else {
          Object.assign(newFormData, draftData.formData)
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

  async function testDatabaseConnection(config: any): Promise<ConnectionTestResult> {
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
    newFormData: readonly(newFormData),
    navigation: readonly(navigation),
    validation: readonly(validation),
    draft: readonly(draft),
    execution: readonly(execution),
    config: readonly(config),

    // Computed properties (legacy)
    currentStepDefinition,
    canNavigateToStep,
    highestValidStep,
    isFormValid,
    canExecuteProject,

    // New computed properties (9-step workflow)
    shouldShowStep3a,
    visibleSteps,
    currentStepIndex,
    totalVisibleSteps,
    canProceed,

    // Navigation actions
    goToStep,
    nextStep,
    previousStep,

    // Form actions
    updateNewFormData,
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