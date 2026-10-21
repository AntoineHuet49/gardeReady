import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../test/api'
import { createTestQueryClient, createWrapper, invalidatedKeys } from '../../test/render'
import { useAuthMutations } from '../useAuthMutations'

const setup = () => {
  const { queryClient, invalidate } = createTestQueryClient()
  const { result } = renderHook(() => useAuthMutations(), { wrapper: createWrapper({ queryClient }) })
  return { result, invalidate }
}

describe('useAuthMutations', () => {
  it('updateRoleMutation envoie le rôle et invalide ["users"]', async () => {
    const calls = mockApi('patch', '/users/:id/role')
    const { result, invalidate } = setup()

    act(() => result.current.updateRoleMutation.mutate({ userId: 4, role: 'admin' }))

    await waitFor(() => expect(result.current.updateRoleMutation.isSuccess).toBe(true))
    expect(calls).toEqual([{ url: '/api/users/4/role', body: { role: 'admin' } }])
    expect(invalidatedKeys(invalidate)).toEqual([['users']])
  })

  it('updateUserMutation envoie les infos et invalide ["users"]', async () => {
    const data = { email: 'a@b.fr', firstname: 'A', lastname: 'B' }
    const calls = mockApi('put', '/users/:id')
    const { result, invalidate } = setup()

    act(() => result.current.updateUserMutation.mutate({ userId: 4, data }))

    await waitFor(() => expect(result.current.updateUserMutation.isSuccess).toBe(true))
    expect(calls).toEqual([{ url: '/api/users/4', body: data }])
    expect(invalidatedKeys(invalidate)).toEqual([['users']])
  })

  it('updateGardeMutation (désassignation) envoie garde_id null et invalide ["users"] et ["gardes"]', async () => {
    const calls = mockApi('patch', '/users/:id/garde')
    const { result, invalidate } = setup()

    act(() => result.current.updateGardeMutation.mutate({ userId: 4, gardeId: null }))

    await waitFor(() => expect(result.current.updateGardeMutation.isSuccess).toBe(true))
    expect(calls).toEqual([{ url: '/api/users/4/garde', body: { garde_id: null } }])
    expect(invalidatedKeys(invalidate)).toEqual(expect.arrayContaining([['users'], ['gardes']]))
  })

  it('deleteUserMutation invalide ["users"] et ["gardes"] (le responsable peut disparaître)', async () => {
    const calls = mockApi('delete', '/users/:id')
    const { result, invalidate } = setup()

    act(() => result.current.deleteUserMutation.mutate(4))

    await waitFor(() => expect(result.current.deleteUserMutation.isSuccess).toBe(true))
    expect(calls.map((c) => c.url)).toEqual(['/api/users/4'])
    expect(invalidatedKeys(invalidate)).toEqual(expect.arrayContaining([['users'], ['gardes']]))
  })

  it('loginMutation envoie email et mot de passe', async () => {
    const calls = mockApi('post', '/auth/login', { message: 'ok' })
    const { result } = setup()

    act(() => result.current.loginMutation.mutate({ email: 'a@b.fr', password: 'secret' }))

    await waitFor(() => expect(result.current.loginMutation.isSuccess).toBe(true))
    expect(calls[0].body).toMatchObject({ email: 'a@b.fr', password: 'secret' })
  })
})
