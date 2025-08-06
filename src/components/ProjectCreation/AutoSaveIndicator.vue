<template>
  <v-card
    class="auto-save-indicator"
    :class="indicatorClass"
    variant="outlined"
    density="compact"
  >
    <v-card-text class="pa-3">
      <div class="d-flex align-center justify-space-between">
        <!-- Status Icon and Text -->
        <div class="d-flex align-center">
          <v-icon
            :icon="statusIcon"
            :color="statusColor"
            size="small"
            class="me-2"
          />
          <div class="text-body-2">
            <div class="font-weight-medium">{{ statusText }}</div>
            <div v-if="lastSavedText" class="text-caption text-medium-emphasis">
              {{ lastSavedText }}
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex align-center">
          <!-- Manual Save Button -->
          <v-btn
            v-if="showManualSave"
            :disabled="saving || !isDirty"
            :loading="saving"
            variant="text"
            size="small"
            color="primary"
            @click="handleManualSave"
          >
            <v-icon start icon="mdi-content-save" />
            Save Now
          </v-btn>

          <!-- Storage Info Button -->
          <v-btn
            v-if="showStorageInfo"
            variant="text"
            size="small"
            icon="mdi-information-outline"
            @click="showStorageDialog = true"
          />

          <!-- Settings Menu -->
          <v-menu v-if="showSettings">
            <template #activator="{ props }">
              <v-btn
                variant="text"
                size="small"
                icon="mdi-cog"
                v-bind="props"
              />
            </template>
            <v-list density="compact">
              <v-list-item @click="toggleAutoSave">
                <template #prepend>
                  <v-icon :icon="autoSaveEnabled ? 'mdi-pause' : 'mdi-play'" />
                </template>
                <v-list-item-title>
                  {{ autoSaveEnabled ? 'Disable' : 'Enable' }} Auto-save
                </v-list-item-title>
              </v-list-item>
              <v-list-item @click="showDraftsDialog = true">
                <template #prepend>
                  <v-icon icon="mdi-folder-multiple" />
                </template>
                <v-list-item-title>Manage Drafts</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>

      <!-- Progress Bar for Saving -->
      <v-progress-linear
        v-if="saving"
        indeterminate
        color="primary"
        height="2"
        class="mt-2"
      />

      <!-- Error Message -->
      <v-alert
        v-if="saveError"
        type="error"
        variant="tonal"
        density="compact"
        class="mt-2"
        closable
        @click:close="clearError"
      >
        <div class="text-caption">{{ saveError }}</div>
      </v-alert>
    </v-card-text>

    <!-- Storage Info Dialog -->
    <v-dialog v-model="showStorageDialog" max-width="500">
      <v-card>
        <v-card-title>Storage Information</v-card-title>
        <v-card-text>
          <div v-if="storageInfo" class="storage-info">
            <div class="mb-3">
              <div class="text-subtitle-2 mb-1">Storage Usage</div>
              <v-progress-linear
                :model-value="storageUsagePercent"
                :color="storageUsageColor"
                height="8"
                rounded
              />
              <div class="text-caption mt-1">
                {{ formatBytes(storageInfo.used) }} / {{ formatBytes(storageInfo.quota) }}
                ({{ storageUsagePercent.toFixed(1) }}%)
              </div>
            </div>

            <v-row dense>
              <v-col cols="6">
                <v-card variant="outlined" density="compact">
                  <v-card-text class="text-center">
                    <div class="text-h6">{{ storageInfo.draftsCount }}</div>
                    <div class="text-caption">Total Drafts</div>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6">
                <v-card variant="outlined" density="compact">
                  <v-card-text class="text-center">
                    <div class="text-h6">{{ formatBytes(storageInfo.available) }}</div>
                    <div class="text-caption">Available</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <div v-if="storageInfo.oldestDraft" class="mt-3">
              <div class="text-caption">
                <strong>Oldest Draft:</strong> {{ formatDate(storageInfo.oldestDraft) }}
              </div>
              <div class="text-caption">
                <strong>Newest Draft:</strong> {{ formatDate(storageInfo.newestDraft) }}
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showStorageDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Drafts Management Dialog -->
    <v-dialog v-model="showDraftsDialog" max-width="800">
      <v-card>
        <v-card-title>Manage Drafts</v-card-title>
        <v-card-text>
          <div v-if="availableDrafts.length === 0" class="text-center py-4">
            <v-icon icon="mdi-folder-open" size="48" class="text-medium-emphasis mb-2" />
            <div class="text-body-1">No drafts available</div>
          </div>
          <v-list v-else>
            <v-list-item
              v-for="draft in availableDrafts"
              :key="draft.id"
              class="draft-item"
            >
              <template #prepend>
                <v-avatar color="primary" size="small">
                  <v-icon icon="mdi-file-document" />
                </v-avatar>
              </template>

              <v-list-item-title>{{ draft.title }}</v-list-item-title>
              <v-list-item-subtitle>
                <div>{{ draft.description || 'No description' }}</div>
                <div class="text-caption">
                  Last modified: {{ formatDate(draft.updatedAt) }} •
                  Progress: {{ draft.progress }}% •
                  Size: {{ formatBytes(draft.size) }}
                </div>
              </v-list-item-subtitle>

              <template #append>
                <div class="d-flex align-center">
                  <v-btn
                    variant="text"
                    size="small"
                    icon="mdi-download"
                    @click="loadDraft(draft.id)"
                  />
                  <v-btn
                    variant="text"
                    size="small"
                    icon="mdi-export"
                    @click="exportDraft(draft.id)"
                  />
                  <v-btn
                    variant="text"
                    size="small"
                    icon="mdi-delete"
                    color="error"
                    @click="deleteDraft(draft.id)"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-btn
            variant="outlined"
            prepend-icon="mdi-import"
            @click="triggerImport"
          >
            Import Draft
          </v-btn>
          <v-spacer />
          <v-btn @click="showDraftsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Hidden file input for import -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleImport"
    />
  </v-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useProjectCreationStore } from '../../stores/project-creation'

