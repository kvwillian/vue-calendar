<template>
  <div class="bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-700">
    <CalendarHeader />
    <CalendarGrid @open-day="$emit('open-day', $event)" @new="openNew" @open-reminder="openEdit" />

    <Teleport to="body">
      <ReminderModal
        v-if="modalOpen"
        :initial="editing"
        @close="closeModal"
        @saved="closeModal"
      />
    </Teleport>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import CalendarHeader from './CalendarHeader.vue'
import CalendarGrid from './CalendarGrid.vue'
import ReminderModal from './ReminderModal.vue'
import type { Reminder } from '@/types/Reminder'

defineEmits<{
  (e: 'open-day', iso: string): void
}>()

const modalOpen = ref(false)
const editing = ref<Reminder | null>(null)
function openNew(dateISO?: string) {
  editing.value = {
    id: crypto.randomUUID(),
    dateISO: dateISO ?? '',
    time: '09:00',
    text: '',
    city: '',
    color: '#3b82f6',
    loc: null,
    weather: null
  }
  modalOpen.value = true
}
function openEdit(rem: Reminder) {
  editing.value = { ...rem }
  modalOpen.value = true
}
function closeModal() {
  modalOpen.value = false
  editing.value = null
}
</script>
