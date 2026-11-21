import { describe, expect, it } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { renderWithProviders } from '../../../test/render'
import AddVehiculeModal from '../AddVehiculeModal'

describe('AddVehiculeModal', () => {
  it('garde la saisie quand le parent repasse un nouvel objet véhicule identique (refetch)', () => {
    const { rerender } = renderWithProviders(
      <AddVehiculeModal isOpen onClose={() => {}} vehicule={{ id: 1, name: 'VSAV01' }} />,
    )
    fireEvent.change(screen.getByPlaceholderText('Ex: VSAV01, FPT01'), { target: { value: 'VSAV02' } })

    rerender(<AddVehiculeModal isOpen onClose={() => {}} vehicule={{ id: 1, name: 'VSAV01' }} />)

    expect(screen.getByPlaceholderText('Ex: VSAV01, FPT01')).toHaveValue('VSAV02')
  })
})
