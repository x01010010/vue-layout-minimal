<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Step Header -->
        <div class="mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            <v-icon icon="mdi-database-plus" class="me-3" />
            New Database Configuration
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Configure a new database instance with business area, environments, and database settings.
          </p>
        </div>

        <!-- Form Fields -->
        <v-form ref="formRef" @submit.prevent>
          <v-row>
            <!-- Business Area Selection -->
            <v-col cols="12">
              <v-select
                v-model="formData.businessArea"
                :items="businessAreaOptions"
                item-title="label"
                item-value="value"
                label="Business Area"
                placeholder="Select business area"
                variant="outlined"
                density="comfortable"
                :rules="businessAreaRules"
                :error-messages="getFieldErrors('businessArea')"
                required
                @update:model-value="handleFieldChange"
                @blur="handleFieldBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-domain" />
                </template>
                <template #item="{ props, item }">
                  <v-list-item
                    v-bind="props"
                    :title="item.raw.label"
                    :subtitle="item.raw.description"
                  >
                    <template #prepend>
                      <v-avatar size="40" color="primary" variant="tonal">
                        <v-icon :icon="item.raw.icon" />
                      </v-avatar>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
              <div class="text-caption text-medium-emphasis mt-1">
                Select the business area that will own this database.
              </div>
            </v-col>

            <!-- Environment Selection -->
            <v-col cols="12">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="d-flex align-center">
                  <v-icon icon="mdi-server-network" class="me-2" />
                  Target Environments
                </v-card-title>
                <v-card-text>
                  <div class="text-subtitle-2 mb-3">
                    Select the environments where this database will be deployed:
                  </div>
                  <v-row>
                    <v-col cols="12" sm="4" v-for="env in environmentOptions" :key="env.value">
                      <v-checkbox
                        v-model="formData.environments"
                        :value="env.value"
                        :label="env.label"
                        :disabled="env.disabled"
                        color="primary"
                        density="comfortable"
                        @update:model-value="handleFieldChange"
                      >
                        <template #label>
                          <div class="d-flex align-center">
                            <v-icon :icon="env.icon" class="me-2" />
                            <div>
                              <div class="font-weight-medium">{{ env.label }}</div>
                              <div class="text-caption text-medium-emphasis">{{ env.description }}</div>
                            </div>
                          </div>
                        </template>
                      </v-checkbox>
                    </v-col>
                  </v-row>
                  <div v-if="getFieldErrors('environments').length" class="text-error text-caption mt-2">
                    {{ getFieldErrors('environments')[0] }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Database Configuration -->
            <v-col cols="12">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-database-settings" class="me-2" />
                    Database Configuration
                  </div>
                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    @click="addDatabase"
                  >
                    <v-icon icon="mdi-plus" start />
                    Add Database
                  </v-btn>
                </v-card-title>
                <v-card-text>
                  <div v-if="!formData.databases.length" class="text-center py-8">
                    <v-icon icon="mdi-database-off" size="64" color="grey-lighten-1" class="mb-4" />
                    <div class="text-h6 text-medium-emphasis mb-2">No databases configured</div>
                    <div class="text-body-2 text-medium-emphasis mb-4">
                      Add at least one database configuration to proceed.
                    </div>
                    <v-btn color="primary" @click="addDatabase">
                      <v-icon icon="mdi-plus" start />
                      Add Your First Database
                    </v-btn>
                  </div>

                  <div v-else>
                    <v-expansion-panels v-model="expandedDatabase" multiple>
                      <v-expansion-panel
                        v-for="(database, index) in formData.databases"
                        :key="index"
                        :value="index"
                      >
                        <v-expansion-panel-title>
                          <div class="d-flex align-center justify-space-between w-100">
                            <div class="d-flex align-center">
                              <v-icon icon="mdi-database" class="me-3" />
                              <div>
                                <div class="font-weight-medium">
                                  {{ database.name || `Database ${index + 1}` }}
                                </div>
                                <div class="text-caption text-medium-emphasis">
                                  {{ database.entitlementBases.length }} entitlement(s),
                                  {{ database.schemas.length }} schema(s)
                                </div>
                              </div>
                            </div>
                            <v-btn
                              icon="mdi-delete"
                              variant="text"
                              size="small"
                              color="error"
                              @click.stop="removeDatabase(index)"
                            />
                          </div>
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <v-row>
                            <v-col cols="12">
                              <v-text-field
                                v-model="database.name"
                                label="Database Name"
                                placeholder="Enter database name"
                                variant="outlined"
                                density="comfortable"
                                required
                                @blur="handleFieldBlur"
                              >
                                <template #prepend-inner>
                                  <v-icon icon="mdi-database" />
                                </template>
                              </v-text-field>
                            </v-col>
                          </v-row>
                          
                          <div class="text-subtitle-2 mb-3 mt-4">Entitlement Bases</div>
                          <div v-if="!database.entitlementBases.length" class="text-center py-4 mb-4" style="border: 1px dashed rgb(var(--v-border-color)); border-radius: 4px;">
                            <div class="text-body-2 text-medium-emphasis mb-2">No entitlement bases configured</div>
                            <v-btn size="small" @click="addEntitlementBase(index)">
                              <v-icon icon="mdi-plus" start />
                              Add Entitlement Base
                            </v-btn>
                          </div>
                          <div v-else class="mb-4">
                            <v-card
                              v-for="(entitlement, entIndex) in database.entitlementBases"
                              :key="entIndex"
                              variant="outlined"
                              class="mb-2"
                            >
                              <v-card-text class="pb-2">
                                <div class="d-flex justify-space-between align-center mb-3">
                                  <div class="text-subtitle-2">Entitlement Base {{ entIndex + 1 }}</div>
                                  <v-btn
                                    icon="mdi-delete"
                                    variant="text"
                                    size="small"
                                    color="error"
                                    @click="removeEntitlementBase(index, entIndex)"
                                  />
                                </div>
                                <v-row>
                                  <v-col cols="12" md="6">
                                    <v-text-field
                                      v-model="entitlement.name"
                                      label="Name"
                                      variant="outlined"
                                      density="compact"
                                      required
                                    />
                                  </v-col>
                                  <v-col cols="12" md="6">
                                    <v-text-field
                                      v-model="entitlement.owner"
                                      label="Owner"
                                      variant="outlined"
                                      density="compact"
                                      required
                                    />
                                  </v-col>
                                  <v-col cols="12" md="6">
                                    <v-text-field
                                      v-model="entitlement.tso"
                                      label="TSO"
                                      variant="outlined"
                                      density="compact"
                                      required
                                    />
                                  </v-col>
                                  <v-col cols="12" md="6">
                                    <v-text-field
                                      v-model="entitlement.readOnlyOwner"
                                      label="Read-Only Owner"
                                      variant="outlined"
                                      density="compact"
                                      required
                                    />
                                  </v-col>
                                </v-row>
                              </v-card-text>
                            </v-card>
                            <v-btn size="small" @click="addEntitlementBase(index)">
                              <v-icon icon="mdi-plus" start />
                              Add Another Entitlement Base
                            </v-btn>
                          </div>

                          <div class="text-subtitle-2 mb-3 mt-4">Schema Definitions</div>
                          <div v-if="!database.schemas.length" class="text-center py-4 mb-4" style="border: 1px dashed rgb(var(--v-border-color)); border-radius: 4px;">
                            <div class="text-body-2 text-medium-emphasis mb-2">No schema definitions configured</div>
                            <v-btn size="small" @click="addSchema(index)">
                              <v-icon icon="mdi-plus" start />
                              Add Schema Definition
                            </v-btn>
                          </div>
                          <div v-else class="mb-4">
                            <v-card
                              v-for="(schema, schemaIndex) in database.schemas"
                              :key="schemaIndex"
                              variant="outlined"
                              class="mb-2"
                            >
                              <v-card-text class="pb-2">
                                <div class="d-flex justify-space-between align-center mb-3">
                                  <div class="text-subtitle-2">Schema {{ schemaIndex + 1 }}</div>
                                  <v-btn
                                    icon="mdi-delete"
                                    variant="text"
                                    size="small"
                                    color="error"
                                    @click="removeSchema(index, schemaIndex)"
                                  />
                                </div>
                                <v-row>
                                  <v-col cols="12" md="6">
                                    <v-text-field
                                      v-model="schema.name"
                                      label="Schema Name"
                                      variant="outlined"
                                      density="compact"
                                      required
                                    />
                                  </v-col>
                                  <v-col cols="12" md="6">
                                    <v-select
                                      v-model="schema.purpose"
                                      :items="schemaPurposeOptions"
                                      item-title="label"
                                      item-value="value"
                                      label="Schema Purpose"
                                      variant="outlined"
                                      density="compact"
                                      required
                                    />
                                  </v-col>
                                  <v-col cols="12" md="6">
                                    <v-text-field
                                      v-model.number="schema.dataRetentionDays"
                                      label="Data Retention (Days)"
                                      type="number"
                                      variant="outlined"
                                      density="compact"
                                      required
                                      min="1"
                                    />
                                  </v-col>
                                  <v-col cols="12" md="6">
                                    <v-checkbox
                                      v-model="schema.restricted"
                                      label="Restricted Schema"
                                      color="primary"
                                      density="compact"
                                    />
                                  </v-col>
                                </v-row>
                              </v-card-text>
                            </v-card>
                            <v-btn size="small" @click="addSchema(index)">
                              <v-icon icon="mdi-plus" start />
                              Add Another Schema Definition
                            </v-btn>
                          </div>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </div>
                  
                  <div v-if="getFieldErrors('databases').length" class="text-error text-caption mt-2">
                    {{ getFieldErrors('databases')[0] }}
                  </div>
                </v-card-text>
              </v-card>
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
                {{ validationResult.valid ? 'Step 3.5 Complete' : 'Please fix the following issues:' }}
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
import type { NewDatabaseCreation, BusinessArea, EnvironmentType, NewDatabaseConfig, EntitlementBase, DatabaseSchema, SchemaPurpose } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Form reference
const formRef = ref()

// Local form data (reactive copy of store data)
const formData = ref<NewDatabaseCreation>({
  businessArea: store.newFormData.newDatabase?.businessArea || 'it',
  environments: [...(store.newFormData.newDatabase?.environments || ['DEV'])],
  databases: store.newFormData.newDatabase?.databases ?
    JSON.parse(JSON.stringify(store.newFormData.newDatabase.databases)) : []
})

// UI state
const hasInteracted = ref(false)
const expandedDatabase = ref<number[]>([])

// Schema purpose options
const schemaPurposeOptions = [
  { value: 'raw', label: 'Raw Data', description: 'Raw, unprocessed data storage' },
  { value: 'staging', label: 'Staging', description: 'Temporary staging area for data processing' },
  { value: 'user_managed', label: 'User Managed', description: 'User-controlled data management' },
  { value: 'target', label: 'Target', description: 'Final target destination for processed data' },
  { value: 'ods', label: 'ODS (Operational Data Store)', description: 'Operational data store for reporting' },
  { value: 'published', label: 'Published', description: 'Published data for external consumption' }
]

// Business area options
const businessAreaOptions = [
  { value: 'cl', label: 'Claims', description: 'Claims processing and management', icon: 'mdi-file-document' },
  { value: 'claims', label: 'Claims Operations', description: 'Claims operations and workflow', icon: 'mdi-clipboard-text' },
  { value: 'corporate', label: 'Corporate', description: 'Corporate functions and governance', icon: 'mdi-office-building' },
  { value: 'crm', label: 'Customer Relations', description: 'Customer relationship management', icon: 'mdi-account-group' },
  { value: 'it', label: 'Information Technology', description: 'IT systems and infrastructure', icon: 'mdi-laptop' },
  { value: 'pl', label: 'Product Lines', description: 'Product line management', icon: 'mdi-package-variant' }
]

// Environment options
const environmentOptions = [
  {
    value: 'DEV',
    label: 'Development',
    description: 'Development environment (always included)',
    icon: 'mdi-code-tags',
    disabled: true // DEV is always included
  },
  {
    value: 'QA',
    label: 'Quality Assurance',
    description: 'Testing and quality assurance',
    icon: 'mdi-test-tube',
    disabled: false
  },
  {
    value: 'PROD',
    label: 'Production',
    description: 'Live production environment',
    icon: 'mdi-server',
    disabled: false
  }
]

// Validation rules
const businessAreaRules = [
  (v: BusinessArea) => !!v || 'Business area is required'
]

// Computed properties
const validationResult = computed(() => store.getStepValidation(3.5))

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

// Database management
const addDatabase = () => {
  const newDatabase: NewDatabaseConfig = {
    name: '',
    entitlementBases: [],
    schemas: [],
    customTags: []
  }
  formData.value.databases.push(newDatabase)
  expandedDatabase.value.push(formData.value.databases.length - 1)
  handleFieldChange()
}

const removeDatabase = (index: number) => {
  formData.value.databases.splice(index, 1)
  expandedDatabase.value = expandedDatabase.value.filter(i => i !== index).map(i => i > index ? i - 1 : i)
  handleFieldChange()
}

const addEntitlementBase = (databaseIndex: number) => {
  const newEntitlement: EntitlementBase = {
    name: '',
    owner: '',
    tso: '',
    readOnlyOwner: '',
    readOnlyTso: ''
  }
  formData.value.databases[databaseIndex].entitlementBases.push(newEntitlement)
  handleFieldChange()
}

const removeEntitlementBase = (databaseIndex: number, entitlementIndex: number) => {
  formData.value.databases[databaseIndex].entitlementBases.splice(entitlementIndex, 1)
  handleFieldChange()
}

const addSchema = (databaseIndex: number) => {
  const newSchema: DatabaseSchema = {
    name: '',
    purpose: 'raw',
    dataRetentionDays: 90,
    restricted: false
  }
  formData.value.databases[databaseIndex].schemas.push(newSchema)
  handleFieldChange()
}

const removeSchema = (databaseIndex: number, schemaIndex: number) => {
  formData.value.databases[databaseIndex].schemas.splice(schemaIndex, 1)
  handleFieldChange()
}

// Update store with current form data
const updateStoreData = async () => {
  store.updateNewFormData('newDatabase', {
    businessArea: formData.value.businessArea,
    environments: formData.value.environments,
    databases: formData.value.databases
  })
}

// Validate current step
const validateStep = async () => {
  await store.validateStep(3.5)
  
  // Emit validation change event to parent
  emit('validation-change', {
    stepId: 3.5,
    valid: validationResult.value.valid,
    errors: validationResult.value.errors,
    warnings: validationResult.value.warnings
  })
}

// Watch for external store changes (e.g., from draft loading)
watch(
  () => store.newFormData.newDatabase,
  (newData) => {
    if (newData) {
      formData.value = {
        businessArea: newData.businessArea || 'it',
        environments: [...(newData.environments || ['DEV'])],
        databases: newData.databases ?
          JSON.parse(JSON.stringify(newData.databases)) : []
      }
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
    formData.value.environments.unshift('DEV')
  }
  
  // Perform initial validation if data exists
  if (formData.value.businessArea || formData.value.databases.length) {
    await nextTick()
    await validateStep()
  }
})
</script>

<style scoped>
.v-container {
  max-width: 900px;
}

.v-expansion-panel-title {
  padding: 16px;
}

.v-card-title {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>