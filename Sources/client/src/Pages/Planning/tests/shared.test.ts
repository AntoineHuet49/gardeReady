import { describe, expect, it, vi } from 'vitest'
import { gardeColor } from '../shared'

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
