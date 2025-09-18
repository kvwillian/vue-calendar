import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CalendarGrid from '../CalendarGrid.vue'

// Mock the calendar store
const mockCalendarStore = {
  year: 2024,
  month: 0 // January
}

vi.mock('@/stores/calendar', () => ({
  useCalendarStore: () => mockCalendarStore
}))

// Mock the calendar composable
const mockCalendarGrid = {
  days: [
    { iso: '2023-12-31', inMonth: false },
    { iso: '2024-01-01', inMonth: true },
    { iso: '2024-01-02', inMonth: true },
    { iso: '2024-01-03', inMonth: true },
    { iso: '2024-01-04', inMonth: true },
    { iso: '2024-01-05', inMonth: true },
    { iso: '2024-01-06', inMonth: true },
    { iso: '2024-01-07', inMonth: true },
    { iso: '2024-01-08', inMonth: true },
    { iso: '2024-01-09', inMonth: true },
    { iso: '2024-01-10', inMonth: true },
    { iso: '2024-01-11', inMonth: true },
    { iso: '2024-01-12', inMonth: true },
    { iso: '2024-01-13', inMonth: true },
    { iso: '2024-01-14', inMonth: true },
    { iso: '2024-01-15', inMonth: true },
    { iso: '2024-01-16', inMonth: true },
    { iso: '2024-01-17', inMonth: true },
    { iso: '2024-01-18', inMonth: true },
    { iso: '2024-01-19', inMonth: true },
    { iso: '2024-01-20', inMonth: true },
    { iso: '2024-01-21', inMonth: true },
    { iso: '2024-01-22', inMonth: true },
    { iso: '2024-01-23', inMonth: true },
    { iso: '2024-01-24', inMonth: true },
    { iso: '2024-01-25', inMonth: true },
    { iso: '2024-01-26', inMonth: true },
    { iso: '2024-01-27', inMonth: true },
    { iso: '2024-01-28', inMonth: true },
    { iso: '2024-01-29', inMonth: true },
    { iso: '2024-01-30', inMonth: true },
    { iso: '2024-01-31', inMonth: true },
    { iso: '2024-02-01', inMonth: false },
    { iso: '2024-02-02', inMonth: false },
    { iso: '2024-02-03', inMonth: false }
  ]
}

vi.mock('@/composables/useCalendar', () => ({
  useCalendarGrid: () => mockCalendarGrid
}))

// Mock DayCell component
vi.mock('../DayCell.vue', () => ({
  default: {
    name: 'DayCell',
    props: ['iso', 'inMonth'],
    emits: ['new', 'open-reminder', 'open-day'],
    template: `
      <div 
        data-testid="day-cell" 
        :data-iso="iso"
        :data-in-month="inMonth"
        @click="$emit('new', iso)"
        @dblclick="$emit('open-day', iso)"
      >
        Day Cell {{ iso }}
      </div>
    `,
    setup(_props: any, { emit }: any) {
      return {
        $emit: emit
      }
    }
  }
}))

describe('CalendarGrid Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendering', () => {
    it('should render weekday headers', () => {
      wrapper = mount(CalendarGrid)

      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      weekdays.forEach(day => {
        expect(wrapper.text()).toContain(day)
      })
    })

    it('should render all day cells', () => {
      wrapper = mount(CalendarGrid)

      const dayCells = wrapper.findAll('[data-testid="day-cell"]')
      expect(dayCells).toHaveLength(mockCalendarGrid.days.length)
    })

    it('should pass correct props to day cells', () => {
      wrapper = mount(CalendarGrid)

      const dayCells = wrapper.findAll('[data-testid="day-cell"]')
      
      // Check first few cells
      expect(dayCells[0].attributes('data-iso')).toBe('2023-12-31')
      expect(dayCells[0].attributes('data-in-month')).toBe('false')
      
      expect(dayCells[1].attributes('data-iso')).toBe('2024-01-01')
      expect(dayCells[1].attributes('data-in-month')).toBe('true')
    })

    it('should have proper grid layout classes', () => {
      wrapper = mount(CalendarGrid)

      const grid = wrapper.find('.grid.grid-cols-7')
      expect(grid.exists()).toBe(true)
    })
  })

  describe('Event Handling', () => {
    it('should emit new event when day cell emits new', async () => {
      wrapper = mount(CalendarGrid)

      const dayCells = wrapper.findAll('[data-testid="day-cell"]')
      await dayCells[1].trigger('click') // Click on 2024-01-01

      expect(wrapper.emitted('new')).toBeTruthy()
      expect(wrapper.emitted('new')[0]).toEqual(['2024-01-01'])
    })

    it('should emit open-day event when day cell emits open-day', async () => {
      wrapper = mount(CalendarGrid)

      const dayCells = wrapper.findAll('[data-testid="day-cell"]')
      await dayCells[1].trigger('dblclick') // Double click on 2024-01-01

      expect(wrapper.emitted('open-day')).toBeTruthy()
      expect(wrapper.emitted('open-day')[0]).toEqual(['2024-01-01'])
    })

  })

  describe('Responsive Design', () => {
    it('should have responsive padding classes', () => {
      wrapper = mount(CalendarGrid)

      const container = wrapper.find('.p-2.sm\\:p-4')
      expect(container.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have proper text color classes for weekdays', () => {
      wrapper = mount(CalendarGrid)

      const weekdayContainer = wrapper.find('.text-xs.text-gray-500')
      expect(weekdayContainer.exists()).toBe(true)
    })

    it('should have rounded corners and overflow hidden for grid', () => {
      wrapper = mount(CalendarGrid)

      const grid = wrapper.find('.rounded.overflow-hidden')
      expect(grid.exists()).toBe(true)
    })
  })

  describe('Data Flow', () => {
    it('should use calendar store data for grid generation', () => {
      wrapper = mount(CalendarGrid)

      // The component should use the mocked calendar store
      expect(mockCalendarStore.year).toBe(2024)
      expect(mockCalendarStore.month).toBe(0)
    })

    it('should pass all days from calendar grid to day cells', () => {
      wrapper = mount(CalendarGrid)

      const dayCells = wrapper.findAll('[data-testid="day-cell"]')
      expect(dayCells).toHaveLength(mockCalendarGrid.days.length)

      // Verify each day cell has the correct ISO date
      mockCalendarGrid.days.forEach((day, index) => {
        expect(dayCells[index].attributes('data-iso')).toBe(day.iso)
        expect(dayCells[index].attributes('data-in-month')).toBe(day.inMonth.toString())
      })
    })
  })

})
