import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWeather } from '../useWeather'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useWeather', () => {
  let weather: ReturnType<typeof useWeather>

  beforeEach(() => {
    vi.clearAllMocks()
    weather = useWeather()
  })

  describe('iconUrl', () => {
    it('should return correct icon URL when icon ID is provided', () => {
      const url = weather.iconUrl('01d')

      expect(url).toBe('https://openweathermap.org/img/wn/01d@2x.png')
    })

    it('should return empty string when icon ID is not provided', () => {
      const url = weather.iconUrl()

      expect(url).toBe('')
    })

    it('should return empty string when icon ID is undefined', () => {
      const url = weather.iconUrl(undefined)

      expect(url).toBe('')
    })
  })

})