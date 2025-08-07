<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Step Header -->
        <div class="mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            <v-icon icon="mdi-check-circle-outline" class="me-3" />
            Review & Create
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Review all configuration details and create your project.
          </p>
        </div>

        <!-- Review Summary List -->
        <div class="mb-6">
          <div
            v-for="section in reviewSections"
            :key="section.step"
            class="review-section mb-4"
          >
            <!-- Step Divider -->
            <div class="step-divider d-flex align-center mb-3">
              <v-icon :icon="section.icon" class="me-2" />
              <h3 class="text-h6 font-weight-medium">{{ section.title }}</h3>
            </div>
            
            <!-- Step Content -->
            <div class="step-content ms-8">
              <!-- Step 1: General Info -->
              <div v-if="section.step === 1">
                <div class="review-item">
                  <strong>Project Name:</strong> {{ store.newFormData.generalInfo.name || 'Not specified' }}
                </div>
                <div class="review-item">
                  <strong>Owner:</strong> {{ store.newFormData.generalInfo.owner || 'Not specified' }}
                </div>
                <div class="review-item">
                  <strong>Description:</strong> {{ store.newFormData.generalInfo.description || 'Not specified' }}
                </div>
                <div class="review-item">
                  <strong>Tags:</strong>
                  <v-chip-group v-if="store.newFormData.generalInfo.tags.length">
                    <v-chip
                      v-for="tag in store.newFormData.generalInfo.tags"
                      :key="tag"
                      size="small"
                      variant="outlined"
                    >
                      {{ tag }}
                    </v-chip>
                  </v-chip-group>
                  <span v-else class="text-medium-emphasis">None</span>
                </div>
              </div>

              <!-- Step 2: Setup Type -->
              <div v-else-if="section.step === 2">
                <div class="review-item">
                  <strong>Setup Type:</strong> {{ store.newFormData.setupType.setupType }}
                </div>
              </div>

              <!-- Step 3: Database Selection -->
              <div v-else-if="section.step === 3">
                <div class="review-item">
                  <strong>Create New Database:</strong>
                  {{ store.newFormData.databaseSelection.createNewDatabase ? 'Yes' : 'No' }}
                </div>
                <div v-if="!store.newFormData.databaseSelection.createNewDatabase" class="review-item">
                  <strong>Existing Database:</strong>
                  {{ store.newFormData.databaseSelection.existingDatabase || 'Not specified' }}
                </div>
              </div>

              <!-- Step 4: Environments -->
              <div v-else-if="section.step === 4">
                <div class="review-item">
                  <strong>Selected Environments:</strong>
                  <v-chip-group>
                    <v-chip
                      v-for="env in store.newFormData.environments.environments"
                      :key="env"
                      size="small"
                      :color="getEnvironmentColor(env)"
                      variant="flat"
                    >
                      {{ env }}
                    </v-chip>
                  </v-chip-group>
                </div>
              </div>

              <!-- Step 5: Database Auth -->
              <div v-else-if="section.step === 5">
                <div class="review-item">
                  <strong>QA Authentication:</strong> {{ store.newFormData.databaseAuth.qaAuth.method }}
                </div>
                <div class="review-item">
                  <strong>Production Authentication:</strong> {{ store.newFormData.databaseAuth.prodAuth.method }}
                </div>
              </div>

              <!-- Step 6: Notifications -->
              <div v-else-if="section.step === 6">
                <div class="review-item">
                  <strong>Support Group:</strong> {{ store.newFormData.notifications.supportGroup || 'Not specified' }}
                </div>
                <div class="review-item">
                  <strong>Primary Contact:</strong> {{ store.newFormData.notifications.primaryContactEmail || 'Not specified' }}
                </div>
                <div v-if="store.newFormData.notifications.secondaryContactEmail" class="review-item">
                  <strong>Secondary Contact:</strong> {{ store.newFormData.notifications.secondaryContactEmail }}
                </div>
                <div class="review-item">
                  <strong>Notification Events:</strong>
                  <v-chip-group v-if="store.newFormData.notifications.notificationEvents.length">
                    <v-chip
                      v-for="event in store.newFormData.notifications.notificationEvents"
                      :key="event"
                      size="small"
                      variant="outlined"
                    >
                      {{ event }}
                    </v-chip>
                  </v-chip-group>
                  <span v-else class="text-medium-emphasis">None selected</span>
                </div>
                <div class="review-item">
                  <strong>Escalation Level:</strong>
                  <v-chip :color="getEscalationColor(store.newFormData.notifications.escalationLevel)" size="small">
                    {{ store.newFormData.notifications.escalationLevel }}
                  </v-chip>
                </div>
              </div>

              <!-- Step 7: GitHub -->
              <div v-else-if="section.step === 7">
                <div class="review-item">
                  <strong>GitHub Team:</strong> {{ store.newFormData.github.githubTeam || 'Not specified' }}
                </div>
                <div class="review-item">
                  <strong>Repository Name:</strong> {{ store.newFormData.github.repositoryName || 'Not specified' }}
                </div>
                <div class="review-item">
                  <strong>Private Repository:</strong> {{ store.newFormData.github.privateRepo ? 'Yes' : 'No' }}
                </div>
              </div>

              <!-- Step 8: Entitlements -->
              <div v-else-if="section.step === 8">
                <div class="review-item">
                  <strong>Entitlement Owner:</strong> {{ store.newFormData.entitlements.entitlementOwner || 'Not specified' }}
                </div>
                <div class="review-item">
                  <strong>Technical Owner:</strong> {{ store.newFormData.entitlements.technicalOwner || 'Not specified' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Final Confirmation Form -->
        <v-form ref="formRef" @submit.prevent>
          <v-card variant="outlined" class="mb-6">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-clipboard-check" class="me-2" />
              Final Confirmation
            </v-card-title>
            <v-card-text>
              <v-checkbox
                v-model="formData.reviewed"
                label="I have reviewed all the information above and confirm it is correct"
                :rules="reviewedRules"
                :error-messages="getFieldErrors('reviewed')"
                required
                @update:model-value="handleFieldChange"
                @blur="handleFieldBlur"
              />
              
              <v-textarea
                v-model="formData.notes"
                label="Additional Notes (Optional)"
                placeholder="Add any additional notes or comments about this project..."
                variant="outlined"
                density="comfortable"
                rows="3"
                @update:model-value="handleFieldChange"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-note-text" />
                </template>
              </v-textarea>
            </v-card-text>
          </v-card>
        </v-form>

        <!-- Project Creation Section -->
        <v-card variant="outlined" class="mb-6">
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-rocket-launch" class="me-2" />
            Create Project
          </v-card-title>
          <v-card-text>
            <!-- Creation Progress -->
            <div v-if="store.execution.status !== 'idle'" class="mb-4">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-subtitle-2">{{ store.execution.message }}</span>
                <span class="text-caption">{{ store.execution.progress }}%</span>
              </div>
              <v-progress-linear
                :model-value="store.execution.progress"
                :color="getProgressColor(store.execution.status)"
                height="8"
                rounded
              />
            </div>

            <!-- Success Result -->
            <v-alert
              v-if="store.execution.status === 'success' && store.execution.result"
              type="success"
              variant="tonal"
              class="mb-4"
            >
              <template #title>Project Created Successfully!</template>
              <div class="mt-2">
                <div><strong>Project ID:</strong> {{ store.execution.result.projectId }}</div>
                <div><strong>Status:</strong> {{ store.execution.result.status }}</div>
                <div><strong>URL:</strong> 
                  <a :href="store.execution.result.url" target="_blank" class="text-primary">
                    {{ store.execution.result.url }}
                  </a>
                </div>
                <div><strong>Created:</strong> {{ formatDate(store.execution.result.metadata.createdAt) }}</div>
                <div><strong>Duration:</strong> {{ formatDuration(store.execution.result.metadata.duration) }}</div>
              </div>
            </v-alert>

            <!-- Error Result -->
            <v-alert
              v-if="store.execution.status === 'error' && store.execution.error"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              <template #title>Project Creation Failed</template>
              {{ store.execution.error.message }}
            </v-alert>

            <!-- Create Button -->
            <div class="d-flex justify-center">
              <v-btn
                v-if="store.execution.status === 'idle'"
                color="primary"
                size="large"
                :disabled="!canCreateProject"
                @click="createProject"
              >
                <v-icon icon="mdi-rocket-launch" class="me-2" />
                Create Project
              </v-btn>
              
              <v-btn
                v-else-if="store.execution.status === 'executing'"
                color="warning"
                size="large"
                @click="cancelCreation"
              >
                <v-icon icon="mdi-stop" class="me-2" />
                Cancel Creation
              </v-btn>
              
              <v-btn
                v-else-if="store.execution.status === 'success'"
                color="success"
                size="large"
                @click="resetCreation"
              >
                <v-icon icon="mdi-refresh" class="me-2" />
                Create Another Project
              </v-btn>
              
              <v-btn
                v-else-if="store.execution.status === 'error'"
                color="error"
                size="large"
                @click="retryCreation"
              >
                <v-icon icon="mdi-refresh" class="me-2" />
                Retry Creation
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Validation Summary -->
        <v-card
          v-if="validationResult && hasInteracted"
          :color="validationResult.valid ? 'success' : 'error'"
          variant="tonal"
          class="mt-6"
        >
          <v-card-text class="d-flex align-center">
            <v-icon
              :icon="validationResult.valid ? 'mdi-check-circle' : 'mdi-alert-circle'"
              class="me-3"
            />
            <div>
              <div class="font-weight-medium">
                {{ validationResult.valid ? 'Step 9 Complete - Ready to Create!' : 'Please fix the following issues:' }}
              </div>
              <div v-if="!validationResult.valid" class="text-caption mt-1">
                {{ validationResult.errors.length }} error(s), {{ validationResult.warnings.length }} warning(s)
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useProjectCreationStore } from '../../../stores/project-creation'
import type { ReviewAndCreate } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Form reference
const formRef = ref()

// Local form data (reactive copy of store data)
const formData = ref<ReviewAndCreate>({
  reviewed: store.newFormData.review.reviewed || false,
  notes: store.newFormData.review.notes || ''
})

// Interaction tracking
const hasInteracted = ref(false)


// Review sections configuration
const reviewSections = [
  { step: 1, title: 'General Information', icon: 'mdi-information', data: 'generalInfo' },
  { step: 2, title: 'Setup Type', icon: 'mdi-cog', data: 'setupType' },
  { step: 3, title: 'Database Selection', icon: 'mdi-database', data: 'databaseSelection' },
  { step: 4, title: 'Environments', icon: 'mdi-server-network', data: 'environments' },
  { step: 5, title: 'Database Authentication', icon: 'mdi-lock', data: 'databaseAuth' },
  { step: 6, title: 'Notifications', icon: 'mdi-bell', data: 'notifications' },
  { step: 7, title: 'GitHub Setup', icon: 'mdi-github', data: 'github' },
  { step: 8, title: 'Entitlements', icon: 'mdi-account-key', data: 'entitlements' }
]

// Validation rules
const reviewedRules = [
  (v: boolean) => !!v || 'You must review and confirm all information before proceeding'
]

// Computed properties
const validationResult = computed(() => store.getStepValidation(9))

const canCreateProject = computed(() => store.canExecuteProject)

// Get field-specific errors
const getFieldErrors = (fieldName: string) => {
  if (!validationResult.value || !hasInteracted.value) return []
  
  return validationResult.value.errors
    .filter(error => error.field === fieldName)
    .map(error => error.message)
}

// Utility functions
const getEnvironmentColor = (env: string) => {
  switch (env) {
    case 'DEV': return 'blue'
    case 'QA': return 'orange'
    case 'PROD': return 'red'
    default: return 'grey'
  }
}

const getEscalationColor = (level: string) => {
  switch (level) {
    case 'low': return 'green'
    case 'medium': return 'orange'
    case 'high': return 'red'
    case 'critical': return 'purple'
    default: return 'grey'
  }
}

const getProgressColor = (status: string) => {
  switch (status) {
    case 'executing': return 'primary'
    case 'success': return 'success'
    case 'error': return 'error'
    default: return 'primary'
  }
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

const formatDuration = (duration: number) => {
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${remainingSeconds}s`
}

// Event handlers
const handleFieldChange = () => {
  hasInteracted.value = true
  updateStoreData()
}

const handleFieldBlur = () => {
  hasInteracted.value = true
  validateStep()
}

// Update store with current form data
const updateStoreData = async () => {
  store.updateNewFormData('review', {
    reviewed: formData.value.reviewed,
    notes: formData.value.notes
  })
}

// Validate current step
const validateStep = async () => {
  await store.validateStep(9)
  
  // Emit validation change event to parent
  emit('validation-change', {
    stepId: 9,
    valid: validationResult.value.valid,
    errors: validationResult.value.errors,
    warnings: validationResult.value.warnings
  })
}

// Project creation handlers
const createProject = async () => {
  try {
    await store.executeProject()
  } catch (error) {
    console.error('Project creation failed:', error)
  }
}

const cancelCreation = () => {
  store.cancelExecution()
}

const resetCreation = () => {
  store.clearExecutionResult()
  store.resetForm()
}

const retryCreation = async () => {
  store.clearExecutionResult()
  await createProject()
}

// Watch for external store changes (e.g., from draft loading)
watch(
  () => store.newFormData.review,
  (newData) => {
    formData.value = {
      reviewed: newData.reviewed || false,
      notes: newData.notes || ''
    }
  },
  { deep: true }
)

// Component events
const emit = defineEmits<{
  'validation-change': [payload: {
    stepId: number
    valid: boolean
    errors: any[]
    warnings: any[]
  }]
}>()

// Initialize component
onMounted(async () => {
  // Perform initial validation if data exists
  if (formData.value.reviewed) {
    hasInteracted.value = true
    await nextTick()
    await validateStep()
  }
})
</script>

<style scoped>
.v-container {
  max-width: 1200px;
}

.review-section {
  border-left: 3px solid rgba(var(--v-theme-primary), 0.2);
  padding-left: 16px;
}

.step-divider {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.12);
  padding-bottom: 8px;
}

.step-content {
  padding-top: 12px;
}

.review-item {
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(var(--v-border-color), 0.06);
}

.review-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.review-item strong {
  display: inline-block;
  min-width: 140px;
  margin-bottom: 4px;
  color: rgba(var(--v-theme-on-surface), 0.87);
}

.v-chip-group {
  margin-top: 4px;
}
</style>