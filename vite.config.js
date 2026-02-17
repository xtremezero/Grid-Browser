// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Entry point for the Electron Main Process
        entry: 'electron/main.js',
      },
    ]),
    renderer(),
  ],
})
