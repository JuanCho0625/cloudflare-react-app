import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'

declare const __BUILD_TIME__: string

const REPO = 'https://github.com/JuanCho0625/cloudflare-react-app'

const pipeline = [
  { n: '01', title: 'git push', detail: 'El codigo se sube a la rama main del repositorio.' },
  { n: '02', title: 'Workers Builds', detail: 'Cloudflare detecta el commit y ejecuta npm run build.' },
  { n: '03', title: 'Static Assets', detail: 'El contenido de dist/ se publica en la red global.' },
]

const stack = [
  { label: 'Framework', value: 'React 19' },
  { label: 'Bundler', value: 'Vite 8' },
  { label: 'Lenguaje', value: 'TypeScript' },
  { label: 'Andamiaje', value: 'create-cloudflare (C3)' },
  { label: 'Runtime', value: 'Cloudflare Workers' },
  { label: 'Entrega', value: 'Workers Static Assets' },
]

function App() {
  const [count, setCount] = useState(0)

  const buildTime = new Date(__BUILD_TIME__).toLocaleString('es-MX', {
    dateStyle: 'long',
    timeStyle: 'medium',
  })

  return (
    <main className="page">
      <header className="hero">
        <div className="badge">
          <span className="dot" aria-hidden="true" />
          Desplegado en Cloudflare Workers
        </div>

        <h1>cloudflare-react-app</h1>

        <p className="lede">
          Aplicacion React generada con el CLI de Cloudflare y publicada de forma
          continua: cada push a <code>main</code> reconstruye y redespliega el
          sitio automaticamente.
        </p>

        <div className="logos" aria-hidden="true">
          <img src={reactLogo} alt="" />
          <span>+</span>
          <img src={viteLogo} alt="" />
        </div>

        <div className="actions">
          <a className="btn primary" href={REPO} target="_blank" rel="noreferrer">
            Ver repositorio
          </a>
          <button type="button" className="btn" onClick={() => setCount((c) => c + 1)}>
            Contador interactivo: {count}
          </button>
        </div>
      </header>

      <section className="section">
        <h2>Como llega el codigo a produccion</h2>
        <ol className="pipeline">
          {pipeline.map((step) => (
            <li key={step.n}>
              <span className="step-n">{step.n}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2>Stack tecnico</h2>
        <dl className="grid">
          {stack.map((item) => (
            <div className="card" key={item.label}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer className="foot">
        <p>
          Build generado el <strong>{buildTime}</strong>
        </p>
        <p className="hint">
          Esta marca cambia en cada despliegue: si se actualiza despues de un
          push, el redespliegue automatico funciono.
        </p>
      </footer>
    </main>
  )
}

export default App
