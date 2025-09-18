<template>
  <div class="px-4 py-3 border-b border-gray-300 dark:border-gray-700 flex items-center gap-2">
    <div class="ml-auto flex items-center gap-2 order-2 sm:order-1">
      <button class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" @click="prevMonth">‹</button>
      <button class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" @click="goToday">Today</button>
      <button class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" @click="nextMonth">›</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCalendarStore } from '@/stores/calendar'

const cal = useCalendarStore()
const { nextMonth, prevMonth, goToday } = cal
</script>
