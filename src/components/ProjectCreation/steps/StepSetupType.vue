<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Step Header -->
        <div class="mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            <v-icon icon="mdi-cog-outline" class="me-3" />
            Setup Type
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Choose between OAD (On-Demand) and Classic setup approaches for your project.
          </p>
        </div>

        <!-- Form Fields -->
        <v-form ref="formRef" @submit.prevent>
          <v-row>
            <!-- Setup Type Selection -->
            <v-col cols="12">
              <v-radio-group
                v-model="formData.setupType"
                :rules="setupTypeRules"
                :error-messages="getFieldErrors('setupType')"
                required
                @update:model-value="handleFieldChange"
              >
                <template #label>
                  <div class="text-subtitle-1 font-weight-medium mb-2">
                    <v-icon icon="mdi-cog-outline" class="me-2" />
                    Setup Type Selection
                  </div>
                </template>

                <!-- OAD Option -->
                <v-radio
                  value="OAD"
                  color="primary"
                  class="mb-4"
                >
                  <template #label>
                    <div class="ml-3">
                      <div class="text-h6 font-weight-medium text-primary">
                        <v-icon icon="mdi-lightning-bolt" class="me-2" />
                        OAD (On-Demand)
                      </div>
                      <div class="text-body-2 text-medium-emphasis mt-1">
                        Modern, cloud-native approach with automated provisioning and scaling.
                        Recommended for new projects requiring flexibility and rapid deployment.
                      </div>
                      <v-chip
                        size="small"
                        color="success"
                        variant="tonal"
                        class="mt-2"
                      >
                        <v-icon icon="mdi-star" start />
                        Recommended
                      </v-chip>
                    </div>
                  </template>
                </v-radio>

                <!-- Classic Option -->
                <v-radio
                  value="Classic"
                  color="primary"
                  class="mb-4"
                >
                  <template #label>
                    <div class="ml-3">
                      <div class="text-h6 font-weight-medium">
                        <v-icon icon="mdi-server" class="me-2" />
                        Classic
                      </div>
                      <div class="text-body-2 text-medium-emphasis mt-1">
                        Traditional setup approach with manual configuration and established workflows.
                        Suitable for projects requiring specific legacy integrations or compliance requirements.
                      </div>
                      <v-chip
                        size="small"
                        color="info"
                        variant="tonal"
                        class="mt-2"
                      >
                        <v-icon icon="mdi-shield-check" start />
                        Enterprise Ready
                      </v-chip>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-col>

            <!-- Additional Information -->
            <v-col cols="12" v-if="formData.setupType">
              <v-alert
                :type="formData.setupType === 'OAD' ? 'info' : 'warning'"
                variant="tonal"
                class="mt-4"
              >
                <template #prepend>
                  <v-icon :icon="formData.setupType === 'OAD' ? 'mdi-information-outline' : 'mdi-alert-outline'" />
                </template>
                <template #title>
                  {{ formData.setupType === 'OAD' ? 'OAD Setup Information' : 'Classic Setup Information' }}
                </template>
                <div v-if="formData.setupType === 'OAD'">
                  Your project will be configured with modern cloud-native tools and automated deployment pipelines.
                  This includes containerization, auto-scaling, and integrated monitoring capabilities.
                </div>
                <div v-else>
                  Your project will use traditional deployment methods with manual configuration steps.
                  Additional setup time may be required for environment provisioning and configuration.
                </div>
              </v-alert>
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
                {{ validationResult.valid ? 'Step 2 Complete' : 'Please fix the following issues:' }}
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
import type { SetupTypeSelection } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Form reference
const formRef = ref()

// Local form data (reactive copy of store data)
const formData = ref<SetupTypeSelection>({
  setupType: store.newFormData.setupType.setupType
})

// Interaction tracking
const hasInteracted = ref(false)

// Validation rules
const setupTypeRules = [
  (v: string) => !!v || 'Setup type selection is required'
]

// Computed properties
const validationResult = computed(() => store.getStepValidation(2))

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

// Update store with current form data
const updateStoreData = async () => {
  store.updateNewFormData('setupType', {
    setupType: formData.value.setupType
  })
}

// Validate current step
const validateStep = async () => {
  await store.validateStep(2)
  
  // Emit validation change event to parent
  emit('validation-change', {
    stepId: 2,
    valid: validationResult.value.valid,
    errors: validationResult.value.errors,
    warnings: validationResult.value.warnings
  })
}

// Watch for external store changes (e.g., from draft loading)
watch(
  () => store.newFormData.setupType,
  (newData) => {
    formData.value = {
      setupType: newData.setupType
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
  if (formData.value.setupType) {
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

.v-radio-group :deep(.v-selection-control) {
  align-items: flex-start;
}

.v-radio-group :deep(.v-selection-control__wrapper) {
  margin-top: 4px;
}

.v-radio :deep(.v-label) {
  opacity: 1;
}
</style>