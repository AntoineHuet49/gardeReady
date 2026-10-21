import { act, renderHook, waitFor } from '@testing-library/react'
import { UseMutationResult } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import { uploadSectionPhoto } from '../../App/utils/Api/Sections'
import { mockApi } from '../../test/api'
import { createTestQueryClient, createWrapper, invalidatedKeys } from '../../test/render'
import { useElementMutations } from '../useElementMutations'
import { useSectionMutations } from '../useSectionMutations'
import { useVehiculeMutations } from '../useVehiculeMutations'

// La compression passe par canvas (absent de jsdom) : testée à part dans resizeImage.test.ts
vi.mock('../../App/utils/resizeImage', () => ({
  resizeImage: vi.fn(async () => new Blob(['jpeg'], { type: 'image/jpeg' })),
}))

// Envoi d'un Blob par XHR : sous Node 22 (CI), l'intercepteur MSW + jsdom ne termine jamais la requête.
// L'appel API est donc remplacé ici ; seuls l'enchaînement compression → envoi et les invalidations sont testés.
vi.mock('../../App/utils/Api/Sections', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../App/utils/Api/Sections')>()),
  uploadSectionPhoto: vi.fn(async () => ({ data: {} })),
}))

const useAll = () => ({ ...useElementMutations(), ...useSectionMutations(), ...useVehiculeMutations() })
type Hooks = ReturnType<typeof useAll>

// Toutes les mutations de l'arbre véhicule → sections → équipements rafraîchissent l'écran d'admin
const cases: [keyof Hooks, Parameters<typeof mockApi>[0], string, unknown, string, unknown][] = [
  ['createElementMutation', 'post', '/elements', { name: 'Lance', section_id: 2, quantite: 1 }, '/api/elements', { name: 'Lance', section_id: 2, quantite: 1 }],
  ['updateElementMutation', 'put', '/elements/:id', { id: 5, data: { name: 'Lance', quantite: 2 } }, '/api/elements/5', { name: 'Lance', quantite: 2 }],
  ['deleteElementMutation', 'delete', '/elements/:id', 5, '/api/elements/5', undefined],
  ['createSectionMutation', 'post', '/sections', { name: 'Coffre', vehicule_id: 1 }, '/api/sections', { name: 'Coffre', vehicule_id: 1 }],
  ['updateSectionMutation', 'put', '/sections/:id', { id: 2, data: { name: 'Coffre G' } }, '/api/sections/2', { name: 'Coffre G' }],
  ['moveSectionMutation', 'patch', '/sections/:id/parent', { id: 2, parentSectionId: null }, '/api/sections/2/parent', { parent_section_id: null }],
  ['deleteSectionMutation', 'delete', '/sections/:id', 2, '/api/sections/2', undefined],
  ['createVehiculeMutation', 'post', '/vehicules', { name: 'VSAV' }, '/api/vehicules', { name: 'VSAV' }],
  ['deleteVehiculeMutation', 'delete', '/vehicules/:id', 1, '/api/vehicules/1', undefined],
]

const setup = () => {
  const { queryClient, invalidate } = createTestQueryClient()
  const { result } = renderHook(useAll, { wrapper: createWrapper({ queryClient }) })
  return { result, invalidate }
}

describe('mutations véhicules / sections / équipements', () => {
  it.each(cases)('%s appelle %s %s et invalide ["admin-vehicules"]', async (name, method, path, variables, url, body) => {
    const calls = mockApi(method, path)
    const { result, invalidate } = setup()
    const mutation = () => result.current[name] as UseMutationResult<unknown, Error, unknown>

    act(() => mutation().mutate(variables))

    await waitFor(() => expect(mutation().isSuccess).toBe(true))
    expect(calls).toEqual([{ url, body }])
    expect(invalidatedKeys(invalidate)).toEqual([['admin-vehicules']])
  })

  it('uploadSectionPhotoMutation envoie la photo compressée et invalide aussi ["details"] (écran de vérification)', async () => {
    const { result, invalidate } = setup()

    act(() => result.current.uploadSectionPhotoMutation.mutate({ id: 2, file: new File(['png'], 'p.png', { type: 'image/png' }) }))

    await waitFor(() => expect(result.current.uploadSectionPhotoMutation.isSuccess).toBe(true))
    // C'est le Blob compressé qui est envoyé, pas le PNG d'origine
    expect(uploadSectionPhoto).toHaveBeenCalledWith(2, expect.objectContaining({ type: 'image/jpeg' }))
    expect(invalidatedKeys(invalidate)).toEqual(expect.arrayContaining([['admin-vehicules'], ['details']]))
  })

  it('deleteSectionPhotoMutation invalide ["admin-vehicules"] et ["details"]', async () => {
    mockApi('delete', '/sections/:id/photo')
    const { result, invalidate } = setup()

    act(() => result.current.deleteSectionPhotoMutation.mutate(2))

    await waitFor(() => expect(result.current.deleteSectionPhotoMutation.isSuccess).toBe(true))
    expect(invalidatedKeys(invalidate)).toEqual(expect.arrayContaining([['admin-vehicules'], ['details']]))
  })

  it("n'invalide rien si le déplacement est refusé par l'API", async () => {
    mockApi('patch', '/sections/:id/parent', { error: 'Cycle interdit' }, 400)
    const { result, invalidate } = setup()

    act(() => result.current.moveSectionMutation.mutate({ id: 2, parentSectionId: 3 }))

    await waitFor(() => expect(result.current.moveSectionMutation.isError).toBe(true))
    expect(invalidate).not.toHaveBeenCalled()
  })
})
