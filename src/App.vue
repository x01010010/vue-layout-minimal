<template>
  <AppLayout
    :sidebar-visible="layoutStore.sidebarVisible"
    :sidebar-width="layoutStore.sidebarWidth"
    :sidebar-state="layoutStore.sidebarState"
  >
    <!-- Header Slot -->
    <template #header>
      <AppHeader
        @user-click="handleUserClick"
      />
    </template>

    <!-- Sidebar Slots -->
    <!-- <template #sidebar-top>
      
      <v-list-item class="sidebar-brand">
        <template #prepend>
          <v-icon icon="mdi-view-dashboard" size="large" color="primary"></v-icon>
        </template>
      </v-list-item>
    </template>
     -->
    <template #sidebar-menu>
      <!-- Main menu using AppSidebar component -->
      <AppSidebar
        :sidebar-state="layoutStore.sidebarState"
        @menu-toggle="handleMenuToggle"
        @menu-item-click="handleSidebarMenuClick"
        @menu-expand="handleSidebarMenuExpand"
        @menu-collapse="handleSidebarMenuCollapse"
        @parent-click-collapsed="handleParentClickCollapsed"
      />
    </template>
    


    <!-- Main Content Slots -->
    <template #main-content>
      <AppMainContent>
        <template #main-content>
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
                  <li>Main content area with content and aside slots</li>
                  <li>Footer with left, center, and right slots</li>
                </ul>
                <p class="mt-4">The main content area now features:</p>
                <ul>
                  <li>Custom scrollable areas with styled scrollbars</li>
                  <li>Responsive layout that adapts to screen size</li>
                  <li>Independent scrolling for main and aside content</li>
                  <li>Smooth scrolling behavior</li>
                </ul>
              </v-card-text>
            </v-card>
          </v-container>
        </template>
        
        <template #main-aside>
          <v-card class="ma-4">
            <v-card-title>Aside Content</v-card-title>
            <v-card-text>
              <p>This is the aside area for additional content with enhanced scrolling.</p>
              <v-divider class="my-3"></v-divider>
              <p class="text-body-2">Try scrolling both the main content and this aside area to see the independent scrolling behavior in action.</p>
            </v-card-text>
          </v-card>
        </template>
      </AppMainContent>
    </template>
    
    <template #main-aside>
      <!-- This slot is now handled by AppMainContent -->
    </template>

    <!-- Footer Slots -->
    <template #footer-left>
      <AppFooter
        @link-click="handleFooterLinkClick"
      />
    </template>
    
    <template #footer-center>
      <!-- Content handled by AppFooter component -->
    </template>
    
    <template #footer-right>
      <!-- Content handled by AppFooter component -->
    </template>
  </AppLayout>
</template>

<script setup lang="ts">
import AppLayout from './components/AppLayout.vue'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppMainContent from './components/AppMainContent.vue'
import AppFooter from './components/AppFooter.vue'
import { useLayoutStore } from './stores/layout'
import { useTheme } from './composables/useTheme'
import type { MenuItem } from './types/sidebar'
import type { FooterLink } from './types/footer'
import { onMounted, onUnmounted } from 'vue'

// Initialize layout state management
const layoutStore = useLayoutStore();

// Initialize theme management
const themeState = useTheme();

onMounted(() => {
  layoutStore.initializeLayout();
})

onUnmounted(() => {
  layoutStore.cleanupLayout();
})

// Header event handlers
const handleMenuToggle = (): void => {
  console.log('Menu toggle clicked - toggling sidebar');
  layoutStore.toggleSidebar();
};


const handleUserClick = (): void => {
  console.log('User menu clicked');
  // TODO: Implement user menu functionality
};

const handleSettingsClick = (): void => {
  console.log('Sidebar settings clicked');
  // TODO: Implement settings functionality
};

// Sidebar event handlers
const handleSidebarMenuClick = (item: MenuItem): void => {
  console.log('Sidebar menu item clicked:', item);
};

const handleSidebarMenuExpand = (item: MenuItem): void => {
  console.log('Sidebar menu expanded:', item);
};

const handleSidebarMenuCollapse = (item: MenuItem): void => {
  console.log('Sidebar menu collapsed:', item);
};

const handleParentClickCollapsed = (item: MenuItem): void => {
  console.log('Parent item clicked in collapsed state:', item);
  // Automatically expand the sidebar when parent item is clicked in collapsed state
  layoutStore.setSidebarState('expanded');
  console.log('Sidebar automatically expanded due to parent item click');
};

// Footer event handlers
const handleFooterLinkClick = (link: FooterLink): void => {
  console.log('Footer link clicked:', link);
  // TODO: Implement footer link navigation
};


</script>

<style scoped>
h1 {
  color: rgb(var(--v-theme-primary));
}
</style>

