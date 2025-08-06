<template>
  <div class="project-creation-view">
    <v-container fluid class="pa-0">
      <!-- Header Section -->
      <div class="d-flex align-center mb-6 px-6 pt-6">
        <v-icon icon="mdi-folder-plus" size="large" class="me-3" />
        <div>
          <h1 class="text-h4 font-weight-bold">Create New Project</h1>
          <p class="text-subtitle-1 text-medium-emphasis mb-0">
            Set up your project with database configuration and custom parameters
          </p>
        </div>
      </div>

      <!-- Draft Restoration Alert -->
      <v-alert
        v-if="hasDraft && !draftRestored"
        type="info"
        variant="tonal"
        closable
        class="mb-6 mx-6"
        @click:close="dismissDraftAlert"
      >
        <template #title>
          <v-icon icon="mdi-content-save" class="me-2" />
          Draft Available
        </template>
        <div class="d-flex align-center justify-space-between">
          <span>You have a saved draft from {{ formatDraftDate(lastSaved) }}. Would you like to restore it?</span>
          <div class="ms-4">
            <v-btn
              variant="text"
              size="small"
              @click="restoreDraft"
            >
              Restore
            </v-btn>
            <v-btn
              variant="text"
              size="small"
              @click="dismissDraftAlert"
            >
              Start Fresh
            </v-btn>
          </div>
        </div>
      </v-alert>

      <!-- Auto-Save Indicator -->
      <AutoSaveIndicator
        class="mb-4 mx-6"
        @manual-save="handleManualSave"
        @draft-loaded="handleDraftLoaded"
        @draft-deleted="handleDraftDeleted"
        @auto-save-toggled="handleAutoSaveToggled"
      />

      <!-- Progress Indicator -->
      <v-card class="mb-6 mx-6" v-if="showProgressIndicator">
        <v-card-text class="py-2">
          <div class="d-flex align-center">
            <span class="text-body-2 me-4">Progress:</span>
            <v-progress-linear
              :model-value="progressPercentage"
              height="8"
              rounded
              color="primary"
              class="flex-grow-1"
            />
            <span class="text-body-2 ms-4">{{ completedSteps.length }}/{{ totalSteps }} steps</span>
          </div>
        </v-card-text>
      </v-card>

      <!-- Main Form Container -->
      <v-card class="project-creation-form">
        <v-card-text class="pa-0">
          <!-- Horizontal Stepper Navigation -->
          <HorizontalStepper
            :steps="store.config.stepDefinitions"
            :current-step="currentStep"
            :completed-steps="completedSteps"
            :can-navigate-to-step="store.canNavigateToStep"
            :get-step-validation="store.getStepValidation"
            @step-click="handleStepClick"
          />

          <v-divider />

          <!-- Step Content Container -->
          <div class="step-content pa-6">
            <!-- Step 1: Project Basics -->
            <div v-if="currentStep === 1" class="step-container">
              <StepProjectBasics
                :model-value="formData.basics"
                @update:model-value="handleBasicsUpdate"
                @validation-change="handleValidationChange"
              />
            </div>

            <!-- Step 2: Database Configuration -->
            <div v-if="currentStep === 2" class="step-container">
              <StepDatabaseConfig
                :model-value="formData.database"
                @update:model-value="handleDatabaseUpdate"
                @validation-change="handleValidationChange"
              />
            </div>

            <!-- Step 3: Parameters (Placeholder) -->
            <div v-if="currentStep === 3" class="step-container">
              <div class="step-header mb-6">
                <h2 class="text-h5 mb-2">Parameters</h2>
                <p class="text-body-1 text-medium-emphasis">
                  Configure additional project parameters
                </p>
              </div>
              
              <v-alert type="info" variant="tonal">
                <template #title>Coming Soon</template>
                Dynamic parameter configuration will be implemented in the next phase.
              </v-alert>
            </div>

            <!-- Step 4: Review & Execute -->
            <div v-if="currentStep === 4" class="step-container">
              <StepReviewExecute />
            </div>
          </div>

          <v-divider />

          <!-- Navigation Actions -->
          <div class="navigation-actions pa-6">
            <div class="d-flex justify-space-between align-center">
              <v-btn
                variant="outlined"
                :disabled="!canNavigateBack"
                @click="previousStep"
              >
                <v-icon icon="mdi-chevron-left" class="me-2" />
                Previous
              </v-btn>

              <div class="d-flex align-center">
                <v-btn
                  variant="text"
                  @click="resetForm"
                >
                  Reset Form
                </v-btn>
                
                <v-btn
                  v-if="currentStep < totalSteps"
                  color="primary"
                  class="ms-3"
                  :disabled="!canNavigateForward"
                  @click="nextStep"
                >
                  Next
                  <v-icon icon="mdi-chevron-right" class="ms-2" />
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useProjectCreationStore } from '../stores/project-creation'
import type { ProjectBasics } from '../types/project-creation'
import HorizontalStepper from '../components/ProjectCreation/HorizontalStepper.vue'
import AutoSaveIndicator from '../components/ProjectCreation/AutoSaveIndicator.vue'
import StepProjectBasics from '../components/ProjectCreation/steps/StepProjectBasics.vue'
import StepDatabaseConfig from '../components/ProjectCreation/steps/StepDatabaseConfig.vue'
import StepReviewExecute from '../components/ProjectCreation/steps/StepReviewExecute.vue'

