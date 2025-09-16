import type { Location } from './Location'

export interface Reminder {
  id: string
  dateISO: string
  time: string
  text: string
  city: string
  color: string
  loc: Location | null  
  weather?: { summary: string; icon?: string } | null
}
