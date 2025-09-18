<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">Home</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Reminders today"
        :value="counts.today"
        :hint="counts.today === 1 ? '1 item' : counts.today + ' items'"
      />
      <StatCard
        label="This week"
        :value="counts.thisWeek"
        :hint="weekRangeLabel"
      />
      <StatCard
        label="Saved cities"
        :value="counts.cities"
        :hint="counts.cities ? cityListHint : '—'"
      />
      <StatCard
        label="Total reminders"
        :value="counts.total"
        :hint="counts.total ? 'Stored locally' : 'No data yet'"
      />
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <section class="xl:col-span-2">
        <div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <h2 class="font-medium text-gray-800 dark:text-gray-100">Next reminders</h2>
            <RouterLink to="/calendar" class="text-blue-700 dark:text-blue-400 hover:underline text-sm">open calendar</RouterLink>
          </div>

          <ul v-if="upcoming.length" class="mt-3 divide-y divide-gray-200 dark:divide-gray-700">
            <li v-for="r in upcoming" :key="r.id" class="py-2 flex items-center gap-3">
              <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: r.color }"></span>
              <div class="min-w-32 text-sm tabular-nums text-gray-600 dark:text-gray-300">
                {{ formatDate(r.dateISO) }} · {{ r.time }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm truncate font-medium text-gray-800 dark:text-gray-100">{{ r.text }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ r.city }} <span v-if="r.weather">• {{ r.weather.summary }}</span>
                </div>
              </div>
              <button
                @click="handleViewReminder(r.dateISO)"
                class="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 shrink-0"
                title="Open in calendar"
              >view</button>
            </li>
          </ul>

          <div v-else class="mt-4 text-sm text-gray-600 dark:text-gray-400">
            No upcoming reminders. <RouterLink to="/calendar" class="text-blue-700 dark:text-blue-400 underline">Create one</RouterLink>.
          </div>
        </div>
      </section>

      <section>
        <div class="bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <h2 class="font-medium text-gray-800 dark:text-gray-100">Weather by city</h2>
            <button
              class="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              @click="refreshForecasts"
              :disabled="loading"
            >
              {{ loading ? 'Refreshing…' : 'Refresh' }}
            </button>
          </div>

          <div v-if="cityCards.length" class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="c in cityCards"
              :key="c.key"
              class="border border-gray-300 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3 bg-gray-100 dark:bg-gray-700"
            >
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate text-gray-800 dark:text-gray-100">
                  {{ c.label }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  Next on {{ format(parseISO(c.nextDateISO), 'EEE, MMM d') }}
                </div>
                <div class="mt-1 text-sm flex items-center gap-2">
                  <img v-if="c.iconUrl" :src="c.iconUrl" alt="" class="w-6 h-6" />
                  <span class="truncate text-gray-600 dark:text-gray-300">{{ c.summary || '—' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="mt-3 text-sm text-gray-600 dark:text-gray-400">
            No cities yet. Create a reminder and pick a city.
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { useReminders } from '@/stores/reminders'
import StatCard from '@/components/StatCard.vue'
import {
  addDays, endOfWeek, isAfter, isBefore, isEqual,
  parseISO, startOfDay, startOfWeek, format, compareAsc
} from 'date-fns'
import { useWeather } from '@/composables/useWeather'
import type { Location } from '@/types/Location'
import type { Reminder } from '@/types/Reminder'

const router = useRouter()
const store = useReminders()
const weather = useWeather()

function toDateTimeISO(dISO: string, time: string) {
  const [h, m] = time.split(':').map(Number)
  const d = parseISO(dISO)
  d.setHours(h ?? 0, m ?? 0, 0, 0)
  return d
}
function formatDate(dISO: string) {
  return format(parseISO(dISO), 'EEE, MMM d')
}

function handleViewReminder(dateISO: string) {
  router.push({
    name: 'calendar',
    query: { view: 'week', date: dateISO }
  })
}

const now = new Date()
const todayStart = startOfDay(now)
const weekStart = startOfWeek(todayStart, { weekStartsOn: 0 })
const weekEnd   = endOfWeek(todayStart,   { weekStartsOn: 0 })
const weekRangeLabel = `${format(weekStart, 'MMM d')}–${format(weekEnd, 'MMM d')}`

const sortedAll = computed(() =>
  [...store.items].sort((a: Reminder, b: Reminder) => {
    const da = toDateTimeISO(a.dateISO, a.time)
    const db = toDateTimeISO(b.dateISO, b.time)
    return compareAsc(da, db)
  })
)

const upcoming = computed(() =>
  sortedAll.value
    .filter((r: Reminder) => {
      const dt = toDateTimeISO(r.dateISO, r.time)
      return isAfter(dt, now) || isEqual(startOfDay(dt), todayStart)
    })
    .slice(0, 10)
)

const counts = computed(() => {
  const total = store.items.length
  const today = store.items.filter((r: Reminder) => {
    const d = parseISO(r.dateISO)
    return isEqual(startOfDay(d), todayStart)
  }).length

  const thisWeek = store.items.filter((r: Reminder) => {
    const d = parseISO(r.dateISO)
    return (isAfter(d, addDays(weekStart, -1)) && isBefore(d, addDays(weekEnd, 1)))
  }).length

  const citySet = new Set(store.items.map((r: Reminder) => r.city.trim()).filter(Boolean))
  return { total, today, thisWeek, cities: citySet.size }
})

const cityListHint = computed(() => {
  const citySet = new Set(store.items.map((r: Reminder) => r.city.trim()).filter(Boolean))
  const arr = Array.from(citySet).slice(0, 3)
  const more = citySet.size - arr.length
  return more > 0 ? `${arr.join(', ')} +${more} more` : arr.join(', ')
})

type CityCard = {
  key: string
  label: string
  loc: Location
  nextDateISO: string
  summary: string
  iconUrl: string
}

const cityCards = ref<CityCard[]>([])
const loading = ref(false)

async function refreshForecasts() {
  const groups = groupByCity(store.items)
  loading.value = true
  const out: CityCard[] = []

  await Promise.all(
    groups.map(async (g: { loc: Location; nextDateISO: string }) => {
      const fc = await weather.getForecastByCoords(g.loc.lat, g.loc.lon, g.nextDateISO)
      out.push({
        key: `${g.loc.lat.toFixed(3)},${g.loc.lon.toFixed(3)}`,
        label: labelOf(g.loc),
        loc: g.loc,
        nextDateISO: g.nextDateISO,
        summary: fc?.summary ?? '',
        iconUrl: weather.iconUrl(fc?.icon),
      })
    })
  )

  out.sort((a: CityCard, b: CityCard) => a.label.localeCompare(b.label))
  cityCards.value = out
  loading.value = false
}

function labelOf(loc: Location) {
  return [loc.name, loc.state, loc.country].filter(Boolean).join(', ')
}

function groupByCity(list: Reminder[]) {
  const withLoc = list.filter(r => r.loc && r.dateISO) as (Reminder & { loc: Location })[]

  const map = new Map<string, { loc: Location; nextDateISO: string }>()
  const startNow = startOfDay(new Date())

  for (const r of withLoc) {
    const key = `${r.loc.lat.toFixed(3)},${r.loc.lon.toFixed(3)}`
    const current = map.get(key)
    const isFutureOrToday = !isBefore(parseISO(r.dateISO), startNow)
    if (!isFutureOrToday) continue

    if (!current) {
      map.set(key, { loc: r.loc, nextDateISO: r.dateISO })
    } else if (compareAsc(parseISO(r.dateISO), parseISO(current.nextDateISO)) < 0) {
      current.nextDateISO = r.dateISO
    }
  }

  return Array.from(map.values())
}

watchEffect(() => {
  void refreshForecasts()
})
</script>
