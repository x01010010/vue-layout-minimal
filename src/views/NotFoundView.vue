<template>
  <v-container class="not-found-container">
    <div class="text-center">
      <!-- 404 Icon and Number -->
      <div class="error-icon-section mb-6">
        <v-icon 
          icon="mdi-map-marker-question" 
          size="120" 
          color="primary"
          class="mb-4"
        />
        <h1 class="error-code">404</h1>
      </div>

      <!-- Error Message -->
      <div class="error-message-section mb-8">
        <h2 class="text-h4 font-weight-bold mb-4">Page Not Found</h2>
        <p class="text-h6 text-medium-emphasis mb-4">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p class="text-body-1 text-medium-emphasis">
          Don't worry, it happens to the best of us. Let's get you back on track.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <v-btn
          color="primary"
          size="large"
          variant="elevated"
          class="me-4"
          @click="goHome"
        >
          <v-icon icon="mdi-home" class="me-2" />
          Go Home
        </v-btn>
        
        <v-btn
          variant="outlined"
          size="large"
          @click="goBack"
        >
          <v-icon icon="mdi-arrow-left" class="me-2" />
          Go Back
        </v-btn>
      </div>

      <!-- Additional Help -->
      <v-card class="mt-8 mx-auto help-card" max-width="600">
        <v-card-title class="text-center">
          <v-icon icon="mdi-help-circle" class="me-2" />
          Need Help?
        </v-card-title>
        <v-card-text class="text-center">
          <p class="mb-4">Here are some things you can try:</p>
          <ul class="help-list">
            <li>Check the URL for typos</li>
            <li>Use the navigation menu to find what you're looking for</li>
            <li>Visit our home page to start fresh</li>
          </ul>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  // Go back in history, or go home if no history
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-code {
  font-size: 8rem;
  font-weight: 900;
  color: rgb(var(--v-theme-primary));
  line-height: 1;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.error-icon-section {
  margin-bottom: 2rem;
}

.error-message-section {
  max-width: 600px;
  margin: 0 auto;
}

.action-buttons {
  margin-bottom: 2rem;
}

.help-card {
  background-color: rgb(var(--v-theme-surface-variant));
}

.help-list {
  text-align: left;
  display: inline-block;
  margin: 0;
  padding-left: 1.5rem;
}

.help-list li {
  margin-bottom: 0.5rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

@media (max-width: 600px) {
  .error-code {
    font-size: 6rem;
  }
  
  .action-buttons .v-btn {
    display: block;
    width: 100%;
    margin: 0.5rem 0;
  }
  
  .action-buttons .v-btn:first-child {
    margin-bottom: 1rem;
  }
}
</style>