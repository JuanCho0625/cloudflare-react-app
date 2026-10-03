import { describe, expect, it, vi } from 'vitest'
import worker from './index'

const LIBROS = [
  { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967 },
  { id: 2, titulo: 'Pedro Páramo', autor: 'Juan Rulfo', anio: 1955 },
]

/**
 * D1 de mentira. Devuelve las filas indicadas, o lanza el error que se le pase,
 * para poder probar el handler sin una base de datos real.
 */
function crearEnv(opciones: { filas?: typeof LIBROS; error?: Error } = {}) {
  const all = vi.fn(async () => {
    if (opciones.error) throw opciones.error
    return { results: opciones.filas ?? [] }
  })
  const prepare = vi.fn(() => ({ all }))
  const env = { DB: { prepare } } as unknown as Env

  return { env, prepare, all }
}

function pedir(ruta: string) {
  return new Request(`https://ejemplo.test${ruta}`)
}

describe('GET /api/libros', () => {
  it('devuelve los registros que entrega D1', async () => {
    const { env } = crearEnv({ filas: LIBROS })

    const res = await worker.fetch(pedir('/api/libros'), env)
    const cuerpo = await res.json()

    expect(res.status).toBe(200)
    expect(cuerpo).toMatchObject({
      ok: true,
      fuente: 'Cloudflare D1 (SQLite)',
      total: 2,
      libros: LIBROS,
    })
  })

  it('consulta la tabla libros ordenada por id', async () => {
    const { env, prepare } = crearEnv({ filas: LIBROS })

    await worker.fetch(pedir('/api/libros'), env)

    expect(prepare).toHaveBeenCalledOnce()
    expect(prepare).toHaveBeenCalledWith(
      'SELECT id, titulo, autor, anio FROM libros ORDER BY id',
    )
  })

  it('informa total 0 cuando la tabla esta vacia', async () => {
    const { env } = crearEnv({ filas: [] })

    const res = await worker.fetch(pedir('/api/libros'), env)
    const cuerpo = (await res.json()) as { total: number; libros: unknown[] }

    expect(res.status).toBe(200)
    expect(cuerpo.total).toBe(0)
    expect(cuerpo.libros).toEqual([])
  })

  it('responde 500 con el mensaje cuando D1 falla', async () => {
    const { env } = crearEnv({ error: new Error('no such table: libros') })

    const res = await worker.fetch(pedir('/api/libros'), env)
    const cuerpo = (await res.json()) as { ok: boolean; error: string }

    expect(res.status).toBe(500)
    expect(cuerpo.ok).toBe(false)
    expect(cuerpo.error).toBe('no such table: libros')
  })
})

describe('rutas no contempladas', () => {
  it('responde 404 e incluye la ruta pedida', async () => {
    const { env } = crearEnv()

    const res = await worker.fetch(pedir('/api/otra-cosa'), env)
    const cuerpo = (await res.json()) as { ok: boolean; error: string }

    expect(res.status).toBe(404)
    expect(cuerpo.ok).toBe(false)
    expect(cuerpo.error).toContain('/api/otra-cosa')
  })

  it('no toca la base de datos en una ruta desconocida', async () => {
    const { env, prepare } = crearEnv()

    await worker.fetch(pedir('/no-existe'), env)

    expect(prepare).not.toHaveBeenCalled()
  })
})
