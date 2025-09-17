<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Settings</h1>

    <form class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-w-xl space-y-4">
      <div>
        <label class="block text-sm mb-1">Start of week</label>
        <select class="w-full px-3 py-2 rounded border bg-white dark:bg-gray-700">
          <option value="0">Sunday</option>
          <option value="1">Monday</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">Time format</label>
        <select class="w-full px-3 py-2 rounded border bg-white dark:bg-gray-700">
          <option>24h</option>
          <option>12h</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">OpenWeather API Key (VITE_OWM_API_KEY)</label>
        <input class="w-full px-3 py-2 rounded border bg-white dark:bg-gray-700" placeholder="cole aqui sua API key" />
      </div>

      <button type="button" class="px-4 py-2 rounded bg-blue-600 text-white dark:bg-blue-600">Save</button>
    </form>
  </div>
</template>

<script setup lang="ts">
</script>
