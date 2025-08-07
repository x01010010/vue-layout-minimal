<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Step Header -->
        <div class="mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            <v-icon icon="mdi-key-variant" class="me-3" />
            Database Authentication
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Configure database authentication credentials and connection settings for QA and Production environments.
          </p>
        </div>

        <!-- Form Fields -->
        <v-form ref="formRef" @submit.prevent>
          <v-row>
            <!-- QA Authentication Section -->
            <v-col cols="12">
              <v-card variant="outlined" class="mb-6">
                <v-card-title class="d-flex align-center">
                  <v-icon icon="mdi-test-tube" class="me-2" />
                  QA Environment Authentication
                </v-card-title>
                <v-card-text>
                  <!-- QA Auth Method Selection -->
                  <v-radio-group
                    v-model="formData.qaAuth.method"
                    :rules="authMethodRules"
                    :error-messages="getFieldErrors('qaAuth.method')"
                    required
                    @update:model-value="handleFieldChange"
                  >
                    <template #label>
                      <div class="text-subtitle-1 font-weight-medium mb-2">
                        <v-icon icon="mdi-shield-key" class="me-2" />
                        Authentication Method
                      </div>
                    </template>

                    <!-- Service Account Option -->
                    <v-radio
                      value="service_account"
                      color="primary"
                      class="mb-3"
                    >
                      <template #label>
                        <div class="ml-3">
                          <div class="text-h6 font-weight-medium text-primary">
                            <v-icon icon="mdi-account-key" class="me-2" />
                            Service Account
                          </div>
                          <div class="text-body-2 text-medium-emphasis mt-1">
                            Use service account credentials for database authentication.
                            Recommended for automated systems and secure environments.
                          </div>
                        </div>
                      </template>
                    </v-radio>

                    <!-- Keypair Option -->
                    <v-radio
                      value="keypair"
                      color="primary"
                      class="mb-3"
                    >
                      <template #label>
                        <div class="ml-3">
                          <div class="text-h6 font-weight-medium">
                            <v-icon icon="mdi-key" class="me-2" />
                            Key Pair Authentication
                          </div>
                          <div class="text-body-2 text-medium-emphasis mt-1">
                            Use public/private key pair for authentication.
                            Provides enhanced security through cryptographic keys.
                          </div>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>

                  <!-- QA Service Account Fields -->
                  <div v-if="formData.qaAuth.method === 'service_account'" class="mt-4">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="formData.qaAuth.serviceAccount"
                          label="Service Account"
                          placeholder="Enter service account name"
                          variant="outlined"
                          density="comfortable"
                          :rules="serviceAccountRules"
                          :error-messages="getFieldErrors('qaAuth.serviceAccount')"
                          required
                          @blur="handleFieldBlur"
                        >
                          <template #prepend-inner>
                            <v-icon icon="mdi-account" />
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="formData.qaAuth.password"
                          label="Password"
                          placeholder="Enter password"
                          variant="outlined"
                          density="comfortable"
                          :type="showQaPassword ? 'text' : 'password'"
                          :rules="passwordRules"
                          :error-messages="getFieldErrors('qaAuth.password')"
                          required
                          @blur="handleFieldBlur"
                        >
                          <template #prepend-inner>
                            <v-icon icon="mdi-lock" />
                          </template>
                          <template #append-inner>
                            <v-btn
                              :icon="showQaPassword ? 'mdi-eye-off' : 'mdi-eye'"
                              variant="text"
                              size="small"
                              @click="showQaPassword = !showQaPassword"
                            />
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- QA Keypair Fields -->
                  <div v-if="formData.qaAuth.method === 'keypair'" class="mt-4">
                    <v-row>
                      <v-col cols="12">
                        <v-textarea
                          v-model="formData.qaAuth.publicKey"
                          label="Public Key"
                          placeholder="Enter public key"
                          variant="outlined"
                          density="comfortable"
                          rows="3"
                          :rules="publicKeyRules"
                          :error-messages="getFieldErrors('qaAuth.publicKey')"
                          required
                          @blur="handleFieldBlur"
                        >
                          <template #prepend-inner>
                            <v-icon icon="mdi-key-plus" />
                          </template>
                        </v-textarea>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="formData.qaAuth.privateKey"
                          label="Private Key"
                          placeholder="Enter private key"
                          variant="outlined"
                          density="comfortable"
                          rows="3"
                          :rules="privateKeyRules"
                          :error-messages="getFieldErrors('qaAuth.privateKey')"
                          required
                          @blur="handleFieldBlur"
                        >
                          <template #prepend-inner>
                            <v-icon icon="mdi-key-minus" />
                          </template>
                        </v-textarea>
                      </v-col>
                    </v-row>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Production Authentication Section -->
            <v-col cols="12">
              <v-card variant="outlined" class="mb-6">
                <v-card-title class="d-flex align-center">
                  <v-icon icon="mdi-server" class="me-2" />
                  Production Environment Authentication
                </v-card-title>
                <v-card-text>
                  <!-- Production Auth Method Selection -->
                  <v-radio-group
                    v-model="formData.prodAuth.method"
                    :rules="authMethodRules"
                    :error-messages="getFieldErrors('prodAuth.method')"
                    required
                    @update:model-value="handleFieldChange"
                  >
                    <template #label>
                      <div class="text-subtitle-1 font-weight-medium mb-2">
                        <v-icon icon="mdi-shield-key" class="me-2" />
                        Authentication Method
                      </div>
                    </template>

                    <!-- Service Account Option -->
                    <v-radio
                      value="service_account"
                      color="primary"
                      class="mb-3"
                    >
                      <template #label>
                        <div class="ml-3">
                          <div class="text-h6 font-weight-medium text-primary">
                            <v-icon icon="mdi-account-key" class="me-2" />
                            Service Account
                          </div>
                          <div class="text-body-2 text-medium-emphasis mt-1">
                            Use service account credentials for database authentication.
                            Recommended for automated systems and secure environments.
                          </div>
                        </div>
                      </template>
                    </v-radio>

                    <!-- Keypair Option -->
                    <v-radio
                      value="keypair"
                      color="primary"
                      class="mb-3"
                    >
                      <template #label>
                        <div class="ml-3">
                          <div class="text-h6 font-weight-medium">
                            <v-icon icon="mdi-key" class="me-2" />
                            Key Pair Authentication
                          </div>
                          <div class="text-body-2 text-medium-emphasis mt-1">
                            Use public/private key pair for authentication.
                            Provides enhanced security through cryptographic keys.
                          </div>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>

                  <!-- Production Service Account Fields -->
                  <div v-if="formData.prodAuth.method === 'service_account'" class="mt-4">
                    <v-row>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="formData.prodAuth.serviceAccount"
                          label="Service Account"
                          placeholder="Enter service account name"
                          variant="outlined"
                          density="comfortable"
                          :rules="serviceAccountRules"
                          :error-messages="getFieldErrors('prodAuth.serviceAccount')"
                          required
                          @blur="handleFieldBlur"
                        >
                          <template #prepend-inner>
                            <v-icon icon="mdi-account" />
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-text-field
                          v-model="formData.prodAuth.password"
                          label="Password"
                          placeholder="Enter password"
                          variant="outlined"
                          density="comfortable"
                          :type="showProdPassword ? 'text' : 'password'"
                          :rules="passwordRules"
                          :error-messages="getFieldErrors('prodAuth.password')"
                          required
                          @blur="handleFieldBlur"
                        >
                          <template #prepend-inner>
                            <v-icon icon="mdi-lock" />
                          </template>
                          <template #append-inner>
                            <v-btn
                              :icon="showProdPassword ? 'mdi-eye-off' : 'mdi-eye'"
                              variant="text"
                              size="small"
                              @click="showProdPassword = !showProdPassword"
                            />
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </div>

                  <!-- Production Keypair Fields -->
                  <div v-if="formData.prodAuth.method === 'keypair'" class="mt-4">
                    <v-row>
                      <v-col cols="12">
                        <v-textarea
                          v-model="formData.prodAuth.publicKey"
                          label="Public Key"
                          placeholder="Enter public key"
                          variant="outlined"
                          density="comfortable"
                          rows="3"
                          :rules="publicKeyRules"
                          :error-messages="getFieldErrors('prodAuth.publicKey')"
                          required
                          @blur="handleFieldBlur"
                        >
                          <template #prepend-inner>
                            <v-icon icon="mdi-key-plus" />
                          </template>
                        </v-textarea>
                      </v-col>
                      <v-col cols="12">
                        <v-textarea
                          v-model="formData.prodAuth.privateKey"
                          label="Private Key"
                          placeholder="Enter private key"
                          variant="outlined"
                          density="comfortable"
                          rows="3"
                          :rules="privateKeyRules"
                          :error-messages="getFieldErrors('prodAuth.privateKey')"
                          required
                          @blur="handleFieldBlur"
                        >
                          <template #prepend-inner>
                            <v-icon icon="mdi-key-minus" />
                          </template>
                        </v-textarea>
                      </v-col>
                    </v-row>
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
                {{ validationResult.valid ? 'Step 5 Complete' : 'Please fix the following issues:' }}
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
import type { DatabaseAuthorization } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Form reference
const formRef = ref()

