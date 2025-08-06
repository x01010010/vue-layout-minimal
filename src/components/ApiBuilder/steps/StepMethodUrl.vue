<template>
  <div class="step-method-url">
    <v-alert type="info" class="mb-4" variant="tonal">
      <v-icon icon="mdi-web" class="me-2" />
      Configure the HTTP method and endpoint URL for your API request
    </v-alert>
    
    <v-form ref="formRef" v-model="isFormValid" @submit.prevent>
      <v-row>
        <!-- HTTP Method Selection -->
        <v-col cols="12" md="3">
          <v-select
            v-model="formData.method"
            :items="httpMethods"
            label="HTTP Method"
            variant="outlined"
            :rules="methodRules"
            prepend-inner-icon="mdi-web"
            @update:model-value="handleMethodChange"
          >
            <template #item="{ props, item }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-chip
                    :color="getMethodColor(item.value)"
                    size="small"
                    class="me-2"
                  >
                    {{ item.value }}
                  </v-chip>
                </template>
              </v-list-item>
            </template>
            <template #selection="{ item }">
              <v-chip
                :color="getMethodColor(item.value)"
                size="small"
                class="me-2"
              >
                {{ item.value }}
              </v-chip>
            </template>
          </v-select>
        </v-col>
        
        <!-- URL Input -->
        <v-col cols="12" md="9">
          <v-text-field
            v-model="formData.url"
            label="API Endpoint URL"
            placeholder="https://api.example.com/endpoint"
            variant="outlined"
            :rules="urlRules"
            prepend-inner-icon="mdi-link"
            @update:model-value="handleUrlChange"
            @blur="validateUrl"
          >
            <template #append-inner>
              <v-tooltip text="Test URL connectivity">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-connection"
                    size="small"
                    variant="text"
                    :disabled="!isValidUrl"
                    @click="testConnection"
                  />
                </template>
              </v-tooltip>
            </template>
          </v-text-field>
        </v-col>
      </v-row>
      
      <!-- URL Preview and Validation -->
      <v-row v-if="formData.url" class="mt-2">
        <v-col cols="12">
          <v-card variant="outlined" class="pa-4">
            <v-card-title class="text-subtitle-1 d-flex align-center">
              <v-icon icon="mdi-eye" class="me-2" />
              Request Preview
            </v-card-title>
            <v-card-text class="pt-2">
              <div class="d-flex align-center mb-2">
                <v-chip
                  :color="getMethodColor(formData.method)"
                  size="small"
                  class="me-3"
                >
                  {{ formData.method }}
                </v-chip>
                <code class="text-body-2">{{ formData.url }}</code>
              </div>
              
              <!-- URL Analysis -->
              <v-row class="mt-3">
                <v-col cols="12" md="6">
                  <v-list density="compact">
                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-server" size="small" />
                      </template>
                      <v-list-item-title class="text-caption">Protocol</v-list-item-title>
                      <v-list-item-subtitle>{{ urlParts.protocol || 'Not specified' }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-domain" size="small" />
                      </template>
                      <v-list-item-title class="text-caption">Host</v-list-item-title>
                      <v-list-item-subtitle>{{ urlParts.host || 'Not specified' }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="6">
                  <v-list density="compact">
                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-folder" size="small" />
                      </template>
                      <v-list-item-title class="text-caption">Path</v-list-item-title>
                      <v-list-item-subtitle>{{ urlParts.pathname || '/' }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <template #prepend>
                        <v-icon icon="mdi-check-circle" size="small" />
                      </template>
                      <v-list-item-title class="text-caption">Status</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip
                          :color="isValidUrl ? 'success' : 'error'"
                          size="x-small"
                        >
                          {{ isValidUrl ? 'Valid' : 'Invalid' }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      
      <!-- Method Information -->
      <v-row v-if="selectedMethodInfo" class="mt-2">
        <v-col cols="12">
          <v-alert
            :color="getMethodColor(formData.method)"
            variant="tonal"
            class="mb-0"
          >
            <v-alert-title class="d-flex align-center">
              <v-icon :icon="selectedMethodInfo.icon" class="me-2" />
              {{ formData.method }} Method
            </v-alert-title>
            <div class="text-body-2 mt-2">
              {{ selectedMethodInfo.description }}
            </div>
            <v-chip-group class="mt-2">
              <v-chip
                v-for="use in selectedMethodInfo.commonUses"
                :key="use"
                size="small"
                variant="outlined"
              >
                {{ use }}
              </v-chip>
            </v-chip-group>
          </v-alert>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { ApiBuilderFormState, StepValidation } from '../../../types/api-builder'

// Type for Step 1 form data
type Step1FormData = ApiBuilderFormState['step1']

// Props and Emits
interface Props {
  modelValue?: Step1FormData
  validation?: StepValidation
}

interface Emits {
  (e: 'update:model-value', value: Step1FormData): void
  (e: 'validation-change', validation: StepValidation): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({ method: 'GET', url: '' })
})

const emit = defineEmits<Emits>()

// Form refs and state
const formRef = ref()
const isFormValid = ref(false)

// Form data
const formData = ref<Step1FormData>({
  method: props.modelValue?.method || 'GET',
  url: props.modelValue?.url || ''
})

// HTTP Methods configuration
const httpMethods = [
  { title: 'GET', value: 'GET' },
  { title: 'POST', value: 'POST' },
  { title: 'PUT', value: 'PUT' },
  { title: 'PATCH', value: 'PATCH' },
  { title: 'DELETE', value: 'DELETE' },
  { title: 'HEAD', value: 'HEAD' },
  { title: 'OPTIONS', value: 'OPTIONS' }
]

const methodInfo = {
  GET: {
    icon: 'mdi-download',
    description: 'Retrieve data from the server. Safe and idempotent operation.',
    commonUses: ['Fetch data', 'Read resources', 'Search queries']
  },
  POST: {
    icon: 'mdi-plus',
    description: 'Create new resources or submit data to the server.',
    commonUses: ['Create records', 'Submit forms', 'Upload files']
  },
  PUT: {
    icon: 'mdi-pencil',
    description: 'Update or replace entire resources on the server.',
    commonUses: ['Update records', 'Replace data', 'Upsert operations']
  },
  PATCH: {
    icon: 'mdi-pencil-outline',
    description: 'Partially update existing resources on the server.',
    commonUses: ['Partial updates', 'Modify fields', 'Incremental changes']
  },
  DELETE: {
    icon: 'mdi-delete',
    description: 'Remove resources from the server.',
    commonUses: ['Delete records', 'Remove data', 'Cleanup operations']
  },
  HEAD: {
    icon: 'mdi-information',
    description: 'Retrieve headers only, without the response body.',
    commonUses: ['Check existence', 'Get metadata', 'Validate resources']
  },
  OPTIONS: {
    icon: 'mdi-cog',
    description: 'Discover allowed methods and capabilities for a resource.',
    commonUses: ['CORS preflight', 'API discovery', 'Method validation']
  }
}

// Validation rules
const methodRules = [
  (v: string) => !!v || 'HTTP method is required'
]

const urlRules = [
  (v: string) => !!v || 'URL is required',
  (v: string) => {
    if (!v) return true
    try {
      new URL(v)
      return true
    } catch {
      return 'Please enter a valid URL (e.g., https://api.example.com/endpoint)'
    }
  }
]

// Computed properties
const selectedMethodInfo = computed(() => {
  return methodInfo[formData.value.method as keyof typeof methodInfo]
})

const isValidUrl = computed(() => {
  if (!formData.value.url) return false
  try {
    new URL(formData.value.url)
    return true
  } catch {
    return false
  }
})

const urlParts = computed(() => {
  if (!isValidUrl.value) return {}
  try {
    const url = new URL(formData.value.url)
    return {
      protocol: url.protocol.replace(':', ''),
      host: url.host,
      pathname: url.pathname,
      search: url.search
    }
  } catch {
    return {}
  }
})

// Methods
const getMethodColor = (method: string) => {
  const colors = {
    GET: 'blue',
    POST: 'green',
    PUT: 'orange',
    PATCH: 'purple',
    DELETE: 'red',
    HEAD: 'teal',
    OPTIONS: 'grey'
  }
  return colors[method as keyof typeof colors] || 'primary'
}

const handleMethodChange = () => {
  updateFormData()
}

const handleUrlChange = () => {
  updateFormData()
}

const validateUrl = () => {
  if (formRef.value) {
    formRef.value.validate()
  }
}

const testConnection = async () => {
  // TODO: Implement connection testing in future phase
  console.log('Testing connection to:', formData.value.url)
}

const updateFormData = () => {
  emit('update:model-value', formData.value)
  
  // Update validation state
  const validation: StepValidation = {
    method: {
      valid: !!formData.value.method,
      message: formData.value.method ? '' : 'HTTP method is required'
    },
    url: {
      valid: isValidUrl.value,
      message: isValidUrl.value ? '' : 'Valid URL is required'
    }
  }
  
  emit('validation-change', validation)
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    formData.value = { ...newValue }
  }
}, { deep: true })

watch(isFormValid, (valid) => {
  updateFormData()
})

// Lifecycle
onMounted(() => {
  updateFormData()
})
</script>

<style scoped>
.step-method-url {
  max-width: 100%;
}

code {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
}

.v-list-item {
  min-height: 32px;
}

.v-list-item-title {
  font-weight: 500;
}
</style>