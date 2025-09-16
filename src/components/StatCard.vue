<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4">
    <div class="text-sm text-gray-500">{{ label }}</div>
    <div class="mt-1 text-2xl font-semibold">{{ value }}</div>
    <div v-if="hint" class="mt-2 text-xs text-gray-500">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string | number; hint?: string }>()
</script>
