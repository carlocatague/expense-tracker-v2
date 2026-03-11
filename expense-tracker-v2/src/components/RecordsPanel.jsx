import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { fmt } from '../utils/currency'

/* ── Category badge colours ── */
const CATEGORY_COLORS = {
  'Food & Drinks':'#f97316','Transportation':'#3b82f6','Entertainment':'#a855f7',
  'Health':'#22c55e','Education':'#06b6d4','Shopping':'#ec4899','Bills':'#eab308','Other':'#6b7280',
}

function Badge({ category }) {
  if (!category) return <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>—</span>
  const color = CATEGORY_COLORS[category] || '#6b7280'
  return (
    <span className="category-badge" style={{ background:color+'22', color, borderColor:color+'55' }}>
      {category}
    </span>
  )
}

/* ══════════════════════════════
   SALARY HISTORY PANEL
══════════════════════════════ */
function SalaryPanel({ salaries, deleteSalary, onEdit, currency, toast }) {
  const [delConfirm, setDel] = useState(null)

  async function doDelete(id) {
    try { await deleteSalary(id); toast('Salary deleted.', 'success') }
    catch(err) { toast(err.message || 'Failed to delete', 'error') }
    setDel(null)
  }

  return (
    <>
      {salaries.length === 0 ? (
        <div className="records-empty">
          <i className="fas fa-coins" />
          <p>No salary records yet.</p>
        </div>
      ) : (
        <div className="records-scroll">
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
    </>
  )
}

/* ══════════════════════════════
   EXPENSE RECORDS PANEL
══════════════════════════════ */
function ExpensePanel({ expenses, loading, currency, onEdit, onDelete }) {
  const [search, setSearch]   = useState('')
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

  const fmtAmt  = (n) => fmt(n, currency)
  const fmtDate = (d) => format(new Date(d), 'MMM d, yyyy · HH:mm')

  async function doDelete() {
    if (confirm) { await onDelete(confirm); setConfirm(null) }
  }

  return (
    <>
      {/* Search bar */}
      <div className="search-bar" style={{ marginBottom:14 }}>
        <i className="fas fa-magnifying-glass search-icon" />
        <input
          className="search-input"
          placeholder="Search title, category or amount…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button className="search-clear" onClick={() => setSearch('')}>
            <i className="fas fa-xmark" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="records-empty">
          <div className="spinner" />
          <p style={{ fontSize:'0.85rem', marginTop:6 }}>Loading…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="records-empty">
          <i className="fas fa-receipt" />
          <p>{search ? 'No results match your search.' : 'No expense records yet.'}</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="table-desktop table-scroll-wrap records-scroll-wrap">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>Title</th><th>Amount</th><th>Category</th>
                  <th>Date & Time</th><th>Actions</th>
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
                          <i className="fas fa-pen" style={{ fontSize:'0.72rem' }} />
                        </button>
                        <button className="btn btn-danger" title="Delete" onClick={() => setConfirm(e.id)}>
                          <i className="fas fa-trash-can" style={{ fontSize:'0.72rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ── */}
          <div className="expense-cards records-scroll-wrap">
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
                    <i className="fas fa-pen" style={{ fontSize:'0.72rem' }} /> Edit
                  </button>
                  <button className="btn btn-danger" onClick={() => setConfirm(e.id)}>
                    <i className="fas fa-trash-can" style={{ fontSize:'0.72rem' }} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete confirm */}
      {confirm && (
        <div className="overlay" onClick={() => setConfirm(null)}>
          <div className="glass-card modal" onClick={ev => ev.stopPropagation()}>
            <div style={{ fontSize:'2rem', marginBottom:10 }}>🗑️</div>
            <h3 style={{ marginBottom:8, fontWeight:700 }}>Delete Expense?</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:'0.88rem', marginBottom:20 }}>
              This action cannot be undone.
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
              <button className="btn btn-ghost" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={doDelete} style={{ padding:'8px 20px' }}>
                <i className="fas fa-trash-can" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ══════════════════════════════
   COMBINED RECORDS PANEL
══════════════════════════════ */
export default function RecordsPanel({
  salaries, deleteSalary, onEditSalary, 
  expenses, loading, onEditExpense, onDeleteExpense,
  currency, toast,
}) {
  const [tab, setTab] = useState('salary')

  const TABS = [
    { key:'expenses', label:'Expense Records',  icon:'fa-table-list', count: expenses.length },
    { key:'salary',   label:'Salary Records',  icon:'fa-table-list',   count: salaries.length },
    
  ]

  return (
    <div className="glass-card records-panel">

      {/* Tab bar + count badge */}
      <div className="records-tab-bar">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`records-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <i className={`fas ${t.icon}`} />
            <span>{t.label}</span>
            <span className="records-tab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Panel content */}
      {tab === 'salary' ? (
        <SalaryPanel
          salaries={salaries}
          deleteSalary={deleteSalary}
          onEdit={onEditSalary}
          currency={currency}
          toast={toast}
        />
      ) : (
        <ExpensePanel
          expenses={expenses}
          loading={loading}
          currency={currency}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
        />
      )}
    </div>
  )
}
