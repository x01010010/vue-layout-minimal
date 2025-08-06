/**
 * TypeScript interfaces for Project Creation form configuration and state management
 * Provides comprehensive types for multi-step form, validation, draft persistence, and API execution
 */

import type { Ref } from 'vue'

// =============================================================================
// Project Types
// =============================================================================

/**
 * Supported project types
 */
export type ProjectType = 'web-app' | 'api-service' | 'mobile-app' | 'desktop-app' | 'library' | 'microservice'

/**
 * Database types supported by the project creation
 */
export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'redis' | 'none'

// =============================================================================
// Form Step Data Interfaces
// =============================================================================

/**
 * Step 1: Project Basics configuration
 */
export interface ProjectBasics {
  name: string
  description: string
  type: ProjectType
  template?: string
  tags: string[]
}

/**
 * Database connection options
 */
export interface DatabaseOptions {
  ssl?: boolean
  poolSize?: number
  timeout?: number
  charset?: string
  timezone?: string
  // Redis specific options
  database?: number
  // MongoDB specific options
  authSource?: string
  replicaSet?: string
  // SQLite specific options
  filePath?: string
  // SSL certificate options
  sslCert?: string
  sslKey?: string
  sslCA?: string
  // Connection retry options
  retryAttempts?: number
  retryDelay?: number
}

/**
 * Step 2: Database Configuration
 */
export interface DatabaseConfig {
  type: DatabaseType
  connectionString: string
  schema?: string
  options: DatabaseOptions
}

/**
 * Parameter value types for dynamic parameters
 */
export type ParameterValue = 
  | string 
  | number 
  | boolean 
  | string[] 
  | ParameterObject

/**
 * Parameter object with metadata
 */
export interface ParameterObject {
  value: any
  metadata?: {
    source?: string
    validated?: boolean
    encrypted?: boolean
  }
}

/**
 * Step 3-N: Dynamic Parameters configuration
 */
export interface DynamicParameters {
  [key: string]: ParameterValue
}

/**
 * Project metadata
 */
export interface ProjectMetadata {
  version: string
  author?: string
  license?: string
  repository?: string
  createdAt: number
  updatedAt: number
}

/**
 * Complete project form data
 */
export interface ProjectFormData {
  basics: ProjectBasics
  database: DatabaseConfig
  parameters: DynamicParameters
  metadata: ProjectMetadata
}

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string
  message: string
  code: string
  severity: 'error' | 'critical'
}

/**
 * Validation warning interface
 */
export interface ValidationWarning {
  field: string
  message: string
  code: string
}

/**
 * Step validation result
 */
export interface StepValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  touched: boolean
}

/**
 * Global validation result
 */
export interface GlobalValidationResult {
  valid: boolean
  completedSteps: number[]
  totalErrors: number
  totalWarnings: number
  canProceed: boolean
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean
  message?: string
  errors?: ValidationError[]
  warnings?: ValidationWarning[]
}

// =============================================================================
// Step Management Types
// =============================================================================

/**
 * Step definition interface
 */
export interface StepDefinition {
  id: number
  title: string
  subtitle: string
  icon: string
  component: string
  required: boolean
  completed: boolean
  valid: boolean
}

/**
 * Navigation state
 */
export interface NavigationState {
  currentStep: number
  completedSteps: number[]
  totalSteps: number
  canNavigateBack: boolean
  canNavigateForward: boolean
}

// =============================================================================
// Draft Persistence Types
// =============================================================================

/**
 * Draft metadata
 */
export interface DraftMetadata {
  id: string
  createdAt: number
  updatedAt: number
  title: string
  description?: string
  version: string
}

/**
 * Draft state
 */
export interface DraftState {
  hasDraft: boolean
  lastSaved: number
  autoSaveEnabled: boolean
  autoSaveInterval: number
}

/**
 * Complete project creation draft
 */
export interface ProjectCreationDraft {
  metadata: DraftMetadata
  formData: ProjectFormData
  navigationState: Pick<NavigationState, 'currentStep' | 'totalSteps'>
}

/**
 * Draft restoration options
 */
export interface DraftRestorationOptions {
  restoreFormData: boolean
  restoreStepPosition: boolean
  mergeWithCurrent: boolean
}

// =============================================================================
// API Execution Types
// =============================================================================

/**
 * Execution status types
 */
export type ExecutionStatus = 'idle' | 'preparing' | 'executing' | 'success' | 'error' | 'cancelled'

/**
 * Progress event stages
 */
export type ProgressStage = 'validating' | 'preparing' | 'creating' | 'configuring' | 'finalizing'

/**
 * Progress event interface
 */
export interface ProgressEvent {
  stage: ProgressStage
  progress: number // 0-100
  message: string
  details?: {
    currentStep: string
    totalSteps: number
    estimatedTime?: number
  }
}

/**
 * Execution step information
 */
export interface ExecutionStep {
  name: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startTime?: number
  endTime?: number
  duration?: number
  message?: string
  error?: string
}

/**
 * Project creation result
 */
export interface ProjectCreationResult {
  projectId: string
  status: 'created' | 'pending' | 'failed'
  url: string
  metadata: {
    createdAt: number
    duration: number
    steps: ExecutionStep[]
  }
}

/**
 * Execution state
 */
