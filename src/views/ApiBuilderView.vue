<template>
  <div class="api-builder-view">
    <v-container fluid class="pa-6">
      <div class="d-flex align-center mb-6">
        <v-icon icon="mdi-api" size="large" class="me-3" />
        <div>
          <h1 class="text-h4 font-weight-bold">API Builder</h1>
          <p class="text-subtitle-1 text-medium-emphasis mb-0">
            Build and test REST API requests with an intuitive step-by-step interface
          </p>
        </div>
      </div>
      
      <!-- Multi-Step Form Component -->
      <MultiStepForm
        :initial-step="1"
        :auto-save="true"
        :auto-save-interval="5000"
        @form-update="handleFormUpdate"
        @step-change="handleStepChange"
        @form-submit="handleFormSubmit"
        @draft-save="handleDraftSave"
      />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import MultiStepForm from '../components/ApiBuilder/MultiStepForm.vue'
import type { ApiBuilderFormState } from '../types/api-builder'

// Event handlers
const handleFormUpdate = (formState: ApiBuilderFormState) => {
  console.log('Form updated:', formState)
}

const handleStepChange = (newStep: number, oldStep: number) => {
  console.log(`Step changed from ${oldStep} to ${newStep}`)
}

const handleFormSubmit = (formState: ApiBuilderFormState) => {
  console.log('Form submitted:', formState)
}

const handleDraftSave = (formState: ApiBuilderFormState) => {
  console.log('Draft saved:', formState)
}
</script>

<style scoped>
.api-builder-view {
  min-height: 100vh;
}
</style>