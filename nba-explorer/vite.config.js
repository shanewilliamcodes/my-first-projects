import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base must match the GitHub Pages sub-path so assets load when deployed.
// Locally (npm run dev) base is '/', on Pages it's '/my-first-projects/nba-explorer/'.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/my-first-projects/nba/' : '/',
  plugins: [react(), tailwindcss()],
}))
