<template>
  <div class="step-database-config">
    <div class="step-header mb-6">
      <h2 class="text-h5 mb-2">Database Configuration</h2>
      <p class="text-body-1 text-medium-emphasis">
        Configure your database connection and settings for the project
      </p>
    </div>

    <!-- Database Type Selection -->
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="localData.type"
          label="Database Type"
          :items="databaseTypeOptions"
          variant="outlined"
          required
          persistent-hint
          hint="Select the database system for your project"
          @update:model-value="handleDatabaseTypeChange"
        >
          <template #prepend-inner>
            <v-icon icon="mdi-database" />
          </template>
        </v-select>
      </v-col>
    </v-row>

    <!-- Dynamic Database Configuration Fields -->
    <div v-if="localData.type !== 'none'" class="database-config-fields">
      <!-- Connection Method Selection -->
      <v-row>
        <v-col cols="12">
          <v-radio-group
            v-model="connectionMethod"
            inline
            @update:model-value="handleConnectionMethodChange"
          >
            <template #label>
              <span class="text-subtitle-1 font-weight-medium">Connection Method</span>
            </template>
            <v-radio
              label="Connection String"
              value="string"
              color="primary"
            />
            <v-radio
              label="Individual Fields"
              value="fields"
              color="primary"
            />
          </v-radio-group>
        </v-col>
      </v-row>

      <!-- Connection String Method -->
      <div v-if="connectionMethod === 'string'">
        <v-row>
          <v-col cols="12">
            <v-text-field
              v-model="localData.connectionString"
              label="Connection String"
              :placeholder="getConnectionStringPlaceholder()"
              variant="outlined"
              :error-messages="connectionStringErrors"
              persistent-hint
              :hint="getConnectionStringHint()"
              @input="validateConnectionString"
              @blur="validateConnectionString"
            >
              <template #prepend-inner>
                <v-icon icon="mdi-link" />
              </template>
            </v-text-field>
          </v-col>
        </v-row>
      </div>

      <!-- Individual Fields Method -->
      <div v-if="connectionMethod === 'fields'" class="connection-fields">
        <!-- SQLite File Path -->
        <v-row v-if="localData.type === 'sqlite'">
          <v-col cols="12">
            <v-text-field
              v-model="connectionFields.filePath"
              label="Database File Path"
              placeholder="/path/to/database.db"
              variant="outlined"
              persistent-hint
              hint="Path where the SQLite database file will be stored"
              @input="buildConnectionString"
            >
              <template #prepend-inner>
                <v-icon icon="mdi-file-database" />
              </template>
              <template #append-inner>
                <v-btn
                  icon="mdi-folder-open"
                  variant="text"
                  size="small"
                  @click="selectDatabaseFile"
                />
              </template>
            </v-text-field>
          </v-col>
        </v-row>

        <!-- Standard Database Fields (PostgreSQL, MySQL, Redis) -->
        <div v-if="['postgresql', 'mysql', 'redis'].includes(localData.type)">
          <v-row>
            <v-col cols="12" md="8">
              <v-text-field
                v-model="connectionFields.host"
                label="Host"
                placeholder="localhost"
                variant="outlined"
                @input="buildConnectionString"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-server" />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="connectionFields.port"
                label="Port"
                :placeholder="getDefaultPort()"
                variant="outlined"
                type="number"
                @input="buildConnectionString"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-ethernet" />
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row v-if="localData.type !== 'redis'">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="connectionFields.username"
                label="Username"
                placeholder="username"
                variant="outlined"
                @input="buildConnectionString"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-account" />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="connectionFields.password"
                label="Password"
                placeholder="password"
                variant="outlined"
                type="password"
                @input="buildConnectionString"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-lock" />
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <v-row v-if="localData.type !== 'redis'">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="connectionFields.database"
                label="Database Name"
                :placeholder="getDatabasePlaceholder()"
                variant="outlined"
                @input="buildConnectionString"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-database" />
                </template>
              </v-text-field>
            </v-col>
          </v-row>

          <!-- Redis specific fields -->
          <v-row v-if="localData.type === 'redis'">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="connectionFields.password"
                label="Password (Optional)"
                placeholder="password"
                variant="outlined"
                type="password"
                @input="buildConnectionString"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-lock" />
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="connectionFields.database"
                label="Database Number"
                placeholder="0"
                variant="outlined"
                type="number"
                min="0"
                max="15"
                @input="buildConnectionString"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-database" />
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </div>

        <!-- MongoDB Fields -->
        <div v-if="localData.type === 'mongodb'">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="connectionFields.mongoUri"
                label="MongoDB URI"
                placeholder="mongodb://localhost:27017"
                variant="outlined"
                persistent-hint
                hint="MongoDB connection URI (without database name)"
                @input="buildConnectionString"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-leaf" />
                </template>
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="connectionFields.database"
                label="Database Name"
                placeholder="myapp"
                variant="outlined"
                @input="buildConnectionString"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-database" />
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </div>
      </div>

      <!-- Schema/Database Name Field (for connection string method) -->
      <v-row v-if="connectionMethod === 'string' && showSchemaField">
        <v-col cols="12" md="6">
          <v-text-field
            v-model="localData.schema"
            :label="getSchemaLabel()"
            :placeholder="getSchemaPlaceholder()"
            variant="outlined"
            persistent-hint
            :hint="getSchemaHint()"
            @input="handleFormUpdate"
          >
            <template #prepend-inner>
              <v-icon icon="mdi-database-outline" />
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <!-- Generated Connection String Preview -->
      <v-row v-if="connectionMethod === 'fields' && localData.connectionString">
        <v-col cols="12">
          <v-text-field
            :model-value="localData.connectionString"
            label="Generated Connection String"
            variant="outlined"
            readonly
            persistent-hint
            hint="This connection string is automatically generated from the fields above"
          >
            <template #prepend-inner>
              <v-icon icon="mdi-eye" />
            </template>
            <template #append-inner>
              <v-btn
                icon="mdi-content-copy"
                variant="text"
                size="small"
                @click="copyConnectionString"
              />
            </template>
          </v-text-field>
        </v-col>
      </v-row>

      <!-- Advanced Settings Section -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-expansion-panels v-model="advancedSettingsPanel" variant="accordion">
            <v-expansion-panel>
              <v-expansion-panel-title>
                <template #default="{ expanded }">
                  <v-row no-gutters>
                    <v-col cols="4" class="d-flex justify-start">
                      <v-icon icon="mdi-cog" class="me-2" />
                      Advanced Settings
                    </v-col>
                    <v-col cols="8" class="text-grey">
                      <v-fade-transition leave-absolute>
                        <span v-if="expanded" key="0">
                          Configure SSL, connection pooling, and other advanced options
                        </span>
                        <span v-else key="1">
                          {{ getAdvancedSettingsSummary() }}
                        </span>
                      </v-fade-transition>
                    </v-col>
                  </v-row>
                </template>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <!-- SSL/TLS Configuration -->
                <div class="mb-6">
                  <h4 class="text-h6 mb-3">SSL/TLS Configuration</h4>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-switch
                        v-model="localData.options.ssl"
                        label="Enable SSL/TLS"
                        color="primary"
                        persistent-hint
                        hint="Enable secure connection to the database"
                        @update:model-value="handleFormUpdate"
                      />
                    </v-col>
                  </v-row>

                  <!-- SSL Certificate Options (shown when SSL is enabled) -->
                  <div v-if="localData.options.ssl && showSSLOptions" class="ssl-options mt-4">
                    <v-row>
                      <v-col cols="12" md="4">
                        <v-text-field
                          v-model="localData.options.sslCert"
                          label="SSL Certificate Path"
                          placeholder="/path/to/client-cert.pem"
                          variant="outlined"
                          persistent-hint
                          hint="Path to SSL client certificate file"
                          @input="handleFormUpdate"
                        >
                          <template #prepend-inner>
                            <v-icon icon="mdi-certificate" />
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field
                          v-model="localData.options.sslKey"
                          label="SSL Private Key Path"
                          placeholder="/path/to/client-key.pem"
                          variant="outlined"
                          persistent-hint
                          hint="Path to SSL private key file"
                          @input="handleFormUpdate"
                        >
                          <template #prepend-inner>
                            <v-icon icon="mdi-key" />
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col cols="12" md="4">
                        <v-text-field
                          v-model="localData.options.sslCA"
                          label="SSL CA Certificate Path"
                          placeholder="/path/to/ca-cert.pem"
                          variant="outlined"
                          persistent-hint
                          hint="Path to SSL Certificate Authority file"
                          @input="handleFormUpdate"
                        >
                          <template #prepend-inner>
                            <v-icon icon="mdi-shield-check" />
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                  </div>
                </div>

                <!-- Connection Pooling Settings -->
                <div class="mb-6">
                  <h4 class="text-h6 mb-3">Connection Pooling</h4>
                  <v-row>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model.number="localData.options.poolSize"
                        label="Pool Size"
                        type="number"
                        min="1"
                        max="100"
                        variant="outlined"
                        persistent-hint
                        hint="Maximum number of connections in the pool"
                        @input="handleFormUpdate"
                      >
                        <template #prepend-inner>
                          <v-icon icon="mdi-pool" />
                        </template>
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model.number="localData.options.timeout"
                        label="Connection Timeout (ms)"
                        type="number"
                        min="1000"
                        max="300000"
                        variant="outlined"
                        persistent-hint
                        hint="Connection timeout in milliseconds"
                        @input="handleFormUpdate"
                      >
                        <template #prepend-inner>
                          <v-icon icon="mdi-timer" />
                        </template>
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" md="4">
                      <v-text-field
                        v-model.number="localData.options.retryAttempts"
                        label="Retry Attempts"
                        type="number"
                        min="0"
                        max="10"
                        variant="outlined"
                        persistent-hint
                        hint="Number of connection retry attempts"
                        @input="handleFormUpdate"
                      >
                        <template #prepend-inner>
                          <v-icon icon="mdi-refresh" />
                        </template>
                      </v-text-field>
                    </v-col>
                  </v-row>
                </div>

                <!-- Database-specific Advanced Options -->
                <div v-if="showDatabaseSpecificOptions" class="mb-6">
                  <h4 class="text-h6 mb-3">{{ getDatabaseSpecificOptionsTitle() }}</h4>
                  
                  <!-- PostgreSQL/MySQL specific options -->
                  <v-row v-if="['postgresql', 'mysql'].includes(localData.type)">
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="localData.options.charset"
                        label="Character Set"
                        :items="getCharsetOptions()"
                        variant="outlined"
                        persistent-hint
                        hint="Database character encoding"
                        @update:model-value="handleFormUpdate"
                      >
                        <template #prepend-inner>
                          <v-icon icon="mdi-format-text" />
                        </template>
                      </v-select>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="localData.options.timezone"
                        label="Timezone"
                        :items="getTimezoneOptions()"
                        variant="outlined"
                        persistent-hint
                        hint="Database timezone setting"
                        @update:model-value="handleFormUpdate"
                      >
                        <template #prepend-inner>
                          <v-icon icon="mdi-clock" />
                        </template>
                      </v-select>
                    </v-col>
                  </v-row>

                  <!-- MongoDB specific options -->
                  <v-row v-if="localData.type === 'mongodb'">
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="localData.options.authSource"
                        label="Authentication Source"
                        placeholder="admin"
                        variant="outlined"
                        persistent-hint
                        hint="Database used for authentication"
                        @input="handleFormUpdate"
                      >
                        <template #prepend-inner>
                          <v-icon icon="mdi-account-key" />
                        </template>
                      </v-text-field>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="localData.options.replicaSet"
                        label="Replica Set"
                        placeholder="rs0"
                        variant="outlined"
                        persistent-hint
                        hint="MongoDB replica set name"
                        @input="handleFormUpdate"
                      >
                        <template #prepend-inner>
                          <v-icon icon="mdi-database-sync" />
                        </template>
                      </v-text-field>
                    </v-col>
                  </v-row>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-col>
      </v-row>

      <!-- Connection Testing Section -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card variant="outlined" class="connection-test-card">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-connection" class="me-2" />
              Connection Testing
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-btn
                    :disabled="!canTestConnection || isTestingConnection"
                    :loading="isTestingConnection"
                    color="primary"
                    variant="elevated"
                    @click="testConnection"
                  >
                    <v-icon icon="mdi-play" class="me-2" />
                    Test Connection
                  </v-btn>
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center">
                  <div v-if="connectionTestResult" class="connection-status">
                    <v-chip
                      :color="connectionTestResult.success ? 'success' : 'error'"
                      :prepend-icon="connectionTestResult.success ? 'mdi-check-circle' : 'mdi-alert-circle'"
                      variant="flat"
                    >
                      {{ connectionTestResult.success ? 'Connected' : 'Failed' }}
                    </v-chip>
                    <div class="text-caption mt-1">
                      {{ connectionTestResult.message }}
                    </div>
                  </div>
                </v-col>
              </v-row>
              
              <!-- Connection Test Details -->
              <v-expand-transition>
                <div v-if="connectionTestResult && !connectionTestResult.success" class="mt-4">
                  <v-alert
                    type="error"
                    variant="tonal"
                    :text="connectionTestResult.details"
                  />
                </div>
              </v-expand-transition>
              
              <v-expand-transition>
                <div v-if="connectionTestResult && connectionTestResult.success" class="mt-4">
                  <v-alert
                    type="success"
                    variant="tonal"
                  >
                    <template #title>Connection Successful</template>
                    <div v-if="connectionTestResult.serverInfo">
                      <div><strong>Server:</strong> {{ connectionTestResult.serverInfo.version }}</div>
                      <div><strong>Host:</strong> {{ connectionTestResult.serverInfo.host }}</div>
                      <div><strong>Response Time:</strong> {{ connectionTestResult.responseTime }}ms</div>
                    </div>
                  </v-alert>
                </div>
              </v-expand-transition>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- No Database Selected Message -->
    <v-alert
      v-if="localData.type === 'none'"
      type="info"
      variant="tonal"
      class="mt-4"
    >
      <template #title>No Database Required</template>
      Your project will be configured without a database connection. You can change this later if needed.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
