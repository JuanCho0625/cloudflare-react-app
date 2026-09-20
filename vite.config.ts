import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Sello de tiempo del build: cambia en cada despliegue, lo que permite
    // comprobar a simple vista que un push disparo un redespliegue nuevo.
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
