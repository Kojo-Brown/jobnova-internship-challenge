import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  // jsdom under vitest may expose a minimal storage shim without clear()
  const storage = window.localStorage
  if (typeof storage.clear === 'function') {
    storage.clear()
  } else {
    for (const key of Object.keys(storage)) storage.removeItem(key)
  }
  window.location.hash = ''
})
