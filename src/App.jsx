import { useState, useEffect, useMemo } from 'react'

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = {
  income:        { label: 'Income',        color: '#6b9e74' },
  food:          { label: 'Food',          color: '#c4993d' },
  transport:     { label: 'Transport',     color: '#6b8fa5' },
  entertainment: { label: 'Entertainment', color: '#8b72a5' },
  health:        { label: 'Health',        color: '#5fa89a' },
  shopping:      { label: 'Shopping',      color: '#a57272' },
  utilities:     { label: 'Utilities',     color: '#9b9b7a' },
  other:         { label: 'Other',         color: '#7a7060' },
}

const SEED_TRANSACTIONS = [
  { id: 's1', type: 'income',  amount: 3200.00, category: 'income',        description: 'May salary — Aperture Labs',    date: '2026-05-25' },
  { id: 's2', type: 'expense', amount:   84.30, category: 'food',          description: 'Weekday groceries',             date: '2026-05-24' },
  { id: 's3', type: 'expense', amount:   42.00, category: 'transport',     description: 'Monthly transit pass',          date: '2026-05-23' },
  { id: 's4', type: 'income',  amount:  450.00, category: 'income',        description: 'Freelance — UI audit',          date: '2026-05-22' },
  { id: 's5', type: 'expense', amount:  128.75, category: 'shopping',      description: 'Wireless headphones',           date: '2026-05-21' },
  { id: 's6', type: 'expense', amount:   14.99, category: 'entertainment', description: 'Streaming subscription',        date: '2026-05-20' },
  { id: 's7', type: 'expense', amount:   67.40, category: 'health',        description: 'Pharmacy — prescription',       date: '2026-05-19' },
  { id: 's8', type: 'expense', amount:   95.00, category: 'utilities',     description: 'Electricity bill — May',        date: '2026-05-18' },
  { id: 's9', type: 'expense', amount:   38.50, category: 'food',          description: 'Tuesday dinner out',            date: '2026-05-17' },
  { id:'s10', type: 'income',  amount:  200.00, category: 'income',        description: 'Sold old camera lens',          date: '2026-05-16' },
]

// ─── Utilities ────────────────────────────────────────────────────────────────

