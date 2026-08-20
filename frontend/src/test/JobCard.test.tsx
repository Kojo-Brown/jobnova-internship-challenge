import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobCard } from '../components/JobCard'
import { jobs } from '../data/jobs'

const job = jobs[0]

function renderCard(overrides: Partial<Parameters<typeof JobCard>[0]> = {}) {
  const handlers = {
    onOpen: vi.fn(),
    onToggleLike: vi.fn(),
    onApply: vi.fn(),
    onMockInterview: vi.fn(),
    onShare: vi.fn(),
  }
  render(<JobCard job={job} liked={false} applied={false} {...handlers} {...overrides} />)
  return handlers
}

describe('JobCard', () => {
  it('shows title, company, location and salary tag', () => {
    renderCard()
    expect(screen.getByText('Web Application Developer')).toBeInTheDocument()
    expect(screen.getByText('Backd Business Funding')).toBeInTheDocument()
    expect(screen.getByText('Austin, Texas Metropolitan Area')).toBeInTheDocument()
    expect(screen.getByText('$65K/yr - $70K/yr')).toBeInTheDocument()
    expect(screen.getByText('25 applicants')).toBeInTheDocument()
  })

  it('opens the job when the card is clicked', async () => {
    const { onOpen } = renderCard()
    await userEvent.click(screen.getByRole('link', { name: /Web Application Developer at Backd/ }))
    expect(onOpen).toHaveBeenCalledWith(job)
  })

  it('likes without opening the card', async () => {
    const { onToggleLike, onOpen } = renderCard()
    await userEvent.click(screen.getByRole('button', { name: `Like ${job.title}` }))
    expect(onToggleLike).toHaveBeenCalledWith(job)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('applies without opening the card', async () => {
    const { onApply, onOpen } = renderCard()
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }))
    expect(onApply).toHaveBeenCalledWith(job)
    expect(onOpen).not.toHaveBeenCalled()
  })

  it('disables the apply button once applied', () => {
    renderCard({ applied: true })
    expect(screen.getByRole('button', { name: 'Applied ✓' })).toBeDisabled()
  })
})
