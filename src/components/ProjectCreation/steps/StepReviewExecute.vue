<template>
  <div class="step-review-execute">
    <div class="step-header mb-6">
      <h2 class="text-h5 mb-2">Review & Execute</h2>
      <p class="text-body-1 text-medium-emphasis">
        Review your configuration and create the project
      </p>
    </div>

    <!-- Project Creation Status -->
    <v-alert
      v-if="executionStatus !== 'idle'"
      :type="getExecutionAlertType()"
      variant="tonal"
      class="mb-6"
      :closable="executionStatus === 'error'"
      @click:close="clearExecutionResult"
    >
      <template #title>
        <v-icon :icon="getExecutionIcon()" class="me-2" />
        {{ getExecutionTitle() }}
      </template>
      <div>
        <p class="mb-2">{{ executionMessage }}</p>
        
        <!-- Progress Bar -->
        <v-progress-linear
          v-if="isExecuting"
          :model-value="executionProgress"
          height="8"
          rounded
          color="primary"
          class="mb-3"
        />
        
        <!-- Success Result -->
        <div v-if="executionResult" class="mt-3">
          <div class="d-flex align-center mb-2">
            <v-icon icon="mdi-check-circle" color="success" class="me-2" />
            <strong>Project ID:</strong>
            <v-chip size="small" color="success" variant="tonal" class="ms-2">
              {{ executionResult.projectId }}
            </v-chip>
          </div>
          <div class="d-flex gap-2">
            <v-btn
              :href="executionResult.url"
              target="_blank"
              variant="outlined"
              size="small"
              color="success"
            >
              <v-icon icon="mdi-open-in-new" class="me-2" />
              View Project
            </v-btn>
            <v-btn
              variant="outlined"
              size="small"
              @click="downloadProjectConfig"
            >
              <v-icon icon="mdi-download" class="me-2" />
              Download Config
            </v-btn>
          </div>
        </div>
        
        <!-- Error Details -->
        <div v-if="executionError" class="mt-3">
          <v-btn
            variant="outlined"
            size="small"
            color="error"
            @click="retryExecution"
            :disabled="isExecuting"
          >
            <v-icon icon="mdi-refresh" class="me-2" />
            Retry
          </v-btn>
        </div>
      </div>
    </v-alert>

    <!-- Main Content Grid -->
    <v-row>
      <!-- Left Column - Review Sections -->
      <v-col cols="12" lg="8">
        <!-- Project Basics Summary -->
        <v-card class="mb-4" variant="outlined">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-folder-outline" class="me-2" />
              Project Basics
            </div>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click="openEditDialog('basics')"
            />
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis">Project Name</div>
                  <div class="text-body-1 font-weight-medium">
                    {{ formData.basics.name || 'Untitled Project' }}
                  </div>
                </div>
                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis">Project Type</div>
                  <v-chip size="small" color="primary" variant="tonal">
                    {{ getProjectTypeLabel(formData.basics.type) }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="mb-3" v-if="formData.basics.description">
                  <div class="text-caption text-medium-emphasis">Description</div>
                  <div class="text-body-2">
                    {{ formData.basics.description }}
                  </div>
                </div>
                <div v-if="formData.basics.tags.length">
                  <div class="text-caption text-medium-emphasis mb-2">Tags</div>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-for="tag in formData.basics.tags"
                      :key="tag"
                      size="small"
                      variant="outlined"
                    >
                      {{ tag }}
                    </v-chip>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Database Configuration Summary -->
        <v-card class="mb-4" variant="outlined">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-database" class="me-2" />
              Database Configuration
            </div>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click="openEditDialog('database')"
            />
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-3">
                  <div class="text-caption text-medium-emphasis">Database Type</div>
                  <v-chip 
                    size="small" 
                    :color="getDatabaseTypeColor(formData.database.type)"
                    variant="tonal"
                  >
                    {{ getDatabaseTypeLabel(formData.database.type) }}
                  </v-chip>
                </div>
                <div v-if="formData.database.type !== 'none'" class="mb-3">
                  <div class="text-caption text-medium-emphasis">Connection</div>
                  <div class="text-body-2 font-mono">
                    {{ getMaskedConnectionString() }}
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6" v-if="formData.database.type !== 'none'">
                <div class="mb-3" v-if="formData.database.schema">
                  <div class="text-caption text-medium-emphasis">Schema/Database</div>
                  <div class="text-body-2">{{ formData.database.schema }}</div>
                </div>
                <div v-if="hasAdvancedDatabaseOptions">
                  <div class="text-caption text-medium-emphasis mb-2">Advanced Options</div>
                  <div class="d-flex flex-wrap gap-1">
                    <v-chip
                      v-if="formData.database.options.ssl"
                      size="small"
                      color="success"
                      variant="tonal"
                    >
                      SSL Enabled
                    </v-chip>
                    <v-chip
                      v-if="formData.database.options.poolSize && formData.database.options.poolSize !== 10"
                      size="small"
                      variant="outlined"
                    >
                      Pool: {{ formData.database.options.poolSize }}
                    </v-chip>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Parameters Summary (Placeholder) -->
        <v-card class="mb-4" variant="outlined">
          <v-card-title class="d-flex align-center justify-space-between">
            <div class="d-flex align-center">
              <v-icon icon="mdi-cog" class="me-2" />
              Parameters
            </div>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click="openEditDialog('parameters')"
            />
          </v-card-title>
          <v-card-text>
            <v-alert type="info" variant="tonal" density="compact">
              <template #title>Coming Soon</template>
              Dynamic parameter configuration will be available in the next phase.
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Validation Status -->
        <v-card class="mb-4" variant="outlined">
          <v-card-title class="d-flex align-center">
            <v-icon 
              :icon="globalValidation.valid ? 'mdi-check-circle' : 'mdi-alert-circle'"
              :color="globalValidation.valid ? 'success' : 'warning'"
              class="me-2"
            />
            Validation Status
          </v-card-title>
          <v-card-text>
            <div class="d-flex align-center justify-space-between mb-3">
              <span>Overall Status:</span>
              <v-chip
                :color="globalValidation.valid ? 'success' : 'warning'"
                :prepend-icon="globalValidation.valid ? 'mdi-check' : 'mdi-alert'"
                size="small"
                variant="tonal"
              >
                {{ globalValidation.valid ? 'Valid' : 'Issues Found' }}
              </v-chip>
            </div>
            
            <div class="d-flex align-center justify-space-between mb-3">
              <span>Completed Steps:</span>
              <span class="font-weight-medium">
                {{ globalValidation.completedSteps.length }}/{{ totalRequiredSteps }}
              </span>
            </div>
            
            <div v-if="globalValidation.totalErrors > 0" class="d-flex align-center justify-space-between mb-3">
              <span>Errors:</span>
              <v-chip color="error" size="small" variant="tonal">
                {{ globalValidation.totalErrors }}
              </v-chip>
            </div>
            
            <div v-if="globalValidation.totalWarnings > 0" class="d-flex align-center justify-space-between">
              <span>Warnings:</span>
              <v-chip color="warning" size="small" variant="tonal">
                {{ globalValidation.totalWarnings }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Column - Actions and Info -->
      <v-col cols="12" lg="4">
        <!-- Project Creation Actions -->
        <v-card class="mb-4" variant="outlined">
          <v-card-title>
            <v-icon icon="mdi-rocket-launch" class="me-2" />
            Actions
          </v-card-title>
          <v-card-text>
            <!-- Main Create Button -->
            <v-btn
              color="primary"
              block
              size="large"
              :loading="isExecuting"
              :disabled="!canExecute"
              @click="showExecutionConfirmDialog = true"
              class="mb-3"
            >
              <v-icon icon="mdi-rocket-launch" class="me-2" />
              Create Project
            </v-btn>
            
            <!-- Secondary Actions -->
            <div class="d-flex gap-2 mb-3">
              <v-btn
                variant="outlined"
                flex
                @click="saveDraft"
                :disabled="isExecuting"
              >
                <v-icon icon="mdi-content-save" class="me-2" />
                Save Draft
              </v-btn>
              <v-btn
                variant="outlined"
                flex
                @click="validateAllSteps"
                :loading="isValidating"
              >
                <v-icon icon="mdi-check-all" class="me-2" />
                Validate
              </v-btn>
            </div>
            
            <!-- Export Configuration -->
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  variant="outlined"
                  block
                  v-bind="props"
                  :disabled="isExecuting"
                >
                  <v-icon icon="mdi-export" class="me-2" />
                  Export Config
                  <v-icon icon="mdi-chevron-down" class="ms-2" />
                </v-btn>
              </template>
              <v-list>
                <v-list-item @click="exportConfig('json')">
                  <template #prepend>
                    <v-icon icon="mdi-code-json" />
                  </template>
                  <v-list-item-title>JSON</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportConfig('yaml')">
                  <template #prepend>
                    <v-icon icon="mdi-file-code" />
                  </template>
                  <v-list-item-title>YAML</v-list-item-title>
                </v-list-item>
                <v-list-item @click="exportConfig('env')">
                  <template #prepend>
                    <v-icon icon="mdi-file-document" />
                  </template>
                  <v-list-item-title>Environment</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-card-text>
        </v-card>

        <!-- Estimated Setup Time -->
        <v-card class="mb-4" variant="outlined">
          <v-card-title>
            <v-icon icon="mdi-clock-outline" class="me-2" />
            Estimated Setup Time
          </v-card-title>
          <v-card-text>
            <div class="text-center">
              <div class="text-h4 font-weight-bold text-primary mb-2">
                {{ estimatedSetupTime }}
              </div>
              <div class="text-body-2 text-medium-emphasis mb-3">
                Based on your configuration
              </div>
              <v-progress-circular
                :model-value="setupComplexityScore"
                size="80"
                width="8"
                color="primary"
                class="mb-3"
              >
                <span class="text-caption">{{ Math.round(setupComplexityScore) }}%</span>
              </v-progress-circular>
              <div class="text-caption text-medium-emphasis">
                Complexity Score
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Quick Navigation -->
        <v-card variant="outlined">
          <v-card-title>
            <v-icon icon="mdi-navigation" class="me-2" />
            Quick Navigation
          </v-card-title>
          <v-card-text>
            <div class="d-flex flex-column gap-2">
              <v-btn
                v-for="step in stepDefinitions"
                :key="step.id"
                :variant="currentStep === step.id ? 'tonal' : 'text'"
                :color="currentStep === step.id ? 'primary' : undefined"
                :prepend-icon="step.icon"
                :disabled="!canNavigateToStep(step.id)"
                @click="goToStep(step.id)"
                class="justify-start"
              >
                <div class="d-flex align-center justify-space-between w-100">
                  <span>{{ step.title }}</span>
                  <v-icon
                    v-if="completedSteps.includes(step.id)"
                    icon="mdi-check"
                    color="success"
                    size="small"
                  />
                </div>
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Execution Confirmation Dialog -->
    <v-dialog
      v-model="showExecutionConfirmDialog"
      max-width="500"
      persistent
    >
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon icon="mdi-rocket-launch" color="primary" class="me-2" />
          Confirm Project Creation
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            You are about to create a new project with the following configuration:
          </p>
          <v-list density="compact">
            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-folder" />
              </template>
              <v-list-item-title>{{ formData.basics.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ getProjectTypeLabel(formData.basics.type) }}</v-list-item-subtitle>
            </v-list-item>
            <v-list-item>
              <template #prepend>
                <v-icon icon="mdi-database" />
              </template>
              <v-list-item-title>{{ getDatabaseTypeLabel(formData.database.type) }}</v-list-item-title>
              <v-list-item-subtitle v-if="formData.database.type !== 'none'">
                {{ getMaskedConnectionString() }}
              </v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-alert type="info" variant="tonal" class="mt-4">
            <template #title>Estimated Time</template>
            This process will take approximately {{ estimatedSetupTime }} to complete.
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="showExecutionConfirmDialog = false"
            :disabled="isExecuting"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="executeProject"
            :loading="isExecuting"
          >
            <v-icon icon="mdi-rocket-launch" class="me-2" />
            Create Project
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Dialog -->
    <v-dialog
      v-model="showEditDialog"
      max-width="600"
      persistent
    >
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>Edit {{ getEditDialogTitle() }}</span>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="closeEditDialog"
          />
        </v-card-title>
        <v-card-text>
          <!-- Inline editing forms would go here -->
          <!-- For now, show a navigation option -->
          <v-alert type="info" variant="tonal">
            <template #title>Quick Edit</template>
            <p class="mb-3">
              To make changes to {{ getEditDialogTitle().toLowerCase() }}, 
              you can navigate back to the respective step.
            </p>
            <v-btn
              color="primary"
              variant="outlined"
              @click="navigateToEditStep"
            >
              <v-icon icon="mdi-arrow-left" class="me-2" />
              Go to {{ getEditDialogTitle() }} Step
            </v-btn>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            variant="text"
            @click="closeEditDialog"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * Step 4: Review & Execute Component
 * 
 * This component provides a comprehensive review of all project configuration
 * with inline editing capabilities and project creation execution functionality.
 * 
 * Features:
 * - Complete project configuration review
 * - Inline editing capabilities for each section
 * - Project creation execution with progress tracking
 * - Success/error handling with detailed feedback
 * - Export configuration in multiple formats
 * - Estimated setup time calculation
 * - Quick navigation to previous steps
 */

import { computed, ref } from 'vue'
import { useProjectCreationStore } from '../../../stores/project-creation'
import type { ProjectType, DatabaseType } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Local reactive state
const showExecutionConfirmDialog = ref(false)
const showEditDialog = ref(false)
const editingSection = ref<'basics' | 'database' | 'parameters' | null>(null)
const isValidating = ref(false)

// Computed properties from store
const formData = computed(() => store.formData)
const currentStep = computed(() => store.navigation.currentStep)
const completedSteps = computed(() => store.navigation.completedSteps)
const stepDefinitions = computed(() => store.config.stepDefinitions)
const globalValidation = computed(() => store.validation.globalValidation)
const executionStatus = computed(() => store.execution.status)
const executionProgress = computed(() => store.execution.progress)
const executionMessage = computed(() => store.execution.message)
const executionResult = computed(() => store.execution.result)
const executionError = computed(() => store.execution.error)
const canExecute = computed(() => store.canExecuteProject)
const canNavigateToStep = computed(() => store.canNavigateToStep)

// UI computed properties
const isExecuting = computed(() => executionStatus.value === 'executing')
const totalRequiredSteps = computed(() => 
  stepDefinitions.value.filter(s => s.required).length
)

const hasAdvancedDatabaseOptions = computed(() => {
  const options = formData.value.database.options
  return options.ssl || 
         (options.poolSize && options.poolSize !== 10) ||
         (options.timeout && options.timeout !== 30000)
})

const estimatedSetupTime = computed(() => {
  let baseTime = 30 // Base 30 seconds
  
  // Add time based on project type
  const projectTypeMultipliers = {
    'web-app': 1.5,
    'api-service': 1.2,
    'mobile-app': 2.0,
    'desktop-app': 1.8,
    'library': 1.0,
    'microservice': 1.3
  }
  
  baseTime *= projectTypeMultipliers[formData.value.basics.type] || 1.0
  
  // Add time based on database complexity
  const databaseMultipliers = {
    'none': 1.0,
    'sqlite': 1.1,
    'postgresql': 1.4,
    'mysql': 1.3,
    'mongodb': 1.5,
    'redis': 1.2
  }
  
  baseTime *= databaseMultipliers[formData.value.database.type] || 1.0
  
  // Add time for advanced options
  if (hasAdvancedDatabaseOptions.value) {
    baseTime *= 1.3
  }
  
  // Format time
  if (baseTime < 60) {
    return `${Math.round(baseTime)}s`
  } else if (baseTime < 3600) {
    return `${Math.round(baseTime / 60)}m ${Math.round(baseTime % 60)}s`
  } else {
    return `${Math.round(baseTime / 3600)}h ${Math.round((baseTime % 3600) / 60)}m`
  }
})

const setupComplexityScore = computed(() => {
  let score = 20 // Base score
  
  // Project type complexity
  const projectTypeScores = {
    'library': 10,
    'api-service': 20,
    'microservice': 25,
    'web-app': 30,
    'desktop-app': 40,
    'mobile-app': 50
  }
  
  score += projectTypeScores[formData.value.basics.type] || 20
  
  // Database complexity
  const databaseScores = {
    'none': 0,
    'sqlite': 5,
    'redis': 10,
    'mysql': 15,
    'postgresql': 20,
    'mongodb': 25
  }
  
  score += databaseScores[formData.value.database.type] || 0
  
  // Advanced options
  if (hasAdvancedDatabaseOptions.value) {
    score += 15
  }
  
  // Tags and description add minor complexity
  if (formData.value.basics.description) score += 2
  if (formData.value.basics.tags.length > 0) score += 3
  
  return Math.min(score, 100)
})

// Helper methods
const getProjectTypeLabel = (type: ProjectType): string => {
  const labels = {
    'web-app': 'Web Application',
    'api-service': 'API Service',
    'mobile-app': 'Mobile App',
    'desktop-app': 'Desktop App',
    'library': 'Library',
    'microservice': 'Microservice'
  }
  return labels[type] || type
}

const getDatabaseTypeLabel = (type: DatabaseType): string => {
  const labels = {
    'none': 'No Database',
    'postgresql': 'PostgreSQL',
    'mysql': 'MySQL',
    'mongodb': 'MongoDB',
    'sqlite': 'SQLite',
    'redis': 'Redis'
  }
  return labels[type] || type
}

const getDatabaseTypeColor = (type: DatabaseType): string => {
  const colors = {
    'none': 'grey',
    'postgresql': 'blue',
    'mysql': 'orange',
    'mongodb': 'green',
    'sqlite': 'teal',
    'redis': 'red'
  }
  return colors[type] || 'grey'
}

const getMaskedConnectionString = (): string => {
  const connectionString = formData.value.database.connectionString
  if (!connectionString) return 'Not configured'
  
  // Mask passwords in connection strings
  return connectionString.replace(/:([^:@]+)@/, ':***@')
}

const getExecutionIcon = (): string => {
  switch (executionStatus.value) {
    case 'preparing': return 'mdi-cog'
    case 'executing': return 'mdi-rocket-launch'
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    case 'cancelled': return 'mdi-cancel'
    default: return 'mdi-help'
  }
}

const getExecutionTitle = (): string => {
  switch (executionStatus.value) {
    case 'preparing': return 'Preparing...'
    case 'executing': return 'Creating Project...'
    case 'success': return 'Project Created Successfully!'
    case 'error': return 'Creation Failed'
    case 'cancelled': return 'Creation Cancelled'
    default: return 'Ready to Create'
  }
}

const getExecutionAlertType = (): 'success' | 'error' | 'warning' | 'info' => {
  switch (executionStatus.value) {
    case 'success': return 'success'
    case 'error': return 'error'
    case 'cancelled': return 'warning'
    default: return 'info'
  }
}

const getEditDialogTitle = (): string => {
  switch (editingSection.value) {
    case 'basics': return 'Project Basics'
    case 'database': return 'Database Configuration'
    case 'parameters': return 'Parameters'
    default: return 'Configuration'
  }
}

// Action methods
const executeProject = async () => {
  showExecutionConfirmDialog.value = false
  try {
    await store.executeProject()
  } catch (error) {
    console.error('Project execution failed:', error)
  }
}

const retryExecution = async () => {
  store.clearExecutionResult()
  await executeProject()
}

const clearExecutionResult = () => {
  store.clearExecutionResult()
}

const saveDraft = () => {
  store.saveDraftToStorage()
}

const validateAllSteps = async () => {
  isValidating.value = true
  try {
    await store.validateForm()
  } finally {
    isValidating.value = false
  }
}

const goToStep = (stepId: number) => {
  store.goToStep(stepId)
}

const openEditDialog = (section: 'basics' | 'database' | 'parameters') => {
  editingSection.value = section
  showEditDialog.value = true
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editingSection.value = null
}

const navigateToEditStep = () => {
  const stepMap = {
    'basics': 1,
    'database': 2,
    'parameters': 3
  }
  
  if (editingSection.value && stepMap[editingSection.value]) {
    goToStep(stepMap[editingSection.value])
    closeEditDialog()
  }
}

const downloadProjectConfig = () => {
  exportConfig('json')
}

const exportConfig = (format: 'json' | 'yaml' | 'env') => {
  const config = {
    project: formData.value.basics,
    database: formData.value.database,
    parameters: formData.value.parameters,
    metadata: formData.value.metadata
  }
  
  let content = ''
  let filename = ''
  let mimeType = ''
  
  switch (format) {
    case 'json':
      content = JSON.stringify(config, null, 2)
      filename = `${formData.value.basics.name || 'project'}-config.json`
      mimeType = 'application/json'
      break
    case 'yaml':
      content = convertToYAML(config)
      filename = `${formData.value.basics.name || 'project'}-config.yaml`
      mimeType = 'text/yaml'
      break
    case 'env':
      content = convertToEnv(config)
      filename = `${formData.value.basics.name || 'project'}.env`
      mimeType = 'text/plain'
      break
  }
  
  downloadFile(content, filename, mimeType)
}

const convertToYAML = (obj: any, indent = 0): string => {
  const spaces = '  '.repeat(indent)
  let yaml = ''
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      yaml += `${spaces}${key}:\n${convertToYAML(value, indent + 1)}`
    } else if (Array.isArray(value)) {
      yaml += `${spaces}${key}:\n`
      for (const item of value) {
        yaml += `${spaces}  - ${item}\n`
      }
    } else {
      yaml += `${spaces}${key}: ${value}\n`
    }
  }
  
  return yaml
}

const convertToEnv = (obj: any): string => {
  let env = ''
  const flatten = (data: any, prefix = '') => {
    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) continue
      
      const envKey = prefix ? `${prefix}_${key.toUpperCase()}` : key.toUpperCase()
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        flatten(value, envKey)
      } else if (Array.isArray(value)) {
        env += `${envKey}=${value.join(',')}\n`
      } else {
        env += `${envKey}=${value}\n`
      }
    }
  }
  
  flatten(obj)
  return env
}

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.step-review-execute {
  min-height: 400px;
}

.step-header {
  text-align: center;
}

.font-mono {
  font-family: 'Courier New', Courier, monospace;
}
</style>