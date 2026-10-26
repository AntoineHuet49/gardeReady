import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../../../test/api'
import { makeUser, renderWithProviders } from '../../../../test/render'
import { User } from '../../../../Types/User'
import { GardesUsers } from '..'

const gardes = [
  { id: 30, numero: 3, color: 'Vert' },
  { id: 10, numero: 1, color: 'Rouge', responsableUser: { id: 2, firstname: 'Alice', lastname: 'Martin', email: 'alice@sdis49.fr' } },
  { id: 20, numero: 2, color: 'Bleu' },
]
const user = (id: number, firstname: string, role: User['role'], garde_id: number | null) =>
  ({ id, firstname, lastname: 'Martin', email: `${firstname.toLowerCase()}@sdis49.fr`, role, garde_id }) as User
const users = [
  user(2, 'Alice', 'user', 10),
  user(3, 'Bob', 'superAdmin', 10),
  user(4, 'Chloé', 'admin', 20),
  user(5, 'Dan', 'user', null),
]

const setup = (role: User['role'] = 'admin') => {
  const getGardes = mockApi('get', '/gardes', gardes)
  const getUsers = mockApi('get', '/users', users)
  renderWithProviders(<GardesUsers />, { user: makeUser(role, { id: 99 }) })
  return { getGardes, getUsers }
}
// Le nom apparaît aussi dans la liste déroulante du responsable : on vise la ligne du membre
const member = { selector: 'span' }
const card = (title: string | RegExp) => screen.getByRole('heading', { name: title }).closest('.card') as HTMLElement

describe('GardesUsers', () => {
  it('affiche une carte par garde, triées par numero', async () => {
    setup()
    await screen.findByRole('heading', { name: 'Garde 1' })
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual(['Garde 1', 'Garde 2', 'Garde 3'])
  })

  it('regroupe les membres dans la carte de leur garde, avec le responsable', async () => {
    setup()
    await screen.findByRole('heading', { name: 'Garde 1' })
    const garde1 = within(card('Garde 1'))
    expect(garde1.getByText('Alice Martin', member)).toBeInTheDocument()
    expect(garde1.getByText('Responsable', { selector: '.badge' })).toBeInTheDocument()
    expect(garde1.getByLabelText('Responsable :')).toHaveValue('2')
    expect(within(card('Garde 2')).getByText('Chloé Martin', member)).toBeInTheDocument()
    expect(within(card('Garde 3')).getByText('Aucun membre dans cette garde')).toBeInTheDocument()
  })

  it('liste les utilisateurs sans garde dans la carte « non assignés »', async () => {
    setup()
    await screen.findByRole('heading', { name: /non assignés/ })
    const nonAssignes = within(card(/non assignés/))
    await nonAssignes.findByText(/Dan Martin/)
    expect(nonAssignes.queryByText(/Alice/)).not.toBeInTheDocument()
  })

  it('masque les superAdmin à un admin', async () => {
    setup('admin')
    await screen.findByText('Alice Martin', member)
    expect(screen.queryByText('Bob Martin')).not.toBeInTheDocument()
    expect(within(card('Garde 1')).getByText('Membres (1) :')).toBeInTheDocument()
    expect(within(card('Garde 1')).queryByRole('option', { name: 'Bob Martin' })).not.toBeInTheDocument()
  })

  it('affiche les superAdmin à un superAdmin', async () => {
    setup('superAdmin')
    await screen.findByText('Bob Martin', member)
    expect(within(card('Garde 1')).getByText('Membres (2) :')).toBeInTheDocument()
  })

  it('supprime une garde après confirmation puis recharge gardes et utilisateurs', async () => {
    const { getGardes, getUsers } = setup()
    const deleteCalls = mockApi('delete', '/gardes/:id')
    await screen.findByText('Chloé Martin', member)

    await userEvent.click(within(card('Garde 2')).getByTitle('Supprimer cette garde'))
    const dialog = within(card('Garde 2')).getByText(/supprimer la Garde 2/).closest('dialog') as HTMLElement
    await userEvent.click(within(dialog).getByRole('button', { name: 'Supprimer' }))

    await waitFor(() => expect(deleteCalls.map((c) => c.url)).toEqual(['/api/gardes/20']))
    await waitFor(() => {
      expect(getGardes.length).toBeGreaterThanOrEqual(2)
      expect(getUsers.length).toBe(2)
    })
  })

  it('change le responsable via la liste déroulante', async () => {
    setup()
    const calls = mockApi('put', '/gardes/:id/responsable', {})
    await screen.findByText('Chloé Martin', member)

    await userEvent.selectOptions(within(card('Garde 2')).getByLabelText('Responsable :'), 'Chloé Martin')

    await waitFor(() => expect(calls).toEqual([{ url: '/api/gardes/20/responsable', body: { responsableId: 4 } }]))
  })

  it("n'affiche pas le bouton de suppression sur son propre compte", async () => {
    mockApi('get', '/gardes', gardes)
    mockApi('get', '/users', users)
    renderWithProviders(<GardesUsers />, { user: makeUser('admin', { id: 2 }) })
    await screen.findByText('Alice Martin', member)
    const alice = screen.getByText('Alice Martin', member).closest('li') as HTMLElement
    expect(within(alice).queryByTitle('Supprimer cet utilisateur')).not.toBeInTheDocument()
    const chloe = screen.getByText('Chloé Martin', member).closest('li') as HTMLElement
    expect(within(chloe).getByTitle('Supprimer cet utilisateur')).toBeInTheDocument()
  })

  it('glisser un membre sur la carte « non assignés » le retire de sa garde', async () => {
    setup()
    const calls = mockApi('patch', '/users/:id/garde')
    await screen.findByText('Alice Martin', member)

    fireEvent.drop(card(/non assignés/), { dataTransfer: { getData: () => '2' } })

    await waitFor(() => expect(calls).toEqual([{ url: '/api/users/2/garde', body: { garde_id: null } }]))
  })

  it('masque aussi les superAdmin sans garde à un admin', async () => {
    mockApi('get', '/gardes', gardes)
    mockApi('get', '/users', [...users, user(6, 'Eve', 'superAdmin', null)])
    renderWithProviders(<GardesUsers />, { user: makeUser('admin', { id: 99 }) })
    await screen.findByText(/Dan Martin/)
    expect(screen.queryByText(/Eve Martin/)).not.toBeInTheDocument()
  })
})
