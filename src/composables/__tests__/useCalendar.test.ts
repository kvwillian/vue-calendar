import { describe, it, expect } from 'vitest'
import { useCalendarGrid } from '../useCalendar'
import { format } from 'date-fns'

describe.only('useCalendarGrid', () => {
  it('returns correct grid for March 2023 with Sunday as start of week', () => {
    const { days } = useCalendarGrid(2023, 2, 0)

    expect(days).toHaveLength(35)

    expect(days[0].iso).toBe('2023-02-26')
    expect(days[0].inMonth).toBe(false)
    
    expect(days[34].iso).toBe('2023-04-01')
    expect(days[34].inMonth).toBe(false)

    const march15 = days.find(d => d.iso === '2023-03-15')
    expect(march15).toBeDefined()
    expect(march15!.inMonth).toBe(true)
  })

  it('respects custom week start (Monday)', () => {
    const { days } = useCalendarGrid(2023, 2, 1) 

    expect(days[0].iso).toBe('2023-02-27')

    expect(days).toHaveLength(35)

    expect(days[34].iso).toBe('2023-04-02')
  })

  it('marks inMonth correctly for February 2024 (leap year)', () => {
    const { days } = useCalendarGrid(2024, 1, 0)

    const feb29 = days.find(d => d.iso === '2024-02-29')
    expect(feb29).toBeDefined()
    expect(feb29!.inMonth).toBe(true)

    const mar1 = days.find(d => d.iso === '2024-03-01')
    expect(mar1).toBeDefined()
    expect(mar1!.inMonth).toBe(false)
  })

  it('produces consecutive days without gaps', () => {
    const { days } = useCalendarGrid(2023, 6, 0)

    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1].iso)
      const curr = new Date(days[i].iso)

      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      expect(diff).toBe(1) 
    }
  })

  it('iso format is always yyyy-MM-dd', () => {
    const { days } = useCalendarGrid(2023, 0, 0)

    days.forEach(d => {
      expect(d.iso).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(d.iso).toBe(format(d.date, 'yyyy-MM-dd'))
    })
  })
})
