import { ref, computed, reactive, watch, onMounted, onUnmounted, readonly } from 'vue';
import { useTheme as useVuetifyTheme } from 'vuetify';
import type {
  ThemeState,
  ThemeConfig,
  UseThemeReturn,
  ThemeMode
} from '../types/theme';

/**
 * Default configuration for theme management
 */
const DEFAULT_CONFIG: ThemeConfig = {
  defaultTheme: 'system',
  persistent: true,
  persistenceKey: 'vue-layout-theme-preference',
  followSystemTheme: true
};

/**
 * Theme management composable
 * Provides reactive state management for theme switching with light/dark/system modes
 */
export function useTheme(config: Partial<ThemeConfig> = {}): UseThemeReturn {
  // Merge provided config with defaults
  const themeConfig = reactive<ThemeConfig>({
    ...DEFAULT_CONFIG,
    ...config
  });

  // Get Vuetify theme instance
  const vuetifyTheme = useVuetifyTheme();

  // Initialize reactive state
  const state = reactive<ThemeState>({
    currentTheme: themeConfig.defaultTheme,
    activeTheme: 'light',
    systemPrefersDark: false,
    isThemeSwitchingEnabled: true
  });

  // Reactive references for external access
  const currentTheme = ref<ThemeMode>(state.currentTheme);
  const activeTheme = ref<'light' | 'dark'>(state.activeTheme);
  const systemPrefersDark = ref<boolean>(state.systemPrefersDark);
  const isThemeSwitchingEnabled = ref<boolean>(state.isThemeSwitchingEnabled);

  // Helper function to update all related state properties
  const updateThemeState = (newTheme: ThemeMode): void => {
    state.currentTheme = newTheme;
    currentTheme.value = newTheme;
    
    // Determine active theme based on current theme and system preference
    let resolvedTheme: 'light' | 'dark';
    if (newTheme === 'system') {
      resolvedTheme = state.systemPrefersDark ? 'dark' : 'light';
    } else {
      resolvedTheme = newTheme;
    }
    
    state.activeTheme = resolvedTheme;
    activeTheme.value = resolvedTheme;
    
    // Update Vuetify theme
    vuetifyTheme.change(resolvedTheme);
    
    // Save to localStorage if persistence is enabled
    if (themeConfig.persistent) {
      try {
        localStorage.setItem(themeConfig.persistenceKey, newTheme);
      } catch (error) {
        console.warn('Failed to save theme preference to localStorage:', error);
      }
    }
  };

  // Function to detect system theme preference
  const detectSystemTheme = (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const prefersDark = mediaQuery.matches;
    
    state.systemPrefersDark = prefersDark;
    systemPrefersDark.value = prefersDark;
    
    // If current theme is 'system', update active theme based on system preference
    if (state.currentTheme === 'system') {
      const resolvedTheme = prefersDark ? 'dark' : 'light';
      state.activeTheme = resolvedTheme;
      activeTheme.value = resolvedTheme;
      vuetifyTheme.change(resolvedTheme);
    }
  };

  // Function to handle system theme changes
  const handleSystemThemeChange = (event: MediaQueryListEvent): void => {
    const prefersDark = event.matches;
    
    state.systemPrefersDark = prefersDark;
    systemPrefersDark.value = prefersDark;
    
    // Only update active theme if we're in 'system' mode
    if (state.currentTheme === 'system' && themeConfig.followSystemTheme) {
      const resolvedTheme = prefersDark ? 'dark' : 'light';
      state.activeTheme = resolvedTheme;
      activeTheme.value = resolvedTheme;
      vuetifyTheme.change(resolvedTheme);
    }
  };

  // Function to initialize system theme detection
  const initializeSystemThemeDetection = (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Initial detection
    detectSystemTheme();
    
    // Listen for system theme changes
    if (themeConfig.followSystemTheme) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    }
  };

  // Function to cleanup system theme listeners
  const cleanupSystemThemeDetection = (): void => {
    if (typeof window === 'undefined') {
      return;
    }
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
  };

  // Function to load saved theme from localStorage
  const loadSavedTheme = (): void => {
    if (!themeConfig.persistent) {
      return;
    }
    
    try {
      const savedTheme = localStorage.getItem(themeConfig.persistenceKey);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        updateThemeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.warn('Failed to load theme preference from localStorage:', error);
    }
  };

  // Theme toggle method - cycles through light → dark → system
  const toggleTheme = (): void => {
    let nextTheme: ThemeMode;
    
    switch (state.currentTheme) {
      case 'light':
        nextTheme = 'dark';
        break;
      case 'dark':
        nextTheme = 'system';
        break;
      case 'system':
        nextTheme = 'light';
        break;
      default:
        nextTheme = 'light';
        break;
    }
    
    updateThemeState(nextTheme);
  };

  // Theme setter method - sets theme explicitly
  const setTheme = (theme: ThemeMode): void => {
    if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
      console.warn('Invalid theme mode:', theme);
      return;
    }
    
    updateThemeState(theme);
  };

  // Lifecycle management
  onMounted(() => {
    // Initialize system theme detection first
    initializeSystemThemeDetection();
    
    // Load saved theme from localStorage on mount
    loadSavedTheme();
    
    console.log('useTheme mounted - system theme detection and saved theme loaded');
  });

  onUnmounted(() => {
    // Cleanup system theme listeners
    cleanupSystemThemeDetection();
    
    console.log('useTheme unmounted - cleanup completed');
  });

  // Return the composable interface
  return {
    // State (readonly)
    state: readonly(state),
    config: readonly(themeConfig),
    
    // Actions
    toggleTheme,
    setTheme,
    
    // Computed properties
    currentTheme: readonly(currentTheme),
    activeTheme: readonly(activeTheme),
    systemPrefersDark: readonly(systemPrefersDark),
    isThemeSwitchingEnabled: readonly(isThemeSwitchingEnabled)
  };
}