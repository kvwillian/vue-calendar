import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

const STORAGE_KEY = 'calendar-theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const;

type Theme = typeof THEMES[keyof typeof THEMES];

function applyThemeToDocument(theme: Theme) {
  const html = document.documentElement;
  if (theme === THEMES.DARK) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}

export const useThemeStore = defineStore('theme', () => {
  function loadFromStorage(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && Object.values(THEMES).includes(stored as Theme)) {
        return stored as Theme;
      }
    } catch (e) {
    }
    
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
        return THEMES.DARK;
    }
    
    return THEMES.LIGHT;
  }
  
  const currentTheme = ref<Theme>(loadFromStorage());

  function toggleTheme() {
    currentTheme.value = currentTheme.value === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
  }

  function setTheme(theme: Theme) {
    currentTheme.value = theme;
  }

  const isDark = computed(() => {
    return currentTheme.value === THEMES.DARK;
    
  });
  const isLight = computed(() => {
      return currentTheme.value === THEMES.LIGHT;
  });

  watch(currentTheme, (newTheme: Theme) => {
    applyThemeToDocument(newTheme);
  }, { immediate: true });

  watch(currentTheme, (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme);
  });

  return { 
    currentTheme, 
    toggleTheme, 
    setTheme, 
    isDark, 
    isLight,
    THEMES 
  };
});