/**
 * Step 2: Database Configuration Component
 * 
 * This component handles the database configuration step of project creation, including:
 * - Database type selection (PostgreSQL, MySQL, MongoDB, SQLite, Redis, None)
 * - Dynamic connection string input based on database type
 * - Schema/database name configuration
 * - Connection validation and testing
 * - SSL/TLS configuration options
 * - Advanced connection settings
 */

import { computed, ref, watch } from 'vue'
import { useProjectCreationStore } from '../../../stores/project-creation'
import type { DatabaseConfig } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Component props
interface Props {
  modelValue?: DatabaseConfig
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    type: 'none',
    connectionString: '',
    schema: '',
    options: {
      ssl: false,
      poolSize: 10,
      timeout: 30000,
      charset: 'utf8',
      timezone: 'UTC'
    }
  })
})

// Component emits
interface Emits {
  (e: 'update:modelValue', value: DatabaseConfig): void
  (e: 'validation-change', isValid: boolean): void
}

const emit = defineEmits<Emits>()

// Local reactive state
const localData = ref<DatabaseConfig>({ ...props.modelValue })
const connectionMethod = ref<'string' | 'fields'>('string')
const connectionFields = ref({
  host: 'localhost',
  port: '',
  username: '',
  password: '',
  database: '',
  filePath: '',
  mongoUri: 'mongodb://localhost:27017'
})

