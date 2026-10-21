import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { removeCookie } from '../../utils/getCookie'
import { UserProvider } from './UserProvider'
import { useUser } from './UserContext'

const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '')
const setToken = (payload: object) => (document.cookie = `token=${b64({ alg: 'HS256' })}.${b64(payload)}.sig; path=/`)

function Etat() {
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useUser()
  return (
    <>
      <p>{`${user?.firstname ?? 'personne'} auth=${isAuthenticated} admin=${isAdmin} super=${isSuperAdmin}`}</p>
      <button onClick={logout}>Déconnexion</button>
    </>
  )
}

afterEach(() => removeCookie('token'))

describe('UserProvider', () => {
  it.each([
    ['user', 'admin=false super=false'],
    ['admin', 'admin=true super=false'],
    ['superAdmin', 'admin=true super=true'],
  ])('décode le JWT du cookie : rôle %s → %s', (role, droits) => {
    setToken({ id: 1, firstname: 'Jean', role })
    render(<UserProvider><Etat /></UserProvider>)
    expect(screen.getByText(`Jean auth=true ${droits}`)).toBeInTheDocument()
  })

  it("n'authentifie pas sans cookie ou avec un token illisible", () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    document.cookie = 'token=pas-un-jwt; path=/'
    render(<UserProvider><Etat /></UserProvider>)
    expect(screen.getByText('personne auth=false admin=false super=false')).toBeInTheDocument()
    vi.restoreAllMocks()
  })

  it('logout supprime le cookie et les droits', async () => {
    setToken({ id: 1, firstname: 'Jean', role: 'admin' })
    render(<UserProvider><Etat /></UserProvider>)
    await userEvent.click(screen.getByRole('button', { name: 'Déconnexion' }))
    expect(screen.getByText('personne auth=false admin=false super=false')).toBeInTheDocument()
    expect(document.cookie).not.toContain('token=')
  })
})
