import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../../test/api'
import { makeUser, renderWithProviders } from '../../../test/render'
import { Kilometrage } from '..'

const vehicules = [{ id: 1, name: 'fpt' }]
const history = [{ id: 5, vehicule_id: 1, kilometrage: 12040, motif: 'Manœuvre', created_at: '2026-10-05T10:00:00Z', user: { id: 2, firstname: 'Bob', lastname: 'Agent' } }]

describe('Kilometrage', () => {
  it('un agent enregistre un relevé et ne voit pas l’historique', async () => {
    mockApi('get', '/vehicules', vehicules)
    const calls = mockApi('post', '/vehicules/:id/kilometrages', {}, 201)
    renderWithProviders(<Kilometrage />, { user: makeUser('user') })

    await screen.findByRole('option', { name: 'FPT' })
    await userEvent.selectOptions(screen.getByLabelText('Véhicule'), '1')
    await userEvent.type(screen.getByLabelText('Kilométrage (km)'), '12000')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    await waitFor(() => expect(calls).toHaveLength(1))
    expect(calls[0]).toEqual({ url: '/api/vehicules/1/kilometrages', body: { kilometrage: 12000 } })
    expect(screen.queryByRole('heading', { name: 'Historique' })).not.toBeInTheDocument()
  })

  it('un admin voit l’historique du véhicule choisi', async () => {
    mockApi('get', '/vehicules', vehicules)
    mockApi('get', '/vehicules/:id/kilometrages', history)
    renderWithProviders(<Kilometrage />, { user: makeUser('admin') })

    await screen.findByRole('option', { name: 'FPT' })
    await userEvent.selectOptions(screen.getByLabelText('Véhicule'), '1')
    expect(await screen.findByText('Bob Agent')).toBeInTheDocument()
    expect(screen.getByText('Manœuvre')).toBeInTheDocument()
  })
})
