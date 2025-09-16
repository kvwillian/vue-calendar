<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-semibold">Calendário</h1>

    <div class="flex flex-wrap items-center gap-2">
      <select v-model="view" class="px-3 py-1.5 rounded border bg-white">
        <option value="month">Mês</option>
        <option value="week" disabled>Semana (em breve)</option>
        <option value="day" disabled>Dia (em breve)</option>
      </select>

      <div class="ml-auto flex items-center gap-2">
        <button class="px-3 py-1.5 rounded border hover:bg-gray-50" @click="prev">‹</button>
        <button class="px-3 py-1.5 rounded border hover:bg-gray-50" @click="today">Hoje</button>
        <button class="px-3 py-1.5 rounded border hover:bg-gray-50" @click="next">›</button>
      </div>
    </div>

    <Calendar @prev="prev" @next="next" @today="today" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Calendar from '@/components/calendar/Calendar.vue'

const view = ref<'month'|'week'|'day'>('month')
function prev(){ }
function next(){ }
function today(){ }
</script>
