import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Must match the GitHub repository name, otherwise the deployed page is blank.
  base: '/mp2/',
})
