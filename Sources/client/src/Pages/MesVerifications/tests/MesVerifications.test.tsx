import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { mockApi } from '../../../test/api'
import { renderWithProviders } from '../../../test/render'
import * as Api from '../../../App/utils/Api/Verifications'
import { MesVerifications } from '..'

const item = (id: number, mail_envoye: boolean) => ({
  id,
  created_at: '2026-10-02T08:30:00.000Z',
  vehicule: { id: 1, name: 'VSAV' },
  user: { id: 2, firstname: 'Bob', lastname: 'Agent' },
  garde: { id: 10, numero: 1 },
  mail_envoye,
  results: [{ element: '2 Thermomètre', status: 'KO', comment: 'pile HS' }],
})

describe('MesVerifications', () => {
  it('liste mes vérifications, signale l’e-mail non envoyé et permet de télécharger le PDF', async () => {
    mockApi('get', '/vehicules/verifications/mine', [item(2, false), item(1, true)])
    const download = vi.spyOn(Api, 'downloadVerificationPdf').mockResolvedValue()
    renderWithProviders(<MesVerifications />)

    expect(await screen.findAllByText('VSAV')).toHaveLength(2)
    expect(screen.getAllByText('e-mail non envoyé')).toHaveLength(1)
    await userEvent.click(screen.getAllByRole('button', { name: 'Télécharger le PDF', hidden: true })[0])
    expect(download).toHaveBeenCalledWith(2)
  })

  it('affiche un message quand il n’y a rien', async () => {
    mockApi('get', '/vehicules/verifications/mine', [])
    renderWithProviders(<MesVerifications />)
    expect(await screen.findByText('Aucune vérification enregistrée.')).toBeInTheDocument()
  })
})