export interface ExecutionState {
  status: ExecutionStatus
  progress: number
  message: string
  result?: ProjectCreationResult
  error?: Error
}

/**
 * Execution options
 */
export interface ExecutionOptions {
  timeout: number
  retryAttempts: number
  retryDelay: number
  validateBeforeExecution: boolean
}

// =============================================================================
// Complete State Interface
// =============================================================================

/**
 * Complete project creation state
 */
export interface ProjectCreationState {
  // Form Data
  formData: ProjectFormData
  
  // Navigation State
  navigation: NavigationState
  
  // Validation State
  validation: {
    stepValidation: Record<number, StepValidationResult>
    globalValidation: GlobalValidationResult
    isDirty: boolean
  }
  
  // Draft State
  draft: DraftState
  
  // Execution State
  execution: ExecutionState
}

// =============================================================================
// Connection Test Types
// =============================================================================

/**
 * Connection test result
 */
export interface ConnectionTestResult {
  success: boolean
  message: string
  details?: {
    latency?: number
    version?: string
    features?: string[]
  }
  error?: string
}

// =============================================================================
// Parameter Schema Types
// =============================================================================

/**
 * Parameter schema for dynamic form generation
 */
export interface ParameterSchema {
  [key: string]: ParameterDefinition
}

/**
 * Parameter definition
 */
export interface ParameterDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  label: string
  description?: string
  required: boolean
  default?: any
  validation?: {
    min?: number
    max?: number
    pattern?: string
    options?: string[]
  }
  conditional?: {
    dependsOn: string
    values: any[]
  }
}

// =============================================================================
// Composable Return Types
// =============================================================================

/**
 * Project creation form composable return type
 */
export interface UseProjectCreationFormReturn {
  // Form state
  readonly formData: Readonly<Ref<ProjectFormData>>
  readonly navigationState: Readonly<Ref<NavigationState>>
  readonly validationState: Readonly<Ref<ProjectCreationState['validation']>>
  
  // Step navigation
  goToStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  
  // Form actions
  updateFormData: <T extends keyof ProjectFormData>(section: T, data: Partial<ProjectFormData[T]>) => void
  validateStep: (step: number) => Promise<boolean>
  validateForm: () => Promise<boolean>
  resetForm: () => void
  
  // Utility functions
  canNavigateToStep: (step: number) => boolean
  getStepValidation: (step: number) => StepValidationResult
}

/**
 * Draft management composable return type
 */
export interface UseProjectDraftManagerReturn {
  // Draft state
  readonly currentDraft: Readonly<Ref<ProjectCreationDraft | null>>
  readonly availableDrafts: Readonly<Ref<DraftMetadata[]>>
  readonly isDraftDirty: Readonly<Ref<boolean>>
  readonly autoSaveEnabled: Readonly<Ref<boolean>>
  
  // Draft actions
  saveDraft: (title?: string, description?: string) => Promise<string>
  loadDraft: (draftId: string, options?: DraftRestorationOptions) => Promise<void>
  deleteDraft: (draftId: string) => Promise<void>
  createDraft: (formData: ProjectFormData, title: string) => Promise<string>
  
  // Auto-save management
  enableAutoSave: () => void
  disableAutoSave: () => void
  triggerAutoSave: () => void
}

/**
 * Project execution composable return type
 */
export interface UseProjectExecutionReturn {
  // Execution state
  readonly executionState: Readonly<Ref<ExecutionState>>
  readonly isExecuting: Readonly<Ref<boolean>>
  readonly canExecute: Readonly<Ref<boolean>>
  
  // Execution actions
  executeProject: (formData: ProjectFormData, options?: Partial<ExecutionOptions>) => Promise<ProjectCreationResult>
  cancelExecution: () => void
  retryExecution: () => Promise<ProjectCreationResult>
  
  // Progress tracking
  onProgress: (callback: (progress: ProgressEvent) => void) => void
  
  // Result management
  clearResult: () => void
  exportConfiguration: (format: 'json' | 'yaml' | 'env') => string
}

// =============================================================================
// Event Types
// =============================================================================

/**
 * Project creation form events
 */
export interface ProjectCreationFormEvents {
  'step-change': (newStep: number, oldStep: number) => void
  'form-update': (formData: ProjectFormData) => void
  'validation-change': (validationState: ProjectCreationState['validation']) => void
  'draft-save': (draft: ProjectCreationDraft) => void
  'draft-load': (draft: ProjectCreationDraft) => void
  'execution-start': (formData: ProjectFormData) => void
  'execution-progress': (progress: ProgressEvent) => void
  'execution-complete': (result: ProjectCreationResult) => void
  'execution-error': (error: string) => void
  'connection-test': (result: ConnectionTestResult) => void
}

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Project creation configuration
 */
export interface ProjectCreationConfig {
  // Step configuration
  enabledSteps: number[]
  defaultStep: number
  stepDefinitions: StepDefinition[]
  
  // Validation configuration
  validateOnChange: boolean
  validateOnStepChange: boolean
  
  // Draft configuration
  autoSaveInterval: number
  maxDrafts: number
  draftStorageKey: string
  
  // Execution configuration
  defaultTimeout: number
  maxRetries: number
  
  // UI configuration
  showStepNumbers: boolean
  allowStepSkipping: boolean
  showProgressBar: boolean
  horizontalLayout: boolean
}