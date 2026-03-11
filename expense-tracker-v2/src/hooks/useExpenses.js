import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { startOfMonth, endOfMonth, startOfYear, endOfYear, startOfWeek, endOfWeek, subWeeks, format } from 'date-fns'

export function useExpenses(userId) {
  const [expenses, setExpenses] = useState([])
  const [stats, setStats]       = useState({ monthly: 0, yearly: 0 })
  const [loading, setLoading]   = useState(true)

  const fetchExpenses = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('expenses').select('*').eq('user_id', userId)
      .order('expense_date', { ascending: false })
    if (!error) setExpenses(data || [])
    setLoading(false)
  }, [userId])

  const computeStats = useCallback((data) => {
    const now = new Date()
    const sum = arr => arr.reduce((a, e) => a + parseFloat(e.amount), 0)
    setStats({
      monthly: sum(data.filter(e => { const d = new Date(e.expense_date); return d >= startOfMonth(now) && d <= endOfMonth(now) })),
      yearly:  sum(data.filter(e => { const d = new Date(e.expense_date); return d >= startOfYear(now)  && d <= endOfYear(now)  })),
    })
  }, [])

  useEffect(() => { fetchExpenses() },            [fetchExpenses])
  useEffect(() => { computeStats(expenses) }, [expenses, computeStats])

  const createExpense = useCallback(async (formData) => {
    const { data, error } = await supabase.from('expenses')
      .insert([{ ...formData, user_id: userId }]).select().single()
    if (error) throw error
    setExpenses(prev => [data, ...prev])
    return data
  }, [userId])

  const updateExpense = useCallback(async (id, formData) => {
    const { data, error } = await supabase.from('expenses')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', id).eq('user_id', userId).select().single()
    if (error) throw error
    setExpenses(prev => prev.map(e => e.id === id ? data : e))
    return data
  }, [userId])

  const deleteExpense = useCallback(async (id) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId)
    if (error) throw error
    setExpenses(prev => prev.filter(e => e.id !== id))
  }, [userId])

  /* ── Monthly chart data ── */
  const getExpensesByMonth = useCallback((numMonths = 12) => {
    const now = new Date()
    return Array.from({ length: numMonths }, (_, i) => {
      const d   = new Date(now.getFullYear(), now.getMonth() - (numMonths - 1 - i), 1)
      const key = format(d, 'yyyy-MM')
      return {
        label: d.toLocaleDateString('en', { month: 'short', year: '2-digit' }),
        month: key,
        expenses: expenses
          .filter(e => { const ed = new Date(e.expense_date); return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear() })
          .reduce((a, e) => a + parseFloat(e.amount), 0),
      }
    })
  }, [expenses])

  /* ── Weekly chart data — last 12 weeks ── */
  const getExpensesByWeek = useCallback((numWeeks = 12) => {
    const now = new Date()
    return Array.from({ length: numWeeks }, (_, i) => {
      const weekStart = startOfWeek(subWeeks(now, numWeeks - 1 - i), { weekStartsOn: 1 })
      const weekEnd   = endOfWeek(weekStart, { weekStartsOn: 1 })
      const label     = weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })
      return {
        label,
        weekStart,
        weekEnd,
        expenses: expenses
          .filter(e => { const d = new Date(e.expense_date); return d >= weekStart && d <= weekEnd })
          .reduce((a, e) => a + parseFloat(e.amount), 0),
      }
    })
  }, [expenses])

  return {
    expenses, stats, loading,
    createExpense, updateExpense, deleteExpense,
    fetchExpenses, getExpensesByMonth, getExpensesByWeek,
  }
}
