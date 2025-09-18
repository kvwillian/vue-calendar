import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import ReminderModal from '../ReminderModal.vue'
import type { Reminder } from '../../../types/Reminder'
import type { Location } from '../../../types/Location'

const mockRemindersStore = {
  items: [] as Reminder[],
  upsert: vi.fn(),
  remove: vi.fn(),
  find: vi.fn()
}

vi.mock('@/stores/reminders', () => ({
  useReminders: () => mockRemindersStore
}))

const mockWeather = {
  getForecastByCoords: vi.fn()
}

vi.mock('@/composables/useWeather', () => ({
  useWeather: () => mockWeather
}))

vi.mock('@/components/CitySelect.vue', () => ({
  default: {
    name: 'CitySelect',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<div data-testid="city-select">City Select</div>'
  }
}))

describe('ReminderModal Component', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    Object.defineProperty(global, 'crypto', {
      value: {
        randomUUID: vi.fn(() => 'test-uuid-123')
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Rendering', () => {
    it('should render modal with backdrop and form', () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      expect(wrapper.find('.fixed.inset-0').exists()).toBe(true)
      expect(wrapper.find('form').exists()).toBe(true)
      expect(wrapper.find('h3').text()).toBe('New reminder')
    })

    it('should show edit title when editing existing reminder', () => {
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

      mockRemindersStore.items = [existingReminder]
      mockRemindersStore.find.mockReturnValue(true)

      wrapper = mount(ReminderModal, {
        props: { initial: existingReminder }
      })

      expect(wrapper.find('h3').text()).toBe('Edit reminder')
    })

    it('should render all form fields', () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      expect(wrapper.find('input[type="date"]').exists()).toBe(true)
      expect(wrapper.find('input[type="time"]').exists()).toBe(true)
      expect(wrapper.find('input[maxlength="30"]').exists()).toBe(true)
      expect(wrapper.find('input[type="color"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="city-select"]').exists()).toBe(true)
    })

    it('should show delete button only when editing', () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })
      expect(wrapper.html()).not.toContain('Delete')

      wrapper.unmount()

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

      mockRemindersStore.items = [existingReminder]
      mockRemindersStore.find.mockReturnValue(true)
      wrapper = mount(ReminderModal, {
        props: { initial: existingReminder }
      })
      expect(wrapper.html()).toContain('Delete')
    })
  })

  describe('Form Initialization', () => {
    it('should initialize with default values for new reminder', () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      const form = wrapper.vm.form
      expect(form).toMatchObject({
        time: '09:00',
        text: '',
        city: '',
        color: '#3b82f6',
        loc: null,
        weather: null
      })
      expect(form.id).toBeDefined()
      expect(form.dateISO).toBe('')
    })

    it('should initialize with existing reminder data', () => {
      const existingReminder: Reminder = {
        id: 'existing-id',
        dateISO: '2024-01-15',
        time: '10:00',
        text: 'Existing reminder',
        city: 'Existing City',
        color: '#ff0000',
        loc: null,
        weather: null
      }

      wrapper = mount(ReminderModal, {
        props: { initial: existingReminder }
      })

      const form = wrapper.vm.form
      expect(form).toMatchObject({
        id: 'existing-id',
        dateISO: '2024-01-15',
        time: '10:00',
        text: 'Existing reminder',
        city: 'Existing City',
        color: '#ff0000',
        loc: null,
        weather: null
      })
    })

    it('should handle location data correctly', () => {
      const location: Location = {
        name: 'New York',
        country: 'US',
        state: 'NY',
        lat: 40.7128,
        lon: -74.0060
      }

      const existingReminder: Reminder = {
        id: 'existing-id',
        dateISO: '2024-01-15',
        time: '10:00',
        text: 'Existing reminder',
        city: 'Existing City',
        color: '#ff0000',
        loc: location,
        weather: null
      }

      wrapper = mount(ReminderModal, {
        props: { initial: existingReminder }
      })

      expect(wrapper.vm.form.loc).toEqual(location)
    })
  })

  describe('Form Submission', () => {
    beforeEach(() => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })
    })

    it('should submit valid form data', async () => {
      await wrapper.find('input[type="date"]').setValue('2024-01-15')
      await wrapper.find('input[type="time"]').setValue('10:00')
      await wrapper.find('input[maxlength="30"]').setValue('Test reminder')
      await wrapper.find('input[type="color"]').setValue('#ff0000')

      await wrapper.find('form').trigger('submit')

      expect(mockRemindersStore.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          dateISO: '2024-01-15',
          time: '10:00',
          text: 'Test reminder',
          color: '#ff0000'
        })
      )
    })

    it('should not submit when text is empty', async () => {
      await wrapper.find('input[type="date"]').setValue('2024-01-15')
      await wrapper.find('input[type="time"]').setValue('10:00')

      await wrapper.find('form').trigger('submit')

      expect(mockRemindersStore.upsert).not.toHaveBeenCalled()
    })

    it('should not submit when text is too long', async () => {
      await wrapper.find('input[type="date"]').setValue('2024-01-15')
      await wrapper.find('input[type="time"]').setValue('10:00')
      await wrapper.find('input[maxlength="30"]').setValue('This is a very long reminder text that exceeds the 30 character limit')

      await wrapper.find('form').trigger('submit')

      expect(mockRemindersStore.upsert).not.toHaveBeenCalled()
    })

    it('should emit saved and close events on successful submission', async () => {
      await wrapper.find('input[type="date"]').setValue('2024-01-15')
      await wrapper.find('input[type="time"]').setValue('10:00')
      await wrapper.find('input[maxlength="30"]').setValue('Test reminder')

      await wrapper.find('form').trigger('submit')

      expect(wrapper.emitted('saved')).toBeTruthy()
      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should set city from location when submitting', async () => {
      const location: Location = {
        name: 'New York',
        country: 'US',
        state: 'NY',
        lat: 40.7128,
        lon: -74.0060
      }

      wrapper.vm.form.loc = location
      wrapper.vm.form.city = ''
      wrapper.vm.form.text = 'Test reminder'

      await wrapper.find('form').trigger('submit')

      expect(mockRemindersStore.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'New York, NY, US'
        })
      )
    })
  })

  describe('Delete Functionality', () => {
    it('should delete reminder and close modal', async () => {
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

      mockRemindersStore.items = [existingReminder]
      mockRemindersStore.find.mockReturnValue(true)
      wrapper = mount(ReminderModal, {
        props: { initial: existingReminder }
      })

      const deleteButton = wrapper.findAll('button').find((btn: any) => btn.text().includes('Delete'))
      await deleteButton?.trigger('click')

      expect(mockRemindersStore.remove).toHaveBeenCalledWith('test-id')
      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('Weather Integration', () => {
    it('should fetch weather when location and date are set', async () => {
      const location: Location = {
        name: 'New York',
        country: 'US',
        state: 'NY',
        lat: 40.7128,
        lon: -74.0060
      }

      mockWeather.getForecastByCoords.mockResolvedValue({
        summary: 'Clear sky',
        icon: '01d'
      })

      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      wrapper.vm.form.loc = location
      wrapper.vm.form.dateISO = '2024-01-15'

      await nextTick()

      expect(mockWeather.getForecastByCoords).toHaveBeenCalledWith(40.7128, -74.0060, '2024-01-15')
    })

    it('should clear weather when location or date is removed', async () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      wrapper.vm.form.weather = { summary: 'Clear sky', icon: '01d' }
      wrapper.vm.form.loc = { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 }
      wrapper.vm.form.dateISO = '2024-01-15'

      wrapper.vm.form.loc = null

      await nextTick()

      expect(wrapper.vm.form.weather).toBeNull()
    })

    it('should display weather information', async () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      wrapper.vm.form.weather = { summary: 'Clear sky', icon: '01d' }
      wrapper.vm.form.loc = { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 }
      wrapper.vm.form.dateISO = '2024-01-15'

      await nextTick()

      expect(wrapper.text()).toContain('Forecast: Clear sky')
    })

    it('should show loading state while fetching weather', async () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      wrapper.vm.form.loc = { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060 }
      wrapper.vm.form.dateISO = '2024-01-15'
      wrapper.vm.form.weather = null

      await nextTick()

      expect(wrapper.text()).toContain('Fetching forecast…')
    })
  })

  describe('Modal Interactions', () => {
    it('should close modal when backdrop is clicked', async () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      await wrapper.find('.fixed.inset-0').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should close modal when close button is clicked', async () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      await wrapper.find('button[aria-label="Close"]').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should close modal when cancel button is clicked', async () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      const cancelButton = wrapper.findAll('button').find((btn: any) => btn.text().includes('Cancel'))
      await cancelButton?.trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })

    it('should close modal on Escape key', async () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      window.dispatchEvent(event)

      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      const modal = wrapper.find('[role="dialog"]')
      expect(modal.exists()).toBe(true)
      expect(modal.attributes('aria-modal')).toBe('true')
      expect(modal.attributes('aria-labelledby')).toBe('reminder-title')
    })

    it('should focus first input on mount', async () => {
      const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus')
      
      wrapper = mount(ReminderModal, {
        props: { initial: null }
      })

      await nextTick()

      expect(focusSpy).toHaveBeenCalled()
    })
  })
})
