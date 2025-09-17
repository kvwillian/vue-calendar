import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCalendarStore } from '../calendar'

describe('useCalendarStore', () => {
  let store: ReturnType<typeof useCalendarStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useCalendarStore()
  })

  describe('Initialization', () => {
    it('should initialize with current date', () => {
      const today = new Date()
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth()

      expect(store.year).toBe(currentYear)
      expect(store.month).toBe(currentMonth)
    })
  })

  describe('Navigation', () => {
    it('should navigate to next month within same year', () => {
      const initialMonth = store.month
      const initialYear = store.year

      store.nextMonth()

      expect(store.month).toBe(initialMonth + 1)
      expect(store.year).toBe(initialYear)
    })

    it('should navigate to next year when going from December to January', () => {
      // Set to December
      store.month = 11
      store.year = 2023

      store.nextMonth()

      expect(store.month).toBe(0) // January
      expect(store.year).toBe(2024)
    })

    it('should navigate to previous month within same year', () => {
      // Set to a month other than January
      store.month = 5 // June
      store.year = 2023

      store.prevMonth()

      expect(store.month).toBe(4) // May
      expect(store.year).toBe(2023)
    })

    it('should navigate to previous year when going from January to December', () => {
      // Set to January
      store.month = 0
      store.year = 2024

      store.prevMonth()

      expect(store.month).toBe(11) // December
      expect(store.year).toBe(2023)
    })

    it('should go to today', () => {
      // Set to a different date
      store.month = 5
      store.year = 2020

      store.goToday()

      const today = new Date()
      expect(store.year).toBe(today.getFullYear())
      expect(store.month).toBe(today.getMonth())
    })
  })

  describe('Edge Cases', () => {
    it('should handle month boundaries correctly', () => {
      // Test December to January transition
      store.month = 11
      store.year = 2023
      store.nextMonth()
      expect(store.month).toBe(0)
      expect(store.year).toBe(2024)

      // Test January to December transition
      store.month = 0
      store.year = 2024
      store.prevMonth()
      expect(store.month).toBe(11)
      expect(store.year).toBe(2023)
    })

    it('should maintain month value within valid range', () => {
      // Test multiple next month operations
      store.month = 10
      store.year = 2023

      store.nextMonth() // November -> December
      expect(store.month).toBe(11)

      store.nextMonth() // December -> January (next year)
      expect(store.month).toBe(0)
      expect(store.year).toBe(2024)

      // Test multiple previous month operations
      store.month = 1
      store.year = 2024

      store.prevMonth() // February -> January
      expect(store.month).toBe(0)

      store.prevMonth() // January -> December (previous year)
      expect(store.month).toBe(11)
      expect(store.year).toBe(2023)
    })
  })

  describe('Reactivity', () => {
    it('should be reactive to month changes', () => {
      const initialMonth = store.month

      store.nextMonth()

      expect(store.month).not.toBe(initialMonth)
    })

    it('should be reactive to year changes', () => {
      const initialYear = store.year

      // Force year change by going from December to January
      store.month = 11
      store.nextMonth()

      expect(store.year).not.toBe(initialYear)
    })
  })
})
