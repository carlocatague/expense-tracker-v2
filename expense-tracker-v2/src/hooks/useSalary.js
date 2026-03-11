import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { format } from 'date-fns'

export function useSalary(userId) {
  const [salaries, setSalaries] = useState([])   // all salary rows, desc by month
  const [loading, setLoading]   = useState(true)

  /* ── Fetch all salary records ── */
  const fetchSalaries = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('salaries')
      .select('*')
      .eq('user_id', userId)
      .order('month', { ascending: false })
    if (!error) setSalaries(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchSalaries() }, [fetchSalaries])

  /* ── Upsert (create or update by month) ── */
  const upsertSalary = useCallback(async ({ month, amount, note }) => {
    const { data, error } = await supabase
      .from('salaries')
      .upsert(
        { user_id: userId, month, amount, note: note || null },
        { onConflict: 'user_id,month' }
      )
      .select()
      .single()
    if (error) throw error
    setSalaries(prev => {
      const exists = prev.find(s => s.month === month)
      if (exists) return prev.map(s => s.month === month ? data : s)
      return [data, ...prev].sort((a, b) => b.month.localeCompare(a.month))
    })
    return data
  }, [userId])

  /* ── Delete ── */
  const deleteSalary = useCallback(async (id) => {
    const { error } = await supabase
      .from('salaries')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    setSalaries(prev => prev.filter(s => s.id !== id))
  }, [userId])

  /* ── Helpers ── */
  const currentMonthKey = format(new Date(), 'yyyy-MM')

  // Map month key → salary amount for quick lookup
  const salaryMap = Object.fromEntries(salaries.map(s => [s.month, parseFloat(s.amount)]))

  // Current month salary (0 if not set)
  const thisMonthSalary = salaryMap[currentMonthKey] ?? 0

  // This year savings: sum over each month of (salary - expenses)  — provided by consumer
  const getSavings = (expenses) => {
    const now = new Date()
    let yearSavings = 0
    for (let m = 0; m < 12; m++) {
      const d    = new Date(now.getFullYear(), m, 1)
      const key  = format(d, 'yyyy-MM')
      const sal  = salaryMap[key] ?? 0
      const exp  = expenses
        .filter(e => {
          const ed = new Date(e.expense_date)
          return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear()
        })
        .reduce((a, e) => a + parseFloat(e.amount), 0)
      yearSavings += sal - exp
    }
    return yearSavings
  }

  return {
    salaries, loading,
    upsertSalary, deleteSalary, fetchSalaries,
    salaryMap, thisMonthSalary, currentMonthKey,
    getSavings,
  }
}
