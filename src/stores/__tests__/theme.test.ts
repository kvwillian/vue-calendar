import { setActivePinia, createPinia } from 'pinia';
import { useThemeStore } from '../theme';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import { nextTick } from 'vue';

const STORAGE_KEY = 'calendar-theme';

describe('useThemeStore', () => {
  let store: ReturnType<typeof useThemeStore>;

  beforeEach(() => {
    // fresh Pinia for each test
    setActivePinia(createPinia());

    // mock localStorage
    const localStorageMock = (() => {
      let backing: Record<string, string> = {};
      return {
        getItem: vi.fn((key: string) => (key in backing ? backing[key] : null)),
        setItem: vi.fn((key: string, val: string) => { backing[key] = String(val); }),
        removeItem: vi.fn((key: string) => { delete backing[key]; }),
        clear: vi.fn(() => { backing = {}; }),
      };
    })();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      configurable: true,
    });

    // mock matchMedia: DEFAULT = NOT DARK
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false, // keep default "light" for most tests
        media: query,
        onchange: null,
        addListener: vi.fn(),          // legacy
        removeListener: vi.fn(),       // legacy
        addEventListener: vi.fn(),     // modern
        removeEventListener: vi.fn(),  // modern
        dispatchEvent: vi.fn(),
      })),
    });

    // reset document classList
    document.documentElement.className = '';

    // create the store AFTER mocks are set
    store = useThemeStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('defaults to light theme if no localStorage and system not dark', () => {
    expect(store.currentTheme).toBe(store.THEMES.LIGHT);
    expect(store.isLight).toBe(true);
    expect(store.isDark).toBe(false);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('loads dark theme from localStorage', () => {
    // For this test, simulate stored preference BEFORE store creation
    window.localStorage.getItem = vi.fn().mockReturnValue('dark');

    // Recreate Pinia & store to take the altered boot path
    setActivePinia(createPinia());
    const s = useThemeStore();

    expect(s.currentTheme).toBe(s.THEMES.DARK);
    expect(s.isDark).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('falls back to system dark preference when no localStorage', () => {
    // For this test only, pretend system prefers dark
    (window.matchMedia as unknown as Mock).mockImplementationOnce((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)', // true for the dark query
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    // Recreate Pinia & store to apply the changed matchMedia
    setActivePinia(createPinia());
    const s = useThemeStore();

    expect(s.currentTheme).toBe(s.THEMES.DARK);
  });

  it('toggleTheme switches between light and dark', () => {
    // starts light (because default matchMedia=false and no localStorage)
    expect(store.currentTheme).toBe(store.THEMES.LIGHT);

    store.toggleTheme();
    expect(store.currentTheme).toBe(store.THEMES.DARK);
    expect(store.isDark).toBe(true);

    store.toggleTheme();
    expect(store.currentTheme).toBe(store.THEMES.LIGHT);
    expect(store.isLight).toBe(true);
  });

  it('setTheme updates theme explicitly', () => {
    store.setTheme(store.THEMES.DARK);
    expect(store.currentTheme).toBe(store.THEMES.DARK);

    store.setTheme(store.THEMES.LIGHT);
    expect(store.currentTheme).toBe(store.THEMES.LIGHT);
  });

  it('writes current theme to localStorage', async () => {
    store.setTheme(store.THEMES.DARK);
  
    await nextTick(); 
  
    expect(window.localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'dark');
  });
  
  it('updates document classList on theme change', async () => {
    store.setTheme(store.THEMES.DARK);
  
    await nextTick(); 
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  
    store.setTheme(store.THEMES.LIGHT);
      
    await nextTick(); 
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  })
});