// Password visibility toggles
const showQaPassword = ref(false)
const showProdPassword = ref(false)

// Local form data (reactive copy of store data)
const formData = ref<DatabaseAuthorization>({
  qaAuth: {
    method: store.newFormData.databaseAuth.qaAuth.method,
    serviceAccount: store.newFormData.databaseAuth.qaAuth.serviceAccount || '',
    password: store.newFormData.databaseAuth.qaAuth.password || '',
    publicKey: store.newFormData.databaseAuth.qaAuth.publicKey || '',
    privateKey: store.newFormData.databaseAuth.qaAuth.privateKey || ''
  },
  prodAuth: {
    method: store.newFormData.databaseAuth.prodAuth.method,
    serviceAccount: store.newFormData.databaseAuth.prodAuth.serviceAccount || '',
    password: store.newFormData.databaseAuth.prodAuth.password || '',
    publicKey: store.newFormData.databaseAuth.prodAuth.publicKey || '',
    privateKey: store.newFormData.databaseAuth.prodAuth.privateKey || ''
  }
})

// Interaction tracking
const hasInteracted = ref(false)

// Validation rules
const authMethodRules = [
  (v: string) => !!v || 'Authentication method is required'
]

const serviceAccountRules = [
  (v: string) => !!v || 'Service account is required',
  (v: string) => v.length >= 3 || 'Service account must be at least 3 characters'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 8 || 'Password must be at least 8 characters'
]

