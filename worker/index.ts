/**
 * Worker de la aplicacion.
 *
 * Solo atiende las rutas /api/*, declaradas en "run_worker_first" dentro de
 * wrangler.jsonc. Cualquier otra peticion la resuelve directamente el binding
 * de assets estaticos, que sirve el build de Vite.
 */

interface Libro {
  id: number
  titulo: string
  autor: string
  anio: number
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/libros') {
      try {
        // env.DB es el binding declarado en wrangler.jsonc y apunta a la
        // base de datos D1. D1 es SQLite, asi que la consulta es SQL normal.
        const { results } = await env.DB.prepare(
          'SELECT id, titulo, autor, anio FROM libros ORDER BY id',
        ).all<Libro>()

        return Response.json({
          ok: true,
          fuente: 'Cloudflare D1 (SQLite)',
          consulta: 'SELECT id, titulo, autor, anio FROM libros ORDER BY id',
          total: results.length,
          libros: results,
        })
      } catch (error) {
        return Response.json(
          { ok: false, error: (error as Error).message },
          { status: 500 },
        )
      }
    }

    return Response.json(
      { ok: false, error: `Ruta no encontrada: ${url.pathname}` },
      { status: 404 },
    )
  },
} satisfies ExportedHandler<Env>
