export type WorkMode = 'On-site' | 'Remote' | 'Hybrid'

export interface FitCriterion {
  label: 'Education' | 'Work Exp' | 'Skills' | 'Exp. Level'
  score: number
}

export interface FitNote {
  title: string
  /** ok = green check, warn = caution */
  status: 'ok' | 'warn'
  detail: string
}

export interface Company {
  name: string
  logo: string
  founded?: string
  location?: string
  size?: string
  website?: string
  about?: string
}

export interface Job {
  id: string
  title: string
  company: Company
  location: string
  workMode: WorkMode
  country: string
  employmentType: string
  experience: string
  level: string
  salary: string
  matchScore: number
  skillsMatchLabel?: string
  postedAgo: string
  applicants: number
  description: string
  qualificationTags: string[]
  required: string[]
  preferred: string[]
  responsibilities: string[]
  benefits: { emoji: string; title: string; detail: string }[]
  fit: {
    criteria: FitCriterion[]
    notes: FitNote[]
  }
}

export type Tab = 'matched' | 'liked' | 'applied'
export type Plan = 'free' | 'pro'
