import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  // The test mode does not load any root .env* file or expose legacy variables.
  ...(mode === 'auth-tests' ? {
    envDir: 'config/auth-tests',
    envPrefix: 'VITE_AUTH_TEST_',
    server: { host: '127.0.0.1', port: 5174, strictPort: true },
  } : {}),
  plugins: [react(), tailwindcss()],
}))
