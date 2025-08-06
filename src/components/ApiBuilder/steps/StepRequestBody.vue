<template>
  <div class="step-request-body">
    <v-alert type="info" class="mb-4">
      <v-icon icon="mdi-code-json" class="me-2" />
      Step 4: Request Body Configuration
    </v-alert>
    
    <p class="text-body-1 mb-4">
      This step will contain request body editor with JSON validation.
      Implementation coming in the next phase.
    </p>
    
    <v-card variant="outlined" class="pa-4">
      <v-card-title class="text-h6">Placeholder Content</v-card-title>
      <v-card-text>
        <v-select
          label="Content Type"
          :items="['application/json', 'application/xml', 'text/plain']"
          value="application/json"
          disabled
        />
        <v-textarea
          label="Request Body"
          placeholder='{"key": "value"}'
          rows="6"
          disabled
        />
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: any
  validation?: any
}

interface Emits {
  (e: 'update:model-value', value: any): void
  (e: 'validation-change', validation: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

emit('validation-change', { valid: true })
</script>

<style scoped>
.step-request-body {
  max-width: 100%;
}
</style>