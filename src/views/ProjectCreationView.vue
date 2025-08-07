<template>
  <div class="project-creation-view">
    <v-container fluid class="pa-0">
      <!-- Header Section -->
      <div class="d-flex align-center mb-6 px-6 pt-6">
        <v-icon icon="mdi-folder-plus" size="large" class="me-3" />
        <div>
          <h1 class="text-h4 font-weight-bold">Create dbt Cloud Project</h1>

        </div>
        <v-spacer />
        <AutoSaveIndicator class="me-4" />
      </div>

      <!-- Main Form Container -->
      <v-card class="project-creation-form">
        <v-card-text class="pa-0">
          <!-- Horizontal Stepper Navigation -->
          <HorizontalStepper
            :steps="[...store.config.stepDefinitions]"
            :current-step="store.navigation.currentStep"
            :completed-steps="[...store.navigation.completedSteps]"
            :can-navigate-to-step="store.canNavigateToStep"
            :get-step-validation="store.getStepValidation"
            @step-click="handleStepClick"
          />

          <v-divider />

          <!-- Step Content Container -->
          <div class="step-content pa-6">
            <div class="step-container">
              <!-- Step 1: General Information -->
              <StepGeneralInfo
                v-if="store.navigation.currentStep === 1"
                @validation-change="handleValidationChange"
              />
              
              <!-- Step 2: Setup Type -->
              <StepSetupType
                v-if="store.navigation.currentStep === 2"
                @validation-change="handleValidationChange"
              />
              
              <!-- Step 3: Database Selection -->
              <StepDatabaseSelection
                v-if="store.navigation.currentStep === 3"
                @validation-change="handleValidationChange"
              />

              <!-- Step 3.5: New Database -->
              <StepNewDatabase
                v-if="store.navigation.currentStep === 3.5"
              />
              
              <!-- Step 4: Environments -->
              <StepEnvironments
                v-if="store.navigation.currentStep === 4"
                @validation-change="handleValidationChange"
              />
              
              <!-- Step 5: Database Authentication -->
              <StepDatabaseAuth
                v-if="store.navigation.currentStep === 5"
                @validation-change="handleValidationChange"
              />
              
              <!-- Step 6: Notifications -->
              <StepNotifications
                v-if="store.navigation.currentStep === 6"
                @validation-change="handleValidationChange"
              />
              
              <!-- Step 7: GitHub Configuration -->
              <StepGitHub
                v-if="store.navigation.currentStep === 7"
                @validation-change="handleValidationChange"
              />
              
              <!-- Step 8: Entitlements -->
              <StepEntitlements
                v-if="store.navigation.currentStep === 8"
                @validation-change="handleValidationChange"
              />
              
              <!-- Step 9: Review & Create -->
              <StepReviewCreate
                v-if="store.navigation.currentStep === 9"
                @validation-change="handleValidationChange"
              />
            </div>
          </div>

          <v-divider />

          <!-- Navigation Actions -->
          <div class="navigation-actions pa-6">
            <div class="d-flex justify-space-between align-center">
              <v-btn
                variant="outlined"
                :disabled="!store.navigation.canNavigateBack"
                @click="store.previousStep"
              >
                <v-icon icon="mdi-chevron-left" class="me-2" />
                Previous
              </v-btn>

              <div class="d-flex align-center">
                <v-btn
                  variant="text"
                  @click="store.resetForm"
                >
                  Reset Form
                </v-btn>
                
                <v-btn
                  v-if="store.navigation.currentStep < store.navigation.totalSteps"
                  color="primary"
                  class="ms-3"
                  :disabled="!store.navigation.canNavigateForward"
                  @click="store.nextStep"
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
import { onMounted, onUnmounted } from 'vue';
import { useProjectCreationStore } from '../stores/project-creation';
import AutoSaveIndicator from '../components/ProjectCreation/AutoSaveIndicator.vue';
import HorizontalStepper from '../components/ProjectCreation/HorizontalStepper.vue';
import StepGeneralInfo from '../components/ProjectCreation/steps/StepGeneralInfo.vue';
import StepSetupType from '../components/ProjectCreation/steps/StepSetupType.vue'
import StepDatabaseSelection from '../components/ProjectCreation/steps/StepDatabaseSelection.vue'
import StepNewDatabase from '../components/ProjectCreation/steps/StepNewDatabase.vue'
import StepEnvironments from '../components/ProjectCreation/steps/StepEnvironments.vue'
import StepDatabaseAuth from '../components/ProjectCreation/steps/StepDatabaseAuth.vue'
import StepNotifications from '../components/ProjectCreation/steps/StepNotifications.vue'
import StepGitHub from '../components/ProjectCreation/steps/StepGitHub.vue'
import StepEntitlements from '../components/ProjectCreation/steps/StepEntitlements.vue'
import StepReviewCreate from '../components/ProjectCreation/steps/StepReviewCreate.vue'

// Store
const store = useProjectCreationStore()

// Props (for route params)
interface Props {
  initialStep?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialStep: 1
})

// Methods
const handleStepClick = (stepId: number) => {
  store.goToStep(stepId)
}

const handleValidationChange = (payload: {
  stepId: number
  valid: boolean
  errors: any[]
  warnings: any[]
}) => {
  // The validation change is handled automatically by the store
  // through the StepGeneralInfo component's internal validation logic
  console.log('Validation change for step', payload.stepId, 'valid:', payload.valid)
}

// Lifecycle
onMounted(async () => {
  await store.initializeStore()
  
  // Navigate to initial step if provided
  if (props.initialStep && props.initialStep !== store.navigation.currentStep) {
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