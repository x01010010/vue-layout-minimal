<template>
  <div class="step-project-basics">
    <div class="step-header mb-6">
      <h2 class="text-h5 mb-2">Project Basics</h2>
      <p class="text-body-1 text-medium-emphasis">
        Define the fundamental properties of your project
      </p>
    </div>

    <!-- Project Name Field -->
    <v-row>
      <v-col cols="12" md="8">
        <v-text-field
          v-model="localData.name"
          label="Project Name"
          placeholder="Enter your project name"
          variant="outlined"
          :error-messages="nameErrors"
          :counter="100"
          maxlength="100"
          required
          persistent-hint
          hint="3-100 characters, alphanumeric with spaces and hyphens allowed"
          @input="validateName"
          @blur="validateName"
        >
          <template #prepend-inner>
            <v-icon icon="mdi-folder-outline" />
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <!-- Project Description Field -->
    <v-row>
      <v-col cols="12">
        <v-textarea
          v-model="localData.description"
          label="Project Description"
          placeholder="Describe your project's purpose and goals"
          variant="outlined"
          :error-messages="descriptionErrors"
          :counter="500"
          maxlength="500"
          rows="4"
          auto-grow
          persistent-hint
          hint="Optional but recommended. Describe what your project does and its main features."
          @input="validateDescription"
          @blur="validateDescription"
        >
          <template #prepend-inner>
            <v-icon icon="mdi-text-box-outline" />
          </template>
        </v-textarea>
      </v-col>
    </v-row>

    <!-- Project Type Selection -->
    <v-row>
      <v-col cols="12" md="6">
        <v-select
          v-model="localData.type"
          label="Project Type"
          :items="projectTypeOptions"
          variant="outlined"
          required
          persistent-hint
          hint="Select the type of project you're creating"
          @update:model-value="validateProjectType"
        >
          <template #prepend-inner>
            <v-icon icon="mdi-application-outline" />
          </template>
        </v-select>
      </v-col>
    </v-row>

    <!-- Project Tags System -->
    <v-row>
      <v-col cols="12">
        <v-combobox
          v-model="localData.tags"
          label="Project Tags"
          placeholder="Add tags to categorize your project (press Enter to add)"
          variant="outlined"
          multiple
          chips
          closable-chips
          :items="suggestedTags"
          :error-messages="tagsErrors"
          persistent-hint
          hint="Optional tags to help categorize and find your project. Press Enter or comma to add tags."
          @update:model-value="validateTags"
        >
          <template #prepend-inner>
            <v-icon icon="mdi-tag-multiple-outline" />
          </template>
          <template #chip="{ props, item }">
            <v-chip
              v-bind="props"
              :text="item.raw"
              size="small"
              closable
              color="primary"
              variant="tonal"
            />
          </template>
        </v-combobox>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
/**
 * Step 1: Project Basics Component
 * 
 * This component handles the first step of project creation, capturing:
 * - Project name with validation
 * - Project description with character counter
 * - Project owner/creator selection
 * - Project type selection
 * - Project tags system
 * - Project visibility settings
 * - Optional project template selection
 */

import { computed, ref, watch } from 'vue'
import { useProjectCreationStore } from '../../../stores/project-creation'
import type { ProjectBasics } from '../../../types/project-creation'

// Store integration
const store = useProjectCreationStore()

// Component props
interface Props {
  modelValue?: ProjectBasics
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => ({
    name: '',
    description: '',
    type: 'web-app',
    template: '',
    tags: []
  })
})

// Component emits
interface Emits {
  (e: 'update:modelValue', value: ProjectBasics): void
  (e: 'validation-change', isValid: boolean): void
}

const emit = defineEmits<Emits>()

// Local reactive state
const localData = ref<ProjectBasics>({ ...props.modelValue })

// Validation state
const nameErrors = ref<string[]>([])
const descriptionErrors = ref<string[]>([])
const tagsErrors = ref<string[]>([])

// Computed properties
const formData = computed(() => store.formData.basics)

// Project type options
const projectTypeOptions = [
  { title: 'Web Application', value: 'web-app', subtitle: 'Frontend, full-stack, or SPA applications' },
  { title: 'API Service', value: 'api-service', subtitle: 'REST APIs, GraphQL, or microservices' },
  { title: 'Mobile App', value: 'mobile-app', subtitle: 'iOS, Android, or cross-platform apps' },
  { title: 'Desktop App', value: 'desktop-app', subtitle: 'Native desktop applications' },
  { title: 'Library', value: 'library', subtitle: 'Reusable code libraries or packages' },
  { title: 'Microservice', value: 'microservice', subtitle: 'Small, focused service components' }
]

