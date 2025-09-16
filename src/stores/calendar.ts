import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCalendarStore = defineStore('calendar', () => {
  const today = new Date()
  const year = ref(today.getFullYear())
  const month = ref(today.getMonth())

  function nextMonth(){ month.value===11 ? (month.value=0, year.value++) : month.value++ }
  function prevMonth(){ month.value===0 ? (month.value=11, year.value--) : month.value-- }
  function goToday(){ const t=new Date(); year.value=t.getFullYear(); month.value=t.getMonth() }

  return { year, month, nextMonth, prevMonth, goToday }
})
