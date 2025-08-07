<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Step Header -->
        <div class="mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            <v-icon icon="mdi-bell-outline" class="me-3" />
            Notifications
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Set support group and email distribution list for project notifications.
          </p>
        </div>

        <!-- Form Fields -->
        <v-form ref="formRef" @submit.prevent>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.supportGroup"
                label="Support Group"
                placeholder="Enter support group name"
                variant="outlined"
                density="comfortable"
                :rules="supportGroupRules"
                :error-messages="getFieldErrors('supportGroup')"
                required
                @update:model-value="handleFieldChange"
                @blur="handleFieldBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-account-group" />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.emailDistribution"
                label="Email Distribution"
                placeholder="Enter email distribution list"
                variant="outlined"
                density="comfortable"
                :rules="emailDistributionRules"
                :error-messages="getFieldErrors('emailDistribution')"
                @update:model-value="handleFieldChange"
                @blur="handleFieldBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-email-multiple" />
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
                {{ validationResult.valid ? 'Step 6 Complete' : 'Please fix the following issues:' }}
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
import type { NotificationConfig } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Form reference
const formRef = ref()

// Local form data (reactive copy of store data)
const formData = ref<NotificationConfig>({
  supportGroup: store.newFormData.notifications.supportGroup || '',
  primaryContactEmail: store.newFormData.notifications.primaryContactEmail || '',
  secondaryContactEmail: store.newFormData.notifications.secondaryContactEmail || '',
  notificationEvents: [...(store.newFormData.notifications.notificationEvents || [])],
  escalationLevel: store.newFormData.notifications.escalationLevel || 'medium',
  communicationChannels: [...(store.newFormData.notifications.communicationChannels || ['email'])],
  emailDistribution: store.newFormData.notifications.emailDistribution || ''
})

// Interaction tracking
const hasInteracted = ref(false)

// Validation rules
const supportGroupRules = [
  (v: string) => !!v || 'Support group is required'
]

const emailDistributionRules: ((v: string) => boolean | string)[] = [
  // Email distribution is optional according to wireframes
]

// Computed properties
const validationResult = computed(() => store.getStepValidation(6))

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
  store.updateNewFormData('notifications', {
    supportGroup: formData.value.supportGroup,
    primaryContactEmail: formData.value.primaryContactEmail,
    secondaryContactEmail: formData.value.secondaryContactEmail,
    notificationEvents: formData.value.notificationEvents,
    escalationLevel: formData.value.escalationLevel,
    communicationChannels: formData.value.communicationChannels,
    emailDistribution: formData.value.emailDistribution
  })
}

// Validate current step
const validateStep = async () => {
  await store.validateStep(6)
  
  // Emit validation change event to parent
  emit('validation-change', {
    stepId: 6,
    valid: validationResult.value.valid,
    errors: validationResult.value.errors,
    warnings: validationResult.value.warnings
  })
}

// Watch for external store changes (e.g., from draft loading)
watch(
  () => store.newFormData.notifications,
  (newData) => {
    formData.value = {
      supportGroup: newData.supportGroup || '',
      primaryContactEmail: newData.primaryContactEmail || '',
      secondaryContactEmail: newData.secondaryContactEmail || '',
      notificationEvents: [...(newData.notificationEvents || [])],
      escalationLevel: newData.escalationLevel || 'medium',
      communicationChannels: [...(newData.communicationChannels || ['email'])],
      emailDistribution: newData.emailDistribution || ''
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
  if (formData.value.supportGroup) {
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