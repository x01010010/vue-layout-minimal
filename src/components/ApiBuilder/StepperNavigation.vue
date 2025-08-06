<template>
  <v-card class="stepper-navigation" elevation="1">
    <v-card-text class="pa-4">
      <!-- Progress Bar -->
      <v-progress-linear
        :model-value="progressPercentage"
        color="primary"
        height="4"
        rounded
        class="mb-4"
      />
      
      <!-- Steps Container -->
      <div class="steps-container">
        <div
          v-for="(step, index) in steps"
          :key="step.id"
          class="step-item"
          :class="{
            'step-active': step.id === currentStep,
            'step-completed': step.completed,
            'step-valid': step.valid,
            'step-invalid': !step.valid && step.id < currentStep
          }"
        >
          <!-- Step Circle -->
          <div class="step-circle">
            <v-icon
              v-if="step.completed"
              icon="mdi-check"
              size="small"
              color="white"
            />
            <v-icon
              v-else-if="!step.valid && step.id < currentStep"
              icon="mdi-alert"
              size="small"
              color="white"
            />
            <span v-else class="step-number">{{ step.id }}</span>
          </div>
          
          <!-- Step Content -->
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div class="step-subtitle">{{ step.subtitle }}</div>
          </div>
          
          <!-- Step Icon -->
          <div class="step-icon">
            <v-icon
              :icon="step.icon"
              size="small"
              :color="getStepIconColor(step)"
            />
          </div>
          
          <!-- Connector Line -->
          <div
            v-if="index < steps.length - 1"
            class="step-connector"
            :class="{
              'connector-completed': step.completed,
              'connector-active': step.id === currentStep
            }"
          />
        </div>
      </div>
      
      <!-- Navigation Buttons -->
      <div class="navigation-buttons mt-4">
        <v-btn
          variant="outlined"
          :disabled="!canGoPrevious"
          @click="$emit('previous')"
          prepend-icon="mdi-chevron-left"
        >
          Previous
        </v-btn>
        
        <v-spacer />
        
        <v-btn
          v-if="!isLastStep"
          color="primary"
          :disabled="!canGoNext"
          @click="$emit('next')"
          append-icon="mdi-chevron-right"
        >
          Next
        </v-btn>
        
        <v-btn
          v-else
          color="success"
          :disabled="!canSubmit"
          @click="$emit('submit')"
          prepend-icon="mdi-send"
        >
          Execute Request
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormStep } from '../../types/api-builder'

// Props
interface Props {
  steps: FormStep[]
  currentStep: number
  canGoNext: boolean
  canGoPrevious: boolean
  canSubmit: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canGoNext: false,
  canGoPrevious: false,
  canSubmit: false
})

// Emits
interface Emits {
  (e: 'next'): void
  (e: 'previous'): void
  (e: 'submit'): void
  (e: 'step-click', stepId: number): void
}

const emit = defineEmits<Emits>()

// Computed properties
const progressPercentage = computed(() => {
  const completedSteps = props.steps.filter(step => step.completed).length
  return (completedSteps / props.steps.length) * 100
})

const isLastStep = computed(() => {
  return props.currentStep === props.steps.length
})

// Methods
const getStepIconColor = (step: FormStep): string => {
  if (step.completed) return 'success'
  if (step.id === props.currentStep) return 'primary'
  if (!step.valid && step.id < props.currentStep) return 'error'
  return 'grey'
}

const handleStepClick = (step: FormStep) => {
  // Only allow clicking on completed steps or the current step
  if (step.completed || step.id === props.currentStep) {
    emit('step-click', step.id)
  }
}
</script>

<style scoped>
.stepper-navigation {
  border-radius: 12px;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.step-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.step-item.step-active {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.step-item.step-completed .step-circle {
  background-color: rgb(var(--v-theme-success));
  color: white;
}

.step-item.step-active .step-circle {
  background-color: rgb(var(--v-theme-primary));
  color: white;
}

.step-item.step-invalid .step-circle {
  background-color: rgb(var(--v-theme-error));
  color: white;
}

.step-item:not(.step-active):not(.step-completed):not(.step-invalid) .step-circle {
  background-color: rgba(var(--v-theme-on-surface), 0.12);
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.step-number {
  font-size: 14px;
  font-weight: 600;
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-weight: 600;
  font-size: 16px;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin-bottom: 2px;
}

.step-subtitle {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  line-height: 1.2;
}

.step-icon {
  flex-shrink: 0;
}

.step-connector {
  position: absolute;
  left: 23px;
  top: 48px;
  width: 2px;
  height: 24px;
  background-color: rgba(var(--v-theme-on-surface), 0.12);
  transition: all 0.3s ease;
}

.step-connector.connector-completed {
  background-color: rgb(var(--v-theme-success));
}

.step-connector.connector-active {
  background-color: rgb(var(--v-theme-primary));
}

.navigation-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .step-item {
    gap: 12px;
    padding: 6px;
  }
  
  .step-circle {
    width: 28px;
    height: 28px;
  }
  
  .step-title {
    font-size: 14px;
  }
  
  .step-subtitle {
    font-size: 12px;
  }
  
  .step-connector {
    left: 21px;
    height: 20px;
  }
}

/* Accessibility */
.step-item:focus {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.step-item[aria-disabled="true"] {
  opacity: 0.6;
  cursor: not-allowed;
}

.step-item[aria-disabled="true"]:hover {
  background-color: transparent;
}
</style>