// Validation state
const connectionStringErrors = ref<string[]>([])

// Advanced settings state
const advancedSettingsPanel = ref<number | undefined>(undefined)

// Connection testing state
const isTestingConnection = ref(false)
const connectionTestResult = ref<{
  success: boolean
  message: string
  details?: string
  responseTime?: number
  serverInfo?: {
    version: string
    host: string
  }
} | null>(null)

// Database type options
const databaseTypeOptions = [
  { 
    title: 'No Database', 
    value: 'none', 
    subtitle: 'Project without database requirements' 
  },
  { 
    title: 'PostgreSQL', 
    value: 'postgresql', 
    subtitle: 'Advanced open-source relational database' 
  },
  { 
    title: 'MySQL', 
    value: 'mysql', 
    subtitle: 'Popular open-source relational database' 
  },
  { 
    title: 'MongoDB', 
    value: 'mongodb', 
    subtitle: 'Document-oriented NoSQL database' 
  },
  { 
    title: 'SQLite', 
    value: 'sqlite', 
    subtitle: 'Lightweight file-based database' 
  },
  { 
    title: 'Redis', 
    value: 'redis', 
    subtitle: 'In-memory data structure store' 
  }
]

// Computed properties
const showSchemaField = computed(() => {
  return localData.value.type !== 'none' && localData.value.type !== 'sqlite'
})

