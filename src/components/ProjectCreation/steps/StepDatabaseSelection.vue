<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Step Header -->
        <div class="mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            <v-icon icon="mdi-database-outline" class="me-3" />
            Database Selection
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Choose to use an existing database or create a new one for your project.
          </p>
        </div>

        <!-- Form Fields -->
        <v-form ref="formRef" @submit.prevent>
          <v-row>
            <!-- Database Selection Type -->
            <v-col cols="12">
              <v-radio-group
                v-model="selectionType"
                :rules="selectionTypeRules"
                :error-messages="getFieldErrors('createNewDatabase')"
                required
                @update:model-value="handleSelectionTypeChange"
              >
                <template #label>
                  <div class="text-subtitle-1 font-weight-medium mb-2">
                    <v-icon icon="mdi-database-outline" class="me-2" />
                    Database Selection
                  </div>
                </template>

                <!-- Select Existing Database Option -->
                <v-radio
                  value="existing"
                  color="primary"
                  class="mb-4"
                >
                  <template #label>
                    <div class="ml-3">
                      <div class="text-h6 font-weight-medium text-primary">
                        <v-icon icon="mdi-database" class="me-2" />
                        Select Existing Database
                      </div>
                      <div class="text-body-2 text-medium-emphasis mt-1">
                        Choose from available databases that are already configured and ready to use.
                        Recommended for projects that can share database resources.
                      </div>
                      <v-chip
                        size="small"
                        color="success"
                        variant="tonal"
                        class="mt-2"
                      >
                        <v-icon icon="mdi-clock-fast" start />
                        Quick Setup
                      </v-chip>
                    </div>
                  </template>
                </v-radio>

                <!-- Create New Database Option -->
                <v-radio
                  value="new"
                  color="primary"
                  class="mb-4"
                >
                  <template #label>
                    <div class="ml-3">
                      <div class="text-h6 font-weight-medium">
                        <v-icon icon="mdi-database-plus" class="me-2" />
                        Create New Database
                      </div>
                      <div class="text-body-2 text-medium-emphasis mt-1">
                        Configure a new database instance with custom settings and dedicated resources.
                        Ideal for projects requiring specific database configurations or isolation.
                      </div>
                      <v-chip
                        size="small"
                        color="info"
                        variant="tonal"
                        class="mt-2"
                      >
                        <v-icon icon="mdi-cog" start />
                        Custom Configuration
                      </v-chip>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
            </v-col>

            <!-- Existing Database Selection -->
            <v-col cols="12" v-if="selectionType === 'existing'">
              <v-autocomplete
                v-model="formData.existingDatabase"
                :items="mockDatabases"
                item-title="name"
                item-value="name"
                label="Select Database"
                placeholder="Choose an existing database"
                variant="outlined"
                density="comfortable"
                :rules="existingDatabaseRules"
                :error-messages="getFieldErrors('existingDatabase')"
                required
                clearable
                @update:model-value="handleFieldChange"
                @blur="handleFieldBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-database" />
                </template>
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="item.raw.name"
                    :subtitle="`${item.raw.type} • ${item.raw.status}`"
                  >
                    <template #prepend>
                      <v-avatar size="40" color="primary" variant="tonal">
                        <v-icon icon="mdi-database" />
                      </v-avatar>
                    </template>
                    <template #append>
                      <v-chip
                        :color="item.raw.status === 'Active' ? 'success' : 'warning'"
                        size="small"
                        variant="tonal"
                      >
                        {{ item.raw.status }}
                      </v-chip>
                    </template>
                  </v-list-item>
                </template>
              </v-autocomplete>
              <div class="text-caption text-medium-emphasis mt-1">
                Select from available databases in your organization.
              </div>
            </v-col>

            <!-- New Database Information -->
            <v-col cols="12" v-if="selectionType === 'new'">
              <v-alert
                type="info"
                variant="tonal"
                class="mt-4"
              >
                <template #prepend>
                  <v-icon icon="mdi-information-outline" />
                </template>
                <template #title>
                  New Database Configuration
                </template>
                <div>
                  Creating a new database will require additional configuration steps including business area selection,
                  environment targeting, and database schema setup. This will be handled in the next step.
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
                {{ validationResult.valid ? 'Step 3 Complete' : 'Please fix the following issues:' }}
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
import type { DatabaseSelection } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Form reference
const formRef = ref()

// Mock data for development
const mockDatabases = [
  { id: 'db1', name: 'Production Database', type: 'Oracle', status: 'Active' },
  { id: 'db2', name: 'Development Database', type: 'Oracle', status: 'Active' },
  { id: 'db3', name: 'Testing Database', type: 'Oracle', status: 'Active' },
  { id: 'db4', name: 'Analytics Database', type: 'PostgreSQL', status: 'Active' },
  { id: 'db5', name: 'Legacy Database', type: 'MySQL', status: 'Maintenance' }
]

// Local form data (reactive copy of store data)
const formData = ref<DatabaseSelection>({
  existingDatabase: store.newFormData.databaseSelection.existingDatabase || '',
  createNewDatabase: store.newFormData.databaseSelection.createNewDatabase
})

// Selection type helper (derived from createNewDatabase boolean)
const selectionType = ref<'existing' | 'new'>(
  store.newFormData.databaseSelection.createNewDatabase ? 'new' : 'existing'
)

// Interaction tracking
const hasInteracted = ref(false)

// Validation rules
const selectionTypeRules = [
  (v: string) => !!v || 'Database selection is required'
]

const existingDatabaseRules = [
  (v: string) => {
    if (selectionType.value === 'existing') {
      return !!v || 'Please select an existing database'
    }
    return true
  }
]

// Computed properties
const validationResult = computed(() => store.getStepValidation(3))

// Get field-specific errors
const getFieldErrors = (fieldName: string) => {
  if (!validationResult.value || !hasInteracted.value) return []
  
  return validationResult.value.errors
    .filter(error => error.field === fieldName)
    .map(error => error.message)
}

// Event handlers
const handleSelectionTypeChange = () => {
  hasInteracted.value = true
  
  // Update form data based on selection type
  if (selectionType.value === 'new') {
    formData.value.createNewDatabase = true
    formData.value.existingDatabase = undefined
  } else {
    formData.value.createNewDatabase = false
    // Keep existing database selection if any
  }
  
  updateStoreData()
}

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
  store.updateNewFormData('databaseSelection', {
    existingDatabase: formData.value.existingDatabase,
    createNewDatabase: formData.value.createNewDatabase
  })
}

// Validate current step
const validateStep = async () => {
  await store.validateStep(3)
  
  // Emit validation change event to parent
  emit('validation-change', {
    stepId: 3,
    valid: validationResult.value.valid,
    errors: validationResult.value.errors,
    warnings: validationResult.value.warnings
  })
}

// Watch for external store changes (e.g., from draft loading)
watch(
  () => store.newFormData.databaseSelection,
  (newData) => {
    formData.value = {
      existingDatabase: newData.existingDatabase || '',
      createNewDatabase: newData.createNewDatabase
    }
    
    // Update selection type based on store data
    selectionType.value = newData.createNewDatabase ? 'new' : 'existing'
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
  if (formData.value.createNewDatabase !== undefined || formData.value.existingDatabase) {
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

.v-autocomplete :deep(.v-field__prepend-inner) {
  padding-top: 8px;
}
</style>