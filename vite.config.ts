import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Safely expose the API key. We stringify it to ensure it's treated as a string in the browser code.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})