<template>
  <div class="app-sidebar">
    <!-- Top Section: Logo/Branding Area -->
    <div class="sidebar-top">
      <slot name="sidebar-top">
        <v-list-item class="sidebar-brand">
          <template #prepend>
            <v-icon icon="mdi-view-dashboard" size="large" color="primary"></v-icon>
          </template>
          <v-list-item-title class="text-h6 font-weight-bold">
            App Name
          </v-list-item-title>
        </v-list-item>
      </slot>
    </div>

    <!-- Menu Section: Navigation Menu -->
    <div class="sidebar-menu">
      <slot name="sidebar-menu">
        <v-list nav>
          <template v-for="item in menuItems" :key="item.id">
            <!-- Menu items with children (expandable) -->
            <v-list-group
              v-if="item.children"
              :value="item.id"
              :model-value="item.isExpanded"
              @update:model-value="(value: boolean) => toggleMenuGroup(item, value)"
            >
              <template #activator="{ props }">
                <v-list-item
                  v-bind="props"
                  :prepend-icon="item.icon"
                  :title="item.title"
                  class="menu-item-parent"
                  @click="handleParentItemClick(item)"
                />
              </template>
              
              <!-- Child menu items -->
              <v-list-item
                v-for="child in item.children"
                :key="child.id"
                :prepend-icon="child.icon"
                :title="child.title"
                class="menu-item-child"
                @click="child.action?.()"
              />
            </v-list-group>
            
            <!-- Single menu items (no children) -->
            <v-list-item
              v-else
              :prepend-icon="item.icon"
              :title="item.title"
              class="menu-item-single"
              @click="item.action?.()"
            />
          </template>
        </v-list>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SidebarProps, SidebarEmits, MenuItem } from '@/types/sidebar'

// Component props
const props = withDefaults(defineProps<SidebarProps>(), {
  sidebarState: 'expanded'
})

// Component emits
const emit = defineEmits<SidebarEmits>()

// Menu data structure
const menuItems = ref<MenuItem[]>([
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'mdi-view-dashboard',
    action: () => handleMenuClick('dashboard')
  },
  {
    id: 'components',
    title: 'Components',
    icon: 'mdi-puzzle',
    isExpanded: false,
    children: [
      {
        id: 'buttons',
        title: 'Buttons',
        icon: 'mdi-gesture-tap-button',
        action: () => handleMenuClick('buttons')
      },
      {
        id: 'forms',
        title: 'Forms',
        icon: 'mdi-form-select',
        action: () => handleMenuClick('forms')
      },
      {
        id: 'tables',
        title: 'Tables',
        icon: 'mdi-table',
        action: () => handleMenuClick('tables')
      }
    ]
  },
  {
    id: 'pages',
    title: 'Pages',
    icon: 'mdi-file-document-multiple',
    isExpanded: false,
    children: [
      {
        id: 'about',
        title: 'About',
        icon: 'mdi-information',
        action: () => handleMenuClick('about')
      },
      {
        id: 'contact',
        title: 'Contact',
        icon: 'mdi-email',
        action: () => handleMenuClick('contact')
      },
      {
        id: 'help',
        title: 'Help',
        icon: 'mdi-help-circle',
        action: () => handleMenuClick('help')
      }
    ]
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'mdi-cog',
    action: () => handleMenuClick('settings')
  }
])

// Menu click handler (placeholder for now)
const handleMenuClick = (itemId: string): void => {
  console.log(`Menu item clicked: ${itemId}`)
  // TODO: Implement actual navigation logic
}

// Toggle menu group expand/collapse
const toggleMenuGroup = (item: MenuItem, isExpanded: boolean): void => {
  item.isExpanded = isExpanded
  
  // Emit events for expand/collapse
  if (isExpanded) {
    emit('menu-expand', item)
  } else {
    emit('menu-collapse', item)
  }
  
  console.log(`Menu group ${item.title} ${isExpanded ? 'expanded' : 'collapsed'}`)
}

// Handle parent item click
const handleParentItemClick = (item: MenuItem): void => {
  // If the sidebar is collapsed, expand it
  if (props.sidebarState === 'collapsed' && item.children && item.children.length > 0) {
    emit('parent-click-collapsed', item)
  }
  
  // Always toggle the menu group's expansion state
  toggleMenuGroup(item, !item.isExpanded)
}

// Watch for sidebar state changes to implement cascading collapse
watch(() => props.sidebarState, (newState) => {
  if (newState === 'collapsed') {
    // Auto-collapse all expanded parent items when sidebar collapses
    menuItems.value.forEach(item => {
      if (item.children && item.isExpanded) {
        item.isExpanded = false
      }
    })
  }
}, { immediate: true })
</script>

