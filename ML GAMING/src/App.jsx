import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GameProvider } from './context/GameContext'
import Header from './components/Header'
import LevelMap from './components/LevelMap'
import { RewardToasts } from './components/RewardToasts'
import LevelPlay from './pages/LevelPlay'
import BadgesPage from './pages/BadgesPage'
import './index.css'

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <div className="app-shell">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<LevelMap />} />
              <Route path="/level/:id" element={<LevelPlay />} />
              <Route path="/badges" element={<BadgesPage />} />
            </Routes>
          </main>
          <RewardToasts />
          <footer className="site-foot">
            Questions inspired by{' '}
            <a href="https://github.com/amitshekhariitbhu/machine-learning-interview-questions" target="_blank" rel="noreferrer">
              ML Interview Questions
            </a>{' '}
            &{' '}
            <a href="https://www.datacamp.com/blog/top-machine-learning-interview-questions" target="_blank" rel="noreferrer">
              DataCamp
            </a>
          </footer>
        </div>
      </BrowserRouter>
    </GameProvider>
  )
}
