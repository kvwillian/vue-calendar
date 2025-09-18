<template>
  <div class="h-dvh grid grid-rows-[auto_1fr] lg:grid-rows-[1fr] lg:grid-cols-[280px_1fr] bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-gray-200 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 z-30',
        'fixed inset-y-0 left-0 w-72 p-3 lg:static transform transition-transform',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
      aria-label="Sidebar menu"
    >
      <SidebarNav @navigate="sidebarOpen=false" />
    </aside>

    <!-- Top bar (mobile) -->
    <header class="lg:hidden sticky top-0 z-20 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
      <TopBar @toggle-sidebar="sidebarOpen=!sidebarOpen" />
    </header>

    <!-- Main -->
    <section class="min-h-0 flex flex-col">
      <!-- Top bar (desktop) -->
      <div class="hidden lg:block sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
        <TopBar />
      </div>

      <main class="min-h-0 overflow-auto p-4 lg:p-6">
        <RouterView />
      </main>
    </section>

    <!-- backdrop mobile -->
    <button
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/30 lg:hidden"
      aria-label="Close menu"
      @click="sidebarOpen=false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import SidebarNav from '@/components/SidebarNav.vue'
import TopBar from '@/components/TopBar.vue'

const sidebarOpen = ref(false)
</script>
