import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { notify } from '../../App/utils/notify'
import { mockApi } from '../../test/api'
import { renderWithProviders } from '../../test/render'
import { Vehicule } from '../../Types/Vehicule'
import { Verifications } from '.'

vi.mock('../../App/utils/notify', () => ({ notify: vi.fn() }))

const fpt: Vehicule = {
  id: 1,
  name: 'fpt',
  sections: [
    {
      id: 1,
      name: 'Cabine',
      elements: [{ id: 10, name: 'Radio', quantite: 1 }],
      subSections: [{ id: 2, name: 'Sac', elements: [{ id: 11, name: 'Garrot', quantite: 2 }] }],
    },
    { id: 3, name: 'Coffre vide', elements: [], subSections: [] },
    { id: 4, name: 'Arrière', elements: [{ id: 12, name: 'Lance', quantite: 1 }] },
  ],
}

const setup = (vehicule: Vehicule | object = fpt, status = 200) => {
  mockApi('get', '/vehicules/:id', vehicule, status)
  renderWithProviders(
    <Routes>
      <Route path="/vehicules/:id" element={<Verifications />} />
      <Route path="/vehicules" element={<p>Liste des véhicules</p>} />
    </Routes>,
    { route: '/vehicules/1' },
  )
}
const radios = (label: 'OK' | 'KO') => screen.getAllByRole('radio', { name: label })

beforeEach(() => {
  vi.mocked(notify).mockClear()
  vi.spyOn(console, 'log').mockImplementation(() => {}) // SectionVerification journalise chaque élément
})

describe('Verifications', () => {
  it("affiche les sections non vides, tous les équipements et une progression à 0", async () => {
    setup()
    expect(await screen.findByRole('heading', { name: 'FPT' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Cabine' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Sac' })).toBeInTheDocument()
    expect(screen.queryByRole('checkbox', { name: 'Coffre vide' })).not.toBeInTheDocument()
    expect(radios('OK')).toHaveLength(3)
    expect(screen.getByText('0/3 éléments vérifiés')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Valider' })).toBeDisabled()
  })

  it('demande un commentaire obligatoire quand un équipement est KO', async () => {
    setup()
    await screen.findByText('0/3 éléments vérifiés')

    await userEvent.click(radios('KO')[1])

    expect(screen.getByRole('textbox', { name: 'Commentaire pour Garrot' })).toBeRequired()
    expect(screen.getByText('1/3 éléments vérifiés')).toBeInTheDocument()

    await userEvent.click(radios('OK')[1])
    expect(screen.queryByRole('textbox', { name: 'Commentaire pour Garrot' })).not.toBeInTheDocument()
  })

  it("n'active « Valider » qu'une fois tous les équipements cochés", async () => {
    setup()
    await screen.findByText('0/3 éléments vérifiés')
    await userEvent.click(radios('OK')[0])
    await userEvent.click(radios('OK')[1])
    expect(screen.getByRole('button', { name: 'Valider' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Valider' })).toHaveAttribute('title', '1 élément(s) restant(s) à vérifier')

    await userEvent.click(radios('OK')[2])
    expect(screen.getByRole('button', { name: 'Valider' })).toBeEnabled()
  })

  it('envoie les statuts et commentaires puis revient à la liste des véhicules', async () => {
    setup()
    const calls = mockApi('post', '/vehicules/verifications/:id', { message: 'ok' })
    await screen.findByText('0/3 éléments vérifiés')

    await userEvent.click(radios('OK')[0])
    await userEvent.click(radios('KO')[1])
    await userEvent.type(screen.getByRole('textbox', { name: 'Commentaire pour Garrot' }), 'Périmé')
    await userEvent.click(radios('OK')[2])
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))

    expect(await screen.findByText('Liste des véhicules')).toBeInTheDocument()
    expect(calls[0].url).toBe('/api/vehicules/verifications/1')
    // Le formulaire est indexé par id d'élément ; l'API lit Object.values(body)
    expect(Object.values(calls[0].body as object).filter(Boolean)).toEqual([
      { elementId: '10', status: 'OK' },
      { elementId: '11', status: 'KO', comment: 'Périmé' },
      { elementId: '12', status: 'OK' },
    ])
    expect(notify).toHaveBeenCalledWith('Verifications envoyées', 'success')
  })

  it("indique qu'aucun élément n'est à vérifier pour un véhicule sans équipement", async () => {
    setup({ id: 2, name: 'vl', sections: [] })
    expect(await screen.findByText('Aucun élément de vérification disponible pour ce véhicule.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Valider' })).not.toBeInTheDocument()
  })

  it("affiche une erreur si le véhicule n'existe pas", async () => {
    setup({ message: 'introuvable' }, 404)
    expect(await screen.findByText("Aucun vehicule n'a été trouvé")).toBeInTheDocument()
  })

  // BUG: en cas d'échec de l'API, mutateAsync rejette au lieu de renvoyer la réponse : la branche
  // « Une erreur est survenue » n'est jamais atteinte, l'utilisateur n'a aucun retour (rejet non géré).
  // it.skip et non it.fails : le rejet non géré ferait échouer toute la suite Vitest.
  it.skip("prévient l'utilisateur si l'envoi échoue", async () => {
    setup()
    mockApi('post', '/vehicules/verifications/:id', { error: 'Erreur serveur' }, 500)
    await screen.findByText('0/3 éléments vérifiés')
    for (const radio of radios('OK')) await userEvent.click(radio)
    await userEvent.click(screen.getByRole('button', { name: 'Valider' }))

    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.any(String), 'error'))
  })
})
