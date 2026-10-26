import { screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { makeUser, renderWithProviders } from '../../../test/render'
import { User } from '../../../Types/User'
import PrivateRoute from '../privatesRoutes'
import AdminRoutes from '../adminRoutes'
import SuperAdminRoutes from '../superAdminRoutes'

const pages = (guarded: ReactNode) => (
  <Routes>
    <Route path="/" element={<p>Page de connexion</p>} />
    <Route path="/vehicules" element={<p>Liste des véhicules</p>} />
    <Route path="/protegee" element={guarded} />
  </Routes>
)

describe('PrivateRoute', () => {
  const renderPrivate = (user: User | null) =>
    renderWithProviders(pages(<PrivateRoute><p>Contenu privé</p></PrivateRoute>), { user, route: '/protegee' })

  it("redirige vers l'accueil sans session", () => {
    renderPrivate(null)
    expect(screen.getByText('Page de connexion')).toBeInTheDocument()
    expect(screen.queryByText('Contenu privé')).not.toBeInTheDocument()
  })

  it('affiche la page avec une session', () => {
    renderPrivate(makeUser('user'))
    expect(screen.getByText('Contenu privé')).toBeInTheDocument()
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
