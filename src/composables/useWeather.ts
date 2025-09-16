import type { Location } from '@/types/Location'
type Forecast = { summary: string; icon?: string }

const API = import.meta.env.VITE_OWM_API_KEY as string | undefined
const TTL_MS = 5 * 60 * 1000
const mem = new Map<string, { t: number; data: Forecast | null }>()

function cache(k: string) {
  const hit = mem.get(k)
  if (!hit) return undefined
  if (Date.now() - hit.t > TTL_MS) { mem.delete(k); return undefined }
  return hit.data
}
function setc(k: string, v: Forecast | null) { mem.set(k, { t: Date.now(), data: v }) }

export function useWeather() {
  async function getForecastByCoords(lat: number, lon: number, dateISO: string): Promise<Forecast | null> {
    if (!API) return { summary: 'weather preview (mock)' }
    const key = `c:${lat.toFixed(3)},${lon.toFixed(3)}|${dateISO}`
    const cached = cache(key); if (cached !== undefined) return cached

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API}&units=metric&lang=en`
    const r = await fetch(url); if (!r.ok) { setc(key, null); return null }
    const data = await r.json(); if (!data?.list?.length) { setc(key, null); return null }

    const target = new Date(`${dateISO}T12:00:00`).getTime()
    let best = data.list[0], diff = Infinity
    for (const it of data.list) {
      const dt = it.dt * 1000
      const d = Math.abs(dt - target)
      if (d < diff) { diff = d; best = it }
    }
    const out = { summary: best.weather?.[0]?.description ?? '—', icon: best.weather?.[0]?.icon }
    setc(key, out); return out
  }

  async function getForecast(cityOrLoc: string | Location, dateISO: string): Promise<Forecast | null> {
    if (typeof cityOrLoc !== 'string' && cityOrLoc) {
      return getForecastByCoords(cityOrLoc.lat, cityOrLoc.lon, dateISO)
    }
    if (!API) return { summary: 'weather preview (mock)' }
    const geocode = async (q: string) => {
      const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${API}`
      const r = await fetch(url); if (!r.ok) throw new Error('geocoding failed')
      const [hit] = await r.json(); return hit ? { lat: hit.lat, lon: hit.lon } : null
    }
    const loc = await geocode(cityOrLoc)
    return loc ? getForecastByCoords(loc.lat, loc.lon, dateISO) : null
  }

  function iconUrl(id?: string) {
    return id ? `https://openweathermap.org/img/wn/${id}@2x.png` : ''
  }

  return { getForecast, getForecastByCoords, iconUrl }
}
