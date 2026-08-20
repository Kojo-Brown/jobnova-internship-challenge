import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { Profile } from './types.js'

export async function loadProfile(file = path.resolve(process.cwd(), 'profile.json')): Promise<Profile> {
  let raw: string
  try {
    raw = await readFile(file, 'utf8')
  } catch {
    throw new Error(`Profile not found at ${file}. Copy profile.example.json to profile.json and fill in your own details.`)
  }
  const profile = JSON.parse(raw) as Profile
  for (const field of ['user', 'fullName', 'email', 'phone'] as const) {
    if (!profile[field]) throw new Error(`profile.json is missing required field "${field}"`)
  }
  if (!profile.jobPreferences?.queries?.length) {
    throw new Error('profile.json needs jobPreferences.queries with at least one search query')
  }
  return profile
}
