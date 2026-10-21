import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { vi } from 'vitest'
import { UserContext } from '../App/Provider/UserProvider/UserContext'
import { User } from '../Types/User'

export const makeUser = (role: User['role'] = 'admin', overrides: Partial<User> = {}): User => ({
  id: 1,
  email: 'moi@sdis49.fr',
  firstname: 'Jean',
  lastname: 'Moi',
  role,
  garde_id: 1,
  ...overrides,
})

// QueryClient sans retry (une erreur MSW doit échouer tout de suite) + espion sur les invalidations
export const createTestQueryClient = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
  return { queryClient, invalidate }
}

type Options = { user?: User | null; route?: string; queryClient?: QueryClient }

// Providers de l'app : TanStack Query, utilisateur connecté (sans passer par le cookie JWT) et routeur
export const createWrapper = ({ user = makeUser(), route = '/', queryClient = createTestQueryClient().queryClient }: Options = {}) =>
  function Wrapper({ children }: { children: ReactNode }) {
    const value = {
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin' || user?.role === 'superAdmin',
      isSuperAdmin: user?.role === 'superAdmin',
      logout: () => {},
      refreshUser: () => ({ isAdmin: false, isSuperAdmin: false, user }),
    }
    return (
      <QueryClientProvider client={queryClient}>
        <UserContext.Provider value={value}>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </UserContext.Provider>
      </QueryClientProvider>
    )
  }

export const renderWithProviders = (ui: ReactNode, options: Options = {}) => {
  const queryClient = options.queryClient ?? createTestQueryClient().queryClient
  return { queryClient, ...render(ui, { wrapper: createWrapper({ ...options, queryClient }) }) }
}

// Clés passées à queryClient.invalidateQueries, dans l'ordre
export const invalidatedKeys = (invalidate: ReturnType<typeof createTestQueryClient>['invalidate']) =>
  invalidate.mock.calls.map(([filters]) => filters?.queryKey)