const showSSLOptions = computed(() => {
  return ['postgresql', 'mysql', 'mongodb'].includes(localData.value.type)
})

const showDatabaseSpecificOptions = computed(() => {
  return localData.value.type !== 'none' && localData.value.type !== 'sqlite'
})

const canTestConnection = computed(() => {
  return localData.value.type !== 'none' &&
         localData.value.connectionString.trim() !== '' &&
         connectionStringErrors.value.length === 0
})

// Helper methods for dynamic content
const getConnectionStringPlaceholder = (): string => {
  switch (localData.value.type) {
    case 'postgresql':
      return 'postgresql://username:password@localhost:5432/database'
    case 'mysql':
      return 'mysql://username:password@localhost:3306/database'
    case 'mongodb':
      return 'mongodb://username:password@localhost:27017/database'
    case 'sqlite':
      return '/path/to/database.db'
    case 'redis':
      return 'redis://localhost:6379'
    default:
      return ''
  }
}

const getConnectionStringHint = (): string => {
  switch (localData.value.type) {
    case 'postgresql':
      return 'PostgreSQL connection string with host, port, database, and credentials'
    case 'mysql':
      return 'MySQL connection string with host, port, database, and credentials'
    case 'mongodb':
      return 'MongoDB connection URI with host, port, database, and authentication'
    case 'sqlite':
      return 'File path to SQLite database file (will be created if it doesn\'t exist)'
    case 'redis':
      return 'Redis connection string with host and port'
    default:
      return ''
  }
}

