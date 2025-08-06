/**
 * TypeScript interfaces for REST API Builder form configuration and state management
 * Provides comprehensive types for multi-step form, validation, draft persistence, and API execution
 */

import type { Ref } from 'vue'

// =============================================================================
// HTTP Method and Authentication Types
// =============================================================================

/**
 * Supported HTTP methods for REST API requests
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

/**
 * Authentication types supported by the API builder
 */
export type AuthenticationType = 'none' | 'bearer' | 'basic' | 'api-key'

/**
 * Authentication configuration interface
 */
export interface AuthenticationConfig {
  type: AuthenticationType
  token?: string
  username?: string
  password?: string
  apiKey?: string
  apiKeyHeader?: string
}

// =============================================================================
// Form Step Data Interfaces
// =============================================================================

/**
 * Step 1: HTTP Method and URL configuration
 */
export interface MethodUrlStep {
  method: HttpMethod
  url: string
  baseUrl?: string
}

/**
 * Key-value pair interface for headers and query parameters
 */
export interface KeyValuePair {
  id: string
  key: string
  value: string
  enabled: boolean
}

/**
 * Step 2: Request Headers configuration
 */
export interface HeadersStep {
  headers: KeyValuePair[]
}

/**
 * Step 3: Query Parameters configuration
 */
export interface QueryParamsStep {
  params: KeyValuePair[]
}

/**
 * Step 4: Request Body configuration
 */
export interface RequestBodyStep {
  contentType: 'application/json' | 'application/x-www-form-urlencoded' | 'text/plain' | 'application/xml'
  body: string
  formData?: KeyValuePair[]
}

/**
 * Step 5: Authentication configuration
 */
export interface AuthenticationStep {
  auth: AuthenticationConfig
}

/**
 * Step 6: Review and execution data
 */
export interface ReviewStep {
  requestPreview: string
  responseData?: any
  responseStatus?: number
  responseHeaders?: Record<string, string>
  executionTime?: number
}

// =============================================================================
// Complete Form State Interface
// =============================================================================

/**
 * Complete API builder form state
 */
export interface ApiBuilderFormState {
  step1: MethodUrlStep
  step2: HeadersStep
  step3: QueryParamsStep
  step4: RequestBodyStep
  step5: AuthenticationStep
  step6: ReviewStep
}

// =============================================================================
// Step Management Types
// =============================================================================

/**
 * Form step information
 */
export interface FormStep {
  id: number
  title: string
  subtitle: string
  icon: string
  completed: boolean
  valid: boolean
  optional: boolean
}

/**
 * Step navigation state
 */
export interface StepperState {
  currentStep: number
  totalSteps: number
  steps: FormStep[]
  canGoNext: boolean
  canGoPrevious: boolean
  canSubmit: boolean
}

// =============================================================================
// Validation Types
// =============================================================================

/**
 * Field validation result
 */
export interface ValidationResult {
  valid: boolean
  message?: string
}

/**
 * Step validation interface
 */
export interface StepValidation {
  [fieldName: string]: ValidationResult
}

/**
 * Complete form validation state
 */
export interface FormValidationState {
  step1: StepValidation
  step2: StepValidation
  step3: StepValidation
  step4: StepValidation
  step5: StepValidation
  step6: StepValidation
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
 * Complete draft data
 */
export interface ApiBuilderDraft {
  metadata: DraftMetadata
  formState: ApiBuilderFormState
  stepperState: Pick<StepperState, 'currentStep' | 'totalSteps'>
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
 * API execution progress states
 */
export type ExecutionStatus = 'idle' | 'preparing' | 'executing' | 'success' | 'error' | 'cancelled'

/**
 * API execution progress information
 */
export interface ExecutionProgress {
  status: ExecutionStatus
  progress: number
  message: string
  startTime?: number
  endTime?: number
  duration?: number
}

/**
 * API execution result
 */
export interface ExecutionResult {
  success: boolean
  status: number
  statusText: string
  headers: Record<string, string>
  data: any
  duration: number
  timestamp: number
  error?: string
}

/**
 * API execution configuration
 */
export interface ExecutionConfig {
  timeout: number
  retryAttempts: number
  retryDelay: number
  followRedirects: boolean
  validateSSL: boolean
}

// =============================================================================
// Composable Return Types
// =============================================================================

/**
 * API Builder form composable return type
 */
export interface UseApiBuilderFormReturn {
  // Form state
  readonly formState: Readonly<Ref<ApiBuilderFormState>>
  readonly stepperState: Readonly<Ref<StepperState>>
  readonly validationState: Readonly<Ref<FormValidationState>>
  
  // Step navigation
  goToStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  
  // Form actions
  updateStep: <T extends keyof ApiBuilderFormState>(step: T, data: Partial<ApiBuilderFormState[T]>) => void
  validateStep: (step: number) => Promise<boolean>
  validateForm: () => Promise<boolean>
  resetForm: () => void
  
  // Utility functions
  addKeyValuePair: (step: 'step2' | 'step3', pair?: Partial<KeyValuePair>) => void
  removeKeyValuePair: (step: 'step2' | 'step3', id: string) => void
  toggleKeyValuePair: (step: 'step2' | 'step3', id: string) => void
}

/**
 * Draft management composable return type
 */
export interface UseDraftManagerReturn {
  // Draft state
  readonly currentDraft: Readonly<Ref<ApiBuilderDraft | null>>
  readonly availableDrafts: Readonly<Ref<DraftMetadata[]>>
  readonly isDraftDirty: Readonly<Ref<boolean>>
  readonly autoSaveEnabled: Readonly<Ref<boolean>>
  
  // Draft actions
  saveDraft: (title?: string, description?: string) => Promise<string>
  loadDraft: (draftId: string, options?: DraftRestorationOptions) => Promise<void>
  deleteDraft: (draftId: string) => Promise<void>
  createDraft: (formState: ApiBuilderFormState, title: string) => Promise<string>
  
  // Auto-save management
  enableAutoSave: () => void
  disableAutoSave: () => void
  triggerAutoSave: () => void
}

/**
 * API execution composable return type
 */
export interface UseApiExecutionReturn {
  // Execution state
  readonly executionProgress: Readonly<Ref<ExecutionProgress>>
  readonly executionResult: Readonly<Ref<ExecutionResult | null>>
  readonly isExecuting: Readonly<Ref<boolean>>
  readonly canExecute: Readonly<Ref<boolean>>
  
  // Execution actions
  executeRequest: (formState: ApiBuilderFormState, config?: Partial<ExecutionConfig>) => Promise<ExecutionResult>
  cancelExecution: () => void
  retryExecution: () => Promise<ExecutionResult>
  
  // Result management
  clearResult: () => void
  exportResult: (format: 'json' | 'curl' | 'postman') => string
}

// =============================================================================
// Event Types
// =============================================================================

/**
 * Form events
 */
export interface ApiBuilderFormEvents {
  'step-change': (newStep: number, oldStep: number) => void
  'form-update': (formState: ApiBuilderFormState) => void
  'validation-change': (validationState: FormValidationState) => void
  'draft-save': (draft: ApiBuilderDraft) => void
  'draft-load': (draft: ApiBuilderDraft) => void
  'execution-start': (formState: ApiBuilderFormState) => void
  'execution-complete': (result: ExecutionResult) => void
  'execution-error': (error: string) => void
}

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * API Builder configuration
 */
export interface ApiBuilderConfig {
  // Step configuration
  enabledSteps: number[]
  defaultStep: number
  
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
}