// Store
const store = useProjectCreationStore()

// Local state
const draftRestored = ref(false)

// Props (for route params)
interface Props {
  initialStep?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialStep: 1
})

// Computed properties from store
const formData = computed(() => store.formData)
const currentStep = computed({
  get: () => store.navigation.currentStep,
  set: (value: number) => store.goToStep(value)
})
const completedSteps = computed(() => store.navigation.completedSteps)
const totalSteps = computed(() => store.navigation.totalSteps)
const canNavigateBack = computed(() => store.navigation.canNavigateBack)
const canNavigateForward = computed(() => store.navigation.canNavigateForward)
const hasDraft = computed(() => store.draft.hasDraft)
const lastSaved = computed(() => store.draft.lastSaved)
const isExecuting = computed(() => store.execution.status === 'executing')
const executionStatus = computed(() => store.execution.status)
const executionProgress = computed(() => store.execution.progress)
const executionMessage = computed(() => store.execution.message)
const executionResult = computed(() => store.execution.result)
const executionError = computed(() => store.execution.error)
const canExecute = computed(() => store.canExecuteProject)

// UI computed properties
const showProgressIndicator = computed(() => completedSteps.value.length > 0)
const progressPercentage = computed(() => (completedSteps.value.length / totalSteps.value) * 100)

// Form options
const projectTypes = [
  { title: 'Web Application', value: 'web-app' },
  { title: 'API Service', value: 'api-service' },
  { title: 'Mobile App', value: 'mobile-app' },
  { title: 'Desktop App', value: 'desktop-app' },
  { title: 'Library', value: 'library' },
  { title: 'Microservice', value: 'microservice' }
]


// Methods
const handleFormUpdate = () => {
  // Trigger validation on current step
  store.validateCurrentStep()
}

const handleBasicsUpdate = (newBasics: ProjectBasics) => {
  // Update store with new basics data
  store.updateFormData('basics', newBasics)
}

const handleDatabaseUpdate = (newDatabase: any) => {
  // Update store with new database data
  store.updateFormData('database', newDatabase)
}

const handleValidationChange = (isValid: boolean) => {
  // Handle validation state changes from the component
  if (isValid) {
    store.validateCurrentStep()
  }
}

const nextStep = () => store.nextStep()
const previousStep = () => store.previousStep()
const resetForm = () => store.resetForm()

const handleStepClick = (stepId: number) => {
  store.goToStep(stepId)
}

const restoreDraft = async () => {
  try {
    // This would load the most recent draft
    const drafts = await store.getDraftsFromStorage()
    if (drafts.length > 0) {
      await store.loadDraft(drafts[0].id)
      draftRestored.value = true
    }
  } catch (error) {
    console.error('Failed to restore draft:', error)
  }
}

const dismissDraftAlert = () => {
  draftRestored.value = true
}

const saveDraft = async () => {
  try {
    await store.saveDraftToStorage()
  } catch (error) {
    console.error('Failed to save draft:', error)
  }
}

// Enhanced draft management handlers
const handleManualSave = async () => {
  try {
    await store.triggerManualSave()
  } catch (error) {
    console.error('Manual save failed:', error)
  }
}

const handleDraftLoaded = (draftId: string) => {
  console.log('Draft loaded:', draftId)
  draftRestored.value = true
}

const handleDraftDeleted = (draftId: string) => {
  console.log('Draft deleted:', draftId)
}

const handleAutoSaveToggled = (enabled: boolean) => {
  console.log('Auto-save toggled:', enabled)
}

const executeProject = async () => {
  try {
    await store.executeProject()
  } catch (error) {
    console.error('Project execution failed:', error)
  }
}

const getExecutionIcon = () => {
  switch (executionStatus.value) {
    case 'preparing': return 'mdi-cog'
    case 'executing': return 'mdi-rocket-launch'
    case 'success': return 'mdi-check-circle'
    case 'error': return 'mdi-alert-circle'
    case 'cancelled': return 'mdi-cancel'
    default: return 'mdi-help'
  }
}

const getExecutionTitle = () => {
  switch (executionStatus.value) {
    case 'preparing': return 'Preparing...'
    case 'executing': return 'Creating Project...'
    case 'success': return 'Success!'
    case 'error': return 'Error'
    case 'cancelled': return 'Cancelled'
    default: return 'Unknown'
  }
}

const formatDraftDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// Lifecycle
onMounted(async () => {
  await store.initializeStore()
  
  // Navigate to initial step if provided
  if (props.initialStep && props.initialStep !== currentStep.value) {
    store.goToStep(props.initialStep)
  }
})

onUnmounted(() => {
  store.cleanupStore()
})
</script>

<style scoped>
.project-creation-view {
  min-height: 100vh;
}

.project-creation-form {
  width: 100%;
}

.step-container {
  min-height: 400px;
}

.step-header {
  text-align: center;
}

.navigation-actions {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>