const getSchemaLabel = (): string => {
  switch (localData.value.type) {
    case 'postgresql':
    case 'mysql':
      return 'Schema Name'
    case 'mongodb':
      return 'Database Name'
    case 'redis':
      return 'Database Number'
    default:
      return 'Schema'
  }
}

const getSchemaPlaceholder = (): string => {
  switch (localData.value.type) {
    case 'postgresql':
      return 'public'
    case 'mysql':
      return 'main'
    case 'mongodb':
      return 'myapp'
    case 'redis':
      return '0'
    default:
      return ''
  }
}

const getSchemaHint = (): string => {
  switch (localData.value.type) {
    case 'postgresql':
      return 'PostgreSQL schema name (default: public)'
    case 'mysql':
      return 'MySQL schema/database name'
    case 'mongodb':
      return 'MongoDB database name'
    case 'redis':
      return 'Redis database number (0-15)'
    default:
      return ''
  }
}

const getDefaultPort = (): string => {
  switch (localData.value.type) {
    case 'postgresql':
      return '5432'
    case 'mysql':
      return '3306'
    case 'mongodb':
      return '27017'
    case 'redis':
      return '6379'
    default:
      return ''
  }
}

const getDatabasePlaceholder = (): string => {
  switch (localData.value.type) {
    case 'postgresql':
      return 'myapp'
    case 'mysql':
      return 'myapp'
    case 'mongodb':
      return 'myapp'
    case 'redis':
      return '0'
    default:
      return ''
  }
}

