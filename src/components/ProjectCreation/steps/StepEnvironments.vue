<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Step Header -->
        <div class="mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            <v-icon icon="mdi-server-network" class="me-3" />
            Environment Selection
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Select which environments to create for your project. Development is required and always included.
          </p>
        </div>

        <!-- Form Fields -->
        <v-form ref="formRef" @submit.prevent>
          <v-row>
            <!-- Environment Checkboxes -->
            <v-col cols="12">
              <div class="text-subtitle-1 font-weight-medium mb-4">
                <v-icon icon="mdi-server-network" class="me-2" />
                Standard Environments
              </div>
              
              <div class="environment-checkboxes">
                <v-checkbox
                  v-for="env in standardEnvironments"
                  :key="env.id"
                  :model-value="isEnvironmentSelected(env.id)"
                  :disabled="isEnvironmentDisabled(env.id)"
                  :label="env.name"
                  :hint="env.description"
                  color="primary"
                  hide-details="auto"
                  class="mb-2"
                  @update:model-value="(value) => handleEnvironmentChange(env.id, value ?? false)"
                >
                  <template #prepend>
                    <v-icon :icon="env.icon" class="me-2" />
                  </template>
                </v-checkbox>
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
                {{ validationResult.valid ? 'Step 4 Complete' : 'Please fix the following issues:' }}
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
import type { EnvironmentSelection, EnvironmentType } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Form reference
const formRef = ref()

// Standard environments configuration
const standardEnvironments = [
  {
    id: 'DEV' as const,
    name: 'Development',
    description: 'For development and testing',
    icon: 'mdi-code-tags'
  },
  {
    id: 'QA' as const,
    name: 'Testing/QA',
    description: 'For quality assurance testing',
    icon: 'mdi-test-tube'
  },
  {
    id: 'PROD' as const,
    name: 'Production',
    description: 'Live production environment',
    icon: 'mdi-server'
  }
]

// Local form data (reactive copy of store data)
const formData = ref<EnvironmentSelection>({
  environments: [...(store.newFormData.environments.environments || ['DEV'])]
})

// Interaction tracking
const hasInteracted = ref(false)

// Computed properties
const selectedEnvironments = computed(() => formData.value.environments)

const validationResult = computed(() => store.getStepValidation(4))

// Helper functions
const isEnvironmentSelected = (envId: string): boolean => {
  return selectedEnvironments.value.includes(envId as EnvironmentType)
}

const isEnvironmentDisabled = (envId: string): boolean => {
  // Development is always selected and cannot be disabled
  if (envId === 'DEV') return true
  
  // Production can only be selected if QA is selected
  if (envId === 'PROD') {
    return !isEnvironmentSelected('QA')
  }
  
  // QA is always enabled
  return false
}

const getEnvironmentName = (envId: string): string => {
  const standardEnv = standardEnvironments.find(env => env.id === envId)
  return standardEnv ? standardEnv.name : envId
}

const getEnvironmentIcon = (envId: string): string => {
  const standardEnv = standardEnvironments.find(env => env.id === envId)
  return standardEnv ? standardEnv.icon : 'mdi-server'
}

// Event handlers
const handleEnvironmentChange = (envId: string, value: boolean) => {
  hasInteracted.value = true
  
  // Development cannot be unchecked
  if (envId === 'DEV' && !value) {
    return
  }
  
  const index = formData.value.environments.indexOf(envId as EnvironmentType)
  
  if (value && index === -1) {
    // Add environment
    formData.value.environments.push(envId as EnvironmentType)
  } else if (!value && index > -1) {
    // Remove environment
    formData.value.environments.splice(index, 1)
    
    // If QA is being removed, also remove PROD if it's selected
    if (envId === 'QA') {
      const prodIndex = formData.value.environments.indexOf('PROD')
      if (prodIndex > -1) {
        formData.value.environments.splice(prodIndex, 1)
      }
    }
  }
  
  updateStoreData()
}


const handleFieldBlur = () => {
  hasInteracted.value = true
  validateStep()
}

// Update store with current form data
const updateStoreData = async () => {
  store.updateNewFormData('environments', {
    environments: formData.value.environments
  })
}

// Validate current step
const validateStep = async () => {
  await store.validateStep(4)
  
  // Emit validation change event to parent
  emit('validation-change', {
    stepId: 4,
    valid: validationResult.value.valid,
    errors: validationResult.value.errors,
    warnings: validationResult.value.warnings
  })
}

// Watch for external store changes (e.g., from draft loading)
watch(
  () => store.newFormData.environments,
  (newData) => {
    const environments = [...(newData.environments || ['DEV'])]
    // Ensure DEV is always included
    if (!environments.includes('DEV')) {
      environments.push('DEV')
    }
    formData.value = {
      environments
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
  // Ensure DEV is always included
  if (!formData.value.environments.includes('DEV')) {
    formData.value.environments.push('DEV')
    updateStoreData()
  }
  
  // Set default selections if no environments are selected (only DEV)
  if (formData.value.environments.length === 0) {
    formData.value.environments = ['DEV']
    updateStoreData()
  }
  
  // Perform initial validation if data exists
  if (formData.value.environments.length > 0) {
    hasInteracted.value = true
    await nextTick()
    await validateStep()
  }
})
</script>

<style scoped>
.v-container {
  max-width: 1000px;
}

.environment-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>