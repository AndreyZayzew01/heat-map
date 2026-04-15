import HeatMapPanel from './components/HeatMapPanel'
import './styles/app.css'

function App() {
  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <p className="dashboard-kicker">Мониторинг событий КБ</p>
        <h1>Мониторинг событий КБ процесса безопасной разработки</h1>
      </header>

      <section className="dashboard-content">
        <HeatMapPanel />
      </section>
    </main>
  )
}

export default App
