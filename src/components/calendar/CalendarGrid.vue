<template>
  <div class="p-2 sm:p-4">
    <div class="grid grid-cols-7 text-xs text-gray-500 dark:text-gray-400 px-1 pb-2">
      <div v-for="w in weekdays" :key="w" class="px-1">{{ w }}</div>
    </div>
    <div class="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
      <DayCell
        v-for="d in days"
        :key="d.iso"
        :iso="d.iso"
        :in-month="d.inMonth"
        @new="$emit('new', d.iso)"
        @open-reminder="(r)=>$emit('open-reminder', r)"
        @open-day="$emit('open-day', d.iso)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCalendarStore } from '@/stores/calendar'
import { useCalendarGrid } from '@/composables/useCalendar'
import DayCell from './DayCell.vue'

defineEmits<{
  (e:'new', iso:string):void
  (e:'open-day', iso:string):void
  (e:'open-reminder', rem: any):void
}>()

const cal = useCalendarStore()
const days = computed(() => useCalendarGrid(cal.year, cal.month).days)
const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
</script>
