import { useState, useEffect } from 'react'
import { format } from 'date-fns'

const CATEGORIES = [
  'Food & Drinks','Transportation','Entertainment','Health',
  'Education','Shopping','Bills','Other',
]

const defaultExpense = () => ({
  title: '', amount: '', category: '',
  expense_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
})

const defaultSalary = () => ({
  month: format(new Date(), 'yyyy-MM'),
  amount: '', note: '',
})

/* ─── Salary Form Tab ─── */
function SalaryFormTab({ upsertSalary, editingSalary, onCancelSalaryEdit, toast }) {
  const [form, setForm]     = useState(defaultSalary())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingSalary) {
      setForm({ month: editingSalary.month, amount: editingSalary.amount, note: editingSalary.note || '' })
    } else {
      setForm(defaultSalary())
    }
  }, [editingSalary])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) < 0) return
    setSaving(true)
    try {
      await upsertSalary({ month: form.month, amount: parseFloat(form.amount), note: form.note })
      toast(editingSalary ? 'Salary updated!' : 'Salary saved!', 'success')
      if (editingSalary) onCancelSalaryEdit()
      else setForm(defaultSalary())
    } catch(err) {
      toast(err.message || 'Failed to save salary', 'error')
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="expense-form-grid">
      {editingSalary && (
        <div className="span-2" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 4 }}>
          <span style={{ fontSize:'0.82rem', color:'var(--accent)', fontWeight:700 }}>
            <i className="fas fa-pen-to-square" /> Editing Salary
          </span>
          <button type="button" className="btn btn-ghost" onClick={onCancelSalaryEdit}
            style={{ fontSize:'0.75rem', padding:'4px 10px' }}>
            <i className="fas fa-xmark" /> Cancel
          </button>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Month</label>
        <input className="form-control" type="month"
          value={form.month} onChange={e => set('month', e.target.value)} required />
      </div>

      <div className="form-group">
        <label className="form-label">Salary Amount</label>
        <input className="form-control" type="number" placeholder="0.00" step="0.01" min="0"
          value={form.amount} onChange={e => set('amount', e.target.value)} required />
      </div>

      <div className="form-group span-2">
        <label className="form-label">
          Note&nbsp;<span style={{ color:'var(--text-muted)', textTransform:'none', fontWeight:400, fontSize:'0.7rem' }}>(optional)</span>
        </label>
        <input className="form-control" placeholder="e.g., Cash Incentives"
          value={form.note} onChange={e => set('note', e.target.value)} />
      </div>

      <div className="form-group span-2">
        <button type="submit" className="btn btn-primary" disabled={saving}
          style={{ width:'100%', justifyContent:'center' }}>
          {saving
            ? <><span className="spinner" style={{ width:15, height:15, margin:0 }} /> Saving…</>
            : <><i className={`fas ${editingSalary ? 'fa-floppy-disk' : 'fa-plus'}`} />
                {editingSalary ? 'Save Changes' : 'Save Salary'}</>
          }
        </button>
      </div>
    </form>
  )
}

/* ─── Expense Form Tab ─── */
function ExpenseFormTab({ onSave, editingExpense, onCancelEdit }) {
  const [form, setForm]     = useState(defaultExpense())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editingExpense) {
      setForm({
        title:        editingExpense.title,
        amount:       editingExpense.amount,
        category:     editingExpense.category || '',
        expense_date: format(new Date(editingExpense.expense_date), "yyyy-MM-dd'T'HH:mm"),
      })
    } else {
      setForm(defaultExpense())
    }
  }, [editingExpense])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim() || !form.amount || parseFloat(form.amount) <= 0) return
    setSaving(true)
    try {
      await onSave({
        title:        form.title.trim(),
        amount:       parseFloat(form.amount),
        category:     form.category || null,
        expense_date: new Date(form.expense_date).toISOString(),
      }, editingExpense?.id)
      if (!editingExpense) setForm(defaultExpense())
    } finally { setSaving(false) }
  }

  const isEditing = !!editingExpense

  return (
    <form onSubmit={handleSubmit} className="expense-form-grid">
      <div className="form-group span-2">
        <label className="form-label">Expense Note</label>
        <input className="form-control" placeholder="e.g., Groceries"
          value={form.title} onChange={e => set('title', e.target.value)} required />
      </div>
      <div className="form-group">
        <label className="form-label">Amount</label>
        <input className="form-control" type="number" placeholder="0.00" step="0.01" min="0.01"
          value={form.amount} onChange={e => set('amount', e.target.value)} required />
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <input className="form-control" list="cat-list" placeholder="e.g., Shopping"
          value={form.category} onChange={e => set('category', e.target.value)} />
        <datalist id="cat-list">
          {CATEGORIES.map(c => <option key={c} value={c} />)}
        </datalist>
      </div>
      <div className="form-group">
        <label className="form-label">Date & Time</label>
        <input className="form-control" type="datetime-local"
          value={form.expense_date} onChange={e => set('expense_date', e.target.value)} />
      </div>
      <div className="form-group" style={{ justifyContent:'flex-end' }}>
        <label className="form-label" style={{ visibility:'hidden' }}>.</label>
        <button type="submit" className="btn btn-primary" disabled={saving}
          style={{ width:'100%', justifyContent:'center' }}>
          {saving
            ? <><span className="spinner" style={{ width:15, height:15, margin:0 }} /> Saving…</>
            : <><i className={`fas ${isEditing ? 'fa-floppy-disk' : 'fa-plus'}`} />
                {isEditing ? 'Save Changes' : 'Add Expense'}</>
          }
        </button>
      </div>
      {isEditing && (
        <div className="form-group span-2">
          <button type="button" className="btn btn-ghost" onClick={onCancelEdit}
            style={{ width:'100%', justifyContent:'center' }}>
            <i className="fas fa-xmark" /> Cancel Edit
          </button>
        </div>
      )}
    </form>
  )
}

/* ─── Main Export ─── */
export default function ExpenseForm({
  onSave, editingExpense, onCancelEdit,
  upsertSalary, editingSalary, onCancelSalaryEdit,
  toast,
}) {
  const [tab, setTab] = useState('expense')

  // Auto-switch to expense tab when editing an expense
  useEffect(() => { if (editingExpense) setTab('expense') }, [editingExpense])
  // Auto-switch to salary tab when editing a salary
  useEffect(() => { if (editingSalary) setTab('salary') }, [editingSalary])

  const TABS = [
    { key: 'expense', label: 'Input Expense',    icon: 'fa-plus-circle' },
    { key: 'salary',  label: 'Input Salary', icon: 'fa-plus-circle' },
  ]

  return (
    <div className="glass-card">
      <div className="form-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`form-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => {
              setTab(t.key)
              if (t.key === 'expense' && editingSalary) onCancelSalaryEdit()
              if (t.key === 'salary'  && editingExpense) onCancelEdit()
            }}
          >
            <i className={`fas ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'expense' ? (
        <ExpenseFormTab
          onSave={onSave}
          editingExpense={editingExpense}
          onCancelEdit={onCancelEdit}
        />
      ) : (
        <SalaryFormTab
          upsertSalary={upsertSalary}
          editingSalary={editingSalary}
          onCancelSalaryEdit={onCancelSalaryEdit}
          toast={toast}
        />
      )}
    </div>
  )
}
