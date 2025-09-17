import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useGeocoding } from '../useGeocoding'
import type { Location } from '../../types/Location'

describe.only('useGeocoding', () => {
  let searchCities: ReturnType<typeof useGeocoding>['searchCities']
  let label: ReturnType<typeof useGeocoding>['label']

  beforeEach(() => {
    vi.restoreAllMocks()
    ;(import.meta as any).env.VITE_OWM_API_KEY = 'test-api-key'

    const composable = useGeocoding()
    searchCities = composable.searchCities
    label = composable.label
  })

  it('returns [] if query is blank', async () => {
    const result = await searchCities('   ')
    expect(result).toEqual([])
  })

  it('throws if fetch response is not ok', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => [],
    } as any)

    await expect(searchCities('Paris')).rejects.toThrow('geocoding failed')
  })

  it('label formats correctly', () => {
    const loc: Location = {
      name: 'Berlin',
      country: 'DE',
      state: 'Berlin',
      lat: 52.52,
      lon: 13.405,
    }
    expect(label(loc)).toBe('Berlin, Berlin, DE')

    const locNoState: Location = {
      name: 'Tokyo',
      country: 'JP',
      state: undefined,
      lat: 35.6895,
      lon: 139.6917,
    }
    expect(label(locNoState)).toBe('Tokyo, JP')
  })
})
