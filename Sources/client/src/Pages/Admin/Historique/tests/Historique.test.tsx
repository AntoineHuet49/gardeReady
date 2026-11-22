import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../../../test/api'
import { renderWithProviders } from '../../../../test/render'
import { Historique } from '..'

const item = (id: number, status: string) => ({
  id,
  created_at: '2026-10-02T08:30:00.000Z',
  vehicule: { id: 1, name: 'VSAV' },
  user: { id: 2, firstname: 'Bob', lastname: 'Agent' },
  garde: { id: 10, numero: 1 },
  mail_envoye: status === 'OK',
  results: [{ element: '2 Thermomètre', status, comment: status === 'KO' ? 'pile HS' : '' }],
})

describe('Historique', () => {
  it('liste les vérifications avec véhicule, agent, garde et nombre de KO', async () => {
    mockApi('get', '/vehicules/verifications', [item(2, 'KO'), item(1, 'OK')])
    renderWithProviders(<Historique />)
    expect(await screen.findByText('1 KO')).toBeInTheDocument()
    expect(screen.getByText('Tout OK')).toBeInTheDocument()
    expect(screen.getAllByText('VSAV')).toHaveLength(2)
    expect(screen.getAllByText(/Bob Agent · Garde 1/)).toHaveLength(2)
    expect(screen.getByText('pile HS')).toBeInTheDocument()
    expect(screen.getAllByText('e-mail non envoyé')).toHaveLength(1) // seule la vérification KO du jeu de test
    expect(screen.getAllByText('Télécharger le PDF', { exact: false })).toHaveLength(2)
  })

  it('affiche un message quand il n’y a rien', async () => {
    mockApi('get', '/vehicules/verifications', [])
    renderWithProviders(<Historique />)
    expect(await screen.findByText('Aucune vérification enregistrée.')).toBeInTheDocument()
  })
})
