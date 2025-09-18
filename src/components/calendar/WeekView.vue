<template>
    <div class="space-y-4">
      <!-- Navigation Header -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">
          {{ formatWeekRange(startOfWeek) }}
        </h2>
  
        <div class="flex items-center gap-2">
          <button
            @click="emit('prev')"
            class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            ‹
          </button>
          <button
            @click="emit('today')"
            class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            Today
          </button>
          <button
            @click="emit('next')"
            class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            ›
          </button>
        </div>
      </div>
  
      <!-- Week View Container -->
      <div
        class="flex flex-col rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-700"
      >
        <!-- Header row: timezone + weekdays -->
        <div class="grid" :style="gridCols">
          <!-- Timezone label column -->
          <div
            class="px-3 py-2 flex items-center justify-start text-xs font-medium uppercase text-gray-500 dark:text-gray-400"
          >
            {{ timezone }}
          </div>
  
          <!-- Weekday headers -->
          <div class="grid grid-cols-7">
            <div v-for="(d, i) in days" :key="i" class="py-3 text-center">
              <div class="text-[10px] tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
                {{ d.weekday.toUpperCase() }}
              </div>
  
              <div
                v-if="isToday(d.date)"
                class="mt-1 mx-auto w-9 h-9 rounded-full bg-blue-600 text-white grid place-items-center shadow-sm"
              >
                <span class="text-base font-semibold leading-none">{{ d.dayOfMonth }}</span>
              </div>
              <div v-else class="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {{ d.dayOfMonth }}
              </div>
            </div>
          </div>
        </div>
  
        <div
          class="relative overflow-y-auto no-scrollbar"
          :style="{ maxHeight: viewportHeight + 'px' }"
        >
          <!-- 2-column grid: time ruler (80px) + days (1fr) -->
          <div class="grid" :style="gridCols, { minHeight: totalGridHeight + 'px' }">
            <div
              class="grid"
              :style="{ gridTemplateRows: `repeat(${rows}, ${hourHeight}px)` }"
            >
              <div
                v-for="h in hours"
                :key="h"
                class="relative border-t border-gray-100 dark:border-gray-600 first:border-t-0"
              >
                <div
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ formatHourLabel(h) }}
                </div>
              </div>
            </div>
  
            <!-- Day columns -->
            <div class="grid grid-cols-7">
              <div
                v-for="(d, dayIndex) in days"
                :key="dayIndex"
                class="relative border-l first:border-l-0 border-gray-300 dark:border-gray-600"
                :class="isToday(d.date) ? 'bg-gray-200 dark:bg-blue-900/20' : ''"
                @click="onGridClick($event, d.date)"
              >
                <!-- Hour grid lines -->
                <div
                  class="grid absolute inset-0 pointer-events-none"
                  :style="{ gridTemplateRows: `repeat(${rows}, ${hourHeight}px)` }"
                >
                  <div
                    v-for="(_, i) in rows"
                    :key="i"
                    class="border-t border-gray-300 dark:border-gray-600 first:border-t-0"
                  />
                </div>
  
                <!-- Full-day invisible area to define height -->
                <div
                  class="relative"
                  :style="{ height: totalGridHeight + 'px' }"
                  aria-hidden="true"
                ></div>
  
                <!-- Events for the day -->
                <div
                  v-for="ev in eventsByDay[dayIndex]"
                  :key="ev.id"
                  class="absolute left-[4px] right-[4px] rounded-lg shadow-md px-2 py-1 cursor-pointer"
                  :style="{
                    top: ev._pos.top + 'px',
                    height: ev._pos.height + 'px',
                    backgroundColor: ev.color || '#2563eb',
                    color: '#fff'
                  }"
                  :aria-label="`${ev.title}, ${d.weekday}, ${formatTimeRange(ev.startISO, ev.endISO)}`"
                  role="button"
                  tabindex="0"
                  @click.stop="onOpenEvent(ev)"
                >
                  <div class="text-sm font-semibold truncate dark:text-gray-800">
                    {{ ev.title }}
                  </div>
                  <div class="text-xs opacity-90 dark:text-gray-800">
                    {{ formatTimeRange(ev.startISO, ev.endISO) }}
                  </div>
                </div>
  
                <!-- Preview block (dashed) -->
                <div
                  v-if="props.preview && isSameDate(d.date, props.preview.date)"
                  ref="previewEl"
                  class="absolute left-[4px] right-[4px] rounded-lg border border-dashed border-blue-500 bg-blue-500/20 text-xs text-blue-200 p-1"
                  :style="previewStyle(props.preview, d.date)"
                >
                  (No title)
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- /Body -->
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  
  import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
  import { useReminders } from '@/stores/reminders'
  import type { Reminder } from '@/types/Reminder'
  
  /* Configuration */
  const hourHeight = 64
  const visibleStartHour = 1
  const visibleEndHour = 23
  const timezone = 'GMT-03'
  const viewportHeight = 720         
  const defaultDurationMinutes = 60  
  
  /* Props & Emits */
  const props = defineProps<{
    currentDate: Date
    preview: { date: Date; hour: number; minute: number } | null
  }>()
  
  const emit = defineEmits<{
    (e: 'prev'): void
    (e: 'next'): void
    (e: 'today'): void
    (e: 'create-reminder', payload: { date: Date; hour: number; minute: number; x: number; y: number; rect?: DOMRect }): void
    (e: 'open-reminder', payload: { id?: string; date: Date; hour?: number; minute?: number }): void
    (e: 'preview-rect', rect: DOMRect): void
  }>()
  
  /* Refs & Lifecycle */
  const scroller = ref<HTMLElement | null>(null)
  const previewEl = ref<HTMLElement | null>(null)
  
  function emitPreviewRect() {
    if (previewEl.value) emit('preview-rect', previewEl.value.getBoundingClientRect())
  }
  
  onMounted(() => {
    window.addEventListener('resize', emitPreviewRect)
    scroller.value?.addEventListener('scroll', emitPreviewRect, { passive: true })
  })
  
  onUnmounted(() => {
    window.removeEventListener('resize', emitPreviewRect)
    scroller.value?.removeEventListener('scroll', emitPreviewRect)
  })
  
  watch(previewEl, async (el) => {
    await nextTick()
    if (el instanceof HTMLElement) {
      emit('preview-rect', el.getBoundingClientRect())
    }
  })
  
  /* Dates: week boundaries */
  const startOfWeek = computed(() => {
    const date = new Date(props.currentDate)
    const day = date.getDay()
    const diff = date.getDate() - day
    const sunday = new Date(date)
    sunday.setDate(diff)
    sunday.setHours(0, 0, 0, 0)
    return sunday
  })
  
  const endOfWeek = computed(() => {
    const d = new Date(startOfWeek.value)
    d.setDate(d.getDate() + 6)
    d.setHours(23, 59, 59, 999)
    return d
  })
  
  /* Store */
  const remStore = useReminders()
  
  /* Derived layout values */
  const gridCols = { gridTemplateColumns: '80px 1fr' }
  const rows = visibleEndHour - visibleStartHour + 1
  const hours = Array.from({ length: rows }, (_, i) => visibleStartHour + i)
  const totalGridHeight = rows * hourHeight
  
  /* Utilities */
  function addDays(d: Date, n: number) { const z = new Date(d); z.setDate(z.getDate() + n); return z }
  function pad(n: number) { return n.toString().padStart(2, '0') }
  const weekdayNames = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.']
  
  /* Calendar: days of current week */
  const days = computed(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startOfWeek.value, i)
      return {
        date,
        weekday: weekdayNames[date.getDay()],
        dayOfMonth: date.getDate()
      }
    })
  })
  
  /* Today helpers */
  function isSameDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate()
  }
  
  function isToday(d: Date) {
    const now = new Date()
    return isSameDate(d, now)
  }
  
  /* Positioning helpers (time → pixel mapping) */
  function minutesSinceVisibleStart(d: Date) {
    const mins = d.getHours() * 60 + d.getMinutes()
    return mins - visibleStartHour * 60
  }
  
  function toPos(start: Date, end: Date) {
    const minutesFromStart = minutesSinceVisibleStart(start)
    const durationMinutes = Math.max(0, (end.getTime() - start.getTime()) / 60000)
    const pxPerMinute = hourHeight / 60
    return {
      top: minutesFromStart * pxPerMinute,
      height: Math.max(20, durationMinutes * pxPerMinute)
    }
  }
  
  /* Reminders → Week events (projected positions) */
  function parseLocalDateTime(dateISO: string, time: string) {
    const [y, m, d] = dateISO.split('-').map(Number)
    const [hh, mm] = time.split(':').map(Number)
    return new Date(y, (m - 1), d, hh, mm ?? 0, 0, 0)
  }
  
  function previewStyle(preview: { date: Date; hour: number; minute: number }, dayDate: Date) {
    if (!isSameDate(preview.date, dayDate)) return {}
  
    const start = new Date(preview.date)
    const end = new Date(start.getTime() + defaultDurationMinutes * 60000)
    const pos = toPos(start, end)
  
    return { top: pos.top + 'px', height: pos.height + 'px' }
  }
  
  type WeekEvent = {
    id: string
    title: string
    color: string
    startISO: string
    endISO: string
    _pos: { top: number; height: number }
  }
  
  const eventsByDay = computed<Record<number, WeekEvent[]>>(() => {
    const result: Record<number, WeekEvent[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
  
    for (const r of remStore.items as Reminder[]) {
      const start = parseLocalDateTime(r.dateISO, r.time)
      if (start < startOfWeek.value || start > endOfWeek.value) continue
  
      const end = new Date(start.getTime() + defaultDurationMinutes * 60000)
  
      const dayIndex = Math.floor(
        (+new Date(start.getFullYear(), start.getMonth(), start.getDate()) -
         +new Date(startOfWeek.value.getFullYear(), startOfWeek.value.getMonth(), startOfWeek.value.getDate())) / 86400000
      )
      if (dayIndex < 0 || dayIndex > 6) continue
  
      const pos = toPos(start, end)
  
      result[dayIndex].push({
        id: r.id,
        title: r.text || '(No title)',
        color: r.color || '#2563eb',
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        _pos: pos
      })
    }
  
    for (const k of Object.keys(result)) {
      result[+k].sort((a, b) => a._pos.top - b._pos.top)
    }
    return result
  })
  
  /* Formatters */
  function formatHourLabel(h: number) {
    const suffix = h < 12 ? 'AM' : 'PM'
    const hour12 = ((h + 11) % 12) + 1
    return `${hour12} ${suffix}`
  }
  
  function formatTimeRange(startISO: string, endISO: string) {
    const s = new Date(startISO)
    const e = new Date(endISO)
    const fmt = (d: Date) => {
      let h = d.getHours()
      const m = d.getMinutes()
      const suf = h < 12 ? 'am' : 'pm'
      h = ((h + 11) % 12) + 1
      return `${h}:${pad(m)}${suf}`
    }
    return `${fmt(s)} – ${fmt(e)}`
  }
  
  function formatWeekRange(startDate: Date) {
    const endDate = addDays(startDate, 6)
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' })
    const startDay = startDate.getDate()
    const endDay = endDate.getDate()
    const year = startDate.getFullYear()
  
    return startMonth === endMonth
      ? `${startMonth} ${startDay}–${endDay}, ${year}`
      : `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`
  }
  
  /* Click handlers */
  function onGridClick(e: MouseEvent, dayDate: Date) {
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    const y = e.clientY - rect.top
  
    const hourIndex = Math.floor(y / hourHeight)
    const hour = visibleStartHour + hourIndex
  
    const offsetY = y - hourIndex * hourHeight
    const minute = offsetY < hourHeight / 2 ? 0 : 30
  
    console.log('hourIndex', hourIndex, 'hour', hour, 'minute', minute)
    onCreateAt(dayDate, hour, minute, e)
  }
  
  function onCreateAt(dayDate: Date, hour: number, minute = 0, e?: MouseEvent) {
    const d = new Date(dayDate)
    d.setHours(hour, minute, 0, 0)
  
    const rect = (e?.currentTarget as HTMLElement)?.getBoundingClientRect()
  
    emit('create-reminder', {
      date: d,
      hour,
      minute,
      x: e?.clientX ?? 0,
      y: e?.clientY ?? 0,
      rect
    })
  }
  
  function onOpenEvent(ev: WeekEvent) {
    const s = new Date(ev.startISO)
    emit('open-reminder', { id: ev.id, date: s, hour: s.getHours(), minute: s.getMinutes() })
  }
  </script>
  
  <style scoped>
  /* Hide native scrollbars */
  .no-scrollbar {
    -ms-overflow-style: none; /* IE/Edge */
    scrollbar-width: none;    /* Firefox */
    -webkit-overflow-scrolling: touch; /* iOS smoother scroll */
  }
  
  .no-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome/Safari/Opera */
  }
  </style>
  