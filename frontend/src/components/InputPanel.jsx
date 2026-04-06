import { useState } from 'react'

const grades = Array.from({ length: 10 }, (_, i) => i + 1)

export default function InputPanel({ onGenerate, loading }) {
  const [grade, setGrade] = useState('5')
  const [topic, setTopic] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!topic.trim()) return
    onGenerate(grade, topic.trim())
  }

  return (
    <form className="glass-card input-panel" onSubmit={handleSubmit} id="input-panel">
      <div className="field">
        <label htmlFor="grade-select">Grade Level</label>
        <select
          id="grade-select"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          {grades.map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>
      </div>

      <div className="field" style={{ flex: '2 1 300px' }}>
        <label htmlFor="topic-input">Topic</label>
        <input
          id="topic-input"
          type="text"
          placeholder="e.g. Photosynthesis, Fractions, Solar System…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          autoComplete="off"
        />
      </div>

      <button
        type="submit"
        className="btn-generate"
        disabled={loading || !topic.trim()}
        id="generate-btn"
      >
        {loading ? (
          <>
            <span className="spinner" />
            Generating…
          </>
        ) : (
          <>🚀 Generate</>
        )}
      </button>
    </form>
  )
}
