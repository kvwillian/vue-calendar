import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useReminders } from '../reminders'
import type { Reminder } from '../../types/Reminder'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('useReminders Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('Initialization', () => {
    it('should initialize with empty array when no data in localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null)
      const store = useReminders()
      
      expect(store.items).toEqual([])
    })

    it('should load data from localStorage on initialization', () => {
      const mockReminders: Reminder[] = [
        {
          id: '1',
          dateISO: '2024-01-15',
          time: '10:00',
          text: 'Test reminder',
          city: 'Test City',
          color: '#ff0000',
          loc: null,
          weather: null
        }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockReminders))
      
      const store = useReminders()
      
      expect(store.items).toEqual(mockReminders)
    })

    it('should handle corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      const store = useReminders()
      
      expect(store.items).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to parse reminders from storage',
        expect.any(Error)
      )
      
      consoleSpy.mockRestore()
    })
  })

  describe('CRUD Operations', () => {
    let store: ReturnType<typeof useReminders>

    beforeEach(() => {
      store = useReminders()
    })

    describe('upsert', () => {
      it('should add new reminder when id does not exist', () => {
        const newReminder: Reminder = {
          id: 'new-id',
          dateISO: '2024-01-15',
          time: '10:00',
          text: 'New reminder',
          city: 'New City',
          color: '#00ff00',
          loc: null,
          weather: null
        }

        store.upsert(newReminder)

        expect(store.items).toHaveLength(1)
        expect(store.items[0]).toEqual(newReminder)
      })

      it('should update existing reminder when id exists', () => {
        const existingReminder: Reminder = {
          id: 'existing-id',
          dateISO: '2024-01-15',
          time: '10:00',
          text: 'Original text',
          city: 'Original City',
          color: '#ff0000',
          loc: null,
          weather: null
        }

        store.upsert(existingReminder)
        expect(store.items).toHaveLength(1)

        const updatedReminder: Reminder = {
          ...existingReminder,
          text: 'Updated text',
          color: '#00ff00'
        }

        store.upsert(updatedReminder)

        expect(store.items).toHaveLength(1)
        expect(store.items[0]).toEqual(updatedReminder)
      })
    })

    describe('remove', () => {
      it('should remove reminder by id', () => {
        const reminder1: Reminder = {
          id: '1',
          dateISO: '2024-01-15',
          time: '10:00',
          text: 'Reminder 1',
          city: 'City 1',
          color: '#ff0000',
          loc: null,
          weather: null
        }

        const reminder2: Reminder = {
          id: '2',
          dateISO: '2024-01-16',
          time: '11:00',
          text: 'Reminder 2',
          city: 'City 2',
          color: '#00ff00',
          loc: null,
          weather: null
        }

        store.upsert(reminder1)
        store.upsert(reminder2)
        expect(store.items).toHaveLength(2)

        store.remove('1')

        expect(store.items).toHaveLength(1)
        expect(store.items[0]).toEqual(reminder2)
      })

      it('should handle removing non-existent id gracefully', () => {
        store.remove('non-existent-id')
        expect(store.items).toHaveLength(0)
      })
    })

    describe('removeByDate', () => {
      it('should remove all reminders for a specific date', () => {
        const reminder1: Reminder = {
          id: '1',
          dateISO: '2024-01-15',
          time: '10:00',
          text: 'Reminder 1',
          city: 'City 1',
          color: '#ff0000',
          loc: null,
          weather: null
        }

        const reminder2: Reminder = {
          id: '2',
          dateISO: '2024-01-15',
          time: '11:00',
          text: 'Reminder 2',
          city: 'City 2',
          color: '#00ff00',
          loc: null,
          weather: null
        }

        const reminder3: Reminder = {
          id: '3',
          dateISO: '2024-01-16',
          time: '12:00',
          text: 'Reminder 3',
          city: 'City 3',
          color: '#0000ff',
          loc: null,
          weather: null
        }

        store.upsert(reminder1)
        store.upsert(reminder2)
        store.upsert(reminder3)
        expect(store.items).toHaveLength(3)

        store.removeByDate('2024-01-15')

        expect(store.items).toHaveLength(1)
        expect(store.items[0]).toEqual(reminder3)
      })
    })
  })

  describe('Computed Properties', () => {
    let store: ReturnType<typeof useReminders>

    beforeEach(() => {
      store = useReminders()
      
      // Add test data
      const reminders: Reminder[] = [
        {
          id: '1',
          dateISO: '2024-01-15',
          time: '11:00',
          text: 'Late reminder',
          city: 'City 1',
          color: '#ff0000',
          loc: null,
          weather: null
        },
        {
          id: '2',
          dateISO: '2024-01-15',
          time: '09:00',
          text: 'Early reminder',
          city: 'City 2',
          color: '#00ff00',
          loc: null,
          weather: null
        },
        {
          id: '3',
          dateISO: '2024-01-16',
          time: '10:00',
          text: 'Different day',
          city: 'City 3',
          color: '#0000ff',
          loc: null,
          weather: null
        }
      ]

      reminders.forEach(reminder => store.upsert(reminder))
    })

    describe('byDay', () => {
      it('should return reminders for specific date sorted by time', () => {
        const remindersForDay = store.byDay('2024-01-15')

        expect(remindersForDay.value).toHaveLength(2)
        expect(remindersForDay.value[0].text).toBe('Early reminder')
        expect(remindersForDay.value[1].text).toBe('Late reminder')
      })

      it('should return empty array for date with no reminders', () => {
        const remindersForDay = store.byDay('2024-01-20')

        expect(remindersForDay.value).toHaveLength(0)
      })
    })

    describe('byMonth', () => {
      it('should return reminders for specific month', () => {
        const remindersForMonth = store.byMonth(2024, 0) // January 2024

        expect(remindersForMonth.value).toHaveLength(3)
      })

      it('should return empty array for month with no reminders', () => {
        const remindersForMonth = store.byMonth(2024, 5) // June 2024

        expect(remindersForMonth.value).toHaveLength(0)
      })
    })
  })

  describe('Persistence', () => {
    it('should save to localStorage when items change', async () => {
      const store = useReminders()
      const reminder: Reminder = {
        id: '1',
        dateISO: '2024-01-15',
        time: '10:00',
        text: 'Test reminder',
        city: 'Test City',
        color: '#ff0000',
        loc: null,
        weather: null
      }

      store.upsert(reminder)
      
      // Wait for next tick to allow watcher to run
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'calendar-reminders',
        JSON.stringify([reminder])
      )
    })

    it('should save to localStorage when reminder is removed', async () => {
      const store = useReminders()
      const reminder: Reminder = {
        id: '1',
        dateISO: '2024-01-15',
        time: '10:00',
        text: 'Test reminder',
        city: 'Test City',
        color: '#ff0000',
        loc: null,
        weather: null
      }

      store.upsert(reminder)
      vi.clearAllMocks()

      store.remove('1')
      
      // Wait for next tick to allow watcher to run
      await new Promise(resolve => setTimeout(resolve, 0))

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'calendar-reminders',
        JSON.stringify([])
      )
    })
  })
})
