<template>
  <div class="px-4 py-3 border-b border-gray-300 dark:border-gray-700 flex items-center gap-2">
    <div class="ml-auto flex items-center gap-2 order-2 sm:order-1">
      <button class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" @click="prevMonth">‹</button>
      <button class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" @click="goToday">Today</button>
      <button class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" @click="nextMonth">›</button>
    </div>
    <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 order-1 sm:order-2">{{ title }}</h2>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { format } from 'date-fns'

const cal = useCalendarStore()
const title = computed(() => format(new Date(cal.year, cal.month, 1), 'MMMM yyyy'))
const { nextMonth, prevMonth, goToday } = cal
</script>
