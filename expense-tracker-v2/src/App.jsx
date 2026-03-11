import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'

const ANIM_STYLE = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

export default function App() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [booting, setBooting] = useState(true)
  const [theme, setTheme]     = useState(() => localStorage.getItem('et-theme') || 'dark')
  const { toasts, toast }     = useToast()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('et-theme', theme)
  }, [theme])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = ANIM_STYLE
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setBooting(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setBooting(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setBooting(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    toast('Signed out. See you soon!', 'success')
  }

  // Called by Dashboard when user picks a new currency
  function handleProfileUpdate(patch) {
    setProfile(prev => ({ ...prev, ...patch }))
  }

  if (booting) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <div className="spinner" style={{ width:40, height:40, borderWidth:4 }} />
      <p style={{ color:'var(--text-muted)', fontFamily:'var(--font-mono)', fontSize:'0.85rem' }}>Loading…</p>
    </div>
  )

  return (
    <>
      {user ? (
        <Dashboard
          user={user}
          profile={profile}
          theme={theme}
          onToggleTheme={() => setTheme(p => p === 'dark' ? 'light' : 'dark')}
          onLogout={handleLogout}
          onProfileUpdate={handleProfileUpdate}
          toast={toast}
        />
      ) : (
        <Auth onAuth={u => setUser(u)} />
      )}
      <Toast toasts={toasts} />
    </>
  )
}
