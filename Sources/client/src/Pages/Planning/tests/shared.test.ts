import { describe, expect, it, vi } from 'vitest'
import { canAssignVehicules, gardeColor } from '../shared'
import type { Garde } from '../../../Types/Garde'

describe('gardeColor', () => {
  it('traduit les couleurs françaises, sans tenir compte de la casse, des accents ni des espaces', () => {
    expect(gardeColor('Rouge')).toBe('#dc2626')
    expect(gardeColor(' VERTE ')).toBe('#16a34a')
    expect(gardeColor('Bleue')).toBe('#2563eb')
  })

  it('laisse passer une couleur CSS valide et remplace une valeur inconnue par du gris', () => {
    // jsdom n'implémente pas CSS.supports : on simule le navigateur
    const supports = vi.spyOn(CSS, 'supports').mockImplementation((_p: string, v?: string) => v === '#123456')
    expect(gardeColor('#123456')).toBe('#123456')
    expect(gardeColor('Arc-en-ciel')).toBe('#6b7280')
    supports.mockRestore()
  })
})

describe('canAssignVehicules', () => {
  const garde = { id: 1, numero: 1, color: 'Rouge', responsable: 5, users: [{ id: 5 }, { id: 6 }] } as unknown as Garde

  it.each([
    [{ id: 99, role: 'superAdmin' }, true],
    [{ id: 6, role: 'admin' }, true],
    [{ id: 5, role: 'user' }, true],
    [{ id: 7, role: 'admin' }, false],
    [{ id: 6, role: 'user' }, false],
    [null, false],
  ])('%j -> %s', (user, expected) => {
    expect(canAssignVehicules(user, garde)).toBe(expected)
  })
})
