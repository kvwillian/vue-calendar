<template>
  <div class="h-14 flex items-center gap-3 px-3 lg:px-5">
    <button class="lg:hidden p-2 rounded hover:bg-gray-100" aria-label="Abrir menu" @click="$emit('toggle-sidebar')">
      <svg viewBox="0 0 24 24" class="w-6 h-6"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </button>

    <RouterLink to="/" class="flex items-center gap-2 font-semibold">
      <span class="inline-grid place-content-center w-8 h-8 rounded bg-blue-600 text-white">C</span>
      <span class="hidden sm:block">Calendar Dashboard</span>
    </RouterLink>

    <div class="ml-auto flex items-center gap-2">
      <RouterLink to="/calendar" class="px-3 py-1.5 rounded hover:bg-gray-100 text-sm">Calendar</RouterLink>
      <RouterLink to="/settings" class="px-3 py-1.5 rounded hover:bg-gray-100 text-sm">Settings</RouterLink>
      <button class="ml-2 w-8 h-8 rounded-full bg-gray-200" aria-label="Conta"></button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{(e:'toggle-sidebar'):void}>()
</script>
