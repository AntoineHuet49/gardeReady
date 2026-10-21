import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../../../test/api'
import { renderWithProviders } from '../../../../test/render'
import { Vehicule } from '../../../../Types/Vehicule'
import { AdminVehicule as AdminVehicules } from '..'

// VSAV : Cabine > Sac > Trousse, et Coffre à la racine
const vsav: Vehicule = {
  id: 1,
  name: 'VSAV',
  sections: [
    {
      id: 1,
      name: 'Cabine',
      vehicule_id: 1,
      elements: [{ id: 10, name: 'Radio', quantite: 1 }],
      subSections: [
        {
          id: 2,
          name: 'Sac',
          parent_section_id: 1,
          elements: [{ id: 11, name: 'Garrot', quantite: 2 }],
          subSections: [{ id: 3, name: 'Trousse', parent_section_id: 2, elements: [{ id: 12, name: 'Ciseaux', quantite: 1 }] }],
        },
      ],
    },
    { id: 4, name: 'Coffre', vehicule_id: 1, elements: [] },
  ],
}

const setup = () => {
  const getDetails = mockApi('get', '/vehicules/:id', vsav)
  mockApi('get', '/vehicules', [{ id: 1, name: 'VSAV' }])
  renderWithProviders(<AdminVehicules />)
  return { getDetails }
}
// Bloc repliable d'une section (son en-tête est la case à cocher libellée par son nom)
const section = (name: string) => screen.getByRole('checkbox', { name }).closest('.collapse') as HTMLElement
const openMove = async (name: string) => {
  // Le premier bouton du bloc est celui de la section elle-même (les sous-sections suivent)
  await userEvent.click(within(section(name)).getAllByRole('button', { name: '↪ Déplacer' })[0])
  return within(screen.getByRole('heading', { name: 'Déplacer la section' }).closest('dialog') as HTMLElement)
}
const optionLabels = (dialog: Pick<typeof screen, 'getAllByRole'>) =>
  dialog.getAllByRole('option').map((o) => o.textContent?.trim())

describe('AdminVehicules — arbre des sections', () => {
  it('affiche la hiérarchie véhicule → sections → sous-sections → équipements', async () => {
    setup()
    await screen.findByRole('checkbox', { name: 'VSAV' })
    // Les compteurs de la section précèdent ceux de ses sous-sections
    const cabine = within(section('Cabine'))
    expect(cabine.getAllByText(/équipement/)[0]).toHaveTextContent('1 équipement(s)')
    expect(cabine.getAllByText(/sous-section/)[0]).toHaveTextContent('1 sous-section(s)')
    expect(cabine.getByText('Radio')).toBeInTheDocument()
    expect(within(section('Sac')).getByRole('checkbox', { name: 'Trousse' })).toBeInTheDocument()
    expect(within(section('Trousse')).getByText('Ciseaux')).toBeInTheDocument()
    expect(within(section('Coffre')).getByText('Aucun équipement')).toBeInTheDocument()
  })

  it("« Déplacer » propose la racine et les autres sections, sans la section, ses descendantes ni son parent actuel", async () => {
    setup()
    await screen.findByRole('checkbox', { name: 'Sac' })
    const dialog = await openMove('Sac')

    expect(dialog.getByText('Sac')).toBeInTheDocument()
    expect(optionLabels(dialog)).toEqual(['Choisir une destination…', 'Racine du véhicule', 'Coffre'])
    expect(dialog.getByRole('button', { name: 'Déplacer' })).toBeDisabled()
  })

  it("ne propose pas la racine pour une section déjà à la racine", async () => {
    setup()
    await screen.findByRole('checkbox', { name: 'Cabine' })
    const dialog = await openMove('Cabine')
    expect(optionLabels(dialog)).toEqual(['Choisir une destination…', 'Coffre'])
  })

  it("déplace la section vers la destination choisie puis recharge l'arbre", async () => {
    const { getDetails } = setup()
    const calls = mockApi('patch', '/sections/:id/parent')
    await screen.findByRole('checkbox', { name: 'Trousse' })
    const dialog = await openMove('Trousse')

    await userEvent.selectOptions(dialog.getByRole('combobox'), 'Racine du véhicule')
    await userEvent.click(dialog.getByRole('button', { name: 'Déplacer' }))

    await waitFor(() => expect(calls).toEqual([{ url: '/api/sections/3/parent', body: { parent_section_id: null } }]))
    await waitFor(() => expect(getDetails.length).toBe(2)) // invalidation de ["admin-vehicules"]
  })

  it('déplace vers une autre section avec son id', async () => {
    setup()
    const calls = mockApi('patch', '/sections/:id/parent')
    await screen.findByRole('checkbox', { name: 'Sac' })
    const dialog = await openMove('Sac')

    await userEvent.selectOptions(dialog.getByRole('combobox'), 'Coffre')
    await userEvent.click(dialog.getByRole('button', { name: 'Déplacer' }))

    await waitFor(() => expect(calls).toEqual([{ url: '/api/sections/2/parent', body: { parent_section_id: 4 } }]))
  })

  it('renomme le véhicule puis recharge la liste', async () => {
    const { getDetails } = setup()
    const calls = mockApi('put', '/vehicules/:id')
    await screen.findByRole('checkbox', { name: 'Trousse' })

    await userEvent.click(screen.getByTitle('Renommer ce véhicule'))
    const input = await screen.findByDisplayValue('VSAV')
    await userEvent.clear(input)
    await userEvent.type(input, 'VSAV 2')
    await userEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))

    await waitFor(() => expect(calls).toEqual([{ url: '/api/vehicules/1', body: { name: 'VSAV 2' } }]))
    await waitFor(() => expect(getDetails.length).toBe(2))
  })
})