<style scoped>
.app-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-top {
  flex: 0 0 auto;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.sidebar-brand {
  padding: 16px;
  transition: background-color 0.2s ease;
}

.sidebar-brand:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.sidebar-menu {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 8px 0;
}


/* ===== Z-INDEX LAYERING FOR SIDEBAR ELEMENTS ===== */

/* Sidebar sections should have proper layering */
.sidebar-top {
  position: relative;
  z-index: var(--z-index-elevated);
}

.sidebar-menu {
  position: relative;
  z-index: var(--z-index-content);
}


/* Menu items should be elevated for interaction */
:deep(.menu-item-parent),
:deep(.menu-item-single),
:deep(.menu-item-child) {
  position: relative;
  z-index: var(--z-index-elevated);
}

/* Expanded menu groups should be above other items */
:deep(.v-list-group--active .menu-item-parent) {
  z-index: var(--z-index-dropdown);
}

/* Brand/logo should be prominent */
.sidebar-brand {
  position: relative;
  z-index: var(--z-index-elevated);
}

/* ===== ENHANCED MENU ITEM ANIMATIONS ===== */

/* Menu item styling with enhanced animations */
:deep(.menu-item-parent) {
  margin: 2px 8px;
  border-radius: 8px;
  transition: var(--button-transition),
              transform var(--hover-transition-duration) var(--hover-transition-timing),
              box-shadow var(--shadow-transition);
  position: relative;
  overflow: hidden;
}

:deep(.menu-item-parent:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(var(--hover-translate-x)) scale(1.02);
  box-shadow: var(--shadow-hover);
}

:deep(.menu-item-parent:active) {
  transform: translateX(var(--hover-translate-x)) scale(0.98);
  transition-duration: var(--duration-fast);
}

:deep(.menu-item-single) {
  margin: 2px 8px;
  border-radius: 8px;
  transition: var(--button-transition),
              transform var(--hover-transition-duration) var(--hover-transition-timing),
              box-shadow var(--shadow-transition);
  position: relative;
  overflow: hidden;
}

:deep(.menu-item-single:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(var(--hover-translate-x)) scale(1.02);
  box-shadow: var(--shadow-hover);
}

:deep(.menu-item-single:active) {
  transform: translateX(var(--hover-translate-x)) scale(0.98);
  transition-duration: var(--duration-fast);
}

:deep(.menu-item-child) {
  margin: 1px 16px 1px 24px;
  border-radius: 6px;
  transition: var(--button-transition),
              transform var(--hover-transition-duration) var(--hover-transition-timing),
              box-shadow var(--shadow-transition);
  font-size: 0.875rem;
  position: relative;
  overflow: hidden;
}

:deep(.menu-item-child:hover) {
  background-color: rgba(var(--v-theme-secondary), 0.08);
  transform: translateX(6px) scale(1.01);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.menu-item-child:active) {
  transform: translateX(6px) scale(0.99);
  transition-duration: var(--duration-fast);
}

/* Enhanced icon styling with smooth animations */
:deep(.v-list-item__prepend > .v-icon) {
  transition: color var(--duration-normal) var(--ease-out-cubic),
              transform var(--duration-normal) var(--ease-spring);
}

:deep(.menu-item-parent:hover .v-icon),
:deep(.menu-item-single:hover .v-icon) {
  color: rgb(var(--v-theme-primary));
  transform: scale(1.1) rotate(5deg);
}

:deep(.menu-item-child:hover .v-icon) {
  color: rgb(var(--v-theme-secondary));
  transform: scale(1.05) rotate(-3deg);
}

/* Menu item focus states */
:deep(.menu-item-parent:focus-visible),
:deep(.menu-item-single:focus-visible),
:deep(.menu-item-child:focus-visible) {
  outline: none;
  box-shadow: var(--shadow-focus);
}

/* GPU acceleration for smooth performance */
:deep(.menu-item-parent),
:deep(.menu-item-single),
:deep(.menu-item-child),
:deep(.v-list-item__prepend > .v-icon) {
  will-change: transform;
  transform: translateZ(0);
}

/* Typography hierarchy */
:deep(.menu-item-parent .v-list-item-title) {
  font-weight: 500;
}

:deep(.menu-item-single .v-list-item-title) {
  font-weight: 500;
}

:deep(.menu-item-child .v-list-item-title) {
  font-weight: 400;
  opacity: 0.9;
}

/* Smooth scrollbar for menu */
.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(var(--v-border-color), 0.3);
  border-radius: 2px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-border-color), 0.5);
}
</style>