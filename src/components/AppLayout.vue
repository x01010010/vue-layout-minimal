<template>
  <v-app>
    <!-- App Bar / Header -->
    <v-app-bar class="app-bar-reset">
      <slot name="header"></slot>
    </v-app-bar>

    <!-- Navigation Drawer / Sidebar -->
    <v-navigation-drawer
      :model-value="sidebarVisible"
      :width="sidebarWidth"
      :rail="sidebarState === 'collapsed'"
      permanent
      class="sidebar-drawer"
    >
      <div class="sidebar-container">
        <div class="sidebar-top">
          <slot name="sidebar-top"></slot>
        </div>
        <div class="sidebar-menu">
          <slot name="sidebar-menu"></slot>
        </div>
        <div class="sidebar-bottom">
          <slot name="sidebar-bottom"></slot>
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Main Content Area -->
    <v-main>
      <div class="main-container">
        <div class="main-content">
          <slot name="main-content"></slot>
        </div>
      </div>
    </v-main>

    <!-- Footer -->
    <v-footer>
      <div class="footer-container">
        <div class="footer-left">
          <slot name="footer-left"></slot>
        </div>
        <div class="footer-center">
          <slot name="footer-center"></slot>
        </div>
        <div class="footer-right">
          <slot name="footer-right"></slot>
        </div>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import type { SidebarState } from '../types/layout';

// TypeScript interfaces for layout props
interface LayoutProps {
  sidebarVisible?: boolean;
  sidebarWidth?: number;
  sidebarState?: SidebarState;
}

// Component props with defaults
const props = withDefaults(defineProps<LayoutProps>(), {
  sidebarVisible: true,
  sidebarWidth: 280,
  sidebarState: 'expanded'
});
</script>

<style scoped>
/* ===== Z-INDEX LAYERING AND VISUAL HIERARCHY ===== */

/* App Bar - Should be above main content but below modals */
:deep(.v-app-bar) {
  z-index: var(--z-index-sticky) !important;
}

.app-bar-reset :deep(.v-toolbar__content) {
  padding: 0;
}

/* Navigation Drawer - Should be above main content */
:deep(.v-navigation-drawer) {
  z-index: var(--z-index-fixed) !important;
}

/* Main content - Base layer */
:deep(.v-main) {
  z-index: 1;
}

/* Footer - Should be above main content but below sticky elements */
:deep(.v-footer) {
  z-index: var(--z-index-sticky) !important;
}

/* Header Layout */
/* Styles for header-container, header-left, header-center, and header-right are removed */

/* Sidebar Layout */
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-top {
  flex: 0 0 auto;
}

.sidebar-menu {
  flex: 1 1 auto;
}

.sidebar-bottom {
  flex: 0 0 auto;
}

/* Main Content Layout */
.main-container {
  display: flex;
  min-height: 100%;
}

.main-content {
  flex: 1 1 auto;
}



/* Footer Layout */
.footer-container {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.footer-left {
  flex: 0 0 auto;
}

.footer-center {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
}

.footer-right {
  flex: 0 0 auto;
}

/* ===== SIDEBAR ANIMATIONS ===== */
.sidebar-drawer {
  transition: var(--sidebar-width-transition) !important;
  will-change: width;
}

/* Override Vuetify's default transitions for smoother animations */
:deep(.v-navigation-drawer) {
  transition: width var(--sidebar-transition-duration) var(--sidebar-transition-timing) !important;
}

/* Smooth transitions for sidebar content */
:deep(.v-navigation-drawer__content) {
  transition: opacity var(--duration-normal) var(--ease-out-cubic);
}

/* Enhanced rail mode animations */
:deep(.v-navigation-drawer--rail) {
  transition: width var(--sidebar-transition-duration) var(--sidebar-transition-timing) !important;
}

/* Smooth content transitions when sidebar state changes */
:deep(.v-navigation-drawer--rail .v-list-item-title) {
  transition: opacity var(--duration-fast) var(--ease-out-cubic);
}

/* GPU acceleration for smooth performance */
.sidebar-drawer,
:deep(.v-navigation-drawer),
:deep(.v-navigation-drawer__content) {
  transform: translateZ(0);
}

/* ===== RESPONSIVE BEHAVIOR FOR DESKTOP ORIENTATIONS ===== */

/* Base desktop styles (landscape orientation) */
@media (min-width: 1024px) {
  .main-container {
    transition: var(--responsive-layout-transition);
    padding: 16px 24px;
  }
  
  .main-content {
    max-width: none;
    padding-right: 24px;
  }

}

/* Wide desktop screens */
@media (min-width: 1440px) {
  .main-container {
    padding: 24px 32px;
    max-width: 1600px;
    margin: 0 auto;
  }
  
  .main-content {
    padding-right: 32px;
  }
  

}

/* Ultra-wide screens */
@media (min-width: 1920px) {
  .main-container {
    padding: 32px 48px;
    max-width: 1800px;
  }
  
  .main-content {
    padding-right: 48px;
  }
}

/* Portrait orientation on desktop (tall screens) */
@media (min-width: 1024px) and (orientation: portrait) {
  .main-container {
    flex-direction: column;
    padding: 16px 20px;
  }
  
  .main-content {
    padding-right: 0;
    padding-bottom: 24px;
  }
  

  
  /* Adjust sidebar for portrait mode */
  .sidebar-drawer {
    max-width: 320px;
  }
}

/* Landscape orientation optimizations */
@media (min-width: 1024px) and (orientation: landscape) {
  .main-container {
    min-height: calc(100vh - 64px - 60px); /* Account for header and footer */
  }
  
  /* Optimize sidebar width for landscape */
  :deep(.v-navigation-drawer:not(.v-navigation-drawer--rail)) {
    width: 280px !important;
  }
  
  :deep(.v-navigation-drawer--rail) {
    width: 64px !important;
  }
}

/* High-resolution displays */
@media (min-width: 1024px) and (min-resolution: 2dppx) {
  .main-container {
    /* Enhance text rendering on high-DPI displays */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}

/* Aspect ratio specific adjustments */
@media (min-width: 1024px) and (min-aspect-ratio: 16/9) {
  /* Ultra-wide aspect ratios */
  .main-container {
    max-width: 1400px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) and (max-aspect-ratio: 4/3) {
  /* Square-ish aspect ratios */
  .main-container {
    padding: 20px;
  }
  
  .main-content {
    max-width: 800px;
  }
}

/* Responsive header adjustments */
@media (min-width: 1024px) and (orientation: portrait) {
  .header-container {
    padding: 0 16px;
  }
}

@media (min-width: 1024px) and (orientation: landscape) {
  .header-container {
    padding: 0 24px;
  }
}

/* Responsive footer adjustments */
@media (min-width: 1024px) {
  .footer-container {
    padding: 0 24px;
    transition: var(--responsive-layout-transition);
  }
}

@media (min-width: 1440px) {
  .footer-container {
    padding: 0 32px;
    max-width: 1600px;
    margin: 0 auto;
  }
}

/* Smooth transitions for orientation changes */
@media (min-width: 1024px) {
  .main-container,
  .main-content,
  .header-container,
  .footer-container {
    transition: var(--responsive-layout-transition);
  }
}
</style>