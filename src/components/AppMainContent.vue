<template>
  <div class="main-content-wrapper">
    <!-- Primary Content Area -->
    <div class="main-content-area" :class="{ 'with-aside': showAside }">
      <div class="content-scrollable" ref="contentScrollRef">
        <slot name="main-content">
          <!-- Default content if no slot provided -->
          <div class="default-content">
            <h2>Main Content Area</h2>
            <p>This is the primary content area with scrollable content to demonstrate the scrolling behavior.</p>
            
            <v-card class="mt-6 mb-4" elevation="2">
              <v-card-title>Welcome Section</v-card-title>
              <v-card-text>
                <p>This main content area demonstrates proper scrolling behavior with custom styled scrollbars. The content is designed to overflow vertically to showcase the smooth scrolling functionality.</p>
              </v-card-text>
            </v-card>

            <v-card class="mb-4" elevation="2">
              <v-card-title>Features Overview</v-card-title>
              <v-card-text>
                <v-list>
                  <v-list-item v-for="feature in sampleFeatures" :key="feature.id">
                    <template #prepend>
                      <v-icon :icon="feature.icon" color="primary"></v-icon>
                    </template>
                    <v-list-item-title>{{ feature.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ feature.description }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <v-card class="mb-4" elevation="2">
              <v-card-title>Content Sections</v-card-title>
              <v-card-text>
                <div v-for="section in sampleSections" :key="section.id" class="mb-6">
                  <h3 class="text-h6 mb-2 text-primary">{{ section.title }}</h3>
                  <p class="mb-3">{{ section.content }}</p>
                  <v-divider v-if="section.id < sampleSections.length"></v-divider>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="mb-4" elevation="2">
              <v-card-title>Scrolling Demo</v-card-title>
              <v-card-text>
                <p class="mb-4">This section contains additional content to demonstrate the scrolling behavior:</p>
                <div v-for="n in 10" :key="n" class="mb-3 pa-3" style="background-color: rgba(var(--v-theme-surface-variant), 0.1); border-radius: 8px;">
                  <h4 class="text-subtitle-1 mb-2">Demo Section {{ n }}</h4>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </slot>
      </div>
    </div>

    <!-- Aside Content Area -->
    <div 
      v-if="showAside" 
      class="main-aside-area"
      :style="{ width: asideWidth }"
    >
      <div class="aside-scrollable" ref="asideScrollRef">
        <slot name="main-aside">
          <!-- Default aside content if no slot provided -->
          <div class="default-aside">
            <h3>Aside Content</h3>
            <p>This is the aside area with scrollable widgets and secondary content.</p>
            
            <v-card class="mt-4 mb-3" elevation="1">
              <v-card-title class="text-subtitle-1">Quick Stats</v-card-title>
              <v-card-text>
                <div v-for="stat in sampleStats" :key="stat.label" class="d-flex justify-space-between align-center mb-2">
                  <span class="text-body-2">{{ stat.label }}</span>
                  <v-chip size="small" :color="stat.color">{{ stat.value }}</v-chip>
                </div>
              </v-card-text>
            </v-card>

            <v-card class="mb-3" elevation="1">
              <v-card-title class="text-subtitle-1">Recent Activity</v-card-title>
              <v-card-text>
                <v-list density="compact">
                  <v-list-item v-for="activity in sampleActivities" :key="activity.id" class="px-0">
                    <template #prepend>
                      <v-avatar size="24" :color="activity.color">
                        <v-icon size="16" :icon="activity.icon"></v-icon>
                      </v-avatar>
                    </template>
                    <v-list-item-title class="text-body-2">{{ activity.title }}</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">{{ activity.time }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <v-card class="mb-3" elevation="1">
              <v-card-title class="text-subtitle-1">Widget Demo</v-card-title>
              <v-card-text>
                <div v-for="n in 8" :key="n" class="mb-3 pa-2" style="background-color: rgba(var(--v-theme-primary), 0.05); border-radius: 6px;">
                  <div class="text-body-2 font-weight-medium mb-1">Widget {{ n }}</div>
                  <div class="text-caption">Sample widget content to demonstrate aside scrolling behavior.</div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MainContentProps, MainContentEmits } from '../types/main-content'

// Component props with defaults
const props = withDefaults(defineProps<MainContentProps>(), {
  showAside: true,
  asideWidth: '300px',
  contentPadding: '24px',
  enableCustomScrollbar: true,
  scrollBehavior: 'smooth',
  hideAsideOnMobile: true,
  mobileBreakpoint: 768
})

