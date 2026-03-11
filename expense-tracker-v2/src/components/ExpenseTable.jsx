import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { fmt as fmtCurrency } from '../utils/currency'

const CATEGORY_COLORS = {
  'Food & Drinks':  '#f97316',
  'Transportation': '#3b82f6',
  'Entertainment':  '#a855f7',
  'Health':         '#22c55e',
  'Education':      '#06b6d4',
  'Shopping':       '#ec4899',
  'Bills':          '#eab308',
  'Other':          '#6b7280',
}

function Badge({ category }) {
  if (!category) return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>
  const color = CATEGORY_COLORS[category] || '#6b7280'
  return (
    <span className="category-badge" style={{
      background: color + '22',
      color,
      borderColor: color + '55',
    }}>
      {category}
    </span>
  )
}

export default function ExpenseTable({ expenses, loading, currency, onEdit, onDelete }) {
  const [search, setSearch]  = useState('')
  const [confirm, setConfirm] = useState(null)
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    if (!q) return expenses
    return expenses.filter(e =>
      e.title.toLowerCase().includes(q) ||
      (e.category || '').toLowerCase().includes(q) ||
      String(e.amount).includes(q)
    )
  }, [expenses, search])

  const fmtAmt  = (n) => fmtCurrency(n, currency)
  const fmtDate = (d) => format(new Date(d), 'MMM d, yyyy · HH:mm')

  async function doDelete() {
    if (confirm) { await onDelete(confirm); setConfirm(null) }
  }

  return (
    <div className="glass-card">

      {/* Header */}
      <div className="table-header">
        <h2 className="table-title"><i className="fas fa-table-list" /> Expense Records </h2>
        <span className="record-count">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Search */}
      <div className="search-bar">
        <i className="fas fa-magnifying-glass search-icon" />
        <input
          className="search-input"
          placeholder="Search by title, category or amount…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>
            <i className="fas fa-xmark" />
          </button>
        )}
      </div>

      {/* ── Loading ── */}
      {loading ? (
        <div className="table-loading">
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 6 }}>Loading expenses…</p>
        </div>

      /* ── Empty ── */
      ) : filtered.length === 0 ? (
        <div className="table-empty">
          <i className="fas fa-receipt" style={{ fontSize: '2rem', color: 'var(--text-muted)' }} />
          <p>{search ? 'No results match your search.' : 'No expenses yet. Add your first one above!'}</p>
        </div>

      ) : (
        <>
          {/* ════ DESKTOP / TABLET — scrollable table ════ */}
          <div className="table-desktop table-scroll-wrap">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date & Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(e => (
                  <tr key={e.id}>
                    <td><span className="col-title">{e.title}</span></td>
                    <td><span className="col-amount">{fmtAmt(e.amount)}</span></td>
                    <td><Badge category={e.category} /></td>
                    <td className="col-date">{fmtDate(e.expense_date)}</td>
                    <td>
                      <div className="col-actions">
                        <button className="btn btn-icon" title="Edit" onClick={() => onEdit(e)}>
                          <i className="fas fa-pen" style={{ fontSize: '0.72rem' }} />
                        </button>
                        <button className="btn btn-danger" title="Delete" onClick={() => setConfirm(e.id)}>
                          <i className="fas fa-trash-can" style={{ fontSize: '0.72rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ════ MOBILE — scrollable card list ════ */}
          <div className="expense-cards">
            {filtered.map(e => (
              <div key={e.id} className="expense-card">
                <div className="expense-card-top">
                  <span className="expense-card-name">{e.title}</span>
                  <span className="expense-card-amount">{fmtAmt(e.amount)}</span>
                </div>
                <div className="expense-card-meta">
                  <Badge category={e.category} />
                  <span className="expense-card-date">{fmtDate(e.expense_date)}</span>
                </div>
                <div className="expense-card-actions">
                  <button className="btn btn-icon" onClick={() => onEdit(e)}>
                    <i className="fas fa-pen" style={{ fontSize: '0.72rem' }} /> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => setConfirm(e.id)}>
                    <i className="fas fa-trash-can" style={{ fontSize: '0.72rem' }} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirm Modal */}
      {confirm && (
        <div className="overlay" onClick={() => setConfirm(null)}>
          <div className="glass-card modal" onClick={ev => ev.stopPropagation()}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>🗑️</div>
            <h3 style={{ marginBottom: 8, fontWeight: 700 }}>Delete Expense?</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 20 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={doDelete} style={{ padding: '8px 20px' }}>
                <i className="fas fa-trash-can" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
