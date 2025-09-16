import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek, addDays, type Day } from 'date-fns'

export function useCalendarGrid(year: number, monthIdx0: number, weekStartsOn: Day = 0) {
  const monthStart = startOfMonth(new Date(year, monthIdx0, 1))
  const monthEnd   = endOfMonth(monthStart)
  const gridStart  = startOfWeek(monthStart, { weekStartsOn })
  const gridEnd    = endOfWeek(monthEnd, { weekStartsOn })

  const days: { date: Date; iso: string; inMonth: boolean }[] = []
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    const iso = format(d, 'yyyy-MM-dd')
    days.push({ date: d, iso, inMonth: d.getMonth() === monthIdx0 })
  }
  return { days }
}
