<template>
  <div class="relative">
    <label class="block text-sm mb-1">City</label>
    <input
      ref="inputEl"
      v-model="query"
      :placeholder="modelValue ? label(modelValue) : 'Type a city name...'"
      class="w-full px-3 py-2 rounded border"
      @focus="open = true"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter.prevent="selectIndex(activeIndex)"
      @keydown.esc.prevent="open = false"
    />

    <ul
      v-if="open && results.length"
      class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-auto"
    >
      <li
        v-for="(loc, i) in results"
        :key="loc.lat + ',' + loc.lon"
        :class="['px-3 py-2 text-sm cursor-pointer', i === activeIndex ? 'bg-gray-100' : 'hover:bg-gray-50']"
        @mouseenter="activeIndex = i"
        @mouseleave="activeIndex = -1"
        @mousedown.prevent="selectIndex(i)"
      >
        {{ label(loc) }}
      </li>
    </ul>

    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Location } from '@/types/Location'
import { useGeocoding } from '@/composables/useGeocoding'

const props = defineProps<{ modelValue: Location | null }>()
const emit = defineEmits<{ (e:'update:modelValue', v: Location | null): void }>()
const { searchCities, label } = useGeocoding()

const open = ref(false)
const query = ref('')
const results = ref<Location[]>([])
const activeIndex = ref(-1)
const error = ref<string | null>(null)
const inputEl = ref<HTMLInputElement | null>(null)

let t: number | undefined
watch(query, (q) => {
  error.value = null;

  if (props.modelValue && q === label(props.modelValue)) {
    return;
  }

  if (t) window.clearTimeout(t);
  if (!q.trim()) { results.value = []; return; }
  t = window.setTimeout(async () => {
    try {
      const uniqueResults: Location[] = [];
      const seen = new Set();
      const apiResults = await searchCities(q, 8);
      
      for (const loc of apiResults) {
        const uniqueId = `${loc.lat}-${loc.lon}`;
        if (!seen.has(uniqueId)) {
          seen.add(uniqueId);
          uniqueResults.push(loc);
        }
      }
      
      results.value = uniqueResults;
      open.value = true;
      activeIndex.value = results.value.length ? 0 : -1;
    } catch (e) {
      error.value = 'Could not search cities';
    }
  }, 300);
});


function selectIndex(i: number) {
  if (i < 0 || i >= results.value.length) return
  const loc = results.value[i]
  emit('update:modelValue', loc)
  query.value = label(loc)
  open.value = false
}

function onClickOutside(e: MouseEvent) {
  if (!inputEl.value) return
  const root = inputEl.value.closest('.relative') as HTMLElement
  if (root && !root.contains(e.target as Node)) open.value = false
}

function move(delta: number) {
  if (!results.value.length) return
  const len = results.value.length
  activeIndex.value = ( (activeIndex.value + delta) % len + len ) % len
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))

defineExpose({ label })
</script>
