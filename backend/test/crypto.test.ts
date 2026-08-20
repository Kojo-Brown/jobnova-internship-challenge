import { describe, expect, it } from 'vitest'
import { randomBytes } from 'node:crypto'
import { decrypt, encrypt } from '../src/session/crypto.js'

const key = randomBytes(32).toString('hex')

describe('session crypto (AES-256-GCM)', () => {
  it('round-trips plaintext', () => {
    const payload = JSON.stringify({ cookies: [{ name: 'CTK', value: 'secret' }], origins: [] })
    expect(decrypt(encrypt(payload, key), key)).toBe(payload)
  })

  it('produces a different ciphertext each time (fresh IV)', () => {
    expect(encrypt('same', key)).not.toBe(encrypt('same', key))
  })

  it('rejects tampered ciphertext', () => {
    const blob = Buffer.from(encrypt('secret', key), 'base64')
    blob[blob.length - 1] ^= 0xff
    expect(() => decrypt(blob.toString('base64'), key)).toThrow()
  })

  it('rejects the wrong key', () => {
    const other = randomBytes(32).toString('hex')
    expect(() => decrypt(encrypt('secret', key), other)).toThrow()
  })

  it('rejects truncated payloads', () => {
    expect(() => decrypt(Buffer.from('short').toString('base64'), key)).toThrow('Corrupted session payload')
  })
})
