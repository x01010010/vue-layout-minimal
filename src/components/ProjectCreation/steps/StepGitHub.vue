<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <!-- Step Header -->
        <div class="mb-6">
          <h2 class="text-h4 font-weight-bold text-primary mb-2">
            <v-icon icon="mdi-github" class="me-3" />
            GitHub Setup
          </h2>
          <p class="text-body-1 text-medium-emphasis">
            Configure GitHub repository settings for the project.
          </p>
        </div>

        <!-- Form Fields -->
        <v-form ref="formRef" @submit.prevent>
          <v-row>
            <!-- GitHub Team -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.githubTeam"
                label="GitHub Team"
                placeholder="Enter GitHub team name"
                variant="outlined"
                density="comfortable"
                :rules="githubTeamRules"
                required
                @update:model-value="handleFieldChange"
                @blur="handleFieldBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-account-group" />
                </template>
              </v-text-field>
            </v-col>

            <!-- Repository Name -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.repositoryName"
                label="Repository Name"
                placeholder="Enter repository name"
                variant="outlined"
                density="comfortable"
                :rules="repositoryNameRules"
                required
                @update:model-value="handleFieldChange"
                @blur="handleFieldBlur"
              >
                <template #prepend-inner>
                  <v-icon icon="mdi-source-repository" />
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { useProjectCreationStore } from '../../../stores/project-creation'
import type { GitHubSetup } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Form reference
const formRef = ref()

// Local form data (reactive copy of store data)
const formData = ref<GitHubSetup>({
  githubTeam: store.newFormData.github.githubTeam || '',
  repositoryName: store.newFormData.github.repositoryName || store.newFormData.generalInfo.name || '',
  privateRepo: store.newFormData.github.privateRepo ?? true
})

// Interaction tracking
const hasInteracted = ref(false)

// Validation rules
const githubTeamRules = [
  (v: string) => !!v || 'GitHub team is required'
]

const repositoryNameRules = [
  (v: string) => !!v || 'Repository name is required',
  (v: string) => {
    const pattern = /^[a-zA-Z0-9._-]+$/
    return pattern.test(v) || 'Repository name can only contain letters, numbers, dots, hyphens, and underscores'
  },
  (v: string) => v.length <= 100 || 'Repository name must be 100 characters or less'
]

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
  store.updateNewFormData('github', {
    githubTeam: formData.value.githubTeam,
    repositoryName: formData.value.repositoryName,
    privateRepo: formData.value.privateRepo
  })
}

// Validate current step
const validateStep = async () => {
  await store.validateStep(7)
}

// Watch for external store changes (e.g., from draft loading)
watch(
  () => store.newFormData.github,
  (newData) => {
    formData.value.githubTeam = newData.githubTeam || ''
    formData.value.repositoryName = newData.repositoryName || store.newFormData.generalInfo.name || ''
    formData.value.privateRepo = newData.privateRepo ?? true
  },
  { deep: true }
)

// Watch for project name changes to auto-populate repository name
watch(
  () => store.newFormData.generalInfo.name,
  (newProjectName) => {
    if (newProjectName && !hasInteracted.value) {
      formData.value.repositoryName = newProjectName
      updateStoreData()
    }
  }
)

// Initialize component
onMounted(async () => {
  // Auto-populate repository name from project name if not already set
  if (!formData.value.repositoryName && store.newFormData.generalInfo.name) {
    formData.value.repositoryName = store.newFormData.generalInfo.name
    updateStoreData()
  }

  // Perform initial validation if data exists
  if (formData.value.repositoryName || formData.value.githubTeam) {
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