const publicKeyRules = [
  (v: string) => !!v || 'Public key is required',
  (v: string) => v.includes('BEGIN PUBLIC KEY') || 'Invalid public key format'
]

const privateKeyRules = [
  (v: string) => !!v || 'Private key is required',
  (v: string) => v.includes('BEGIN PRIVATE KEY') || 'Invalid private key format'
]

// Computed properties
const validationResult = computed(() => store.getStepValidation(5))

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
  store.updateNewFormData('databaseAuth', {
    qaAuth: {
      method: formData.value.qaAuth.method,
      serviceAccount: formData.value.qaAuth.serviceAccount,
      password: formData.value.qaAuth.password,
      publicKey: formData.value.qaAuth.publicKey,
      privateKey: formData.value.qaAuth.privateKey
    },
    prodAuth: {
      method: formData.value.prodAuth.method,
      serviceAccount: formData.value.prodAuth.serviceAccount,
      password: formData.value.prodAuth.password,
      publicKey: formData.value.prodAuth.publicKey,
      privateKey: formData.value.prodAuth.privateKey
    }
  })
}

// Validate current step
const validateStep = async () => {
  await store.validateStep(5)
  
  // Emit validation change event to parent
  emit('validation-change', {
    stepId: 5,
    valid: validationResult.value.valid,
    errors: validationResult.value.errors,
    warnings: validationResult.value.warnings
  })
}

// Watch for external store changes (e.g., from draft loading)
watch(
  () => store.newFormData.databaseAuth,
  (newData) => {
    formData.value = {
      qaAuth: {
        method: newData.qaAuth.method,
        serviceAccount: newData.qaAuth.serviceAccount || '',
        password: newData.qaAuth.password || '',
        publicKey: newData.qaAuth.publicKey || '',
        privateKey: newData.qaAuth.privateKey || ''
      },
      prodAuth: {
        method: newData.prodAuth.method,
        serviceAccount: newData.prodAuth.serviceAccount || '',
        password: newData.prodAuth.password || '',
        publicKey: newData.prodAuth.publicKey || '',
        privateKey: newData.prodAuth.privateKey || ''
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
  // Perform initial validation if data exists
  if (formData.value.qaAuth.method || formData.value.prodAuth.method) {
    hasInteracted.value = true
    await nextTick()
    await validateStep()
  }
})
</script>

<style scoped>
.v-container {
  max-width: 900px;
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

.v-card-title {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>