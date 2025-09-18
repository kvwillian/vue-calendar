<template>
  <div :class="['bg-gray-100 dark:bg-gray-800 p-1 min-h-[110px] relative cursor-pointer select-none',
    { 'opacity-60': !inMonth }, hoverable && 'hover:bg-gray-200 dark:hover:bg-gray-700']" @click="$emit('new', iso)" role="button"
    tabindex="0" @keydown.enter="$emit('new', iso)">
    <button class="absolute top-1 right-1 text-xs px-1 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300" aria-label="Add reminder"
      @click.stop="$emit('new', iso)">＋</button>

    <div class="text-xs font-medium mb-1 text-gray-800 dark:text-gray-100">{{ dayNumber }}</div>

    <ul v-if="reminders.length">
      <li v-for="r in visible" :key="r.id" class="mb-1">
        <button class="w-full text-left truncate px-1 py-0.5 rounded flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-600"
          :style="{ borderLeft: `4px solid ${r.color}` }" @click.stop="$emit('open-reminder', r)">
          <span class="text-[11px] tabular-nums text-gray-600 dark:text-gray-300">{{ r.time }}</span>
          <span class="truncate text-[11px] text-gray-600 dark:text-gray-300">{{ r.text }}</span>
          <span v-if="r.weather" class="text-[10px] italic ml-auto flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <img v-if="r.weather.icon" :src="iconUrl(r.weather.icon)" alt="" class="w-4 h-4" />
            {{ r.weather.summary }}
          </span>
        </button>
      </li>
    </ul>

    <button v-if="overflow" class="text-[11px] underline text-gray-600 dark:text-gray-400" @click.stop="$emit('open-day', iso)">
      +{{ overflow }} more
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useReminders } from '@/stores/reminders'
import { useWeather } from '@/composables/useWeather'
const { iconUrl } = useWeather()

const props = defineProps<{ iso: string; inMonth: boolean }>()
defineEmits<{
  (e: 'new', iso: string): void
  (e: 'open-reminder', r: any): void
  (e: 'open-day', iso: string): void
}>()

const store = useReminders()
const reminders = computed(() => store.byDay(props.iso).value)

const maxVisible = 3
const visible = computed(() => reminders.value.slice(0, maxVisible))
const overflow = computed(() => Math.max(0, reminders.value.length - maxVisible))
const dayNumber = computed(() => Number(props.iso.slice(-2)))

const hoverable = computed(() => props.inMonth)
</script>
