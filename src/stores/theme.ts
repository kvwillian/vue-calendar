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
      console.error('Failed to load theme from storage', e);
    }
    
    // Fallback para o tema do sistema, se disponível, ou light
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
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

  const isDark = computed(() => currentTheme.value === THEMES.DARK);
  const isLight = computed(() => currentTheme.value === THEMES.LIGHT);

  watch(currentTheme, (newTheme) => {
    applyThemeToDocument(newTheme);
  }, { immediate: true });

  watch(currentTheme, (newTheme) => {
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