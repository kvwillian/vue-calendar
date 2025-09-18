<template>
  <div class="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700 p-4">
    <div class="text-sm text-gray-500 dark:text-gray-400">{{ label }}</div>
    <div class="mt-1 text-2xl font-semibold text-gray-800 dark:text-gray-100">{{ value }}</div>
    <div v-if="hint" class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string | number; hint?: string }>()
</script>
