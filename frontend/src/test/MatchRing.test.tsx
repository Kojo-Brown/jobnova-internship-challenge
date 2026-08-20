import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MatchRing, ringColor } from '../components/MatchRing'

describe('ringColor', () => {
  it('uses lime for strong matches (>= 90)', () => {
    expect(ringColor(93)).toBe('#a3e635')
    expect(ringColor(90)).toBe('#a3e635')
  })

  it('uses yellow-green for good matches (75–89)', () => {
    expect(ringColor(82)).toBe('#bdd932')
  })

  it('uses amber for moderate matches (< 75)', () => {
    expect(ringColor(64)).toBe('#fbbf24')
  })
})

describe('MatchRing', () => {
  it('renders the score and an accessible label', () => {
    render(<MatchRing score={93} />)
    expect(screen.getByRole('img', { name: '93% match' })).toBeInTheDocument()
    expect(screen.getByText('93%')).toBeInTheDocument()
    expect(screen.getByText('Match')).toBeInTheDocument()
  })

  it('clamps out-of-range scores', () => {
    render(<MatchRing score={140} />)
    expect(screen.getByRole('img', { name: '100% match' })).toBeInTheDocument()
  })
})
