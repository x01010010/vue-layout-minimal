/**
 * TypeScript interfaces for Project Creation form configuration and state management
 * Provides comprehensive types for 9-step multi-step form, validation, draft persistence, and API execution
 */

import type { Ref } from 'vue'

// =============================================================================
// Core Types and Enums
// =============================================================================

/**
 * Setup type selection for Step 2
 */
export type SetupType = 'OAD' | 'Classic'

/**
 * Business areas supported by the system
 */
export type BusinessArea = 'cl' | 'claims' | 'corporate' | 'crm' | 'it' | 'pl'

/**
 * Environment types with selection logic
 */
export type EnvironmentType = 'DEV' | 'QA' | 'PROD'

/**
 * Schema purposes for database schemas
 */
export type SchemaPurpose = 'raw' | 'staging' | 'user_managed' | 'target' | 'ods' | 'published'

/**
 * Database authentication methods
 */
export type DatabaseAuthMethod = 'service_account' | 'keypair'

/**
 * Supported project types
 */
export type ProjectType = 'web-app' | 'api-service' | 'mobile-app' | 'desktop-app' | 'library' | 'microservice'

/**
 * Database types supported by the project creation
 */
export type DatabaseType = 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'redis' | 'none'

// =============================================================================
// Step-Specific Data Interfaces
// =============================================================================

/**
 * Step 1: General Info configuration
 * Contains basic project information including the required owner field
 */
export interface GeneralInfo {
  /** Project name (required) */
  name: string
  /** Project owner (required) */
  owner: string
  /** Project description (required) */
  description: string
  /** Project tags (optional) */
  tags: string[]
}

/**
 * Step 2: Setup Type selection
 * Choice between OAD (On-Demand) and Classic setup approaches
 */
export interface SetupTypeSelection {
  /** Selected setup type (required) */
  setupType: SetupType
}

/**
 * Step 3: Database Selection
 * Choice between using existing database or creating new one
 */
export interface DatabaseSelection {
  /** Name of existing database (if selected) */
  existingDatabase?: string
  /** Flag indicating if user wants to create new database */
  createNewDatabase: boolean
}

/**
 * Entitlement Base configuration for new databases
 *
 * Defines ownership and access control for database entitlements.
 * Each entitlement base must have both read-write and read-only ownership assignments.
 *
 * @example
 * ```typescript
 * const entitlementBase: EntitlementBase = {
 *   name: "my-project-entitlement",
 *   owner: "john.doe@company.com",
 *   tso: "tech-team@company.com",
 *   readOnlyOwner: "readonly-user@company.com",
 *   readOnlyTso: "readonly-tech@company.com"
 * }
 * ```
 */
export interface EntitlementBase {
  /** Name of the entitlement base (required) - must be unique within the system */
  name: string
  /** Owner of the entitlement base (required) - email address with full access rights */
  owner: string
  /** TSO (Technical Service Owner) (required) - email address for technical ownership */
  tso: string
  /** Read-only owner (required) - email address with read-only access rights */
  readOnlyOwner: string
  /** Read-only TSO (required) - email address for read-only technical ownership */
  readOnlyTso: string
}

/**
 * Schema configuration for new databases
 */
export interface DatabaseSchema {
  /** Schema name */
  name: string
  /** Schema purpose */
  purpose: SchemaPurpose
  /** Data retention in days */
  dataRetentionDays: number
  /** Whether schema is restricted */
  restricted: boolean
}

/**
 * Custom tag configuration for new databases
 */
export interface CustomTag {
  /** Tag name */
  tag: string
  /** Support group name */
  supportGroupName: string
  /** Support group email */
  supportGroupEmail: string
}

/**
 * Database configuration for new database creation
 *
 * Comprehensive configuration object for creating a new database instance.
 * Includes entitlement management, schema definitions, and custom tagging.
 *
 * @example
 * ```typescript
 * const dbConfig: NewDatabaseConfig = {
 *   name: "my-project-db",
 *   entitlementBases: [entitlementBase],
 *   schemas: [{ name: "raw", purpose: "raw", dataRetentionDays: 90, restricted: false }],
 *   customTags: [{ tag: "project-alpha", supportGroupName: "team-alpha", supportGroupEmail: "alpha@company.com" }]
 * }
 * ```
 */
export interface NewDatabaseConfig {
  /** Database name (required) - must be unique and follow naming conventions */
  name: string
  /** Entitlement bases (required, at least one) - defines access control and ownership */
  entitlementBases: EntitlementBase[]
  /** Database schemas (optional) - defines data organization and retention policies */
  schemas: DatabaseSchema[]
  /** Custom tags (optional) - additional metadata and support group assignments */
  customTags: CustomTag[]
}

