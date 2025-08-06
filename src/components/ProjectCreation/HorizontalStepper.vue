<template>
  <div class="horizontal-stepper">
    <div class="stepper-container">
      <div class="stepper-steps">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="stepper-step"
          :class="getStepClasses(step)"
          @click="handleStepClick(step.id)"
          @keydown="handleKeyDown($event, step.id)"
          :tabindex="isStepClickable(step.id) ? 0 : -1"
          :aria-label="getStepAriaLabel(step)"
          role="button"
        >
          <!-- Connecting Line -->
          <div 
            v-if="index > 0" 
            class="step-connector"
            :class="getConnectorClasses(step, index)"
          />
          
          <!-- Step Circle -->
          <div class="step-circle">
            <v-avatar
              :color="getStepColor(step)"
              :variant="getStepVariant(step)"
              size="40"
              class="step-avatar"
            >
              <v-icon
                :icon="getStepIcon(step)"
                :color="getStepIconColor(step)"
                size="20"
              />
            </v-avatar>
          </div>
          
          <!-- Step Content -->
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div class="step-subtitle">{{ step.subtitle }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { StepDefinition } from '../../types/project-creation'

// Props
interface Props {
  steps: StepDefinition[]
  currentStep: number
  completedSteps: number[]
  canNavigateToStep: (stepId: number) => boolean
  getStepValidation: (stepId: number) => { valid: boolean; errors: any[]; warnings: any[]; touched: boolean }
}

const props = defineProps<Props>()

// Emits
interface Emits {
  (e: 'step-click', stepId: number): void
  (e: 'step-change', stepId: number): void
}

const emit = defineEmits<Emits>()

// Methods
const getStepClasses = (step: StepDefinition) => {
  return {
    'active': step.id === props.currentStep,
    'completed': step.completed,
    'error': !step.valid && props.getStepValidation(step.id).touched,
    'clickable': isStepClickable(step.id)
  }
}

const getConnectorClasses = (step: StepDefinition, index: number) => {
  const previousStep = props.steps[index - 1]
  return {
    'completed': previousStep?.completed || false,
    'active': step.id === props.currentStep
  }
}

const isStepClickable = (stepId: number) => {
  return props.canNavigateToStep(stepId)
}

const getStepColor = (step: StepDefinition) => {
  if (step.completed) return 'success'
  if (step.id === props.currentStep) return 'primary'
  if (!step.valid && props.getStepValidation(step.id).touched) return 'error'
  return 'grey-lighten-1'
}

const getStepVariant = (step: StepDefinition) => {
  if (step.completed || step.id === props.currentStep) return 'flat'
  return 'tonal'
}

const getStepIcon = (step: StepDefinition) => {
  if (step.completed) return 'mdi-check'
  if (!step.valid && props.getStepValidation(step.id).touched) return 'mdi-alert'
  return step.icon
}

const getStepIconColor = (step: StepDefinition) => {
  if (step.completed) return 'white'
  if (step.id === props.currentStep) return 'white'
  return 'grey-darken-1'
}

const getStepAriaLabel = (step: StepDefinition) => {
  let label = `Step ${step.id}: ${step.title}`
  if (step.completed) label += ' (completed)'
  if (step.id === props.currentStep) label += ' (current)'
  if (!step.valid && props.getStepValidation(step.id).touched) label += ' (has errors)'
  return label
}

const handleStepClick = (stepId: number) => {
  if (isStepClickable(stepId)) {
    emit('step-click', stepId)
  }
}

const handleKeyDown = (event: KeyboardEvent, stepId: number) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleStepClick(stepId)
  }
  
  // Arrow key navigation
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    const currentIndex = props.steps.findIndex(s => s.id === stepId)
    const direction = event.key === 'ArrowRight' ? 1 : -1
    const nextIndex = currentIndex + direction
    
    if (nextIndex >= 0 && nextIndex < props.steps.length) {
      const nextStep = props.steps[nextIndex]
      if (isStepClickable(nextStep.id)) {
        // Focus the next step element
        const nextElement = document.querySelector(
          `.stepper-step[aria-label*="Step ${nextStep.id}"]`
        ) as HTMLElement
        nextElement?.focus()
      }
    }
  }
}
</script>

<style scoped>
.horizontal-stepper {
  width: 100%;
}

.stepper-container {
  padding: 24px;
  background-color: rgb(var(--v-theme-surface));
}

.stepper-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
}

.stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  transition: all 0.3s ease;
  border-radius: 8px;
  padding: 8px;
  outline: none;
}

.stepper-step.clickable {
  cursor: pointer;
}

.stepper-step.clickable:hover {
  transform: translateY(-2px);
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.stepper-step.clickable:focus {
  background-color: rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 0 0 2px rgb(var(--v-theme-primary));
}

.stepper-step.active {
  z-index: 2;
}

.step-connector {
  position: absolute;
  top: 20px;
  left: -50%;
  right: 50%;
  height: 2px;
  background-color: rgb(var(--v-theme-outline));
  z-index: 1;
  transition: background-color 0.3s ease;
}

.step-connector.completed {
  background-color: rgb(var(--v-theme-success));
}

.step-connector.active {
  background-color: rgb(var(--v-theme-primary));
}

.step-circle {
  position: relative;
  z-index: 2;
  margin-bottom: 12px;
}

.step-avatar {
  transition: all 0.3s ease;
}

.step-content {
  text-align: center;
  max-width: 120px;
}

.step-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 4px;
  transition: color 0.3s ease;
}

.step-subtitle {
  font-size: 0.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  line-height: 1.2;
  transition: color 0.3s ease;
}

.stepper-step.active .step-title {
  color: rgb(var(--v-theme-primary));
}

.stepper-step.error .step-title {
  color: rgb(var(--v-theme-error));
}

.stepper-step.completed .step-title {
  color: rgb(var(--v-theme-success));
}

/* Responsive Design */
@media (max-width: 768px) {
  .stepper-steps {
    flex-direction: column;
    align-items: stretch;
  }
  
  .stepper-step {
    flex-direction: row;
    align-items: center;
    margin-bottom: 16px;
    padding: 12px;
  }
  
  .step-connector {
    display: none;
  }
  
  .step-circle {
    margin-bottom: 0;
    margin-right: 16px;
  }
  
  .step-content {
    text-align: left;
    max-width: none;
    flex: 1;
  }
  
  .step-title {
    font-size: 1rem;
  }
  
  .step-subtitle {
    font-size: 0.875rem;
  }
}

@media (max-width: 480px) {
  .stepper-container {
    padding: 16px;
  }
  
  .step-content {
    margin-left: 8px;
  }
  
  .step-subtitle {
    display: none;
  }
}
</style>