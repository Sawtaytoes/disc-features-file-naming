import { vol } from 'memfs'
import { afterEach, vi } from 'vitest'

// Always mock `fs` because it's used everywhere, and we never want to hit the filesystem.
vi.mock('node:fs')
vi.mock('node:fs/promises')

// Reset the in-memory filesystem after each test.
afterEach(() => {
  vol
  .reset()
})
