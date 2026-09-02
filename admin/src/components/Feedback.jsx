export function formatApiError(err) {
  const details = err.details?.map((item) => item.message).filter(Boolean)
  if (details?.length) return `${err.message}: ${details.join(' ')}`
  return err.message || 'Something went wrong'
}

export function FeedbackBanner({ tone = 'error', children }) {
  if (!children) return null
  return <p className={tone === 'success' ? 'notice' : 'form-error'}>{children}</p>
}

export function FieldHint({ children }) {
  if (!children) return null
  return <span className="field-error">{children}</span>
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  )
}
