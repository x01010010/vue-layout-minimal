<template>
  <v-footer class="app-footer" app>
    <v-container fluid class="footer-container">
      <v-row align="center" no-gutters>
        <!-- Left Section: Copyright/Branding -->
        <v-col cols="auto" class="footer-left">
          <slot name="footer-left">
            <span class="copyright-text">
              &copy; {{ currentYear }} {{ appName }}
            </span>
          </slot>
        </v-col>

        <!-- Center Section: Central Content -->
        <v-col class="footer-center">
          <slot name="footer-center">
            <div class="navigation-links">
              <template v-if="navigationLinks && navigationLinks.length > 0">
                <v-btn
                  v-for="(link, index) in navigationLinks"
                  :key="link.id"
                  variant="text"
                  size="small"
                  @click="handleLinkClick(link)"
                  class="nav-link"
                >
                  {{ link.title }}
                </v-btn>
              </template>
              <template v-else>
                <v-btn variant="text" size="small" class="nav-link">About</v-btn>
                <v-btn variant="text" size="small" class="nav-link">Privacy</v-btn>
                <v-btn variant="text" size="small" class="nav-link">Terms</v-btn>
              </template>
            </div>
          </slot>
        </v-col>
      </v-row>
    </v-container>
  </v-footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FooterProps, FooterEmits, FooterLink } from '../types/footer'

// Component props with defaults
const props = withDefaults(defineProps<FooterProps>(), {
  appName: 'Vue Layout Minimal',
  showYear: true,
  centerContent: 'Built with Vue 3 + Vuetify 3',
  showVersion: false
})

// Component events
const emit = defineEmits<FooterEmits>()

// Computed properties
const currentYear = computed((): number => {
  if (props.customYear) {
    return props.customYear
  }
  return props.showYear ? new Date().getFullYear() : 0
})

// Event handlers
const handleLinkClick = (link: FooterLink): void => {
  emit('link-click', link)
}

</script>

<style scoped>
.app-footer {
  border-top: 1px solid rgb(var(--v-theme-outline-variant));
}

.footer-container {
  padding: 12px 16px;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.copyright-text {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  white-space: nowrap;
}

.center-content {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  text-align: center;
}

/* Desktop responsive styling */
@media (min-width: 960px) {
  .footer-container {
    padding: 16px 24px;
  }
  
  .copyright-text,
  .center-content {
    font-size: 0.9375rem;
  }
}
</style>
.navigation-links {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.nav-link {
  font-size: 0.875rem;
  text-transform: none;
  letter-spacing: normal;
}


/* ===== Z-INDEX LAYERING FOR FOOTER ELEMENTS ===== */

/* Footer buttons should be elevated for interaction */
:deep(.v-btn) {
  position: relative;
  z-index: var(--z-index-elevated);
}

/* Navigation links should be above base content */
.navigation-links {
  position: relative;
  z-index: var(--z-index-content);
}


/* ===== ENHANCED BUTTON ANIMATIONS ===== */

/* Navigation link buttons with consistent animations */
:deep(.nav-link) {
  transition: var(--button-transition) !important;
  position: relative;
  overflow: hidden;
}

:deep(.nav-link:hover) {
  transform: scale(var(--button-hover-scale));
  background-color: rgba(var(--v-theme-primary), 0.08);
}

:deep(.nav-link:active) {
  transform: scale(var(--button-active-scale));
  transition-duration: var(--duration-fast);
}

:deep(.nav-link:focus-visible) {
  transform: scale(var(--button-focus-scale));
  box-shadow: var(--shadow-focus);
}


/* GPU acceleration for smooth performance */
:deep(.nav-link),
:deep(.v-icon) {
  will-change: transform;
  transform: translateZ(0);
}

/* Theme transition for footer elements */
.app-footer {
  transition: var(--theme-transition);
}

.copyright-text,
.center-content {
  transition: color var(--theme-transition-duration) var(--theme-transition-timing);
}

/* Enhanced desktop responsive styling */
@media (min-width: 960px) {
  .navigation-links {
    gap: 12px;
  }
  
  .nav-link {
    font-size: 0.9375rem;
  }
  
}