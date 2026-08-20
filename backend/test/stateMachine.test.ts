import { describe, expect, it } from 'vitest'
import { assertTransition, canTransition, isRunnable } from '../src/workflow/stateMachine.js'

describe('application state machine', () => {
  it('allows the happy path pending -> in_progress -> submitted', () => {
    expect(canTransition('pending', 'in_progress')).toBe(true)
    expect(canTransition('in_progress', 'submitted')).toBe(true)
  })

  it('allows pausing and resuming for manual action', () => {
    expect(canTransition('in_progress', 'manual_action_required')).toBe(true)
    expect(canTransition('manual_action_required', 'in_progress')).toBe(true)
  })

  it('allows failure and explicit retry', () => {
    expect(canTransition('in_progress', 'failed')).toBe(true)
    expect(canTransition('failed', 'pending')).toBe(true)
  })

  it('rejects illegal transitions', () => {
    expect(canTransition('pending', 'submitted')).toBe(false)
    expect(canTransition('submitted', 'in_progress')).toBe(false)
    expect(canTransition('submitted', 'pending')).toBe(false)
    expect(() => assertTransition('submitted', 'failed')).toThrow('Illegal status transition')
  })

  it('treats pending, paused and interrupted work as runnable', () => {
    expect(isRunnable('pending')).toBe(true)
    expect(isRunnable('manual_action_required')).toBe(true)
    expect(isRunnable('in_progress')).toBe(true)
    expect(isRunnable('submitted')).toBe(false)
    expect(isRunnable('failed')).toBe(false)
  })
})
