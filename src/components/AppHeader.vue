<template>
  <div class="app-header" :class="{ 'theme-transition': true, 'state-loading': isLoading }">
    <!-- Left Section: Logo placeholder and App Name -->
    <div class="header-left">
      <v-icon
        icon="mdi-hexagon"
        size="32"
        color="primary"
        class="logo-placeholder"
      />
      <span class="app-name">DSS Garage</span>
    </div>

    <!-- Center Section: Application Title with Loading Demo -->
    <div class="header-center">
      <v-toolbar-title class="app-title component-enter">
        {{ title }}
      </v-toolbar-title>
      
      <!-- Loading Demo Area -->
      <div v-if="showLoadingDemo" class="loading-demo fade-in">
        <div class="skeleton" style="width: 80px; height: 16px; margin-right: 12px;"></div>
        <div class="loading-spinner" style="width: 14px; height: 14px;"></div>
      </div>
    </div>

    <!-- Right Section: User Actions -->
    <div class="header-right">
      <v-btn
        :icon="themeIcon"
        variant="text"
        @click="handleThemeToggle"
        :aria-label="themeToggleLabel"
        :class="{ 'state-success': themeChangeSuccess }"
        :disabled="isLoading"
        class="mr-2"
      />
      <v-btn
        icon="mdi-account-circle"
        variant="text"
        @click="handleUserClick"
        :aria-label="userLabel"
        :disabled="isLoading"
      />
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTheme } from '../composables/useTheme';

// TypeScript interfaces for header component
interface HeaderProps {
  title?: string;
  userLabel?: string;
}

interface HeaderEvents {
  'user-click': [];
}

// Component props with defaults
const props = withDefaults(defineProps<HeaderProps>(), {
  title: 'Vue Layout Minimal',
  userLabel: 'User account menu'
});

// Component events
const emit = defineEmits<HeaderEvents>();

// Theme management
const { toggleTheme, currentTheme, activeTheme } = useTheme();

// Loading and state management for demonstrations
const isLoading = ref(false);
const themeChangeSuccess = ref(false);
const showLoadingDemo = ref(false);

// Computed properties for theme toggle
const themeIcon = computed(() => {
  switch (currentTheme.value) {
    case 'light':
      return 'mdi-weather-sunny';
    case 'dark':
      return 'mdi-weather-night';
    case 'system':
      return 'mdi-theme-light-dark';
    default:
      return 'mdi-weather-sunny';
  }
});

const themeToggleLabel = computed(() => {
  switch (currentTheme.value) {
    case 'light':
      return 'Switch to dark theme';
    case 'dark':
      return 'Switch to system theme';
    case 'system':
      return 'Switch to light theme';
    default:
      return 'Toggle theme';
  }
});

// Event handlers
const handleThemeToggle = async (): Promise<void> => {
  // Demonstrate loading state during theme change
  isLoading.value = true;
  
  // Simulate async theme change with loading
  await new Promise(resolve => setTimeout(resolve, 500));
  
  toggleTheme();
  
  // Show success state briefly
  themeChangeSuccess.value = true;
  isLoading.value = false;
  
  // Reset success state
  setTimeout(() => {
    themeChangeSuccess.value = false;
  }, 1000);
};

const handleUserClick = (): void => {
  emit('user-click');
};

const toggleLoadingDemo = (): void => {
  showLoadingDemo.value = !showLoadingDemo.value;
  
  if (showLoadingDemo.value) {
    // Auto-hide demo after 3 seconds
    setTimeout(() => {
      showLoadingDemo.value = false;
    }, 3000);
  }
};
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: space-between;
}

.header-left {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 16px;
}

.logo-placeholder {
  transition: var(--theme-transition);
}

.header-center {
  /* flex: 1 1 auto; */ /* This is no longer needed with space-between */
  display: flex;
  justify-content: center;
  align-items: center;
}

.header-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  /* margin-left: auto; */ /* This is no longer needed with space-between */
}

.app-name {
  font-weight: 600;
  font-size: 1.125rem;
  color: rgb(var(--v-theme-primary));
}

.app-title {
  font-weight: 500;
  font-size: 1.25rem;
  color: rgb(var(--v-theme-on-surface));
  transition: var(--theme-transition);
}

.header-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

/* Desktop responsive styling */
@media (min-width: 960px) {
  .app-name {
    font-size: 1.25rem;
  }
  
  .app-title {
    font-size: 1.375rem;
  }
}

/* ===== Z-INDEX LAYERING FOR HEADER ELEMENTS ===== */

/* Header buttons should be elevated above content */
:deep(.v-btn) {
  position: relative;
  z-index: var(--z-index-elevated);
}

/* Menu toggle button needs higher priority for interaction */
.header-left :deep(.v-btn) {
  z-index: var(--z-index-dropdown);
}

/* Theme toggle and user buttons */
.header-right :deep(.v-btn) {
  z-index: var(--z-index-elevated);
}

