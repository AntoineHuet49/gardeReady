import { describe, expect, it } from 'vitest'
import { addDays, gardeForShift, mondayOf, parseDateOnly, shiftStartOf, toDateOnly } from '../planning'

// Fuseau Europe/Paris imposé par vitest.config.ts (test.env.TZ)
const gardes = [1, 2, 3]
const ref = '2026-10-02' // vendredi : Garde 1
const at = (s: string) => {
  const start = shiftStartOf(new Date(s))
  return { start: `${toDateOnly(start)} ${start.getHours()}h`, garde: gardeForShift(start, ref, gardes) }
}

describe('planning', () => {
  it('tourne dans le fuseau Europe/Paris', () => {
    // 2 octobre 2026 : heure d'été (UTC+2)
    expect(new Date('2026-10-02T08:00:00').getTimezoneOffset()).toBe(-120)
  })

  it.each([
    ['2026-10-02T07:59:00', '2026-09-25 8h', 3], // juste avant la relève du vendredi
    ['2026-10-02T08:00:00', '2026-10-02 8h', 1], // relève à 8h
    ['2026-10-02T18:00:00', '2026-10-02 8h', 1],
    ['2026-10-08T23:00:00', '2026-10-02 8h', 1], // jeudi soir : encore la même garde
    ['2026-10-09T08:00:00', '2026-10-09 8h', 2],
    ['2026-10-30T09:00:00', '2026-10-30 8h', 2], // après le passage à l'heure d'hiver (25/10)
    ['2026-09-18T12:00:00', '2026-09-18 8h', 2], // avant la date de référence
    ['2026-10-23T12:00:00', '2026-10-23 8h', 1], // cycle complet
    ['2026-04-03T08:30:00', '2026-04-03 8h', 2], // heure d'été (29/03), 26 semaines avant
  ])('à %s la garde de service a commencé le %s (Garde %i)', (instant, start, garde) => {
    expect(at(instant)).toEqual({ start, garde })
  })

  it("gardeForShift renvoie undefined s'il n'y a aucune garde", () => {
    expect(gardeForShift(new Date(2026, 9, 2, 8), ref, [])).toBeUndefined()
  })

  it('parseDateOnly / toDateOnly font un aller-retour', () => {
    expect(toDateOnly(parseDateOnly('2026-03-29'))).toBe('2026-03-29')
  })

  it("addDays garde l'heure locale malgré le changement d'heure", () => {
    const d = addDays(new Date(2026, 2, 27, 8), 7) // 27/03 → 03/04, passage à l'heure d'été au milieu
    expect([toDateOnly(d), d.getHours()]).toEqual(['2026-04-03', 8])
  })

  it('mondayOf renvoie le lundi 0h de la semaine (dimanche compris)', () => {
    expect(toDateOnly(mondayOf(new Date(2026, 9, 4, 15)))).toBe('2026-09-28') // dimanche
    expect(toDateOnly(mondayOf(new Date(2026, 9, 5)))).toBe('2026-10-05') // lundi
    expect(mondayOf(new Date(2026, 9, 7, 15)).getHours()).toBe(0)
  })
})
