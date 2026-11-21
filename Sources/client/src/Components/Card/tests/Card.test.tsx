import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Card from '../Card'

describe('Card', () => {
  it('indique "Seul" quand aucun collègue n\'est assigné', () => {
    render(<Card name="FPT" onClick={() => {}} highlighted colleagues={[]} />)
    expect(screen.getByText('Seul')).toBeInTheDocument()
  })

  it('liste les collègues assignés au même véhicule', () => {
    render(<Card name="FPT" onClick={() => {}} highlighted colleagues={['Jean Dupont', 'Léa Martin']} />)
    expect(screen.getByText('Avec Jean Dupont, Léa Martin')).toBeInTheDocument()
  })

  it('n\'affiche rien sur un véhicule non assigné', () => {
    render(<Card name="FPT" onClick={() => {}} />)
    expect(screen.queryByText('Seul')).not.toBeInTheDocument()
  })
})