/* Loading demo area should be above other content */
.loading-demo {
  position: relative;
  z-index: var(--z-index-content);
}

/* App title should be above base content */
.app-title {
  position: relative;
  z-index: var(--z-index-content);
}

/* ===== BUTTON HOVER AND INTERACTION ANIMATIONS ===== */

/* Enhanced button animations */
:deep(.v-btn) {
  transition: var(--button-transition) !important;
  position: relative;
  overflow: hidden;
}

/* Button hover effects */
:deep(.v-btn:hover) {
  transform: scale(var(--button-hover-scale));
  box-shadow: var(--shadow-hover);
}

/* Button active/pressed effects */
:deep(.v-btn:active) {
  transform: scale(var(--button-active-scale));
  transition-duration: var(--duration-fast);
}

/* Button focus effects */
:deep(.v-btn:focus-visible) {
  transform: scale(var(--button-focus-scale));
  box-shadow: var(--shadow-focus);
}

/* Icon button specific animations */
:deep(.v-btn--icon) {
  border-radius: 50%;
  transition: var(--button-transition),
              border-radius var(--duration-normal) var(--ease-out-cubic);
}

:deep(.v-btn--icon:hover) {
  border-radius: 12px;
  background-color: rgba(var(--v-theme-primary), 0.08);
}

/* Menu button specific animations */
.header-left :deep(.v-btn) {
  transition: var(--button-transition),
              transform var(--duration-normal) var(--ease-spring);
}

.header-left :deep(.v-btn:hover) {
  transform: scale(var(--button-hover-scale)) rotate(90deg);
}

/* Theme toggle button animations */
.header-right :deep(.v-btn:nth-child(1)) {
  transition: var(--button-transition),
              transform var(--duration-medium) var(--ease-out-cubic);
}

.header-right :deep(.v-btn:nth-child(1):hover) {
  transform: scale(var(--button-hover-scale)) rotate(180deg);
}

/* User button animations */
.header-right :deep(.v-btn:nth-child(2)) {
  transition: var(--button-transition);
}

.header-right :deep(.v-btn:nth-child(2):hover) {
  transform: scale(var(--button-hover-scale));
  background-color: rgba(var(--v-theme-secondary), 0.08);
}

/* Icon animations within buttons */
:deep(.v-btn .v-icon) {
  transition: color var(--duration-normal) var(--ease-out-cubic),
              transform var(--duration-normal) var(--ease-out-cubic);
}

:deep(.v-btn:hover .v-icon) {
  color: rgb(var(--v-theme-primary));
}

/* Ripple effect enhancement */
:deep(.v-btn .v-ripple__container) {
  transition: opacity var(--duration-fast) var(--ease-out-cubic);
}

/* Button spacing with smooth transitions */
.header-right .v-btn {
  margin-left: 0.25rem;
  transition: margin var(--duration-normal) var(--ease-out-cubic);
}

.header-right .v-btn:hover {
  margin-left: 0.375rem;
  margin-right: 0.125rem;
}

/* GPU acceleration for smooth animations */
:deep(.v-btn),
:deep(.v-btn .v-icon) {
  will-change: transform;
  transform: translateZ(0);
}

/* Loading state animations for buttons */
:deep(.v-btn--loading) {
  pointer-events: none;
}

:deep(.v-btn--loading .v-icon) {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Stagger animation for multiple buttons */
.header-right .v-btn:nth-child(1) {
  animation-delay: 0.1s;
}

.header-right .v-btn:nth-child(2) {
  animation-delay: 0.2s;
}

/* ===== LOADING AND STATE TRANSITION STYLING ===== */

/* Loading demo styling */
.loading-demo {
  display: flex;
  align-items: center;
  margin-left: 16px;
  padding: 8px 12px;
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

/* Enhanced state transitions for header */
.app-header.theme-transition {
  transition: background-color var(--theme-transition-duration) var(--theme-transition-timing),
              border-color var(--theme-transition-duration) var(--theme-transition-timing);
}

.app-header.state-loading {
  opacity: 0.8;
  pointer-events: none;
  position: relative;
}

.app-header.state-loading::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 16px;
  width: 16px;
  height: 16px;
  margin-top: -8px;
  border: 2px solid transparent;
  border-top: 2px solid rgb(var(--v-theme-primary));
  border-radius: 50%;
  animation: spin var(--duration-slow) linear infinite;
  z-index: var(--z-index-tooltip);
}

/* Component enter animation for title */
.app-title.component-enter {
  animation: fadeIn var(--duration-normal) var(--ease-out-cubic);
}

/* Enhanced responsive styling for loading demo */
@media (min-width: 960px) {
  .loading-demo {
    margin-left: 24px;
    padding: 10px 16px;
  }
  
  .app-header.state-loading::after {
    right: 24px;
    width: 18px;
    height: 18px;
    margin-top: -9px;
  }
}
</style>