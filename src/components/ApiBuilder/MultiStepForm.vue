<template>
  <div class="multi-step-form">
    <!-- Stepper Navigation -->
    <StepperNavigation
      :steps="formSteps"
      :current-step="currentStep"
      :can-go-next="canGoNext"
      :can-go-previous="canGoPrevious"
      :can-submit="canSubmit"
      @next="handleNext"
      @previous="handlePrevious"
      @submit="handleSubmit"
      @step-click="handleStepClick"
    />
    
    <!-- Form Content Container -->
    <v-card class="form-content mt-4" elevation="1">
      <v-card-title class="d-flex align-center">
        <v-icon :icon="currentStepData.icon" class="me-2" />
        Step {{ currentStep }}: {{ currentStepData.title }}
      </v-card-title>
      
      <v-card-subtitle>
        {{ currentStepData.subtitle }}
      </v-card-subtitle>
      
      <v-divider />
      
      <v-card-text class="pa-6">
        <!-- Dynamic Step Content -->
        <component
          :is="currentStepComponent"
          v-model="currentStepFormData"
          :validation="currentStepValidation"
          @update:model-value="handleStepDataUpdate"
          @validation-change="handleValidationChange"
        />
      </v-card-text>
      
      <!-- Form Actions -->
      <v-card-actions class="px-6 pb-6">
        <v-btn
          variant="outlined"
          :disabled="!canGoPrevious"
          @click="handlePrevious"
          prepend-icon="mdi-chevron-left"
        >
          Previous
        </v-btn>
        
        <v-spacer />
        
        <!-- Step Progress Indicator -->
        <v-chip
          :color="currentStepData.completed ? 'success' : 'primary'"
          variant="outlined"
          size="small"
        >
          {{ currentStep }} of {{ totalSteps }}
        </v-chip>
        
        <v-spacer />
        
        <v-btn
          v-if="!isLastStep"
          color="primary"
          :disabled="!canGoNext"
          @click="handleNext"
          append-icon="mdi-chevron-right"
        >
          Next
        </v-btn>
        
        <v-btn
          v-else
          color="success"
          :disabled="!canSubmit"
          :loading="isSubmitting"
          @click="handleSubmit"
          prepend-icon="mdi-send"
        >
          Execute Request
        </v-btn>
      </v-card-actions>
    </v-card>
    
    <!-- Auto-save Indicator -->
    <v-snackbar
      v-model="showAutoSaveIndicator"
      timeout="2000"
      color="info"
      location="bottom right"
    >
      <v-icon icon="mdi-content-save" class="me-2" />
      Draft saved automatically
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import StepperNavigation from './StepperNavigation.vue'
import type { 
  FormStep, 
  ApiBuilderFormState, 
  StepValidation,
  FormValidationState 
} from '../../types/api-builder'

// Dynamic imports for step components (will be created in subsequent steps)
const StepMethodUrl = () => import('./steps/StepMethodUrl.vue')
const StepHeaders = () => import('./steps/StepHeaders.vue')
const StepQueryParams = () => import('./steps/StepQueryParams.vue')
const StepRequestBody = () => import('./steps/StepRequestBody.vue')
const StepAuthentication = () => import('./steps/StepAuthentication.vue')
const StepReviewExecute = () => import('./steps/StepReviewExecute.vue')

// Props
interface Props {
  initialStep?: number
  autoSave?: boolean
  autoSaveInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialStep: 1,
  autoSave: true,
  autoSaveInterval: 5000 // 5 seconds
})

// Emits
interface Emits {
  (e: 'form-update', formState: ApiBuilderFormState): void
  (e: 'step-change', newStep: number, oldStep: number): void
  (e: 'form-submit', formState: ApiBuilderFormState): void
  (e: 'draft-save', formState: ApiBuilderFormState): void
}

const emit = defineEmits<Emits>()

// Router
const router = useRouter()

// Reactive state
const currentStep = ref(props.initialStep)
const isSubmitting = ref(false)
const showAutoSaveIndicator = ref(false)
const autoSaveTimer = ref<NodeJS.Timeout | null>(null)

// Form state - initialized with default values
const formState = ref<ApiBuilderFormState>({
  step1: {
    method: 'GET',
    url: ''
  },
  step2: {
    headers: []
  },
  step3: {
    params: []
  },
  step4: {
    contentType: 'application/json',
    body: ''
  },
  step5: {
    auth: {
      type: 'none'
    }
  },
  step6: {
    requestPreview: ''
  }
})

// Validation state
const validationState = ref<FormValidationState>({
  step1: {},
  step2: {},
  step3: {},
  step4: {},
  step5: {},
  step6: {}
})

// Form steps configuration
const formSteps: FormStep[] = [
  {
    id: 1,
    title: 'Method & URL',
    subtitle: 'Configure HTTP method and endpoint',
    icon: 'mdi-web',
    completed: false,
    valid: false,
    optional: false
  },
  {
    id: 2,
    title: 'Headers',
    subtitle: 'Set request headers',
    icon: 'mdi-format-header-1',
    completed: false,
    valid: true,
    optional: true
  },
  {
    id: 3,
    title: 'Query Parameters',
    subtitle: 'Add URL parameters',
    icon: 'mdi-help-circle',
    completed: false,
    valid: true,
    optional: true
  },
  {
    id: 4,
    title: 'Request Body',
    subtitle: 'Configure request payload',
    icon: 'mdi-code-json',
    completed: false,
    valid: true,
    optional: true
  },
  {
    id: 5,
    title: 'Authentication',
    subtitle: 'Set up authentication',
    icon: 'mdi-shield-key',
    completed: false,
    valid: true,
    optional: true
  },
  {
    id: 6,
    title: 'Review & Execute',
    subtitle: 'Review and send request',
    icon: 'mdi-send',
    completed: false,
    valid: true,
    optional: false
  }
]

