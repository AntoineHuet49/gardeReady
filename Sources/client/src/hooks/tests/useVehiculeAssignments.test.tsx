import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { mockApi } from '../../test/api'
import { createTestQueryClient, createWrapper, invalidatedKeys } from '../../test/render'
import { server } from '../../test/server'
import { useReplaceWeekAssignments, useVehiculeAssignments } from '../useVehiculeAssignments'

describe('useVehiculeAssignments', () => {
  it('demande la période from/to et renvoie [] avant réponse', async () => {
    let params = ''
    server.use(
      http.get('*/api/vehicule-assignments', ({ request }) => {
        params = new URL(request.url).search
        return HttpResponse.json([{ id: 1 }])
      }),
    )
    const { result } = renderHook(() => useVehiculeAssignments('2026-10-02', '2026-10-30'), { wrapper: createWrapper() })

    expect(result.current.assignments).toEqual([])
    await waitFor(() => expect(result.current.assignments).toEqual([{ id: 1 }]))
    expect(params).toBe('?from=2026-10-02&to=2026-10-30')
  })

  it("n'appelle pas l'API quand enabled vaut false", () => {
    // onUnhandledRequest: 'error' ferait échouer le test en cas d'appel
    const { result } = renderHook(() => useVehiculeAssignments('2026-10-02', '2026-10-30', false), { wrapper: createWrapper() })
    expect(result.current.isLoading).toBe(false)
  })

  it('useReplaceWeekAssignments remplace la semaine et invalide ["vehicule-assignments"]', async () => {
    const calls = mockApi('put', '/vehicule-assignments/:date', [])
    const { queryClient, invalidate } = createTestQueryClient()
    const { result } = renderHook(() => useReplaceWeekAssignments(), { wrapper: createWrapper({ queryClient }) })
    const assignments = [{ vehicule_id: 1, user_ids: [2, 3] }]

    act(() => result.current.mutate({ shiftDate: '2026-10-02', assignments }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(calls).toEqual([{ url: '/api/vehicule-assignments/2026-10-02', body: { assignments } }])
    expect(invalidatedKeys(invalidate)).toEqual([['vehicule-assignments']])
  })
})
