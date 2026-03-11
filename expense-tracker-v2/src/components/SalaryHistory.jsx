import { useState } from 'react'
import { fmt } from '../utils/currency'

export default function SalaryHistory({ salaries, deleteSalary, onEdit, currency, toast }) {
  const [delConfirm, setDel] = useState(null)

  async function doDelete(id) {
    try {
      await deleteSalary(id)
      toast('Salary deleted.', 'success')
    } catch(err) {
      toast(err.message || 'Failed to delete', 'error')
    }
    setDel(null)
  }

  return (
    <div className="glass-card salary-history-card">
      <div className="salary-hist-header">
        <h2 className="salary-hist-title">
          <i className="fa-table-list" /> Salary Records
        </h2>
        <span className="record-count">
          {salaries.length} record{salaries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {salaries.length === 0 ? (
        <div className="salary-hist-empty">
          <i className="fas fa-coins" />
          <p>No salary records yet.</p>
          <p style={{ fontSize:'0.75rem' }}>Add one using the form on the left.</p>
        </div>
      ) : (
        <div className="salary-hist-scroll">
          {salaries.map(s => (
            <div key={s.id} className="salary-hist-row">
              <div className="salary-hist-left">
                <span className="salary-hist-month">
                  {new Date(s.month + '-01').toLocaleDateString('en', { month:'long', year:'numeric' })}
                </span>
                {s.note && <span className="salary-hist-note">{s.note}</span>}
              </div>
              <div className="salary-hist-right">
                <span className="salary-hist-amt">{fmt(s.amount, currency)}</span>
                <button className="btn btn-icon" title="Edit" onClick={() => onEdit(s)}
                  style={{ padding:'5px 7px' }}>
                  <i className="fas fa-pen" style={{ fontSize:'0.68rem' }} />
                </button>
                <button className="btn btn-danger" title="Delete" onClick={() => setDel(s.id)}
                  style={{ padding:'5px 8px' }}>
                  <i className="fas fa-trash-can" style={{ fontSize:'0.68rem' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {delConfirm && (
        <div className="overlay" onClick={() => setDel(null)}>
          <div className="glass-card modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:'2rem', marginBottom:10 }}>💰</div>
            <h3 style={{ marginBottom:8, fontWeight:700 }}>Delete Salary?</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', marginBottom:20 }}>
              This cannot be undone.
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button className="btn btn-ghost" onClick={() => setDel(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => doDelete(delConfirm)}
                style={{ padding:'8px 18px' }}>
                <i className="fas fa-trash-can" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
