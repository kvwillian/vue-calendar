<template>
  <div class="space-y-4">
    <h1 class="text-2xl font-semibold">{{ currentMonthYear }}</h1>
 
    <div class="flex flex-wrap items-center gap-2">
      <select v-model="view"
        class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700">
        <option value="month">Month</option>
        <option value="week">Week</option>
      </select>
    </div>

    <Calendar v-if="view === 'month'" @open-day="openDayInWeekView" />

    <WeekView v-else-if="view === 'week'" :current-date="currentWeekDate" @prev="prev" @next="next" @today="today"
      @create-reminder="createReminder" @open-reminder="openExistingReminder" :preview="previewReminder"
      @preview-rect="onPreviewRect" />

    <!-- Reminder Modal -->
    <ReminderModal v-if="showReminderModal" :initial="draftReminder" @close="closeReminderModal"
      @saved="onReminderSaved" :position="modalPosition" :preview-rect="previewRect" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Calendar from '@/components/calendar/Calendar.vue'
import WeekView from '@/components/calendar/WeekView.vue'
import ReminderModal from '@/components/calendar/ReminderModal.vue'
import type { Reminder } from '@/types/Reminder'
import { useCalendarStore } from '@/stores/calendar'
import { useReminders } from '@/stores/reminders'

const view = ref<'month' | 'week' | 'day'>('month')
const calendarStore = useCalendarStore()
const remindersStore = useReminders()
const modalPosition = ref<{ x: number; y: number; rect?: DOMRect } | null>(null)

const currentMonthYear = computed(() => {
  let date;

  if (view.value === 'week') {
    date = currentWeekDate.value;
  } else {
    date = new Date(calendarStore.year, calendarStore.month, 1);
  }
  
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(date);
});
const previewReminder = ref<null | { date: Date; hour: number; minute: number }>(null)

// Week navigation state
const currentWeekDate = ref(new Date())

// Route handling
const route = useRoute()

onMounted(() => {
  if (route.query.view === 'week' && route.query.date) {
    const date = new Date(route.query.date as string)
    if (!isNaN(date.getTime())) {
      const day = date.getDay() // 0 = Sunday
      const diff = date.getDate() - day
      const startOfWeek = new Date(date)
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)
      
      currentWeekDate.value = startOfWeek
      view.value = 'week'
    }
  }
})

function prev() {
  if (view.value === 'month') {
    calendarStore.prevMonth()
  } else if (view.value === 'week') {
    const newDate = new Date(currentWeekDate.value)
    newDate.setDate(newDate.getDate() - 7)
    currentWeekDate.value = newDate
  }
}

function next() {
  if (view.value === 'month') {
    calendarStore.nextMonth()
  } else if (view.value === 'week') {
    const newDate = new Date(currentWeekDate.value)
    newDate.setDate(newDate.getDate() + 7)
    currentWeekDate.value = newDate
  }
}

function today() {
  if (view.value === 'month') {
    calendarStore.goToday()
  } else if (view.value === 'week') {
    currentWeekDate.value = new Date()
  }
}

function closeReminderModal() {
  showReminderModal.value = false
  previewReminder.value = null
}

const previewRect = ref<DOMRect | null>(null)
function onPreviewRect(rect: DOMRect) {
  previewRect.value = rect;
  showReminderModal.value = true;
}

const showReminderModal = ref(false)
const draftReminder = ref<Reminder | null>(null)

function toDateISO(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
function toHour(h: number) {
  return String(h).padStart(2, '0')
}

function createReminder(payload: { date: Date; hour: number; minute: number; x: number; y: number; rect?: DOMRect }) {
  const dt = payload.date;

  previewReminder.value = { date: dt, hour: payload.hour, minute: payload.minute };

  draftReminder.value = {
    id: crypto.randomUUID(),
    dateISO: toDateISO(dt),
    time: `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`,
    text: '',
    city: '',
    color: '#3b82f6',
    loc: null,
    weather: null
  };

  modalPosition.value = { x: payload.x, y: payload.y, rect: payload.rect };
  showReminderModal.value = true; 
}

function openExistingReminder(payload: { id?: string; date: Date; hour?: number; minute?: number }) {
  if (payload.id) {
    const existingReminder = remindersStore.items.find(r => r.id === payload.id)
    if (existingReminder) {
      draftReminder.value = { ...existingReminder }
      showReminderModal.value = true
      return
    }
  }

  const dt = new Date(payload.date)
  const h = typeof payload.hour === 'number' ? payload.hour : dt.getHours()
  const m = typeof payload.minute === 'number' ? payload.minute : dt.getMinutes()
  dt.setHours(h, m, 0, 0)

  draftReminder.value = {
    id: payload.id ?? crypto.randomUUID(),
    dateISO: toDateISO(dt),
    time: `${toHour(dt.getHours())}:${String(dt.getMinutes()).padStart(2, '0')}`,
    text: '',
    city: '',
    color: '#3b82f6',
    loc: null,
    weather: null
  }

  showReminderModal.value = true
}


function onReminderSaved() {
  // optional: display toast, reload something, etc.
}

function openDayInWeekView(iso: string) {
  const date = new Date(iso)
  
  const day = date.getDay() // 0 = Sunday
  const diff = date.getDate() - day
  const startOfWeek = new Date(date)
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)
  
  currentWeekDate.value = startOfWeek
  view.value = 'week'
}
</script> 
