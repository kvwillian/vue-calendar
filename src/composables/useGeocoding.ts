import type { Location } from '@/types/Location'

const API = import.meta.env.VITE_OWM_API_KEY as string | undefined

export function useGeocoding() {
  async function searchCities(query: string, limit = 5): Promise<Location[]> {
    if (!API || !query.trim()) return []
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API}`
    const r = await fetch(url)
    if (!r.ok) throw new Error('geocoding failed')
    const data = await r.json()
    return (data ?? []).map((d: any) => ({
      name: d.name,
      country: d.country,
      state: d.state,
      lat: d.lat,
      lon: d.lon,
    })) as Location[]
  }

  function label(loc: Location) {
    return [loc.name, loc.state, loc.country].filter(Boolean).join(', ')
  }

  return { searchCities, label }
}
