/// <reference types="vitest/config" />
import { defineConfig } from "vite"

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.ts'],
  }
})
