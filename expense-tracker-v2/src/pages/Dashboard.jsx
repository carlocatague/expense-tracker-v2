import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../supabase'
import { useExpenses } from '../hooks/useExpenses'
import { useSalary } from '../hooks/useSalary'
import { CURRENCIES } from '../utils/currency'
import StatsCards from '../components/StatsCards'
import ExpenseForm from '../components/ExpenseForm'
import RecordsPanel from '../components/RecordsPanel'
import ExpenseChart from '../components/ExpenseChart'

export default function Dashboard({ user, profile, theme, onToggleTheme, onLogout, onProfileUpdate, toast }) {
  const [currency, setCurrency]            = useState(profile?.currency || 'PHP')
  const [editingExpense, setEditingExpense] = useState(null)
  const [editingSalary,  setEditingSalary]  = useState(null)

  // Sync currency when Supabase profile loads (profile is null on first render)
  useEffect(() => {
    if (profile?.currency) setCurrency(profile.currency)
  }, [profile?.currency])

  const {
    expenses, stats, loading,
    createExpense, updateExpense, deleteExpense,
    getExpensesByMonth, getExpensesByWeek,
  } = useExpenses(user.id)

  const {
    salaries, upsertSalary, deleteSalary,
    salaryMap, thisMonthSalary, getSavings,
  } = useSalary(user.id)

  const yearSavings = getSavings(expenses)

  async function handleCurrencyChange(e) {
    const c = e.target.value
    setCurrency(c)
    onProfileUpdate({ currency: c })
    const { error } = await supabase.from('profiles').update({ currency: c }).eq('id', user.id)
    if (error) toast('Failed to save currency preference', 'error')
  }

  const handleSaveExpense = useCallback(async (data, id) => {
    try {
      if (id) {
        await updateExpense(id, data)
        toast('Expense updated!', 'success')
        setEditingExpense(null)
      } else {
        await createExpense(data)
        toast('Expense added!', 'success')
      }
    } catch (err) { toast(err.message || 'Failed to save expense', 'error') }
  }, [createExpense, updateExpense, toast])

  const handleDeleteExpense = useCallback(async (id) => {
    try {
      await deleteExpense(id)
      toast('Expense deleted.', 'success')
    } catch (err) { toast(err.message || 'Failed to delete', 'error') }
  }, [deleteExpense, toast])

  const username = profile?.username || user.email?.split('@')[0] || 'User'

  return (
    <div className="dashboard">

      {/* ── Header ── */}
      <header className="glass-card header">
        <div className="header-brand">
          <i className="fas fa-credit-card" style={{ color:'var(--accent)' }} />
          <span>Expense Tracker <span className="accent">2.0</span></span>
        </div>
        <div className="header-controls">
          <div className="user-badge">
            <i className="fas fa-user-circle" style={{ color:'var(--accent)' }} />
            <span className="user-name">{username}</span>
          </div>
          <select className="currency-select" value={currency} onChange={handleCurrencyChange}>
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.code} ({c.sym})</option>
            ))}
          </select>
          <button className="btn btn-ghost header-btn" onClick={onToggleTheme} title="Toggle theme">
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
            <span className="btn-label">{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <button className="btn btn-ghost header-btn" onClick={onLogout} title="Logout">
            <i className="fas fa-right-from-bracket" />
            <span className="btn-label">Logout</span>
          </button>
        </div>
      </header>

      {/* ── 4 Stats ── */}
      <StatsCards
        stats={stats}
        thisMonthSalary={thisMonthSalary}
        yearSavings={yearSavings}
        currency={currency}
      />

      {/* ── Spending Statistics (full-width) ── */}
      <ExpenseChart
        getExpensesByMonth={getExpensesByMonth}
        getExpensesByWeek={getExpensesByWeek}
        salaryMap={salaryMap}
        currency={currency}
        theme={theme}
      />

      {/* ── Form  |  Records Panel (salary + expenses tabbed) ── */}
      <div className="form-history-grid">
        <ExpenseForm
          onSave={handleSaveExpense}
          editingExpense={editingExpense}
          onCancelEdit={() => setEditingExpense(null)}
          upsertSalary={upsertSalary}
          editingSalary={editingSalary}
          onCancelSalaryEdit={() => setEditingSalary(null)}
          toast={toast}
        />
        <RecordsPanel
          salaries={salaries}
          deleteSalary={deleteSalary}
          onEditSalary={setEditingSalary}
          expenses={expenses}
          loading={loading}
          onEditExpense={setEditingExpense}
          onDeleteExpense={handleDeleteExpense}
          currency={currency}
          toast={toast}
        />
      </div>

    </div>
  )
}