// Suggested tags for autocomplete
const suggestedTags = [
  'frontend', 'backend', 'fullstack', 'api', 'database', 'authentication',
  'react', 'vue', 'angular', 'node', 'python', 'java', 'typescript',
  'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
  'aws', 'azure', 'gcp', 'serverless', 'microservices', 'monolith',
  'testing', 'ci-cd', 'devops', 'security', 'performance', 'scalability'
]

// Validation methods
const validateName = () => {
  const errors: string[] = []
  const name = localData.value.name.trim()
  
  // Required validation
  if (!name) {
    errors.push('Project name is required')
  } else {
    // Length validation
    if (name.length < 3) {
      errors.push('Project name must be at least 3 characters long')
    }
    if (name.length > 100) {
      errors.push('Project name must not exceed 100 characters')
    }
    
    // Character validation (alphanumeric, spaces, hyphens, underscores)
    const validNamePattern = /^[a-zA-Z0-9\s\-_]+$/
    if (!validNamePattern.test(name)) {
      errors.push('Project name can only contain letters, numbers, spaces, hyphens, and underscores')
    }
    
    // No leading/trailing spaces or special characters
    if (name !== name.trim()) {
      errors.push('Project name cannot start or end with spaces')
    }
  }
  
  nameErrors.value = errors
  
  // Emit validation status
  const isValid = errors.length === 0
  emit('validation-change', isValid)
  
  return isValid
}

const validateDescription = () => {
  const errors: string[] = []
  const description = localData.value.description.trim()
  
  // Length validation (optional field, but if provided, must be within limits)
  if (description.length > 500) {
    errors.push('Project description must not exceed 500 characters')
  }
  
  // Optional: Check for minimum meaningful length if provided
  if (description.length > 0 && description.length < 10) {
    errors.push('If provided, project description should be at least 10 characters long')
  }
  
  descriptionErrors.value = errors
  
  // Description validation doesn't affect overall validity since it's optional
  return errors.length === 0
}

const validateProjectType = () => {
  // Project type is required and must be one of the valid options
  const validTypes = projectTypeOptions.map(option => option.value)
  const isValid = validTypes.includes(localData.value.type)
  
  // Emit validation status
  emit('validation-change', isValid)
  
  return isValid
}

const validateTags = () => {
  const errors: string[] = []
  const tags = localData.value.tags
  
  // Validate individual tags
  if (tags.length > 10) {
    errors.push('Maximum 10 tags allowed')
  }
  
  // Check for duplicate tags (case insensitive)
  const uniqueTags = new Set(tags.map(tag => tag.toLowerCase()))
  if (uniqueTags.size !== tags.length) {
    errors.push('Duplicate tags are not allowed')
  }
  
  // Validate tag format (no special characters except hyphens and underscores)
  const invalidTags = tags.filter(tag => !/^[a-zA-Z0-9\-_]+$/.test(tag))
  if (invalidTags.length > 0) {
    errors.push('Tags can only contain letters, numbers, hyphens, and underscores')
  }
  
  // Validate tag length
  const longTags = tags.filter(tag => tag.length > 20)
  if (longTags.length > 0) {
    errors.push('Tags must be 20 characters or less')
  }
  
  tagsErrors.value = errors
  
  // Tags validation doesn't affect overall validity since they're optional
  return errors.length === 0
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
    // Update the store with the new form data
    store.updateFormData('basics', newValue)
    
    // Emit to parent component
    emit('update:modelValue', newValue)
    
    // Trigger validation on the current step
    store.validateCurrentStep()
  },
  { deep: true }
)

// Initialize local data from store on mount
watch(
  () => store.formData.basics,
  (newValue) => {
    // Only update if different to avoid infinite loops
    if (JSON.stringify(localData.value) !== JSON.stringify(newValue)) {
      localData.value = {
        ...newValue,
        tags: [...newValue.tags] // Convert readonly array to mutable array
      }
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.step-project-basics {
  min-height: 400px;
}

.step-header {
  text-align: center;
}
</style>