import type { Ref } from 'vue';

/**
 * TypeScript interfaces for theme management
 * Defines the structure for theme state, configuration, and switching behavior
 */

/**
 * Available theme modes
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Theme configuration options
 */
export interface ThemeConfig {
  /** Default theme mode */
  defaultTheme: ThemeMode;
  /** Whether to persist theme preference in localStorage */
  persistent: boolean;
  /** localStorage key for persistence */
  persistenceKey: string;
  /** Whether to follow system theme preference when in 'system' mode */
  followSystemTheme: boolean;
}

/**
 * Theme state interface
 */
export interface ThemeState {
  /** Current theme mode setting */
  currentTheme: ThemeMode;
  /** Actual active theme (resolved from system if needed) */
  activeTheme: 'light' | 'dark';
  /** Whether system prefers dark theme */
  systemPrefersDark: boolean;
  /** Whether theme switching is available */
  isThemeSwitchingEnabled: boolean;
}

/**
 * Theme composable return type
 */
export interface UseThemeReturn {
  // State (readonly)
  readonly state: Readonly<ThemeState>;
  readonly config: Readonly<ThemeConfig>;
  
  // Actions
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  
  // Computed properties
  readonly currentTheme: Readonly<Ref<ThemeMode>>;
  readonly activeTheme: Readonly<Ref<'light' | 'dark'>>;
  readonly systemPrefersDark: Readonly<Ref<boolean>>;
  readonly isThemeSwitchingEnabled: Readonly<Ref<boolean>>;
}