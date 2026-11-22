import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { makeUser, renderWithProviders } from '../../../test/render'
import AppLayout from '../AppLayout'

describe('AppLayout', () => {
  it('affiche le lien Admin pour un admin, sans le masquer sur mobile', () => {
    renderWithProviders(<AppLayout title="t">x</AppLayout>, { user: makeUser('admin') })
    expect(screen.getByRole('link', { name: 'Admin' }).className).not.toContain('hidden')
  })

  it("n'affiche pas le lien Admin pour un utilisateur simple", () => {
    renderWithProviders(<AppLayout title="t">x</AppLayout>, { user: makeUser('user') })
    expect(screen.queryByRole('link', { name: 'Admin' })).not.toBeInTheDocument()
  })
})
