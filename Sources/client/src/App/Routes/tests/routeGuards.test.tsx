import { render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it } from 'vitest'
import { removeCookie } from '../../utils/getCookie'
import { makeUser, renderWithProviders } from '../../../test/render'
import { User } from '../../../Types/User'
import PrivateRoute from '../privatesRoutes'
import AdminRoutes from '../adminRoutes'
import SuperAdminRoutes from '../superAdminRoutes'

// JWT non signé (seul le payload est lu côté client)
const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '')
const jwt = (payload: object) => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.signature`

const pages = (guarded: ReactNode) => (
  <Routes>
    <Route path="/" element={<p>Page de connexion</p>} />
    <Route path="/vehicules" element={<p>Liste des véhicules</p>} />
    <Route path="/protegee" element={guarded} />
  </Routes>
)

afterEach(() => removeCookie('token'))

describe('PrivateRoute', () => {
  const renderPrivate = () =>
    render(<MemoryRouter initialEntries={['/protegee']}>{pages(<PrivateRoute><p>Contenu privé</p></PrivateRoute>)}</MemoryRouter>)

  it("redirige vers l'accueil sans cookie token", () => {
    renderPrivate()
    expect(screen.getByText('Page de connexion')).toBeInTheDocument()
    expect(screen.queryByText('Contenu privé')).not.toBeInTheDocument()
  })

  it('affiche la page avec un cookie token', () => {
    document.cookie = `token=${jwt({ id: 1, role: 'user', exp: Math.floor(Date.now() / 1000) + 3600 })}; path=/`
    renderPrivate()
    expect(screen.getByText('Contenu privé')).toBeInTheDocument()
  })

  // BUG: PrivateRoute ne vérifie que la présence du cookie (TODO dans le code) : un JWT expiré ouvre la page,
  // l'utilisateur n'est renvoyé à l'accueil qu'au premier 401 de l'API (intercepteur axios).
  it.fails('redirige vers l\'accueil avec un JWT expiré', () => {
    document.cookie = `token=${jwt({ id: 1, role: 'user', exp: 1 })}; path=/`
    renderPrivate()
    expect(screen.getByText('Page de connexion')).toBeInTheDocument()
  })
})

describe('AdminRoutes / SuperAdminRoutes', () => {
  const renderGuard = (guard: 'admin' | 'superAdmin', user: User | null) =>
    renderWithProviders(
      pages(guard === 'admin' ? <AdminRoutes><p>Tableau de bord</p></AdminRoutes> : <SuperAdminRoutes><p>Zone super admin</p></SuperAdminRoutes>),
      { user, route: '/protegee' },
    )

  it.each([
    ['user', false],
    ['admin', true],
    ['superAdmin', true],
  ] as const)('AdminRoutes avec le rôle %s : accès %s', (role, allowed) => {
    renderGuard('admin', makeUser(role))
    expect(screen.queryByText('Tableau de bord') !== null).toBe(allowed)
    expect(screen.queryByText('Liste des véhicules') !== null).toBe(!allowed)
  })

  it('AdminRoutes redirige un visiteur non connecté vers les véhicules', () => {
    renderGuard('admin', null)
    expect(screen.getByText('Liste des véhicules')).toBeInTheDocument()
  })

  it.each([
    ['admin', false],
    ['superAdmin', true],
  ] as const)('SuperAdminRoutes avec le rôle %s : accès %s', (role, allowed) => {
    renderGuard('superAdmin', makeUser(role))
    expect(screen.queryByText('Zone super admin') !== null).toBe(allowed)
  })
})
