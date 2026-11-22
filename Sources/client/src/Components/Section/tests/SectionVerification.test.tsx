import { describe, expect, it, vi } from 'vitest'
import { render } from '@testing-library/react'
import SectionVerification from '../SectionVerification'

vi.mock('../../Input/VerificationInput', () => ({ default: () => <div /> }))
vi.mock('../SectionPhotoButton', () => ({ default: () => null }))

describe('SectionVerification', () => {
  it("n'émet ni console.log ni warning de key en rendant plusieurs éléments", () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {})
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const section = {
      id: 1,
      name: 'Section',
      elements: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
    }
    /* eslint-disable @typescript-eslint/no-explicit-any */
    render(<SectionVerification section={section as any} register={vi.fn() as any} watch={vi.fn() as any} />)
    /* eslint-enable @typescript-eslint/no-explicit-any */
    expect(log).not.toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })
})
