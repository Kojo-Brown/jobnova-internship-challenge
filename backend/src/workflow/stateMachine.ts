import type { ApplicationStatus } from '../types.js'

/**
 * Allowed application status transitions.
 *
 *   pending ──▶ in_progress ──▶ submitted
 *                  │  ▲
 *                  │  └───────── manual_action_required (operator resolves, we resume)
 *                  ├─▶ failed
 *                  └─▶ manual_action_required
 *   failed ──▶ pending (explicit retry)
 */
const transitions: Record<ApplicationStatus, ApplicationStatus[]> = {
  pending: ['in_progress'],
  in_progress: ['submitted', 'failed', 'manual_action_required'],
  manual_action_required: ['in_progress', 'failed'],
  failed: ['pending'],
  submitted: [],
}

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return transitions[from].includes(to)
}

export function assertTransition(from: ApplicationStatus, to: ApplicationStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal status transition: ${from} -> ${to}`)
  }
}

/** Statuses the workflow will pick up when running/resuming. */
export function isRunnable(status: ApplicationStatus): boolean {
  return status === 'pending' || status === 'manual_action_required' || status === 'in_progress'
}