const getAdvancedSettingsSummary = (): string => {
  const settings: string[] = []
  
  if (localData.value.options.ssl) {
    settings.push('SSL enabled')
  }
  
  if (localData.value.options.poolSize && localData.value.options.poolSize !== 10) {
    settings.push(`Pool: ${localData.value.options.poolSize}`)
  }
  
  if (localData.value.options.timeout && localData.value.options.timeout !== 30000) {
    settings.push(`Timeout: ${localData.value.options.timeout}ms`)
  }
  
  return settings.length > 0 ? settings.join(', ') : 'Default settings'
}

const getDatabaseSpecificOptionsTitle = (): string => {
  switch (localData.value.type) {
    case 'postgresql':
      return 'PostgreSQL Options'
    case 'mysql':
      return 'MySQL Options'
    case 'mongodb':
      return 'MongoDB Options'
    case 'redis':
      return 'Redis Options'
    default:
      return 'Database Options'
  }
}

const getCharsetOptions = () => {
  const commonOptions = [
    { title: 'UTF-8', value: 'utf8' },
    { title: 'UTF-8 (4-byte)', value: 'utf8mb4' },
    { title: 'Latin1', value: 'latin1' },
    { title: 'ASCII', value: 'ascii' }
  ]
  
  if (localData.value.type === 'postgresql') {
    return [
      { title: 'UTF-8', value: 'UTF8' },
      { title: 'Latin1', value: 'LATIN1' },
      { title: 'SQL ASCII', value: 'SQL_ASCII' }
    ]
  }
  
  return commonOptions
}

const getTimezoneOptions = () => {
  return [
    { title: 'UTC', value: 'UTC' },
    { title: 'Local', value: 'LOCAL' },
    { title: 'US/Eastern', value: 'US/Eastern' },
    { title: 'US/Central', value: 'US/Central' },
    { title: 'US/Mountain', value: 'US/Mountain' },
    { title: 'US/Pacific', value: 'US/Pacific' },
    { title: 'Europe/London', value: 'Europe/London' },
    { title: 'Europe/Paris', value: 'Europe/Paris' },
    { title: 'Asia/Tokyo', value: 'Asia/Tokyo' },
    { title: 'Asia/Shanghai', value: 'Asia/Shanghai' }
  ]
}

// Validation methods
const validateConnectionString = () => {
  const errors: string[] = []
  const connectionString = localData.value.connectionString.trim()
  
  // Skip validation if no database is selected
  if (localData.value.type === 'none') {
    connectionStringErrors.value = []
    emit('validation-change', true)
    return true
  }
  
  // Required validation
  if (!connectionString) {
    errors.push('Connection string is required for database configuration')
  } else {
    // Basic format validation based on database type
    switch (localData.value.type) {
      case 'postgresql':
        if (!connectionString.startsWith('postgresql://') && !connectionString.startsWith('postgres://')) {
          errors.push('PostgreSQL connection string must start with postgresql:// or postgres://')
        }
        break
      case 'mysql':
        if (!connectionString.startsWith('mysql://')) {
          errors.push('MySQL connection string must start with mysql://')
        }
        break
      case 'mongodb':
        if (!connectionString.startsWith('mongodb://') && !connectionString.startsWith('mongodb+srv://')) {
          errors.push('MongoDB connection string must start with mongodb:// or mongodb+srv://')
        }
        break
      case 'sqlite':
        if (connectionString.includes('://')) {
          errors.push('SQLite connection should be a file path, not a URL')
        }
        break
      case 'redis':
        if (!connectionString.startsWith('redis://') && !connectionString.startsWith('rediss://')) {
          errors.push('Redis connection string must start with redis:// or rediss://')
        }
        break
    }
  }
  
  connectionStringErrors.value = errors
  
  // Emit validation status
  const isValid = errors.length === 0
  emit('validation-change', isValid)
  
  return isValid
}

// Event handlers
const handleDatabaseTypeChange = () => {
  // Clear connection string when changing database type
  localData.value.connectionString = ''
  localData.value.schema = ''
  
  // Reset validation
  validateConnectionString()
  handleFormUpdate()
}

