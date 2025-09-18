import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Calendar from '../Calendar.vue'
import type { Reminder } from '../../../types/Reminder'

// Mock the child components
vi.mock('../CalendarHeader.vue', () => ({
  default: {
    name: 'CalendarHeader',
    template: '<div data-testid="calendar-header">Calendar Header</div>'
  }
}))

vi.mock('../CalendarGrid.vue', () => ({
  default: {
    name: 'CalendarGrid',
    template: '<div data-testid="calendar-grid">Calendar Grid</div>',
    emits: ['open-day', 'new', 'open-reminder']
  }
}))

vi.mock('../ReminderModal.vue', () => ({
  default: {
    name: 'ReminderModal',
    props: ['initial'],
    emits: ['close', 'saved'],
    template: '<div data-testid="reminder-modal" v-if="initial">Reminder Modal</div>'
  }
}))

describe('Calendar Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
    
    wrapper = mount(Calendar, {
      global: {
        stubs: {
          Teleport: true
        }
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Rendering', () => {
    it('should render calendar header and grid', () => {
      expect(wrapper.find('[data-testid="calendar-header"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="calendar-grid"]').exists()).toBe(true)
    })

    it('should not render reminder modal initially', () => {
      expect(wrapper.find('[data-testid="reminder-modal"]').exists()).toBe(false)
    })
  })

  describe('Modal Management', () => {
    it('should open modal for new reminder', async () => {
      const calendarGrid = wrapper.findComponent({ name: 'CalendarGrid' })
      
      await calendarGrid.vm.$emit('new')
      
      expect(wrapper.find('[data-testid="reminder-modal"]').exists()).toBe(true)
    })

    it('should open modal for new reminder with specific date', async () => {
      const calendarGrid = wrapper.findComponent({ name: 'CalendarGrid' })
      const testDate = '2024-01-15'
      
      await calendarGrid.vm.$emit('new', testDate)
      
      const modal = wrapper.findComponent({ name: 'ReminderModal' })
      expect(modal.exists()).toBe(true)
      expect(modal.props('initial')).toMatchObject({
        dateISO: testDate,
        time: '09:00',
        text: '',
        city: '',
        color: '#3b82f6',
        loc: null,
        weather: null
      })
    })

    it('should open modal for editing existing reminder', async () => {
      const existingReminder: Reminder = {
        id: 'test-id',
        dateISO: '2024-01-15',
        time: '10:00',
        text: 'Test reminder',
        city: 'Test City',
        color: '#ff0000',
        loc: null,
        weather: null
      }

      const calendarGrid = wrapper.findComponent({ name: 'CalendarGrid' })
      
      await calendarGrid.vm.$emit('open-reminder', existingReminder)
      
      const modal = wrapper.findComponent({ name: 'ReminderModal' })
      expect(modal.exists()).toBe(true)
      expect(modal.props('initial')).toEqual(existingReminder)
    })

    it('should emit open-day event when day cell emits open-day', async () => {
      const calendarGrid = wrapper.findComponent({ name: 'CalendarGrid' })
      const testDate = '2024-01-15'
      
      await calendarGrid.vm.$emit('open-day', testDate)
      
      expect(wrapper.emitted('open-day')).toBeTruthy()
      expect(wrapper.emitted('open-day')[0]).toEqual([testDate])
    })

    it('should close modal when close event is emitted', async () => {
      // Open modal first
      const calendarGrid = wrapper.findComponent({ name: 'CalendarGrid' })
      await calendarGrid.vm.$emit('new')
      
      expect(wrapper.find('[data-testid="reminder-modal"]').exists()).toBe(true)
      
      // Close modal
      const modal = wrapper.findComponent({ name: 'ReminderModal' })
      await modal.vm.$emit('close')
      
      expect(wrapper.find('[data-testid="reminder-modal"]').exists()).toBe(false)
    })

    it('should close modal when saved event is emitted', async () => {
      // Open modal first
      const calendarGrid = wrapper.findComponent({ name: 'CalendarGrid' })
      await calendarGrid.vm.$emit('new')
      
      expect(wrapper.find('[data-testid="reminder-modal"]').exists()).toBe(true)
      
      // Save and close modal
      const modal = wrapper.findComponent({ name: 'ReminderModal' })
      await modal.vm.$emit('saved')
      
      expect(wrapper.find('[data-testid="reminder-modal"]').exists()).toBe(false)
    })
  })

  describe('New Reminder Creation', () => {
    it('should create new reminder with default values', async () => {
      const calendarGrid = wrapper.findComponent({ name: 'CalendarGrid' })
      await calendarGrid.vm.$emit('new')
      
      const modal = wrapper.findComponent({ name: 'ReminderModal' })
      const initialData = modal.props('initial')
      
      expect(initialData).toMatchObject({
        time: '09:00',
        text: '',
        city: '',
        color: '#3b82f6',
        loc: null,
        weather: null
      })
      expect(initialData.id).toBeDefined()
      expect(typeof initialData.id).toBe('string')
    })

    it('should create new reminder with specific date', async () => {
      const calendarGrid = wrapper.findComponent({ name: 'CalendarGrid' })
      const testDate = '2024-01-15'
      await calendarGrid.vm.$emit('new', testDate)
      
      const modal = wrapper.findComponent({ name: 'ReminderModal' })
      const initialData = modal.props('initial')
      
      expect(initialData.dateISO).toBe(testDate)
    })

    it('should create new reminder with empty date when no date provided', async () => {
      const calendarGrid = wrapper.findComponent({ name: 'CalendarGrid' })
      await calendarGrid.vm.$emit('new')
      
      const modal = wrapper.findComponent({ name: 'ReminderModal' })
      const initialData = modal.props('initial')
      
      expect(initialData.dateISO).toBe('')
    })
  })

  describe('Reminder Editing', () => {
    it('should pass exact copy of reminder to modal', async () => {
      const originalReminder: Reminder = {
        id: 'test-id',
        dateISO: '2024-01-15',
        time: '10:00',
        text: 'Test reminder',
        city: 'Test City',
        color: '#ff0000',
        loc: {
          name: 'Test City',
          country: 'US',
          state: 'NY',
          lat: 40.7128,
          lon: -74.0060
        },
        weather: {
          summary: 'Clear sky',
          icon: '01d'
        }
      }

      const calendarGrid = wrapper.findComponent({ name: 'CalendarGrid' })
      await calendarGrid.vm.$emit('open-reminder', originalReminder)
      
      const modal = wrapper.findComponent({ name: 'ReminderModal' })
      const initialData = modal.props('initial')
      
      expect(initialData).toEqual(originalReminder)
      expect(initialData).not.toBe(originalReminder) // Should be a copy, not reference
    })
  })

  describe('State Management', () => {
    it('should reset editing state when modal is closed', async () => {
      const existingReminder: Reminder = {
        id: 'test-id',
        dateISO: '2024-01-15',
        time: '10:00',
        text: 'Test reminder',
        city: 'Test City',
        color: '#ff0000',
        loc: null,
        weather: null
      }

      // Open modal for editing
      const calendarGrid = wrapper.findComponent({ name: 'CalendarGrid' })
      await calendarGrid.vm.$emit('open-reminder', existingReminder)
      
      // Close modal
      const modal = wrapper.findComponent({ name: 'ReminderModal' })
      await modal.vm.$emit('close')
      
      // Modal should be closed
      expect(wrapper.find('[data-testid="reminder-modal"]').exists()).toBe(false)
    })
  })
})
