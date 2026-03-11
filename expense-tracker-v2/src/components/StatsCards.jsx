import { format } from 'date-fns'
import { fmt } from '../utils/currency'

function Card({ icon, label, sub, value, valueColor, delay }) {
  return (
    <div className="glass-card stat-card" style={{ animationDelay:`${delay}ms` }}>
      <div className="stat-top">
        <span className="stat-icon"><i className={`fas ${icon}`} /></span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value" style={{ color: valueColor }}>{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  )
}

export default function StatsCards({ stats, thisMonthSalary, yearSavings, currency }) {
  const now          = new Date()
  const monthSavings = thisMonthSalary - (stats.monthly || 0)

  const savingsColor = (n) => parseFloat(n) >= 0 ? 'var(--accent)' : 'var(--danger)'

  return (
    <div className="stats-grid">
      <Card icon="fa-calendar-alt"  label="This Month"
        sub={`Expenses : ${format(now, 'MMMM')}`}
        value={fmt(stats.monthly, currency)}
        valueColor="var(--danger)" delay={0} />

      <Card icon="fa-calendar"      label="This Year"
        sub={`Expenses : ${format(now, 'yyyy')}`}
        value={fmt(stats.yearly, currency)}
        valueColor="var(--danger)" delay={60} />

      <Card icon="fa-piggy-bank"    label="This Month"
        sub={`Savings : ${format(now, 'MMMM')}`}
        value={fmt(monthSavings, currency)}
        valueColor={savingsColor(monthSavings)} delay={120} />

      <Card icon="fa-sack-dollar"   label="This Year"
        sub={`Savings : ${format(now, 'yyyy')}`}
        value={fmt(yearSavings, currency)}
        valueColor={savingsColor(yearSavings)} delay={180} />
    </div>
  )
}
