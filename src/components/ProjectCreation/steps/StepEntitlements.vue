<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Step Header -->
        <div class="mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            <v-icon icon="mdi-account-key" class="me-3" />
            Entitlements
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Assign ownership and technical responsibility for project entitlements.
          </p>
          <div class="text-body-1 text-medium-emphasis mt-2">
            The following entitlements will be created:
            <ul class="mt-2">
              <li>P-L-DBT-DEV-{{ projectName.toUpperCase() }} for developers</li>
              <li>P-L-DBT-JOB-{{ projectName.toUpperCase() }} for job admins</li>
              <li>P-R-DBT-{{ projectName.toUpperCase() }} for read-only access</li>
            </ul>
          </div>
        </div>

        <!-- Form Fields -->
        <v-form ref="formRef" @submit.prevent>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="entitlementOwner"
                label="Entitlement Owner"
                placeholder="Enter entitlement owner ID (e.g., A123456)"
                variant="outlined"
                density="comfortable"
                :rules="ownerIdRules"
                :error-messages="getFieldErrors('entitlementOwner')"
                required
                @blur="handleBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-account-star" />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="technicalOwner"
                label="Technical Owner"
                placeholder="Enter technical owner ID (e.g., A123456)"
                variant="outlined"
                density="comfortable"
                :rules="ownerIdRules"
                :error-messages="getFieldErrors('technicalOwner')"
                required
                @blur="handleBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-account-cog" />
                </template>
              </v-text-field>
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
                {{ validationResult.valid ? 'Step 8 Complete' : 'Please fix the following issues:' }}
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useProjectCreationStore } from '../../../stores/project-creation'

// Store integration
const store = useProjectCreationStore()

// Get project name from store
const projectName = computed(() => store.newFormData.generalInfo.name || '')

// Form reference
const formRef = ref()

// Interaction tracking
const hasInteracted = ref(false)

// Computed properties with setters to bind directly to the store
const entitlementOwner = computed({
  get: () => store.newFormData.entitlements.entitlementOwner,
  set: (value) => {
    hasInteracted.value = true
    store.updateNewFormData('entitlements', { entitlementOwner: value })
  }
})

const technicalOwner = computed({
  get: () => store.newFormData.entitlements.technicalOwner,
  set: (value) => {
    hasInteracted.value = true
    store.updateNewFormData('entitlements', { technicalOwner: value })
  }
})

// Simplified validation rules (format only)
const ownerIdRules = [
  (v: string) => !!v || 'Owner ID is required',
  (v: string) => /^A\d{6}$/.test(v) || 'Owner ID must be in format A followed by 6 digits'
]

// Computed properties for validation
const validationResult = computed(() => store.getStepValidation(8))

const getFieldErrors = (fieldName: string) => {
  if (!validationResult.value || !hasInteracted.value) return []
  
  return validationResult.value.errors
    .filter(error => error.field === fieldName)
    .map(error => error.message)
}

// Event handlers
const handleBlur = () => {
  hasInteracted.value = true
  validateStep()
}

// Validate current step
const validateStep = async () => {
  await store.validateStep(8)
  
  emit('validation-change', {
    stepId: 8,
    valid: validationResult.value.valid,
    errors: validationResult.value.errors,
    warnings: validationResult.value.warnings
  })
}

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
  if (entitlementOwner.value || technicalOwner.value) {
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
</style>