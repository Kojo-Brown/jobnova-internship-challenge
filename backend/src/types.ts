/** Application lifecycle states required by the challenge. */
export type ApplicationStatus =
  | 'pending'
  | 'in_progress'
  | 'submitted'
  | 'failed'
  | 'manual_action_required'

/** Why the workflow paused and is waiting for a human. */
export type ManualActionKind = 'captcha' | 'sms_code' | 'email_verification' | 'login_required' | 'unknown_challenge'

export interface ApplicationEvent {
  at: string
  status: ApplicationStatus
  message: string
}

export interface ApplicationRecord {
  id: string
  user: string
  jobKey: string
  title: string
  company: string
  url: string
  status: ApplicationStatus
  manualAction?: ManualActionKind
  /** Where in the apply flow we stopped, so resume can pick up. */
  checkpoint?: string
  createdAt: string
  updatedAt: string
  events: ApplicationEvent[]
}

export interface JobPosting {
  jobKey: string
  title: string
  company: string
  url: string
}

export interface WorkExperience {
  title: string
  company: string
  from: string
  to: string
  summary?: string
}

export interface Education {
  degree: string
  school: string
  graduated: string
}

export interface Profile {
  user: string
  fullName: string
  email: string
  phone: string
  location: string
  resumePath: string
  jobPreferences: {
    queries: string[]
    location: string
    maxApplications: number
    excludeKeywords: string[]
  }
  workExperience: WorkExperience[]
  education: Education[]
  /** keyword (lower-case substring of the question) -> answer */
  screenerAnswers: Record<string, string>
}
