import StageCard from './StageCard.jsx'

function SkeletonCard({ label }) {
  return (
    <div className="skeleton-card">
      <div className="skeleton__title">
        <div className="skeleton__circle" />
        <div className="skeleton__bar" style={{ width: 180, height: 18 }} />
      </div>
      <div className="skeleton__lines">
        <div className="skeleton__bar" style={{ width: '100%' }} />
        <div className="skeleton__bar" style={{ width: '85%' }} />
        <div className="skeleton__bar" style={{ width: '70%' }} />
      </div>
      <p
        style={{
          marginTop: 16,
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
          fontWeight: 500,
        }}
      >
        🤖 Agent thinking — {label}…
      </p>
    </div>
  )
}

export default function PipelineDisplay({ result, loading, activeStep }) {
  if (!loading && !result) return null

  const showDraft = result?.draft || (loading && ['generator', 'reviewer', 'refiner', 'done'].includes(activeStep))
  const showReview = result?.review || (loading && ['reviewer', 'refiner', 'done'].includes(activeStep))
  const showRefined = result?.refined || (loading && ['refiner', 'done'].includes(activeStep))

  return (
    <div className="pipeline" id="pipeline-display">
      {/* Stage 1: Draft */}
      {showDraft && (
        <>
          {result?.draft ? (
            <StageCard
              variant="draft"
              emoji="📝"
              title="Draft Content"
              data={result.draft}
            />
          ) : (
            <SkeletonCard label="generating content" />
          )}
        </>
      )}

      {showDraft && showReview && <div className="flow-arrow">⬇</div>}

      {/* Stage 2: Review */}
      {showReview && (
        <>
          {result?.review ? (
            <StageCard
              variant={
                result.review.status === 'pass' ? 'review-pass' : 'review-fail'
              }
              emoji="🔍"
              title="Reviewer Feedback"
              data={result.review}
              isReview
            />
          ) : (
            <SkeletonCard label="reviewing content" />
          )}
        </>
      )}

      {showReview && showRefined && <div className="flow-arrow">⬇</div>}

      {/* Stage 3: Refined */}
      {showRefined && (
        <>
          {result?.refined ? (
            <StageCard
              variant="refined"
              emoji="✨"
              title="AI-Refined Version"
              data={result.refined}
            />
          ) : (
            <SkeletonCard label="refining content" />
          )}
        </>
      )}
    </div>
  )
}