/**
 * Step 3a: New Database creation (conditional step)
 *
 * Complex nested forms for database configuration that appears conditionally
 * when user selects "Create new database" in Step 3. This step includes
 * business area selection, environment targeting, and multiple database configurations.
 *
 * Business Logic:
 * - DEV environment is always included by default
 * - QA and PROD environments are optional selections
 * - Multiple databases can be configured in a single step
 * - Each database requires at least one entitlement base
 *
 * @example
 * ```typescript
 * const newDbCreation: NewDatabaseCreation = {
 *   businessArea: "it",
 *   environments: ["DEV", "QA", "PROD"],
 *   databases: [dbConfig1, dbConfig2]
 * }
 * ```
 */
export interface NewDatabaseCreation {
  /** Business area (required) - determines organizational context and permissions */
  businessArea: BusinessArea
  /** Selected environments (DEV always included) - target deployment environments */
  environments: EnvironmentType[]
  /** Database configurations - one or more database instances to create */
  databases: NewDatabaseConfig[]
}

/**
 * Step 4: Environment Selection
 * Environment selection with business logic
 */
export interface EnvironmentSelection {
  /** Selected environments with validation rules */
  environments: EnvironmentType[]
}

/**
 * Database authentication configuration
 */
export interface DatabaseAuth {
  /** Authentication method */
  method: DatabaseAuthMethod
  /** Service account (if using service account method) */
  serviceAccount?: string
  /** Password (if using service account method) */
  password?: string
  /** Public key (if using keypair method) */
  publicKey?: string
  /** Private key (if using keypair method) */
  privateKey?: string
}

/**
 * Step 5: Database Authorization
 * Authentication details for QA and Production environments
 */
export interface DatabaseAuthorization {
  /** QA database authentication */
  qaAuth: DatabaseAuth
  /** Production database authentication */
  prodAuth: DatabaseAuth
}

/**
 * Communication channel types for notifications
 */
export type CommunicationChannel = 'email' | 'slack' | 'teams' | 'webhook'

/**
 * Notification event types
 */
export type NotificationEventType = 'deployment' | 'errors' | 'maintenance' | 'security' | 'performance' | 'alerts'

/**
 * Escalation levels for notifications
 */
export type EscalationLevel = 'low' | 'medium' | 'high' | 'critical'

/**
 * Support group configuration
 */
export interface SupportGroup {
  /** Support group ID */
  id: string
  /** Support group display name */
  name: string
  /** Support group description */
  description: string
}

/**
 * Notification event configuration
 */
export interface NotificationEvent {
  /** Event type identifier */
  id: NotificationEventType
  /** Event display label */
  label: string
  /** Event description */
  description: string
  /** Whether this event is enabled */
  enabled: boolean
}

/**
 * Step 6: Notifications configuration
 * Comprehensive notification settings for project support and communication
 */
export interface NotificationConfig {
  /** Selected support group (required) */
  supportGroup: string
  /** Primary contact email (required) */
  primaryContactEmail: string
  /** Secondary contact email (optional) */
  secondaryContactEmail?: string
  /** Selected notification events */
  notificationEvents: NotificationEventType[]
  /** Escalation level setting */
  escalationLevel: EscalationLevel
  /** Preferred communication channels */
  communicationChannels: CommunicationChannel[]
  /** Additional email distribution list (legacy field for backward compatibility) */
  emailDistribution: string
}

/**
 * Step 7: GitHub Setup configuration
 * Repository and team configuration
 */
export interface GitHubSetup {
  /** GitHub team name (required) */
  githubTeam: string
  /** Repository name (required) */
  repositoryName: string
  /** Whether repository should be private */
  privateRepo: boolean
}

/**
 * Step 8: Entitlements configuration
 * Ownership assignment
 */
export interface EntitlementsConfig {
  /** Entitlement owner (required) */
  entitlementOwner: string
  /** Technical owner (required) */
  technicalOwner: string
}

/**
 * Step 9: Review & Create
 * Summary of all configuration data
 */
export interface ReviewAndCreate {
  /** Flag indicating user has reviewed all data */
  reviewed: boolean
  /** Optional notes or comments */
  notes?: string
}


// =============================================================================
// Conditional Navigation Types
// =============================================================================

/**
 * Navigation context for conditional step visibility
 *
 * Provides context information needed to make navigation decisions,
 * particularly for conditional steps like Step 3a that only appear
 * based on user selections in previous steps.
 *
 * @example
 * ```typescript
 * const context: NavigationContext = {
 *   currentStep: 3,
 *   showStep3a: formData.databaseSelection?.createNewDatabase === true,
 *   formData: { databaseSelection: { createNewDatabase: true } }
 * }
 * ```
 */
export interface NavigationContext {
  /** Current step number (1-9) */
  currentStep: number
  /** Whether Step 3a should be visible based on Step 3 selections */
  showStep3a: boolean
  /** Form data context for navigation decisions - partial data for flexibility */
  formData: Partial<NewProjectFormData>
}

