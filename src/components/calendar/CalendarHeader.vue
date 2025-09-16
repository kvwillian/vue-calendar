<template>
  <div class="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
    <div class="ml-auto flex items-center gap-2 order-2 sm:order-1">
      <button class="px-3 py-1.5 rounded border hover:bg-gray-50" @click="prevMonth">‹</button>
      <button class="px-3 py-1.5 rounded border hover:bg-gray-50" @click="goToday">Today</button>
      <button class="px-3 py-1.5 rounded border hover:bg-gray-50" @click="nextMonth">›</button>
    </div>
    <h2 class="text-lg font-semibold order-1 sm:order-2">{{ title }}</h2>
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
