import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import Collapse from '../Collapse'

describe('Collapse', () => {
  const scrollIntoView = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    Element.prototype.scrollIntoView = scrollIntoView
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    scrollIntoView.mockReset()
  })

  const toggle = () => {
    fireEvent.click(screen.getByRole('checkbox', { name: 'Section' }))
    act(() => { vi.advanceTimersByTime(300) })
  }

  it('centre la section ouverte si elle tient dans la fenêtre', () => {
    render(<Collapse title="Section">contenu</Collapse>)
    toggle()
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'center' }))
  })

  it('cale la section en haut si elle est plus haute que la fenêtre', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(window.innerHeight + 1)
    render(<Collapse title="Section">contenu</Collapse>)
    toggle()
    expect(scrollIntoView).toHaveBeenCalledWith(expect.objectContaining({ block: 'start' }))
  })

  it('ne défile pas à la fermeture', () => {
    render(<Collapse title="Section" defaultOpen>contenu</Collapse>)
    toggle()
    expect(scrollIntoView).not.toHaveBeenCalled()
  })
})
