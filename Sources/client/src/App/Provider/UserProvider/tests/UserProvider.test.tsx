import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../../../test/api'
import { makeUser } from '../../../../test/render'
import { UserProvider } from '../UserProvider'
import { useUser } from '../UserContext'

function Etat() {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useUser()
  return (
    <>
      <p>{`${user?.firstname ?? 'personne'} auth=${isAuthenticated} admin=${isAdmin} super=${isSuperAdmin}`}</p>
      <button onClick={logout}>Déconnexion</button>
    </>
  )
}

describe('UserProvider', () => {
  it.each([
    ['user', 'admin=false super=false'],
    ['admin', 'admin=true super=false'],
    ['superAdmin', 'admin=true super=true'],
  ] as const)('lit la session via /auth/me : rôle %s → %s', async (role, droits) => {
    mockApi('get', '/auth/me', makeUser(role, { firstname: 'Jean' }))
    render(<UserProvider><Etat /></UserProvider>)
    expect(await screen.findByText(`Jean auth=true ${droits}`)).toBeInTheDocument()
  })

  it("n'authentifie pas quand /auth/me renvoie 401", async () => {
    mockApi('get', '/auth/me', {}, 401)
    render(<UserProvider><Etat /></UserProvider>)
    expect(await screen.findByText('personne auth=false admin=false super=false')).toBeInTheDocument()
  })

  it('logout appelle le serveur et retire les droits', async () => {
    mockApi('get', '/auth/me', makeUser('admin', { firstname: 'Jean' }))
    const calls = mockApi('post', '/auth/logout')
    render(<UserProvider><Etat /></UserProvider>)
    await userEvent.click(await screen.findByRole('button', { name: 'Déconnexion' }))
    expect(await screen.findByText('personne auth=false admin=false super=false')).toBeInTheDocument()
    expect(calls).toHaveLength(1)
  })
})