// =============================================================================
// Props and Emits
// =============================================================================

interface Props {
  showManualSave?: boolean
  showStorageInfo?: boolean
  showSettings?: boolean
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showManualSave: true,
  showStorageInfo: true,
  showSettings: true,
  compact: false
})

const emit = defineEmits<{
  'manual-save': []
  'draft-loaded': [draftId: string]
  'draft-deleted': [draftId: string]
  'auto-save-toggled': [enabled: boolean]
}>()

// =============================================================================
// Store and Reactive Data
// =============================================================================

const store = useProjectCreationStore()
const fileInput = ref<HTMLInputElement>()

// Dialog states
const showStorageDialog = ref(false)
const showDraftsDialog = ref(false)

// =============================================================================
// Computed Properties
// =============================================================================

const saving = computed(() => store.draft.saving)
const saveStatus = computed(() => store.draft.saveStatus)
const saveError = computed(() => store.draft.saveError)
const lastSaved = computed(() => store.draft.lastSaved)
const autoSaveEnabled = computed(() => store.draft.autoSaveEnabled)
const isDirty = computed(() => store.validation.isDirty)
const availableDrafts = computed(() => store.draft.availableDrafts)
const storageInfo = computed(() => store.draft.storageInfo)

const statusIcon = computed(() => {
  switch (saveStatus.value) {
    case 'saving':
      return 'mdi-loading'
    case 'saved':
      return 'mdi-check-circle'
    case 'error':
      return 'mdi-alert-circle'
    default:
      return isDirty.value ? 'mdi-circle-edit-outline' : 'mdi-check-circle-outline'
  }
})

