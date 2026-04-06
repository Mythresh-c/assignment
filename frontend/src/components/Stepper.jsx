const STEPS = [
  { key: 'generator', emoji: '📝', label: 'Generator' },
  { key: 'reviewer', emoji: '🔍', label: 'Reviewer' },
  { key: 'refiner', emoji: '✨', label: 'Refiner' },
]

export default function Stepper({ activeStep, hasRefined }) {
  const getStepStatus = (stepKey) => {
    const order = ['generator', 'reviewer', 'refiner', 'done']
    const activeIdx = order.indexOf(activeStep)
    const stepIdx = order.indexOf(stepKey)

    if (activeStep === 'done') {
      // When done, mark generator and reviewer as done always
      if (stepKey === 'refiner') return hasRefined ? 'done' : 'skip'
      return 'done'
    }

    if (stepIdx < activeIdx) return 'done'
    if (stepIdx === activeIdx) return 'active'
    return 'pending'
  }

  return (
    <div className="stepper" id="pipeline-stepper">
      {STEPS.map((step, i) => {
        const status = getStepStatus(step.key)
        if (status === 'skip') return null

        const stepClass =
          status === 'active'
            ? 'stepper__step stepper__step--active'
            : status === 'done'
            ? 'stepper__step stepper__step--done'
            : 'stepper__step'

        return (
          <span key={step.key} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <span
                className={`stepper__arrow ${
                  status === 'done' || status === 'active'
                    ? 'stepper__arrow--active'
                    : ''
                }`}
              >
                →
              </span>
            )}
            <span className={stepClass}>
              <span>{status === 'done' ? '✅' : step.emoji}</span>
              {step.label}
            </span>
          </span>
        )
      })}
    </div>
  )
}
