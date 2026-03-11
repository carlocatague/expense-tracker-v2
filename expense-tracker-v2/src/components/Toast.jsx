export default function Toast({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}${t.removing ? ' removing' : ''}`}>
          <i className={`fas ${t.type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}`} />
          {t.message}
        </div>
      ))}
    </div>
  )
}
