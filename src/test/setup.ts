import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Desmonta lo renderizado despues de cada prueba para que no se filtre
// estado de una a otra.
afterEach(() => {
  cleanup()
})