const handleFormUpdate = () => {
  // Run comprehensive validation
  validateAllFields()
  
  // Update the store with the new form data
  store.updateFormData('database', localData.value)
  
  // Emit to parent component
  emit('update:modelValue', localData.value)
  
  // Trigger validation on the current step
  store.validateCurrentStep()
}

const handleConnectionMethodChange = () => {
  // Clear connection string when switching methods
  if (connectionMethod.value === 'fields') {
    // Reset connection fields to defaults
    connectionFields.value = {
      host: 'localhost',
      port: getDefaultPort(),
      username: '',
      password: '',
      database: '',
      filePath: '',
      mongoUri: 'mongodb://localhost:27017'
    }
    buildConnectionString()
  } else {
    // Clear the connection string for manual input
    localData.value.connectionString = ''
  }
  handleFormUpdate()
}

const buildConnectionString = () => {
  if (connectionMethod.value !== 'fields') return
  
  const fields = connectionFields.value
  let connectionString = ''
  
  switch (localData.value.type) {
    case 'postgresql':
      if (fields.host && fields.database) {
        const port = fields.port || '5432'
        const auth = fields.username && fields.password ? `${fields.username}:${fields.password}@` : ''
        connectionString = `postgresql://${auth}${fields.host}:${port}/${fields.database}`
      }
      break
    case 'mysql':
      if (fields.host && fields.database) {
        const port = fields.port || '3306'
        const auth = fields.username && fields.password ? `${fields.username}:${fields.password}@` : ''
        connectionString = `mysql://${auth}${fields.host}:${port}/${fields.database}`
      }
      break
    case 'mongodb':
      if (fields.mongoUri && fields.database) {
        connectionString = `${fields.mongoUri}/${fields.database}`
      }
      break
    case 'sqlite':
      if (fields.filePath) {
        connectionString = fields.filePath
      }
      break
    case 'redis':
      if (fields.host) {
        const port = fields.port || '6379'
        const auth = fields.password ? `:${fields.password}@` : ''
        const db = fields.database ? `/${fields.database}` : ''
        connectionString = `redis://${auth}${fields.host}:${port}${db}`
      }
      break
  }
  
  localData.value.connectionString = connectionString
  validateConnectionString()
}

const selectDatabaseFile = () => {
  // This would typically open a file dialog
  // For now, we'll just show a placeholder message
  console.log('File selection dialog would open here')
  // In a real implementation, you might use:
  // - Electron's dialog API for desktop apps
  // - A web file picker API
  // - A custom file browser component
}

const copyConnectionString = async () => {
  try {
    await navigator.clipboard.writeText(localData.value.connectionString)
    // You could show a toast notification here
    console.log('Connection string copied to clipboard')
  } catch (error) {
    console.error('Failed to copy connection string:', error)
  }
}

