import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * Configuracion de pruebas unitarias.
 *
 * Se cubren las dos piezas del repositorio: los componentes de React y el
 * handler del Worker de Cloudflare. Ambos corren en el entorno jsdom, que
 * ademas de DOM expone las APIs web que usa el Worker (Request y Response).
 */
export default defineConfig({
  plugins: [react()],
  // App.tsx lee __BUILD_TIME__, que en produccion inyecta vite.config.ts.
  // En pruebas se fija un valor constante para que la salida sea estable.
  define: {
    __BUILD_TIME__: JSON.stringify('2026-01-15T12:00:00.000Z'),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'worker/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      // "text" para la consola y el log de CI; "html" para abrirlo en el
      // navegador; "lcov" y "json-summary" para herramientas externas.
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['src/**/*.{ts,tsx}', 'worker/**/*.ts'],
      exclude: [
        'src/main.tsx',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
        'worker/**/*.test.ts',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 70,
      },
    },
  },
})
