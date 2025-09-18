<template>
  <div class="fixed inset-0 z-[100] bg-black/40" @click="onBackdropClick"></div>

  <div
    class="fixed inset-0 z-[101] grid place-items-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirmation-title"
  >
    <div
      ref="panel"
      class="relative bg-gray-200 dark:bg-gray-800 w-full max-w-md rounded-lg border border-gray-300 dark:border-gray-700 p-4 space-y-3 shadow-xl"
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

      <h3 id="confirmation-title" class="text-lg font-semibold text-gray-800 dark:text-gray-100">
        {{ title }}
      </h3>

      <p class="text-sm text-gray-600 dark:text-gray-300">
        {{ message }}
      </p>

      <div class="pt-2 flex gap-2 justify-end">
        <button 
          type="button" 
          class="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300" 
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button 
          type="button" 
          class="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white" 
          @click="$emit('confirm')"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

defineProps<{
  title: string
  message: string
  confirmText?: string
}>()

const emit = defineEmits<{ 
  (e: 'close'): void
  (e: 'confirm'): void 
}>()

const panel = ref<HTMLDivElement | null>(null)

function onKey(e: KeyboardEvent) { 
  if (e.key === 'Escape') emit('close') 
}
function lockScroll(lock: boolean) { 
  document.documentElement.style.overflow = lock ? 'hidden' : '' 
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  lockScroll(true)
  queueMicrotask(() => {
    const button = panel.value?.querySelector('button:last-child') as HTMLButtonElement
    button?.focus()
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  lockScroll(false)
})

function onBackdropClick() { 
  emit('close') 
}
</script>