const testConnection = async () => {
  if (!canTestConnection.value) return
  
  isTestingConnection.value = true
  connectionTestResult.value = null
  
  const startTime = Date.now()
  
  try {
    // Simulate connection testing with different outcomes based on database type
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
    
    const responseTime = Date.now() - startTime
    
    // Simulate different success/failure scenarios
    const shouldSucceed = Math.random() > 0.3 // 70% success rate for demo
    
    if (shouldSucceed) {
      connectionTestResult.value = {
        success: true,
        message: 'Connection established successfully',
        responseTime,
        serverInfo: {
          version: getSimulatedServerVersion(),
          host: getHostFromConnectionString()
        }
      }
    } else {
      connectionTestResult.value = {
        success: false,
        message: 'Connection failed',
        details: getSimulatedErrorMessage()
      }
    }
  } catch (error) {
    connectionTestResult.value = {
      success: false,
      message: 'Connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  } finally {
    isTestingConnection.value = false
  }
}

const getSimulatedServerVersion = (): string => {
  switch (localData.value.type) {
    case 'postgresql':
      return 'PostgreSQL 15.4'
    case 'mysql':
      return 'MySQL 8.0.34'
    case 'mongodb':
      return 'MongoDB 7.0.2'
    case 'redis':
      return 'Redis 7.2.1'
    case 'sqlite':
      return 'SQLite 3.43.0'
    default:
      return 'Unknown'
  }
}

const getHostFromConnectionString = (): string => {
  const connectionString = localData.value.connectionString
  
  // Extract host from connection string
  if (connectionString.includes('://')) {
    try {
      const url = new URL(connectionString.replace(/^[^:]+:\/\//, 'http://'))
      return url.hostname || 'localhost'
    } catch {
      return 'localhost'
    }
  }
  
  return 'localhost'
}

const getSimulatedErrorMessage = (): string => {
  const errors = [
    'Connection timeout after 30 seconds',
    'Authentication failed: Invalid credentials',
    'Host unreachable: Connection refused',
    'Database does not exist',
    'SSL connection required but not configured',
    'Port is not accessible or service is not running'
  ]
  
  return errors[Math.floor(Math.random() * errors.length)]
}

// Enhanced validation methods
const validateAdvancedSettings = (): string[] => {
  const errors: string[] = []
  
  // SSL validation
  if (localData.value.options.ssl && showSSLOptions.value) {
    if (localData.value.options.sslCert && !localData.value.options.sslKey) {
      errors.push('SSL private key is required when SSL certificate is provided')
    }
    if (localData.value.options.sslKey && !localData.value.options.sslCert) {
      errors.push('SSL certificate is required when SSL private key is provided')
    }
  }
  
  // Pool size validation
  if (localData.value.options.poolSize) {
    if (localData.value.options.poolSize < 1) {
      errors.push('Pool size must be at least 1')
    }
    if (localData.value.options.poolSize > 100) {
      errors.push('Pool size should not exceed 100 connections')
    }
  }
  
  // Timeout validation
  if (localData.value.options.timeout) {
    if (localData.value.options.timeout < 1000) {
      errors.push('Connection timeout must be at least 1000ms (1 second)')
    }
    if (localData.value.options.timeout > 300000) {
      errors.push('Connection timeout should not exceed 300000ms (5 minutes)')
    }
  }
  
  // Retry attempts validation
  if (localData.value.options.retryAttempts !== undefined) {
    if (localData.value.options.retryAttempts < 0) {
      errors.push('Retry attempts cannot be negative')
    }
    if (localData.value.options.retryAttempts > 10) {
      errors.push('Retry attempts should not exceed 10')
    }
  }
  
  return errors
}

const validateDatabaseSpecificOptions = (): string[] => {
  const errors: string[] = []
  
  // MongoDB specific validation
  if (localData.value.type === 'mongodb') {
    if (localData.value.options.authSource && localData.value.options.authSource.trim() === '') {
      errors.push('Authentication source cannot be empty if specified')
    }
    if (localData.value.options.replicaSet && localData.value.options.replicaSet.trim() === '') {
      errors.push('Replica set name cannot be empty if specified')
    }
  }
  
  return errors
}

const validateAllFields = (): boolean => {
  const connectionStringValid = validateConnectionString()
  const advancedErrors = validateAdvancedSettings()
  const specificErrors = validateDatabaseSpecificOptions()
  
  const allErrors = [...connectionStringErrors.value, ...advancedErrors, ...specificErrors]
  const isValid = allErrors.length === 0
  
  emit('validation-change', isValid)
  return isValid
}

// Watchers
watch(
  () => props.modelValue,
  (newValue) => {
    localData.value = { ...newValue }
  },
  { deep: true }
)

watch(
  localData,
  (newValue) => {
    handleFormUpdate()
  },
  { deep: true }
)

// Initialize local data from store on mount
watch(
  () => store.formData.database,
  (newValue) => {
    // Only update if different to avoid infinite loops
    if (JSON.stringify(localData.value) !== JSON.stringify(newValue)) {
      localData.value = { ...newValue }
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.step-database-config {
  min-height: 400px;
}

.step-header {
  text-align: center;
}

.database-config-fields {
  margin-top: 1.5rem;
}
</style>