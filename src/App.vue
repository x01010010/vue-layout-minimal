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
          <router-view />
        </template>
      </AppMainContent>
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

