import { useState } from 'react'
import { supabase } from '../supabase'

const CURRENCIES = [
  'PHP','USD','EUR','GBP','JPY','KRW','CNY','INR',
  'AUD','CAD','SGD','HKD','MYR','THB','IDR','VND','BRL','MXN','ZAR','CHF',
]

export default function Auth({ onAuth }) {
  const [tab, setTab]           = useState('login')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm]         = useState({ username: '', password: '', email: '', currency: 'PHP' })

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  async function handleLogin(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.username.includes('@') ? form.username : `${form.username}@tracker.local`,
        password: form.password,
      })
      if (error) throw error
      onAuth(data.user)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally { setLoading(false) }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    if (form.username.length < 4) { setError('Username must be at least 4 characters'); setLoading(false); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return }

    try {
      const email = form.email || `${form.username}@tracker.local`
      const { data, error } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: { data: { username: form.username, currency: form.currency } },
      })
      if (error) throw error
      // Update profile currency
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, username: form.username, currency: form.currency })
      }
      onAuth(data.user)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card} className="glass-card">
        {/* Logo */}
        <div style={styles.logo}>
          <div style={styles.logoIcon}><i className="fas fa-credit-card" /></div>
          <h1 style={styles.logoTitle}>Expense Tracker 2.0</h1>
          <p style={styles.logoSub}>Manage your expenses efficiently.</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {['login','register'].map(t => (
            <button key={t} onClick={() => { setTab(t); setError('') }} style={{
              ...styles.tab,
              ...(tab === t ? styles.tabActive : {})
            }}>
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {error && <div style={styles.errorBox}><i className="fas fa-triangle-exclamation" /> {error}</div>}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" placeholder="example@email.com" value={form.username}
                onChange={e => set('username', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="••••••••" value={form.password}
                onChange={e => set('password', e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, margin: 0 }} /> Signing in…</> : <><i className="fas fa-sign-in-alt" /> Sign In</>}
            </button>
            <div style={styles.demoBox}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <strong style={{ color: 'var(--accent)' }}>Demo:</strong>&nbsp;
                admin@gmail.com / admin123
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" placeholder="example@email.com" value={form.email}
                onChange={e => set('email', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" placeholder="min 6 characters" value={form.password}
                onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>

             <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-control" placeholder="min 4 characters" value={form.username}
                onChange={e => set('username', e.target.value)} required minLength={4} />
            </div>

            <div className="form-group">
              <label className="form-label">Default Currency</label>
              <select className="form-control" value={form.currency} onChange={e => set('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, margin: 0 }} /> Creating account…</> : <><i className="fas fa-user-plus" /> Create Account</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  page:      { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card:      { width: '100%', maxWidth: 420 },
  logo:      { textAlign: 'center', marginBottom: 28 },
  logoIcon:  { fontSize: '2.2rem', color: 'var(--accent)', marginBottom: 10 },
  logoTitle: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.8rem', letterSpacing: '-0.03em' },
  logoSub:   { color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4, fontFamily: 'var(--font-mono)' },
  tabs:      { display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)' },
  tab:       { flex: 1, padding: '10px 0', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all var(--transition)', marginBottom: -1 },
  tabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  form:      { display: 'flex', flexDirection: 'column', gap: 16 },
  errorBox:  { background: 'var(--danger-dim)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.875rem', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 },
  demoBox:   { textAlign: 'center', padding: '12px', background: 'var(--accent-dim)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' },
}