// Computed properties
const totalSteps = computed(() => formSteps.length)

const currentStepData = computed(() => {
  return formSteps.find(step => step.id === currentStep.value) || formSteps[0]
})

const currentStepFormData = computed({
  get: () => {
    const stepKey = `step${currentStep.value}` as keyof ApiBuilderFormState
    return formState.value[stepKey]
  },
  set: (value) => {
    const stepKey = `step${currentStep.value}` as keyof ApiBuilderFormState
    formState.value[stepKey] = value as any
  }
})

const currentStepValidation = computed(() => {
  const stepKey = `step${currentStep.value}` as keyof FormValidationState
  return validationState.value[stepKey]
})

const currentStepComponent = computed(() => {
  const componentMap = {
    1: StepMethodUrl,
    2: StepHeaders,
    3: StepQueryParams,
    4: StepRequestBody,
    5: StepAuthentication,
    6: StepReviewExecute
  }
  return componentMap[currentStep.value as keyof typeof componentMap]
})

const isLastStep = computed(() => currentStep.value === totalSteps.value)

const canGoPrevious = computed(() => currentStep.value > 1)

const canGoNext = computed(() => {
  if (currentStep.value >= totalSteps.value) return false
  
  const currentStepObj = formSteps.find(step => step.id === currentStep.value)
  if (!currentStepObj) return false
  
  // Can proceed if step is optional or valid
  return currentStepObj.optional || currentStepObj.valid
})

const canSubmit = computed(() => {
  if (!isLastStep.value) return false
  
  // Check that all required steps are valid
  const requiredSteps = formSteps.filter(step => !step.optional)
  return requiredSteps.every(step => step.valid)
})

// Methods
const handleNext = async () => {
  if (!canGoNext.value) return
  
  const oldStep = currentStep.value
  
  // Mark current step as completed if valid
  const currentStepObj = formSteps.find(step => step.id === currentStep.value)
  if (currentStepObj && currentStepObj.valid) {
    currentStepObj.completed = true
  }
  
  currentStep.value++
  emit('step-change', currentStep.value, oldStep)
  
  // Trigger auto-save
  if (props.autoSave) {
    triggerAutoSave()
  }
}

const handlePrevious = () => {
  if (!canGoPrevious.value) return
  
  const oldStep = currentStep.value
  currentStep.value--
  emit('step-change', currentStep.value, oldStep)
}

const handleStepClick = (stepId: number) => {
  // Only allow navigation to completed steps or adjacent steps
  const targetStep = formSteps.find(step => step.id === stepId)
  if (!targetStep) return
  
  const canNavigate = targetStep.completed || 
                     Math.abs(stepId - currentStep.value) <= 1
  
  if (canNavigate) {
    const oldStep = currentStep.value
    currentStep.value = stepId
    emit('step-change', currentStep.value, oldStep)
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value) return
  
  isSubmitting.value = true
  
  try {
    // Mark final step as completed
    const finalStep = formSteps.find(step => step.id === totalSteps.value)
    if (finalStep) {
      finalStep.completed = true
    }
    
    emit('form-submit', formState.value)
  } catch (error) {
    console.error('Form submission error:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleStepDataUpdate = (data: any) => {
  currentStepFormData.value = data
  emit('form-update', formState.value)
  
  // Trigger auto-save after data update
  if (props.autoSave) {
    scheduleAutoSave()
  }
}

const handleValidationChange = (validation: StepValidation) => {
  const stepKey = `step${currentStep.value}` as keyof FormValidationState
  validationState.value[stepKey] = validation
  
  // Update step validity
  const currentStepObj = formSteps.find(step => step.id === currentStep.value)
  if (currentStepObj) {
    currentStepObj.valid = Object.values(validation).every(result => result.valid)
  }
}

const scheduleAutoSave = () => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
  
  autoSaveTimer.value = setTimeout(() => {
    triggerAutoSave()
  }, props.autoSaveInterval)
}

const triggerAutoSave = () => {
  emit('draft-save', formState.value)
  showAutoSaveIndicator.value = true
}

// Lifecycle hooks
onMounted(() => {
  // Initialize first step validation
  const firstStep = formSteps[0]
  if (firstStep) {
    firstStep.valid = false // URL is required
  }
})

onUnmounted(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
})

// Watchers
watch(
  () => formState.value,
  (newState) => {
    emit('form-update', newState)
  },
  { deep: true }
)
</script>

<style scoped>
.multi-step-form {
  max-width: 100%;
}

.form-content {
  border-radius: 12px;
}

.form-content .v-card-title {
  font-size: 1.25rem;
  font-weight: 600;
}

.form-content .v-card-subtitle {
  opacity: 0.7;
  margin-bottom: 0;
}

/* Smooth transitions for step changes */
.form-content {
  transition: all 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .form-content .v-card-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .form-content .v-card-actions .v-spacer {
    display: none;
  }
}
</style>