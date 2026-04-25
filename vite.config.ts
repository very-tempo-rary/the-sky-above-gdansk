import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default defineConfig({
  // BASE_PATH is injected by the GitHub Actions deploy workflow.
  // Locally it's undefined so the app runs at / as usual.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@assets': path.resolve(__dirname, 'assets'),
    },
  },
})
