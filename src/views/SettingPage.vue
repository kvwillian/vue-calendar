<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-semibold">Configurações</h1>

    <form class="bg-white border border-gray-200 rounded-lg p-4 max-w-xl space-y-4">
      <div>
        <label class="block text-sm mb-1">Início da semana</label>
        <select class="w-full px-3 py-2 rounded border bg-white">
          <option value="0">Domingo</option>
          <option value="1">Segunda</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">Formato de hora</label>
        <select class="w-full px-3 py-2 rounded border bg-white">
          <option>24h</option>
          <option>12h</option>
        </select>
      </div>

      <div>
        <label class="block text-sm mb-1">Chave OpenWeather (VITE_OWM_API_KEY)</label>
        <input class="w-full px-3 py-2 rounded border" placeholder="cole aqui sua API key" />
      </div>

      <button type="button" class="px-4 py-2 rounded bg-blue-600 text-white">Salvar</button>
    </form>
  </div>
</template>

<script setup lang="ts">
</script>
