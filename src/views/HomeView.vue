<template>
  <v-container>
    <h1>Welcome to Vue Layout Minimal</h1>
    <p>Vue 3 + Vuetify 3 + TypeScript project with layout structure complete!</p>
    <v-card class="mt-4">
      <v-card-title>Layout Structure</v-card-title>
      <v-card-text>
        <p>This layout includes:</p>
        <ul>
          <li>Header with left, center, and right slots</li>
          <li>Sidebar with top, menu, and bottom slots</li>
          <li>Main content area with content slot</li>
          <li>Footer with left, center, and right slots</li>
        </ul>
        <p class="mt-4">The main content area now features:</p>
        <ul>
          <li>Custom scrollable areas with styled scrollbars</li>
          <li>Responsive layout that adapts to screen size</li>
          <li>Smooth scrolling behavior</li>
        </ul>
      </v-card-text>
    </v-card>
    
    <v-card class="mt-4">
      <v-card-title>API Builder</v-card-title>
      <v-card-text>
        <p>Build and test REST API requests with our sophisticated form builder.</p>
        <v-btn 
          color="primary" 
          :to="{ name: 'ApiBuilder' }"
          class="mt-2"
        >
          Open API Builder
        </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
// Home view component - displays welcome content and navigation to API Builder
</script>

<style scoped>
h1 {
  color: rgb(var(--v-theme-primary));
}
</style>