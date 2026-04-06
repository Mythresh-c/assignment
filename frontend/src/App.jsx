import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import InputPanel from './components/InputPanel.jsx'
import Stepper from './components/Stepper.jsx'
import PipelineDisplay from './components/PipelineDisplay.jsx'

const API_URL = 'http://localhost:8000'

export default function App() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(null) // null | 'generator' | 'reviewer' | 'refiner' | 'done'

  const handleGenerate = async (grade, topic) => {
    setResult(null)
    setLoading(true)
    setActiveStep('generator')

    try {
      // Simulate progressive steps with timers for visual effect
      const stepDelay = (step, ms) =>
        new Promise((resolve) => {
          setTimeout(() => {
            setActiveStep(step)
            resolve()
          }, ms)
        })

      const fetchPromise = fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: parseInt(grade), topic }),
      })

      // Move stepper to "reviewer" after 3s, and "refiner" after 7s
      // These are purely cosmetic — the actual API call runs in parallel
      const timerPromise = (async () => {
        await stepDelay('reviewer', 3000)
        await stepDelay('refiner', 7000)
      })()

      const response = await fetchPromise

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Unknown error' }))
        throw new Error(err.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()

      // Cancel remaining step timers by jumping to done
      setActiveStep('done')
      setResult(data)
      toast.success('Content generated successfully!', {
        style: {
          background: '#1a1d3a',
          color: '#e8eaf6',
          border: '1px solid rgba(0, 230, 118, 0.25)',
        },
        iconTheme: { primary: '#00e676', secondary: '#1a1d3a' },
      })
    } catch (err) {
      setActiveStep(null)
      toast.error(err.message || 'Generation failed', {
        style: {
          background: '#1a1d3a',
          color: '#e8eaf6',
          border: '1px solid rgba(255, 82, 82, 0.25)',
        },
        iconTheme: { primary: '#ff5252', secondary: '#1a1d3a' },
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Toaster position="top-right" />

      <header className="header">
        <h1 className="header__logo">⚡ EduGen AI</h1>
        <p className="header__sub">
          AI-Powered Educational Content Generator — Agent Pipeline
        </p>
      </header>

      <InputPanel onGenerate={handleGenerate} loading={loading} />

      {(loading || result) && (
        <Stepper activeStep={activeStep} hasRefined={result?.refined !== null && result?.refined !== undefined} />
      )}

      <PipelineDisplay result={result} loading={loading} activeStep={activeStep} />
    </div>
  )
}
