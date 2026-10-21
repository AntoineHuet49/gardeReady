import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../test/api'
import { createTestQueryClient, createWrapper, invalidatedKeys } from '../../test/render'
import { useGardeMutations } from '../useGardeMutations'
import { useGardes } from '../useGardes'
import { useGardeRotation } from '../useGardeRotation'

const setup = () => {
  const { queryClient, invalidate } = createTestQueryClient()
  const { result } = renderHook(() => useGardeMutations(), { wrapper: createWrapper({ queryClient }) })
  return { result, invalidate }
}

describe('useGardeMutations', () => {
  it('createGarde envoie la garde et invalide ["gardes"]', async () => {
    const calls = mockApi('post', '/gardes', { id: 3, numero: 3, color: 'Rouge' })
    const { result, invalidate } = setup()

    act(() => result.current.createGarde.mutate({ numero: 3, color: 'Rouge' }))

    await waitFor(() => expect(result.current.createGarde.isSuccess).toBe(true))
    expect(calls).toEqual([{ url: '/api/gardes', body: { numero: 3, color: 'Rouge' } }])
    expect(invalidatedKeys(invalidate)).toEqual([['gardes']])
  })

  it('deleteGarde invalide ["gardes"] ET ["users"] (les utilisateurs référencent la garde)', async () => {
    const calls = mockApi('delete', '/gardes/:id')
    const { result, invalidate } = setup()

    act(() => result.current.deleteGarde.mutate(7))

    await waitFor(() => expect(result.current.deleteGarde.isSuccess).toBe(true))
    expect(calls.map((c) => c.url)).toEqual(['/api/gardes/7'])
    expect(invalidatedKeys(invalidate)).toEqual(expect.arrayContaining([['gardes'], ['users']]))
  })

  it("updateResponsable envoie responsableId (null pour retirer) et invalide ['gardes']", async () => {
    const calls = mockApi('put', '/gardes/:id/responsable', { id: 2 })
    const { result, invalidate } = setup()

    act(() => result.current.updateResponsable.mutate({ id: 2, responsableId: null }))

    await waitFor(() => expect(result.current.updateResponsable.isSuccess).toBe(true))
    expect(calls).toEqual([{ url: '/api/gardes/2/responsable', body: { responsableId: null } }])
    expect(invalidatedKeys(invalidate)).toEqual([['gardes']])
  })

  it("n'invalide rien quand l'API renvoie une erreur", async () => {
    mockApi('delete', '/gardes/:id', { message: 'Garde introuvable' }, 404)
    const { result, invalidate } = setup()

    act(() => result.current.deleteGarde.mutate(99))

    await waitFor(() => expect(result.current.deleteGarde.isError).toBe(true))
    expect(invalidate).not.toHaveBeenCalled()
  })
})

describe('useGardes / useGardeRotation', () => {
  it('useGardes charge la liste des gardes', async () => {
    mockApi('get', '/gardes', [{ id: 1, numero: 1, color: 'Rouge' }])
    const { result } = renderHook(() => useGardes(), { wrapper: createWrapper() })
    await waitFor(() => expect(result.current.gardes).toEqual([{ id: 1, numero: 1, color: 'Rouge' }]))
  })

  it('useGardeRotation renvoie null sans rotation et invalide ["garde-rotation"] après enregistrement', async () => {
    mockApi('get', '/garde-rotation', null)
    const calls = mockApi('put', '/garde-rotation', { id: 1, reference_date: '2026-10-02' })
    const { queryClient, invalidate } = createTestQueryClient()
    const { result } = renderHook(() => useGardeRotation(), { wrapper: createWrapper({ queryClient }) })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.rotation).toBeNull()

    act(() => result.current.updateRotation.mutate('2026-10-02'))

    await waitFor(() => expect(result.current.updateRotation.isSuccess).toBe(true))
    expect(calls[0].body).toEqual({ reference_date: '2026-10-02' })
    expect(invalidatedKeys(invalidate)).toContainEqual(['garde-rotation'])
  })
})