/**
 * Conditional navigation configuration
 *
 * Defines the business logic for conditional step navigation in the 9-step workflow.
 * Handles the complex case where Step 3a (New Database Creation) only appears
 * when the user selects "Create new database" in Step 3.
 *
 * Navigation Flow:
 * - Steps 1-2: Always visible, linear progression
 * - Step 3: Always visible, determines Step 3a visibility
 * - Step 3a: Conditional - only if createNewDatabase is true
 * - Steps 4-9: Always visible, but numbering shifts based on Step 3a presence
 *
 * @example
 * ```typescript
 * const navigation: ConditionalNavigation = {
 *   shouldShowStep3a: (ctx) => ctx.formData.databaseSelection?.createNewDatabase === true,
 *   getNextStep: (current, ctx) => ctx.showStep3a && current === 3 ? 3.5 : current + 1,
 *   getPreviousStep: (current, ctx) => ctx.showStep3a && current === 4 ? 3.5 : current - 1
 * }
 * ```
 */
export interface ConditionalNavigation {
  /** Function to determine if Step 3a should be shown based on form data */
  shouldShowStep3a: (context: NavigationContext) => boolean
  /** Function to get next step number, accounting for conditional Step 3a */
  getNextStep: (currentStep: number, context: NavigationContext) => number
  /** Function to get previous step number, accounting for conditional Step 3a */
  getPreviousStep: (currentStep: number, context: NavigationContext) => number
}

// =============================================================================
// Updated Form Data Interface
// =============================================================================

/**
 * Complete project form data for 9-step workflow
 *
 * Comprehensive interface representing all data collected through the 9-step
 * project creation workflow. Includes conditional Step 3a data that only
 * appears when creating new databases.
 *
 * Workflow Steps:
 * 1. General Info - Basic project details and ownership
 * 2. Setup Type - OAD vs Classic approach selection
 * 3. Database Selection - Choose existing or create new database
 * 3a. New Database Creation - Conditional step for database configuration
 * 4. Environment Selection - Target deployment environments
 * 5. Database Authorization - QA/Prod authentication setup
 * 6. Notifications - Support group and email configuration
 * 7. GitHub Setup - Repository and team configuration
 * 8. Entitlements - Ownership and access assignments
 * 9. Review & Create - Final validation and submission
 *
 * @example
 * ```typescript
 * const formData: NewProjectFormData = {
 *   generalInfo: { name: "my-project", owner: "john.doe", description: "...", tags: [] },
 *   setupType: { setupType: "OAD" },
 *   databaseSelection: { createNewDatabase: true },
 *   newDatabase: { businessArea: "it", environments: ["DEV", "QA"], databases: [...] },
 *   environments: { environments: ["DEV", "QA", "PROD"] },
 *   databaseAuth: { qaAuth: {...}, prodAuth: {...} },
 *   notifications: { supportGroup: "team-alpha", emailDistribution: "alpha@company.com" },
 *   github: { githubTeam: "alpha-team", repositoryName: "my-project", privateRepo: true },
 *   entitlements: { entitlementOwner: "john.doe", technicalOwner: "tech-lead" },
 *   review: { reviewed: true, notes: "Ready for deployment" }
 * }
 * ```
 */
export interface NewProjectFormData {
  /** Step 1: General project information - name, owner, description, and tags */
  generalInfo: GeneralInfo
  /** Step 2: Setup type selection - OAD (On-Demand) vs Classic approach */
  setupType: SetupTypeSelection
  /** Step 3: Database selection - choose existing database or create new one */
  databaseSelection: DatabaseSelection
  /** Step 3a: New database creation (conditional) - only present when createNewDatabase is true */
  newDatabase?: NewDatabaseCreation
  /** Step 4: Environment selection - target deployment environments with validation */
  environments: EnvironmentSelection
  /** Step 5: Database authorization - QA and Production authentication configuration */
  databaseAuth: DatabaseAuthorization
  /** Step 6: Notifications configuration - support group and email distribution setup */
  notifications: NotificationConfig
  /** Step 7: GitHub setup - repository and team configuration */
  github: GitHubSetup
  /** Step 8: Entitlements configuration - ownership and access assignments */
  entitlements: EntitlementsConfig
  /** Step 9: Review and create - final validation, notes, and submission confirmation */
  review: ReviewAndCreate
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
  formData: NewProjectFormData
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
  formData: NewProjectFormData
  
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
  readonly formData: Readonly<Ref<NewProjectFormData>>
  readonly navigationState: Readonly<Ref<NavigationState>>
  readonly validationState: Readonly<Ref<ProjectCreationState['validation']>>
  
  // Step navigation
  goToStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  
  // Form actions
  updateFormData: <T extends keyof NewProjectFormData>(section: T, data: Partial<NewProjectFormData[T]>) => void
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
  createDraft: (formData: NewProjectFormData, title: string) => Promise<string>
  
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
  executeProject: (formData: NewProjectFormData, options?: Partial<ExecutionOptions>) => Promise<ProjectCreationResult>
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
  'form-update': (formData: NewProjectFormData) => void
  'validation-change': (validationState: ProjectCreationState['validation']) => void
  'draft-save': (draft: ProjectCreationDraft) => void
  'draft-load': (draft: ProjectCreationDraft) => void
  'execution-start': (formData: NewProjectFormData) => void
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