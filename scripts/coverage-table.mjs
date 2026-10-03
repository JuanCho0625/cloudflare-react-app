/**
 * Imprime la cobertura por archivo a partir de coverage/coverage-summary.json.
 *
 * El reporter "text" de Vitest no lista worker/index.ts en la tabla de consola
 * (si lo incluye en los totales, y tambien en los reportes html y lcov). Este
 * script existe para que el log de CI muestre los dos archivos sin ambiguedad.
 */
import { readFileSync } from 'node:fs'
import { relative } from 'node:path'

const RUTA = 'coverage/coverage-summary.json'

let resumen
try {
  resumen = JSON.parse(readFileSync(RUTA, 'utf8'))
} catch {
  console.error(`No se encontro ${RUTA}. Ejecuta antes: npm run test:coverage`)
  process.exit(1)
}

const pct = (n) => `${n.toFixed(2)}%`.padStart(8)

const filas = Object.entries(resumen)
  .filter(([clave]) => clave !== 'total')
  .map(([ruta, datos]) => ({
    archivo: relative(process.cwd(), ruta).replace(/\\/g, '/'),
    datos,
  }))
  .sort((a, b) => a.archivo.localeCompare(b.archivo))

const ancho = Math.max(12, ...filas.map((f) => f.archivo.length))

console.log('')
console.log('Cobertura por archivo')
console.log(
  'Archivo'.padEnd(ancho),
  'Sentencias',
  '  Ramas',
  'Funciones',
  '   Lineas',
)
console.log('-'.repeat(ancho + 40))

for (const { archivo, datos } of filas) {
  console.log(
    archivo.padEnd(ancho),
    pct(datos.statements.pct),
    pct(datos.branches.pct),
    pct(datos.functions.pct),
    pct(datos.lines.pct),
  )
}

const { total } = resumen
console.log('-'.repeat(ancho + 40))
console.log(
  'TOTAL'.padEnd(ancho),
  pct(total.statements.pct),
  pct(total.branches.pct),
  pct(total.functions.pct),
  pct(total.lines.pct),
)
console.log('')
