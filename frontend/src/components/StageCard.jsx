import { useState } from 'react'
import MCQCard from './MCQCard.jsx'

export default function StageCard({ variant, emoji, title, data, isReview }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`stage-card stage-card--${variant}`}>
      <div className="stage-card__header">
        <h2 className="stage-card__title">
          <span className="emoji">{emoji}</span>
          {title}
          {isReview && (
            <span
              className={`badge ${
                data.status === 'pass' ? 'badge--pass' : 'badge--fail'
              }`}
            >
              {data.status === 'pass' ? '✅ PASS' : '❌ FAIL'}
            </span>
          )}
        </h2>
        <button className="btn-copy" onClick={handleCopy} id={`copy-${variant}`}>
          {copied ? '✓ Copied!' : '📋 Copy JSON'}
        </button>
      </div>

      {/* Review card */}
      {isReview && (
        <>
          {data.feedback && data.feedback.length > 0 ? (
            <ul className="feedback-list">
              {data.feedback.map((fb, i) => (
                <li key={i}>{fb}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--green)', fontSize: '0.95rem' }}>
              All checks passed. Content is ready!
            </p>
          )}
        </>
      )}

      {/* Content card (draft or refined) */}
      {!isReview && (
        <>
          <div className="explanation">{data.explanation}</div>
          {data.mcqs && (
            <div className="mcq-grid">
              {data.mcqs.map((mcq, i) => (
                <MCQCard key={i} mcq={mcq} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
