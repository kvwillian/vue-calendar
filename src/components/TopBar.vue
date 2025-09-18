<template>
  <div class="h-14 flex items-center gap-3 px-3 lg:px-5">
    <button class="lg:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Open menu" @click="$emit('toggle-sidebar')">
      <svg viewBox="0 0 24 24" class="w-6 h-6"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>

    <RouterLink to="/" class="flex items-center gap-2 font-semibold">
      <span class="hidden sm:block">Calendar Dashboard</span>
    </RouterLink>

    <div class="ml-auto flex items-center gap-2">
      <RouterLink to="/calendar" class="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">Calendar</RouterLink>
      <RouterLink to="/settings" class="px-3 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">Settings</RouterLink>
      
      <!-- Theme Toggle Button -->
      <div class="flex items-center gap-2">
        <button 
          @click="handleThemeToggle"
          class="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          :aria-label="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
        <!-- Sun icon for light mode -->
        <svg 
          v-if="themeStore.isDark" 
          viewBox="0 0 24 24" 
          class="w-5 h-5 text-yellow-500"
          fill="currentColor"
        >
          <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
        </svg>
        
        <!-- Moon icon for dark mode -->
        <svg 
          v-else 
          viewBox="0 0 24 24" 
          class="w-5 h-5 text-gray-600 dark:text-gray-300"
          fill="currentColor"
        >
          <path d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
        </svg>
        </button>
      </div>
      
      <button class="ml-2 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600" aria-label="Account"></button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

defineEmits<{(e:'toggle-sidebar'):void}>()

const themeStore = useThemeStore()

function handleThemeToggle() {
  themeStore.toggleTheme();
}
</script>
