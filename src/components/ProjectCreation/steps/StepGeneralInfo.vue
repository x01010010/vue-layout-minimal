<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Step Header -->
        <div class="mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            <v-icon icon="mdi-information-outline" class="me-3" />
            General Information
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Provide basic information about your project including name, owner, and description.
          </p>
        </div>

        <!-- Form Fields -->
        <v-form ref="formRef" @submit.prevent>
          <v-row>
            <!-- Project Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="Project Name"
                placeholder="Enter your project name"
                variant="outlined"
                density="comfortable"
                :rules="nameRules"
                :error-messages="getFieldErrors('name')"
                required
                clearable
                @input="handleFieldChange"
                @blur="handleFieldBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-folder-outline" />
                </template>
              </v-text-field>
            </v-col>

            <!-- Project Owner -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.owner"
                label="Project Owner"
                placeholder="Enter project owner name"
                variant="outlined"
                density="comfortable"
                :rules="ownerRules"
                :error-messages="getFieldErrors('owner')"
                required
                clearable
                @input="handleFieldChange"
                @blur="handleFieldBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-account-outline" />
                </template>
              </v-text-field>
            </v-col>

            <!-- Project Description -->
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                label="Project Description"
                placeholder="Describe your project's purpose and goals"
                variant="outlined"
                density="comfortable"
                :rules="descriptionRules"
                :error-messages="getFieldErrors('description')"
                rows="4"
                auto-grow
                clearable
                @input="handleFieldChange"
                @blur="handleFieldBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-text-box-outline" />
                </template>
              </v-textarea>
              
              <!-- Description Warning -->
              <v-alert
                v-if="!formData.description.trim() && hasInteracted"
                type="warning"
                variant="tonal"
                density="compact"
                class="mt-2"
              >
                <template #prepend>
                  <v-icon icon="mdi-alert-outline" />
                </template>
                Project description is recommended for better project documentation.
              </v-alert>
            </v-col>

            <!-- Project Tags -->
            <v-col cols="12">
              <v-combobox
                v-model="formData.tags"
                label="Project Tags"
                placeholder="Add tags to categorize your project"
                variant="outlined"
                density="comfortable"
                multiple
                chips
                closable-chips
                clearable
                @input="handleFieldChange"
                @blur="handleFieldBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-tag-outline" />
                </template>
                <template #chip="{ props, item }">
                  <v-chip
                    v-bind="props"
                    :text="item.raw"
                    size="small"
                    color="primary"
                    variant="tonal"
                  />
                </template>
              </v-combobox>
              <div class="text-caption text-medium-emphasis mt-1">
                Press Enter to add tags. Tags help organize and categorize your project.
              </div>
            </v-col>
          </v-row>
        </v-form>

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
                {{ validationResult.valid ? 'Step 1 Complete' : 'Please fix the following issues:' }}
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
import type { GeneralInfo } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Form reference
const formRef = ref()

// Local form data (reactive copy of store data)
const formData = ref<GeneralInfo>({
  name: store.newFormData.generalInfo.name,
  owner: store.newFormData.generalInfo.owner,
  description: store.newFormData.generalInfo.description,
  tags: [...store.newFormData.generalInfo.tags]
})

// Interaction tracking
const hasInteracted = ref(false)

// Validation rules
const nameRules = [
  (v: string) => !!v || 'Project name is required',
  (v: string) => (v && v.length >= 3) || 'Project name must be at least 3 characters',
  (v: string) => (v && v.length <= 100) || 'Project name must be less than 100 characters'
]

const ownerRules = [
  (v: string) => !!v || 'Project owner is required',
  (v: string) => (v && v.length >= 2) || 'Project owner must be at least 2 characters',
  (v: string) => (v && v.length <= 100) || 'Project owner must be less than 100 characters'
]

const descriptionRules = [
  (v: string) => !v || v.length <= 1000 || 'Description must be less than 1000 characters'
]

// Computed properties
const validationResult = computed(() => store.getStepValidation(1))

// Get field-specific errors
const getFieldErrors = (fieldName: string) => {
  if (!validationResult.value || !hasInteracted.value) return []
  
  return validationResult.value.errors
    .filter(error => error.field === fieldName)
    .map(error => error.message)
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
  store.updateNewFormData('generalInfo', {
    name: formData.value.name,
    owner: formData.value.owner,
    description: formData.value.description,
    tags: [...formData.value.tags]
  })
}

// Validate current step
const validateStep = async () => {
  await store.validateStep(1)
  
  // Emit validation change event to parent
  emit('validation-change', {
    stepId: 1,
    valid: validationResult.value.valid,
    errors: validationResult.value.errors,
    warnings: validationResult.value.warnings
  })
}

// Watch for external store changes (e.g., from draft loading)
watch(
  () => store.newFormData.generalInfo,
  (newData) => {
    formData.value = {
      name: newData.name,
      owner: newData.owner,
      description: newData.description,
      tags: [...newData.tags]
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
  if (formData.value.name || formData.value.owner || formData.value.description) {
    hasInteracted.value = true
    await nextTick()
    await validateStep()
  }
})
</script>

<style scoped>
.v-container {
  max-width: 800px;
}

.v-text-field :deep(.v-field__prepend-inner) {
  padding-top: 8px;
}

.v-textarea :deep(.v-field__prepend-inner) {
  padding-top: 12px;
}

.v-combobox :deep(.v-field__prepend-inner) {
  padding-top: 8px;
}
</style>