// Component emits
const emit = defineEmits<MainContentEmits>()

// Template refs
const contentScrollRef = ref<HTMLElement>()
const asideScrollRef = ref<HTMLElement>()

// Computed properties
const contentStyles = computed(() => ({
  padding: props.contentPadding,
  scrollBehavior: props.scrollBehavior
}))

// Scroll event handlers
const handleContentScroll = (event: Event) => {
  const target = event.target as HTMLElement
  emit('content-scroll', target.scrollTop)
}

// Sample data for demonstration
const sampleFeatures = ref([
  {
    id: 1,
    title: 'Responsive Layout',
    description: 'Adapts to different screen sizes seamlessly',
    icon: 'mdi-responsive'
  },
  {
    id: 2,
    title: 'Custom Scrollbars',
    description: 'Styled scrollbars that match the theme',
    icon: 'mdi-scroll-vertical'
  },
  {
    id: 3,
    title: 'Smooth Scrolling',
    description: 'Enhanced scrolling experience with smooth behavior',
    icon: 'mdi-gesture-swipe-vertical'
  },
  {
    id: 4,
    title: 'Flexible Slots',
    description: 'Named slots for main content and aside areas',
    icon: 'mdi-view-column'
  }
])

const sampleSections = ref([
  {
    id: 1,
    title: 'Getting Started',
    content: 'This main content area demonstrates the scrollable layout with proper overflow handling. The content is structured to show how different sections can be organized within the scrollable container.'
  },
  {
    id: 2,
    title: 'Layout Features',
    content: 'The layout supports both single-column (main only) and two-column (main + aside) configurations. The aside area can be toggled and is responsive to mobile breakpoints.'
  },
  {
    id: 3,
    title: 'Scrolling Behavior',
    content: 'Custom scrollbar styling provides a consistent look across different browsers. The scrolling is smooth and includes proper padding and spacing for optimal readability.'
  }
])

const sampleStats = ref([
  { label: 'Active Users', value: '1,234', color: 'success' },
  { label: 'Total Views', value: '5,678', color: 'info' },
  { label: 'Conversions', value: '89%', color: 'warning' },
  { label: 'Performance', value: 'Good', color: 'primary' }
])

const sampleActivities = ref([
  {
    id: 1,
    title: 'User logged in',
    time: '2 min ago',
    icon: 'mdi-login',
    color: 'success'
  },
  {
    id: 2,
    title: 'New message received',
    time: '5 min ago',
    icon: 'mdi-message',
    color: 'info'
  },
  {
    id: 3,
    title: 'Task completed',
    time: '10 min ago',
    icon: 'mdi-check-circle',
    color: 'success'
  },
  {
    id: 4,
    title: 'System update',
    time: '15 min ago',
    icon: 'mdi-update',
    color: 'warning'
  }
])

// Setup scroll listeners
onMounted(() => {
  if (contentScrollRef.value) {
    contentScrollRef.value.addEventListener('scroll', handleContentScroll, { passive: true })
  }
})
</script>

<style scoped>
.main-content-wrapper {
  display: flex;
  height: 100%;
  width: 100%;
  gap: 16px;
}

.main-content-area {
  flex: 1 1 auto;
  min-width: 0; /* Prevents flex item from overflowing */
}

.main-content-area.with-aside {
  flex: 1 1 auto;
}

.main-aside-area {
  flex: 0 0 auto;
  min-width: 250px;
  max-width: 400px;
}

.content-scrollable,
.aside-scrollable {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scroll-behavior: v-bind('props.scrollBehavior');
}

.content-scrollable {
  padding: v-bind('props.contentPadding');
}

.aside-scrollable {
  padding: 16px;
}

/* ===== Z-INDEX LAYERING FOR MAIN CONTENT ELEMENTS ===== */

/* Main content wrapper should be base layer */
.main-content-wrapper {
  position: relative;
  z-index: var(--z-index-base);
}

/* Content areas should be above base */
.main-content-area,
.main-aside-area {
  position: relative;
  z-index: var(--z-index-content);
}

/* Scrollable containers should be elevated */
.content-scrollable,
.aside-scrollable {
  position: relative;
  z-index: var(--z-index-content);
}

/* Cards and interactive elements should be elevated */
:deep(.v-card) {
  position: relative;
  z-index: var(--z-index-elevated);
}

