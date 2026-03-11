import { useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import { fmt, fmtAxis } from '../utils/currency'

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, Filler,
)

const TABS = [
  { key:'weekly',             label:'Weekly',    icon:'fa-calendar-week'  },
  { key:'monthly',            label:'Monthly',   icon:'fa-calendar-days'      }, 
  { key:'salary-vs-expenses', label:'Statistics', icon:'fa-tachograph-digital' },
]

export default function ExpenseChart({ getExpensesByMonth, getExpensesByWeek, salaryMap, currency, theme }) {
  const [tab, setTab] = useState('salary-vs-expenses')

  const isLight  = theme === 'light'
  const tick     = isLight ? 'rgba(13,31,26,0.45)'    : 'rgba(232,244,240,0.4)'
  const grid     = isLight ? 'rgba(0,168,120,0.08)'   : 'rgba(99,217,180,0.05)'
  const tipBg    = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(10,14,26,0.95)'
  const tipTxt   = isLight ? '#0d1f1a'                : '#e8f4f0'
  const accent   = isLight ? '#00a878'                : '#3dffc0'
  const accentRGB = isLight ? '0,168,120'             : '61,255,192'
  const dangerRGB = '255,95,126'

  const monthly = useMemo(() => getExpensesByMonth(12), [getExpensesByMonth])
  const weekly  = useMemo(() => getExpensesByWeek(12),  [getExpensesByWeek])

  /* ── Dataset builders ── */
  const lineData = {
    labels: monthly.map(d => d.label),
    datasets: [
      {
        label: 'Salary',
        data: monthly.map(d => salaryMap[d.month] ?? 0),
        borderColor:          `rgba(${accentRGB},0.9)`,
        pointBackgroundColor: `rgba(${accentRGB},1)`,
        pointBorderColor:     '#fff',
        pointRadius: 5, pointHoverRadius: 7,
        borderWidth: 2.5, tension: 0.35, fill: false,
      },
      {
        label: 'Expenses',
        data: monthly.map(d => d.expenses),
        borderColor:          `rgba(${dangerRGB},0.9)`,
        pointBackgroundColor: `rgba(${dangerRGB},1)`,
        pointBorderColor:     '#fff',
        pointRadius: 5, pointHoverRadius: 7,
        borderWidth: 2.5, tension: 0.35, fill: false,
      },
      {
        label: 'Savings',
        data: monthly.map(d => (salaryMap[d.month] ?? 0) - d.expenses),
        borderColor:          'rgba(99,102,241,0.85)',
        pointBackgroundColor: 'rgba(99,102,241,1)',
        pointBorderColor:     '#fff',
        pointRadius: 4, pointHoverRadius: 6,
        borderWidth: 2, borderDash: [5,4], tension: 0.35, fill: false,
      },
    ],
  }

  const makeBarData = (rows) => ({
    labels: rows.map(d => d.label),
    datasets: [{
      label: 'Expenses',
      data: rows.map(d => d.expenses),
      backgroundColor: rows.map(d =>
        d.expenses > 0 ? `rgba(${accentRGB},0.18)` : `rgba(${accentRGB},0.04)`),
      borderColor: rows.map(d =>
        d.expenses > 0 ? `rgba(${accentRGB},0.9)` : `rgba(${accentRGB},0.2)`),
      borderWidth: 2, borderRadius: 8, borderSkipped: false,
    }],
  })

  /* ── Shared chart options factory ── */
  const makeOptions = (showLegend) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        labels: { color: tick, font:{ family:"'DM Mono'", size:11 }, boxWidth:12, padding:16, usePointStyle:true },
      },
      tooltip: {
        backgroundColor: tipBg,
        borderColor: `rgba(${accentRGB},0.3)`,
        borderWidth: 1,
        titleColor: tipTxt, bodyColor: tipTxt, padding: 12,
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y, currency)}`,
        },
      },
    },
    scales: {
      x: {
        grid:  { color: grid, drawBorder: false },
        ticks: { color: tick, font:{ family:"'DM Mono'", size:10 }, maxRotation: 45 },
      },
      y: {
        grid:  { color: grid, drawBorder: false },
        ticks: { color: tick, font:{ family:"'DM Mono'", size:11 }, callback: v => fmtAxis(v, currency) },
        beginAtZero: true,
      },
    },
  })

  /* ── Summary numbers ── */
  const totalExp12m  = monthly.reduce((s, d) => s + d.expenses, 0)
  const totalSal12m  = monthly.reduce((s, d) => s + (salaryMap[d.month] ?? 0), 0)
  const net12m       = totalSal12m - totalExp12m
  const totalExp12w  = weekly.reduce((s, d) => s + d.expenses, 0)
  const avgWeekly    = totalExp12w / 12

  return (
    <div className="glass-card">
      <div className="chart-header">
        <h2 className="chart-title"><i className="fas fa-chart-line" /> Spending Statistics</h2>
        <div className="chart-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`chart-tab${tab===t.key?' active':''}`} onClick={() => setTab(t.key)}>
              <i className={`fas ${t.icon}`} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 260 }}>
        {tab === 'salary-vs-expenses' && <Line data={lineData}              options={makeOptions(true)}  />}
        {tab === 'monthly'            && <Bar  data={makeBarData(monthly)}  options={makeOptions(false)} />}
        {tab === 'weekly'             && <Bar  data={makeBarData(weekly)}   options={makeOptions(false)} />}
      </div>

      <div className="chart-info">
        {tab === 'salary-vs-expenses' && <>
          <div className="chart-info-item">
            <span className="chart-info-label">Total Salary</span>
            <span className="chart-info-val" style={{ color: accent }}>{fmt(totalSal12m, currency)}</span>
          </div>
          <div className="chart-info-item">
            <span className="chart-info-label">Total Expenses</span>
            <span className="chart-info-val" style={{ color:'var(--danger)' }}>{fmt(totalExp12m, currency)}</span>
          </div>
          <div className="chart-info-item">
            <span className="chart-info-label">Total Savings</span>
            <span className="chart-info-val" style={{ color: net12m >= 0 ? accent : 'var(--danger)' }}>
              {fmt(net12m, currency)}
            </span>
          </div>
        </>}

        {tab === 'monthly' && <>
          <div className="chart-info-item">
            <span className="chart-info-label">Total Monthly</span>
            <span className="chart-info-val">{fmt(totalExp12m, currency)}</span>
          </div>
          <div className="chart-info-item">
            <span className="chart-info-label">Monthly Average</span>
            <span className="chart-info-val">{fmt(totalExp12m / 12, currency)}</span>
          </div>
        </>}

        {tab === 'weekly' && <>
          <div className="chart-info-item">
            <span className="chart-info-label">Total Weekly</span>
            <span className="chart-info-val">{fmt(totalExp12w, currency)}</span>
          </div>
          <div className="chart-info-item">
            <span className="chart-info-label">Weekly Average</span>
            <span className="chart-info-val">{fmt(avgWeekly, currency)}</span>
          </div>
        </>}
      </div>
    </div>
  )
}
