import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const LIBROS = [
  { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', anio: 1967 },
  { id: 2, titulo: 'Pedro Páramo', autor: 'Juan Rulfo', anio: 1955 },
]

/** Respuesta minima de fetch, suficiente para lo que App.tsx consume. */
function respuesta(cuerpo: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => cuerpo,
  } as Response
}

function simularApi(valor: Response | Error) {
  const fetchMock = vi.fn(async () => {
    if (valor instanceof Error) throw valor
    return valor
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

beforeEach(() => {
  vi.restoreAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('seccion de datos de D1', () => {
  it('pide los datos a /api/libros al montar', async () => {
    const fetchMock = simularApi(respuesta({ ok: true, total: 0, libros: [] }))

    render(<App />)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/libros'))
  })

  it('muestra el estado de carga antes de recibir la respuesta', () => {
    simularApi(respuesta({ ok: true, total: 0, libros: [] }))

    render(<App />)

    expect(screen.getByText(/Consultando la base de datos/i)).toBeInTheDocument()
  })

  it('pinta una fila por cada libro recibido', async () => {
    simularApi(
      respuesta({
        ok: true,
        fuente: 'Cloudflare D1 (SQLite)',
        total: LIBROS.length,
        libros: LIBROS,
      }),
    )

    render(<App />)

    expect(await screen.findByText('Cien años de soledad')).toBeInTheDocument()
    expect(screen.getByText('Gabriel García Márquez')).toBeInTheDocument()
    expect(screen.getByText('Pedro Páramo')).toBeInTheDocument()
    expect(screen.getByText('1955')).toBeInTheDocument()

    // Una fila de encabezado mas una por libro.
    expect(screen.getAllByRole('row')).toHaveLength(LIBROS.length + 1)
  })

  it('resume cuantos registros se leyeron y de donde', async () => {
    simularApi(
      respuesta({
        ok: true,
        fuente: 'Cloudflare D1 (SQLite)',
        total: LIBROS.length,
        libros: LIBROS,
      }),
    )

    render(<App />)

    expect(
      await screen.findByText(/2 registros leidos desde Cloudflare D1 \(SQLite\)/i),
    ).toBeInTheDocument()
  })

  it('muestra el error que devuelve la API', async () => {
    simularApi(respuesta({ ok: false, error: 'no such table: libros' }, 500))

    render(<App />)

    expect(await screen.findByText(/no such table: libros/i)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('muestra el error cuando la peticion ni siquiera sale', async () => {
    simularApi(new Error('Failed to fetch'))

    render(<App />)

    expect(await screen.findByText(/Failed to fetch/i)).toBeInTheDocument()
  })
})

describe('contador', () => {
  it('incrementa al hacer clic', async () => {
    simularApi(respuesta({ ok: true, total: 0, libros: [] }))
    const usuario = userEvent.setup()

    render(<App />)
    const boton = screen.getByRole('button', { name: /Contador interactivo: 0/i })

    await usuario.click(boton)

    expect(
      screen.getByRole('button', { name: /Contador interactivo: 1/i }),
    ).toBeInTheDocument()
  })
})

describe('contenido estatico', () => {
  it('muestra el titulo y el enlace al repositorio', () => {
    simularApi(respuesta({ ok: true, total: 0, libros: [] }))

    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: 'cloudflare-react-app' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Ver repositorio/i })).toHaveAttribute(
      'href',
      'https://github.com/JuanCho0625/cloudflare-react-app',
    )
  })

  it('muestra la marca de build inyectada en compilacion', () => {
    simularApi(respuesta({ ok: true, total: 0, libros: [] }))

    render(<App />)

    expect(screen.getByText(/Build generado el/i)).toBeInTheDocument()
  })
})
