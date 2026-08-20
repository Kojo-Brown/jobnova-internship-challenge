import 'dotenv/config'
import path from 'node:path'

export interface Config {
  dataDir: string
  sessionEncKey: string
  port: number
  headless: boolean
}

export function loadConfig(overrides: Partial<Config> = {}): Config {
  const dataDir = overrides.dataDir ?? process.env.DATA_DIR ?? path.resolve(process.cwd(), 'data')
  const sessionEncKey = overrides.sessionEncKey ?? process.env.SESSION_ENC_KEY ?? ''
  if (!/^[0-9a-fA-F]{64}$/.test(sessionEncKey)) {
    throw new Error(
      'SESSION_ENC_KEY must be a 64-character hex string (32 bytes). ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"',
    )
  }
  return {
    dataDir,
    sessionEncKey,
    port: overrides.port ?? Number(process.env.PORT ?? 4000),
    headless: overrides.headless ?? process.env.HEADLESS !== 'false',
  }
}
