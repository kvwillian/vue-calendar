<template>
  <div class="fixed inset-0 z-[100] bg-black/40" @click="onBackdropClick"></div>

  <div
    class="fixed inset-0 z-[101] grid place-items-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="reminder-title"
  >
    <form
      ref="panel"
      class="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3 shadow-xl"
      @submit.prevent="submit"
    >
      <button
        type="button"
        class="absolute right-3 top-3 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        aria-label="Close"
        @click="$emit('close')"
      >
        <svg viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>

      <h3 id="reminder-title" class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {{ isEdit ? 'Edit reminder' : 'New reminder' }}
      </h3>

      <label class="block text-sm text-gray-700 dark:text-gray-300">
        <span class="block mb-1">Date</span>
        <input type="date" v-model="form.dateISO" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
      </label>

      <label class="block text-sm text-gray-700 dark:text-gray-300">
        <span class="block mb-1">Time</span>
        <input type="time" v-model="form.time" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100" required>
      </label>

      <label class="block text-sm text-gray-700 dark:text-gray-300">
        <span class="block mb-1">Text (max 30)</span>
        <input v-model.trim="form.text" maxlength="30" class="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
      </label>

      <CitySelect v-model="form.loc" />

      <div class="block text-sm text-gray-700 dark:text-gray-300">
        <span class="block mb-1">Color</span>
        <div class="inline-block">
          <input type="color" v-model="form.color" class="h-9 w-14 block rounded border border-gray-300 dark:border-gray-600 p-0 cursor-pointer">
        </div>
      </div>

      <div class="text-xs text-gray-600 dark:text-gray-400 min-h-4">
        <template v-if="form.loc && form.dateISO">
          <span v-if="form.weather">Forecast: {{ form.weather.summary }}</span>
          <span v-else>Fetching forecast…</span>
        </template>
        <template v-else>
          <span class="text-gray-200 dark:text-gray-500">Pick a city and date to preview weather</span>
        </template>
      </div>

      <div class="pt-2 flex gap-2">
        <button type="submit" class="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white">
          {{ isEdit ? 'Save' : 'Add' }}
        </button>
        <button type="button" class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" @click="$emit('close')">Cancel</button>
        <button
          v-if="isEdit"
          type="button"
          class="ml-auto px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
          @click="del"
        >Delete</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, watch, computed } from 'vue'
import type { Reminder } from '@/types/Reminder'
import type { Location } from '@/types/Location'
import { useReminders } from '@/stores/reminders'
import { useWeather } from '@/composables/useWeather'
import CitySelect from '@/components/CitySelect.vue'

const props = defineProps<{ initial: Reminder | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

const store = useReminders()
const weather = useWeather()

const defaults: Reminder = {
  id: crypto.randomUUID(),
  dateISO: '',
  time: '09:00',
  text: '',
  city: '',
  color: '#3b82f6',
  loc: null,
  weather: null
}

const form = reactive<Reminder>({
  ...defaults,
  ...(props.initial ?? {}),
  loc: (props.initial?.loc ?? null) as Location | null
})

const isEdit = computed(
  () => !!props.initial && !!store.items.find(r => r.id === props.initial!.id)
)

watch([() => form.loc, () => form.dateISO], async ([loc, date]: [Location | null, string]) => {
  if (loc && date && typeof loc === 'object') {
    form.city = [loc.name, loc.state, loc.country].filter(Boolean).join(', ')
    form.weather = await weather.getForecastByCoords(loc.lat, loc.lon, date)
  } else {
    form.weather = null
  }
})

const panel = ref<HTMLFormElement | null>(null)
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') emit('close') }
function lockScroll(lock: boolean) { document.documentElement.style.overflow = lock ? 'hidden' : '' }

onMounted(() => {
  window.addEventListener('keydown', onKey)
  lockScroll(true)
  queueMicrotask(() => panel.value?.querySelector('input')?.focus())
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  lockScroll(false)
})

function onBackdropClick() { emit('close') }

function submit() {
  if (!form.text || form.text.length > 30) return
  if (form.loc && !form.city) {
    form.city = [form.loc.name, form.loc.state, form.loc.country].filter(Boolean).join(', ')
  }
  store.upsert({ ...form })
  emit('saved'); emit('close')
}

function del() {
  store.remove(form.id)
  emit('close')
}
</script>