function fmt(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

function fmtDate(str) {
  return new Date(str + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function CategoryIcon({ cat, size = 18 }) {
  const color = CATEGORIES[cat]?.color || '#7a7060'
  const shared = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: '1.9', strokeLinecap: 'round', strokeLinejoin: 'round' }

  if (cat === 'income') return (
    <svg {...shared}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
  )
  if (cat === 'food') return (
    <svg {...shared}><path d="M3 2v7c0 1.7 1.3 3 3 3s3-1.3 3-3V2" /><line x1="6" y1="12" x2="6" y2="22" /><path d="M20.88 18.09A5 5 0 0 0 21 17c0-5-6-11-6-11v17.5" /></svg>
  )
  if (cat === 'transport') return (
    <svg {...shared}><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 4v3h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
  )
  if (cat === 'entertainment') return (
    <svg {...shared}><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
  )
  if (cat === 'health') return (
    <svg {...shared}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
  )
  if (cat === 'shopping') return (
    <svg {...shared}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
  )
  if (cat === 'utilities') return (
    <svg {...shared}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
  )
  return (
    <svg {...shared}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
  )
}

function NavIcon({ type }) {
  const shared = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.8', strokeLinecap: 'round', strokeLinejoin: 'round' }
  if (type === 'dashboard') return (
    <svg {...shared}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>
  )
  if (type === 'list') return (
    <svg {...shared}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="3" cy="6" r="0.6" fill="currentColor" /><circle cx="3" cy="12" r="0.6" fill="currentColor" /><circle cx="3" cy="18" r="0.6" fill="currentColor" /></svg>
  )
  if (type === 'chart') return (
    <svg {...shared}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
  )
  if (type === 'settings') return (
    <svg {...shared}><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
  )
  return null
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ data, total }) {
  if (!data.length || total === 0) {
    return <div className="donut-empty">No expense data yet</div>
  }

  const size = 196
  const sw = 26
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const gap = 3

  let startAngle = -90
  const segs = data.map(([cat, amount]) => {
    const pct = amount / total
    const sweep = pct * 360
    const dashLen = Math.max(0, pct * circ - gap)
    const seg = { cat, amount, pct, dashLen, rotation: startAngle, color: CATEGORIES[cat]?.color || '#7a7060' }
    startAngle += sweep
    return seg
  })

  return (
    <div className="donut-chart">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a2720" strokeWidth={sw} />
        {segs.map(seg => (
          <circle
            key={seg.cat}
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={sw - 3}
            strokeDasharray={`${seg.dashLen} ${circ}`}
            strokeDashoffset={0}
            transform={`rotate(${seg.rotation}, ${size / 2}, ${size / 2})`}
            opacity="0.88"
          />
        ))}
      </svg>
      <div className="donut-center">
        <span className="donut-total">{fmt(total)}</span>
        <span className="donut-label">total spent</span>
      </div>
    </div>
  )
}

// ─── Transaction Row ──────────────────────────────────────────────────────────

function TransactionRow({ t, onDelete }) {
  const [leaving, setLeaving] = useState(false)

  function handleDelete() {
    setLeaving(true)
    setTimeout(() => onDelete(t.id), 280)
  }

  return (
    <div className={`tx-row ${leaving ? 'leaving' : ''}`}>
      <div className="tx-icon" style={{ background: (CATEGORIES[t.category]?.color || '#7a7060') + '1a' }}>
        <CategoryIcon cat={t.category} size={15} />
      </div>
      <div className="tx-info">
        <span className="tx-desc">{t.description}</span>
        <div className="tx-meta">
          <span className="tx-cat">{CATEGORIES[t.category]?.label || t.category}</span>
          <span className="tx-sep">·</span>
          <span className="tx-date">{fmtDate(t.date)}</span>
        </div>
      </div>
      <div className="tx-right">
        <span className={`tx-amount ${t.type}`}>
          {t.type === 'expense' ? '−' : '+'}{fmt(t.amount).replace('$', '')}
        </span>
        <button className="tx-delete" onClick={handleDelete} aria-label="Delete">×</button>
      </div>
    </div>
  )
}

// ─── Add Transaction Modal ────────────────────────────────────────────────────

function AddModal({ onAdd, onClose }) {
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')

  function update(key, val) {
    setForm(f => ({ ...f, [key]: val }))
    setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (!form.description.trim()) {
      setError('Add a description')
      return
    }
    onAdd({
      id: uid(),
      type: form.type,
      amount: parseFloat(form.amount),
      category: form.type === 'income' ? 'income' : form.category,
      description: form.description.trim(),
      date: form.date,
    })
  }

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-hd">
          <h2>New Transaction</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="type-toggle">
            <button
              type="button"
              className={`type-opt ${form.type === 'expense' ? 'active exp' : ''}`}
              onClick={() => update('type', 'expense')}
            >Expense</button>
            <button
              type="button"
              className={`type-opt ${form.type === 'income' ? 'active inc' : ''}`}
              onClick={() => update('type', 'income')}
            >Income</button>
          </div>

          <div className="field">
            <label>Amount</label>
            <div className="amount-wrap">
              <span className="amount-prefix">$</span>
              <input
                type="number" step="0.01" min="0.01" placeholder="0.00"
                value={form.amount}
                onChange={e => update('amount', e.target.value)}
                className="amount-inp"
                autoFocus
              />
            </div>
          </div>

          <div className="field">
            <label>Description</label>
            <input
              type="text" placeholder="What was this for?"
              value={form.description}
              onChange={e => update('description', e.target.value)}
              className="text-inp"
            />
          </div>

          {form.type === 'expense' && (
            <div className="field">
              <label>Category</label>
              <div className="cat-grid">
                {Object.entries(CATEGORIES).filter(([k]) => k !== 'income').map(([key, cat]) => (
                  <button
                    key={key} type="button"
                    className={`cat-opt ${form.category === key ? 'selected' : ''}`}
                    style={form.category === key ? {
                      borderColor: cat.color,
                      background: cat.color + '22',
                      color: cat.color,
                    } : {}}
                    onClick={() => update('category', key)}
                  >
                    <CategoryIcon cat={key} size={14} />
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="field">
            <label>Date</label>
            <input
              type="date" value={form.date}
              onChange={e => update('date', e.target.value)}
              className="text-inp"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit">Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [txs, setTxs] = useState(() => {
    try {
      const s = localStorage.getItem('sw_txs')
      return s ? JSON.parse(s) : SEED_TRANSACTIONS
    } catch {
      return SEED_TRANSACTIONS
    }
  })

  const [view, setView] = useState('dashboard')
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    localStorage.setItem('sw_txs', JSON.stringify(txs))
  }, [txs])

  const stats = useMemo(() => {
    const income   = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expenses = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const balance  = income - expenses
    const savRate  = income > 0 ? (balance / income) * 100 : 0
    return { income, expenses, balance, savRate }
  }, [txs])

  const catTotals = useMemo(() => {
    const map = {}
    txs.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [txs])

  const maxCat = catTotals[0]?.[1] || 1

  const filtered = useMemo(() => {
    if (filter === 'all')     return txs
    if (filter === 'income')  return txs.filter(t => t.type === 'income')
    if (filter === 'expense') return txs.filter(t => t.type === 'expense')
    return txs.filter(t => t.category === filter)
  }, [txs, filter])

  function addTx(tx) {
    setTxs(prev => [tx, ...prev])
    setShowAdd(false)
  }

  function deleteTx(id) {
    setTxs(prev => prev.filter(t => t.id !== id))
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="app">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">SW</div>
          <span className="logo-text">SpendWise</span>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard',    label: 'Overview',     icon: 'dashboard' },
            { id: 'transactions', label: 'Transactions',  icon: 'list' },
            { id: 'analytics',   label: 'Analytics',     icon: 'chart' },
          ].map(({ id, label, icon }) => (
            <button key={id} className={`nav-item ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>
              <NavIcon type={icon} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bal">
          <span className="sidebar-bal-label">Net Balance</span>
          <span className={`sidebar-bal-val ${stats.balance >= 0 ? 'pos' : 'neg'}`}>
            {fmt(stats.balance)}
          </span>
          <span className="sidebar-bal-sub">{stats.savRate.toFixed(1)}% savings rate</span>
        </div>

        <button className="sidebar-add" onClick={() => setShowAdd(true)}>
          <span className="sidebar-add-plus">+</span>
          New Transaction
        </button>
      </aside>

      {/* ── Main ── */}
      <main className="main">
        <header className="topbar">
          <span className="topbar-title">
            {view === 'dashboard' ? 'Overview' : view === 'transactions' ? 'Transactions' : 'Analytics'}
          </span>
          <span className="topbar-date">{today}</span>
        </header>

        {/* Dashboard */}
        {view === 'dashboard' && (
          <div className="page dashboard-page">
            <div className="summary-grid">
              <div className="card card-balance">
                <span className="card-lbl">Net Balance</span>
                <span className={`card-val display ${stats.balance >= 0 ? 'pos' : 'neg'}`}>{fmt(stats.balance)}</span>
                <div className="card-split">
                  <span>{fmt(stats.income)} in</span>
                  <span className="card-split-div">·</span>
                  <span>{fmt(stats.expenses)} out</span>
                </div>
              </div>
              <div className="card card-income">
                <span className="card-lbl">Total Income</span>
                <span className="card-val pos">{fmt(stats.income)}</span>
                <span className="card-sub">{txs.filter(t => t.type === 'income').length} transactions</span>
              </div>
              <div className="card card-exp">
                <span className="card-lbl">Total Expenses</span>
                <span className="card-val neg">{fmt(stats.expenses)}</span>
                <span className="card-sub">{txs.filter(t => t.type === 'expense').length} transactions</span>
              </div>
              <div className="card card-rate">
                <span className="card-lbl">Savings Rate</span>
                <span className={`card-val ${stats.savRate >= 0 ? 'pos' : 'neg'}`}>{stats.savRate.toFixed(1)}%</span>
                <span className="card-sub">of income retained</span>
              </div>
            </div>

            <div className="dash-grid">
              <section className="panel">
                <div className="panel-hd">
                  <h2>Recent Activity</h2>
                  <button className="panel-link" onClick={() => setView('transactions')}>View all</button>
                </div>
                {txs.length === 0
                  ? <EmptyState />
                  : <div className="tx-list">{txs.slice(0, 7).map(t => <TransactionRow key={t.id} t={t} onDelete={deleteTx} />)}</div>
                }
              </section>

              <section className="panel">
                <div className="panel-hd">
                  <h2>Spending by Category</h2>
                  <span className="panel-sub">this period</span>
                </div>
                {catTotals.length === 0
                  ? <EmptyState />
                  : (
                    <div className="cat-list">
                      {catTotals.map(([cat, amount]) => (
                        <div key={cat} className="cat-row">
                          <div className="cat-row-top">
                            <div className="cat-row-left">
                              <CategoryIcon cat={cat} size={14} />
                              <span className="cat-name">{CATEGORIES[cat]?.label || cat}</span>
                            </div>
                            <span className="cat-amount">{fmt(amount)}</span>
                          </div>
                          <div className="cat-bar-bg">
                            <div
                              className="cat-bar"
                              style={{ width: `${(amount / maxCat) * 100}%`, background: CATEGORIES[cat]?.color || '#7a7060' }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </section>
            </div>
          </div>
        )}

        {/* Transactions */}
        {view === 'transactions' && (
          <div className="page tx-page">
            <div className="filter-bar">
              {['all', 'income', 'expense', ...Object.keys(CATEGORIES).filter(k => k !== 'income')].map(f => (
                <button
                  key={f}
                  className={`filter-chip ${filter === f ? 'active' : ''}`}
                  style={filter === f && CATEGORIES[f] ? { borderColor: CATEGORIES[f].color, color: CATEGORIES[f].color } : {}}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'income' ? 'Income' : f === 'expense' ? 'Expenses' : CATEGORIES[f]?.label || f}
                </button>
              ))}
            </div>
            <div className="tx-list padded">
              {filtered.length === 0
                ? <EmptyState />
                : filtered.map(t => <TransactionRow key={t.id} t={t} onDelete={deleteTx} />)
              }
            </div>
          </div>
        )}

        {/* Analytics */}
        {view === 'analytics' && (
          <div className="page analytics-page">
            <div className="analytics-grid">
              <section className="panel donut-panel">
                <div className="panel-hd"><h2>Expense Distribution</h2></div>
                <DonutChart data={catTotals} total={stats.expenses} />
                <div className="donut-legend">
                  {catTotals.map(([cat]) => (
                    <div key={cat} className="legend-item">
                      <span className="legend-dot" style={{ background: CATEGORIES[cat]?.color || '#7a7060' }} />
                      <span>{CATEGORIES[cat]?.label || cat}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="panel">
                <div className="panel-hd"><h2>Category Breakdown</h2></div>
                {catTotals.length === 0
                  ? <EmptyState />
                  : (
                    <div className="cat-detail-list">
                      {catTotals.map(([cat, amount]) => (
                        <div key={cat} className="cat-detail-row">
                          <div className="cat-icon-wrap" style={{ background: (CATEGORIES[cat]?.color || '#7a7060') + '22' }}>
                            <CategoryIcon cat={cat} size={15} />
                          </div>
                          <div className="cat-detail-info">
                            <span className="cat-name">{CATEGORIES[cat]?.label || cat}</span>
                            <span className="cat-pct">
                              {stats.expenses > 0 ? ((amount / stats.expenses) * 100).toFixed(1) : 0}% of spending
                            </span>
                          </div>
                          <span className="cat-amount">{fmt(amount)}</span>
                        </div>
                      ))}
                    </div>
                  )
                }
              </section>

              <section className="panel metrics-panel">
                <div className="panel-hd"><h2>Key Metrics</h2></div>
                <div className="metrics-grid">
                  {[
                    { label: 'Savings Rate',      val: `${stats.savRate.toFixed(1)}%`,   cls: stats.savRate >= 0 ? 'pos' : 'neg' },
                    { label: 'Avg. Expense',       val: fmt(stats.expenses / (txs.filter(t => t.type === 'expense').length || 1)) },
                    { label: 'Income Sources',     val: txs.filter(t => t.type === 'income').length },
                    { label: 'Top Category',       val: CATEGORIES[catTotals[0]?.[0]]?.label || '—' },
                    { label: 'Total Entries',      val: txs.length },
                    { label: 'Net Cash Flow',      val: fmt(stats.balance), cls: stats.balance >= 0 ? 'pos' : 'neg' },
                  ].map(({ label, val, cls }) => (
                    <div key={label} className="metric">
                      <span className="metric-lbl">{label}</span>
                      <span className={`metric-val ${cls || ''}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="mobile-nav">
        {[
          { id: 'dashboard',    label: 'Overview', icon: 'dashboard' },
          { id: 'transactions', label: 'Ledger',   icon: 'list' },
          { id: 'analytics',   label: 'Analytics', icon: 'chart' },
        ].map(({ id, label, icon }) => (
          <button key={id} className={`mob-item ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>
            <NavIcon type={icon} />
            <span>{label}</span>
          </button>
        ))}
        <button className="mob-add" onClick={() => setShowAdd(true)}>+</button>
      </nav>

      {/* ── Modal ── */}
      {showAdd && <AddModal onAdd={addTx} onClose={() => setShowAdd(false)} />}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="empty">
      <div className="empty-diamond">◇</div>
      <p>Nothing here yet</p>
    </div>
  )
}