const statusColor = computed(() => {
  switch (saveStatus.value) {
    case 'saving':
      return 'primary'
    case 'saved':
      return 'success'
    case 'error':
      return 'error'
    default:
      return isDirty.value ? 'warning' : 'success'
  }
})

const statusText = computed(() => {
  switch (saveStatus.value) {
    case 'saving':
      return 'Saving...'
    case 'saved':
      return 'All changes saved'
    case 'error':
      return 'Save failed'
    default:
      return isDirty.value ? 'Unsaved changes' : 'Up to date'
  }
})

const lastSavedText = computed(() => {
  if (!lastSaved.value) return null
  
  const now = Date.now()
  const diff = now - lastSaved.value
  
  if (diff < 60000) return 'Saved just now'
  if (diff < 3600000) return `Saved ${Math.floor(diff / 60000)} minutes ago`
  if (diff < 86400000) return `Saved ${Math.floor(diff / 3600000)} hours ago`
  return `Saved ${Math.floor(diff / 86400000)} days ago`
})

const indicatorClass = computed(() => ({
  'auto-save-indicator--compact': props.compact,
  'auto-save-indicator--saving': saving.value,
  'auto-save-indicator--error': saveStatus.value === 'error',
  'auto-save-indicator--dirty': isDirty.value
}))

const storageUsagePercent = computed(() => {
  if (!storageInfo.value) return 0
  return (storageInfo.value.used / storageInfo.value.quota) * 100
})

const storageUsageColor = computed(() => {
  const percent = storageUsagePercent.value
  if (percent > 90) return 'error'
  if (percent > 75) return 'warning'
  return 'success'
})

// =============================================================================
// Methods
// =============================================================================

async function handleManualSave(): Promise<void> {
  try {
    await store.triggerManualSave()
    emit('manual-save')
  } catch (error) {
    console.error('Manual save failed:', error)
  }
}

function toggleAutoSave(): void {
  if (autoSaveEnabled.value) {
    store.disableAutoSave()
  } else {
    store.enableAutoSave()
  }
  emit('auto-save-toggled', !autoSaveEnabled.value)
}

function clearError(): void {
  // This would need to be implemented in the store
  // For now, we'll just hide the error after a timeout
}

async function loadDraft(draftId: string): Promise<void> {
  try {
    await store.loadDraft(draftId)
    emit('draft-loaded', draftId)
    showDraftsDialog.value = false
  } catch (error) {
    console.error('Failed to load draft:', error)
  }
}

async function deleteDraft(draftId: string): Promise<void> {
  try {
    await store.deleteDraft(draftId)
    emit('draft-deleted', draftId)
  } catch (error) {
    console.error('Failed to delete draft:', error)
  }
}

async function exportDraft(draftId: string): Promise<void> {
  try {
    const exportData = await store.exportDraft(draftId, 'json')
    const blob = new Blob([exportData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `project-draft-${draftId}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export draft:', error)
  }
}

function triggerImport(): void {
  fileInput.value?.click()
}

async function handleImport(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    const text = await file.text()
    await store.importDraft(text, 'json')
    target.value = '' // Reset input
  } catch (error) {
    console.error('Failed to import draft:', error)
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

// =============================================================================
// Watchers
// =============================================================================

// Auto-clear error after 5 seconds
watch(saveError, (error) => {
  if (error) {
    setTimeout(() => {
      // This would clear the error in the store
    }, 5000)
  }
})
</script>

<style scoped>
.auto-save-indicator {
  transition: all 0.3s ease;
}

.auto-save-indicator--compact .v-card-text {
  padding: 8px 12px !important;
}

.auto-save-indicator--saving {
  border-color: rgb(var(--v-theme-primary));
}

.auto-save-indicator--error {
  border-color: rgb(var(--v-theme-error));
}

.auto-save-indicator--dirty {
  border-color: rgb(var(--v-theme-warning));
}

.draft-item {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.draft-item:last-child {
  border-bottom: none;
}

.storage-info .v-progress-linear {
  border-radius: 4px;
}
</style>