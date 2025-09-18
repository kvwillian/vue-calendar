import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Reminder } from '@/types/Reminder'
import { parseISO, isSameMonth } from 'date-fns'

const STORAGE_KEY = 'calendar-reminders'

export const useReminders = defineStore('reminders', () => {
  const items = ref<Reminder[]>(loadFromStorage())

  function upsert(rem: Reminder) {
    const i = items.value.findIndex(r => r.id === rem.id)
    if (i >= 0) items.value[i] = rem
    else items.value.push(rem)
  }

  function remove(id: string) {
    items.value = items.value.filter(r => r.id !== id)
  }

  function removeByDate(dateISO: string) {
    items.value = items.value.filter(r => r.dateISO !== dateISO)
  }

  function removeAll() {
    items.value = []
  }

  const byDay = (dateISO: string) => computed(() =>
    items.value
      .filter((r: Reminder) => r.dateISO === dateISO)
      .sort((a: Reminder, b: Reminder) => a.time.localeCompare(b.time))
  )

  const byMonth = (year: number, monthIdx0: number) => computed(() =>
    items.value.filter((r: Reminder) => isSameMonth(parseISO(r.dateISO), new Date(year, monthIdx0, 1)))
  )

  watch(items, (val: Reminder[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
  }, { deep: true })

  return { items, upsert, remove, removeByDate, removeAll, byDay, byMonth }
})

function loadFromStorage(): Reminder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error('Failed to parse reminders from storage', e)
    return []
  }
}
