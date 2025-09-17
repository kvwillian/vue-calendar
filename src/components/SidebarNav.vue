<template>
  <nav class="h-full flex flex-col">
    <RouterLink
      to="/calendar"
      class="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      :class="linkClass('/calendar')"
      @click="$emit('navigate')"
    >
      <IconCalendar class="w-5 h-5" /> <span>Calendar</span>
    </RouterLink>

    <RouterLink
      to="/"
      class="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      :class="linkClass('/')"
      @click="$emit('navigate')"
    >
      <IconHome class="w-5 h-5" /> <span>Home</span>
    </RouterLink>

    <div class="mt-auto p-3 text-xs text-gray-500 dark:text-gray-400">
      v1.0 • Made with Vue + Tailwind
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
const route = useRoute()
defineEmits<{(e:'navigate'):void}>()

function linkClass(path:string) {
  const active = route.path === path || (path !== '/' && route.path.startsWith(path))
  return active ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-700 dark:text-gray-300'
}
</script>

<script lang="ts">
import { defineComponent, h } from 'vue'
export const IconCalendar = defineComponent({ name:'IconCalendar', render(){ return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',class:'inline'},[
  h('rect',{x:3,y:4,width:18,height:18,rx:2,ry:2,strokeWidth:2}),
  h('line',{x1:16,y1:2,x2:16,y2:6,strokeWidth:2}),
  h('line',{x1:8,y1:2,x2:8,y2:6,strokeWidth:2}),
  h('line',{x1:3,y1:10,x2:21,y2:10,strokeWidth:2}),
])}})
export const IconHome = defineComponent({ name:'IconHome', render(){ return h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor'},[
  h('path',{d:'M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5',strokeWidth:2, strokeLinecap:'round', strokeLinejoin:'round'}),
])}})
export default {}
</script>