/* Buttons within content should be elevated for interaction */
:deep(.v-btn) {
  position: relative;
  z-index: var(--z-index-elevated);
}

/* ===== ENHANCED SMOOTH SCROLLING SYSTEM ===== */

/* Enhanced scrollable containers with animation system integration */
.content-scrollable,
.aside-scrollable {
  /* Smooth scrolling with momentum and easing */
  scroll-behavior: smooth;
  scroll-padding-top: var(--spacing-lg);
  scroll-padding-bottom: var(--spacing-lg);
  
  /* Enhanced scroll snap for better UX */
  scroll-snap-type: y proximity;
  
  /* GPU acceleration for smooth performance */
  will-change: scroll-position;
  transform: translateZ(0);
  
  /* Smooth transitions for scroll-related properties */
  transition: scroll-behavior var(--duration-normal) var(--ease-out-cubic);
}

/* Enhanced Custom Scrollbar Styling with Animation System */
.content-scrollable::-webkit-scrollbar,
.aside-scrollable::-webkit-scrollbar {
  width: 8px;
  transition: width var(--duration-fast) var(--ease-out-cubic);
}

.content-scrollable::-webkit-scrollbar:hover,
.aside-scrollable::-webkit-scrollbar:hover {
  width: 12px;
}

.content-scrollable::-webkit-scrollbar-track,
.aside-scrollable::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 6px;
  margin: var(--spacing-xs) 0;
  transition: background-color var(--duration-normal) var(--ease-out-cubic);
}

.content-scrollable::-webkit-scrollbar-thumb,
.aside-scrollable::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.3);
  border-radius: 6px;
  border: 1px solid transparent;
  background-clip: padding-box;
  transition: background-color var(--duration-normal) var(--ease-out-cubic),
              transform var(--duration-fast) var(--ease-spring),
              border-color var(--duration-normal) var(--ease-out-cubic);
}

.content-scrollable::-webkit-scrollbar-thumb:hover,
.aside-scrollable::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.6);
  border-color: rgba(var(--v-theme-primary), 0.2);
  transform: scaleX(1.1);
}

.content-scrollable::-webkit-scrollbar-thumb:active,
.aside-scrollable::-webkit-scrollbar-thumb:active {
  background: rgba(var(--v-theme-primary), 0.8);
  transform: scaleX(1.2);
}

/* Enhanced Firefox scrollbar styling */
.content-scrollable,
.aside-scrollable {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-primary), 0.3) rgba(var(--v-theme-surface-variant), 0.1);
  scrollbar-gutter: stable;
}

/* Scroll snap points for better navigation */
.content-scrollable > * > .v-card,
.aside-scrollable > * > .v-card {
  scroll-snap-align: start;
  scroll-margin-top: var(--spacing-md);
}

/* Enhanced momentum scrolling for iOS */
.content-scrollable,
.aside-scrollable {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* Smooth scroll animations for content sections */
.content-scrollable .v-card,
.aside-scrollable .v-card {
  transition: transform var(--duration-normal) var(--ease-out-cubic),
              box-shadow var(--shadow-transition);
}

/* Scroll-triggered animations (intersection observer would enhance this) */
.content-scrollable .v-card:hover,
.aside-scrollable .v-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

/* Enhanced focus management for keyboard navigation */
.content-scrollable:focus-within,
.aside-scrollable:focus-within {
  scroll-behavior: smooth;
}

/* Accessibility: Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .content-scrollable,
  .aside-scrollable {
    scroll-behavior: auto;
    scroll-snap-type: none;
  }
  
  .content-scrollable::-webkit-scrollbar-thumb,
  .aside-scrollable::-webkit-scrollbar-thumb {
    transition: none;
  }
  
  .content-scrollable .v-card,
  .aside-scrollable .v-card {
    transition: none;
  }
}

/* Default content styling */
.default-content,
.default-aside {
  color: rgb(var(--v-theme-on-surface));
}

.default-content h2,
.default-aside h3 {
  color: rgb(var(--v-theme-primary));
  margin-bottom: 16px;
}

.default-content p,
.default-aside p {
  line-height: 1.6;
  opacity: 0.8;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .main-content-wrapper {
    flex-direction: column;
    gap: 8px;
  }
  
  .main-aside-area {
    width: 100% !important;
    min-width: unset;
    max-width: unset;
    order: 2;
  }
  
  .main-content-area {
    order: 1;
  }
}
</style>