import { describe, expect, it, vi, beforeEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

beforeEach(() => {
  vi.useRealTimers()
})

async function renderApp() {
  render(<App />)
  // wait for the simulated fetch/skeleton to resolve
  await waitFor(() => expect(screen.getByText('Web Application Developer')).toBeInTheDocument(), {
    timeout: 3000,
  })
}

describe('App', () => {
  it('renders the matched job list sorted by match score', async () => {
    await renderApp()
    const headings = screen.getAllByRole('heading', { level: 3 })
    expect(headings[0]).toHaveTextContent('Software Engineer, Network Infrastructure')
  })

  it('filters with the search box', async () => {
    await renderApp()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search jobs' }), 'google')
    expect(screen.getByText('UX Designer')).toBeInTheDocument()
    expect(screen.queryByText('Web Application Developer')).not.toBeInTheDocument()
  })

  it('shows an empty state on the Liked tab and fills it after liking', async () => {
    await renderApp()
    await userEvent.click(screen.getByRole('button', { name: 'Liked' }))
    expect(screen.getByText('No liked jobs yet')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Matched' }))
    await userEvent.click(screen.getByRole('button', { name: 'Like Web Application Developer' }))
    await userEvent.click(screen.getByRole('button', { name: /^Liked/ }))
    expect(screen.getByText('Web Application Developer')).toBeInTheDocument()
    expect(screen.queryByText('UX Designer')).not.toBeInTheDocument()
  })

  it('tracks applications on the Applied tab', async () => {
    await renderApp()
    await userEvent.click(screen.getAllByRole('button', { name: 'Apply' })[0])
    // the tab now shows its badge count in the accessible name ("Applied" + "1")
    await userEvent.click(screen.getByRole('button', { name: 'Applied1' }))
    expect(screen.getByRole('button', { name: 'Applied ✓' })).toBeInTheDocument()
  })

  it('navigates to the job detail page via hash routing', async () => {
    await renderApp()
    await userEvent.click(screen.getByRole('link', { name: /UX Designer at Google/ }))
    await waitFor(() => expect(screen.getByRole('heading', { level: 1, name: 'UX Designer' })).toBeInTheDocument())
    expect(window.location.hash).toBe('#/job/ux-designer')
    expect(screen.getByText('Why is this job a good fit for me?')).toBeInTheDocument()
    // free plan shows the locked fit panel
    expect(screen.getByRole('button', { name: 'Upgrade to check' })).toBeInTheDocument()
  })

  it('unlocks the fit panel after upgrading', async () => {
    await renderApp()
    await userEvent.click(screen.getByRole('link', { name: /UX Designer at Google/ }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Upgrade to check' })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Upgrade to check' }))
    expect(screen.queryByRole('button', { name: 'Upgrade to check' })).not.toBeInTheDocument()
    expect(screen.getByText('Relevant Experience')).toBeInTheDocument()
  })

  it('restores the detail page from the URL hash', async () => {
    act(() => {
      window.location.hash = '#/job/full-stack-software-engineer-web-developer'
    })
    render(<App />)
    await waitFor(() =>
      expect(
        screen.getByRole('heading', { level: 1, name: 'Full-Stack Software Engineer (Web Developer)' }),
      ).toBeInTheDocument(),
    )
  })
})
