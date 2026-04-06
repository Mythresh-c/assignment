const LETTERS = ['A', 'B', 'C', 'D']

export default function MCQCard({ mcq, index }) {
  // Determine which letter is the correct answer
  const correctLetter = (mcq.answer || '').trim().charAt(0).toUpperCase()

  return (
    <div className="mcq-card">
      <div className="mcq-card__number">Question {index + 1}</div>
      <div className="mcq-card__question">{mcq.question}</div>
      <div className="mcq-card__options">
        {mcq.options.map((opt, i) => {
          const letter = LETTERS[i]
          // Check if this option's letter matches the correct answer
          const isCorrect = letter === correctLetter

          // The option text — strip leading "A) " / "A. " style prefix if present
          const displayText = opt.replace(/^[A-Da-d][).]\s*/, '')

          return (
            <div
              key={i}
              className={`mcq-option ${isCorrect ? 'mcq-option--correct' : ''}`}
            >
              <span className="mcq-option__letter">{letter}</span>
              <span className="mcq-option__text">{displayText}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
