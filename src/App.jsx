import { useState, useMemo } from "react";

const CATEGORIES = {
  Food: { icon: "🍜", color: "#f97316" },
  Transport: { icon: "🚗", color: "#3b82f6" },
  Shopping: { icon: "🛍️", color: "#a855f7" },
  Health: { icon: "💊", color: "#10b981" },
  Entertainment: { icon: "🎬", color: "#f59e0b" },
  Housing: { icon: "🏠", color: "#6366f1" },
  Education: { icon: "📚", color: "#14b8a6" },
  Other: { icon: "📦", color: "#64748b" },
};

const INITIAL = [
  { id: 1, type: "income", label: "Salary", amount: 4500, category: "Other", date: "2026-04-01", note: "Monthly salary" },
  { id: 2, type: "expense", label: "Rent", amount: 1200, category: "Housing", date: "2026-04-02", note: "" },
  { id: 3, type: "expense", label: "Groceries", amount: 148.5, category: "Food", date: "2026-04-05", note: "Weekly groceries" },
  { id: 4, type: "expense", label: "Netflix", amount: 15.99, category: "Entertainment", date: "2026-04-06", note: "" },
  { id: 5, type: "income", label: "Freelance", amount: 800, category: "Other", date: "2026-04-08", note: "Design project" },
  { id: 6, type: "expense", label: "Gym", amount: 49, category: "Health", date: "2026-04-10", note: "Monthly membership" },
  { id: 7, type: "expense", label: "Uber", amount: 24.3, category: "Transport", date: "2026-04-12", note: "" },
  { id: 8, type: "expense", label: "New Shoes", amount: 89, category: "Shopping", date: "2026-04-15", note: "Nike Air Max" },
  { id: 9, type: "expense", label: "Coffee Shop", amount: 38.5, category: "Food", date: "2026-04-17", note: "Weekly coffees" },
  { id: 10, type: "expense", label: "Online Course", amount: 59, category: "Education", date: "2026-04-20", note: "React Mastery" },
  { id: 11, type: "expense", label: "Pharmacy", amount: 32, category: "Health", date: "2026-04-22", note: "" },
  { id: 12, type: "expense", label: "Dinner Out", amount: 67, category: "Food", date: "2026-04-24", note: "Anniversary dinner" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <div style={{ width: size, height: size, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>No data</div>;
  let cumulative = 0;
  const r = 54, cx = size / 2, cy = size / 2, strokeW = 22;
  const circumference = 2 * Math.PI * r;
  const segments = data.map(d => {
    const pct = d.value / total;
    const offset = circumference * (1 - cumulative - pct);
    const dash = circumference * pct;
    cumulative += pct;
    return { ...d, dash, offset };
  });
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", filter: "drop-shadow(0 4px 16px rgba(0,0,0,0.08))" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeW} />
      {segments.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth={strokeW}
          strokeDasharray={`${s.dash} ${circumference}`} strokeDashoffset={s.offset}
          strokeLinecap="round" style={{ transition: "all 0.5s ease" }} />
      ))}
    </svg>
  );
}

const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n);
const fmtDate = (d) => { const [y, m, day] = d.split("-"); return `${MONTHS[parseInt(m) - 1]} ${parseInt(day)}, ${y}`; };

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState(INITIAL);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [form, setForm] = useState({ type: "expense", label: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0], note: "" });

  const totalIncome = useMemo(() => transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpense;

  const catBreakdown = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    return Object.entries(map).map(([cat, val]) => ({ label: cat, value: val, color: CATEGORIES[cat]?.color || "#64748b", icon: CATEGORIES[cat]?.icon || "📦" }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const filtered = useMemo(() => transactions.filter(t => {
    if (filterType !== "all" && t.type !== filterType) return false;
    if (filterCat !== "All" && t.category !== filterCat) return false;
    if (search && !t.label.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.date) - new Date(a.date)), [transactions, filterType, filterCat, search]);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 2500); };

  const openAdd = () => {
    setForm({ type: "expense", label: "", amount: "", category: "Food", date: new Date().toISOString().split("T")[0], note: "" });
    setEditId(null); setShowModal(true);
  };
  const openEdit = (t) => { setForm({ ...t, amount: String(t.amount) }); setEditId(t.id); setShowModal(true); };

  const save = () => {
    if (!form.label.trim() || !form.amount || isNaN(parseFloat(form.amount))) { showToast("Please fill name & valid amount", false); return; }
    const entry = { ...form, amount: parseFloat(form.amount), id: editId || Date.now() };
    if (editId) { setTransactions(p => p.map(t => t.id === editId ? entry : t)); showToast("Transaction updated!"); }
    else { setTransactions(p => [entry, ...p]); showToast("Transaction added!"); }
    setShowModal(false);
  };
  const del = (id) => { setTransactions(p => p.filter(t => t.id !== id)); showToast("Deleted.", false); };

  const maxCat = catBreakdown[0]?.value || 1;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ fontFamily: "'Syne', sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8fafc; scrollbar-gutter: stable; }
        html { scrollbar-gutter: stable; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #f1f5f9; } ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        .card { background: #fff; border-radius: 20px; border: 1px solid #e2e8f0; }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; letter-spacing: 0.5px; padding: 10px 20px; border-radius: 10px; transition: all 0.2s; color: #94a3b8; }
        .tab-btn.active { background: #0f172a; color: #fff; }
        .tab-btn:hover:not(.active) { background: #f1f5f9; color: #0f172a; }
        .filter-chip { background: #f1f5f9; border: 1.5px solid transparent; color: #64748b; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 12px; font-weight: 500; padding: 5px 14px; border-radius: 30px; transition: all 0.18s; }
        .filter-chip.on { background: #fff; border-color: #0f172a; color: #0f172a; }
        .filter-chip:hover:not(.on) { border-color: #cbd5e1; color: #334155; }
        .btn-primary { background: #0f172a; color: #fff; border: none; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 700; border-radius: 12px; padding: 12px 24px; font-size: 14px; transition: all 0.2s; letter-spacing: 0.3px; }
        .btn-primary:hover { background: #1e293b; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(15,23,42,0.18); }
        .btn-secondary { background: #f1f5f9; color: #0f172a; border: none; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 600; border-radius: 12px; padding: 12px 24px; font-size: 14px; transition: all 0.2s; }
        .btn-secondary:hover { background: #e2e8f0; }
        input, select, textarea { background: #f8fafc; border: 1.5px solid #e2e8f0; color: #0f172a; font-family: 'Plus Jakarta Sans', sans-serif; padding: 11px 14px; border-radius: 10px; width: 100%; font-size: 14px; outline: none; transition: border-color 0.2s; }
        input:focus, select:focus, textarea:focus { border-color: #0f172a; background: #fff; }
        input::placeholder, textarea::placeholder { color: #cbd5e1; }
        select option { background: #fff; }
        .modal-bg { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(6px); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .tx-row { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-radius: 14px; transition: background 0.15s; cursor: pointer; }
        .tx-row:hover { background: #f8fafc; }
        @keyframes pop { 0% { opacity:0; transform:scale(0.95) translateY(10px); } 100% { opacity:1; transform:scale(1) translateY(0); } }
        .pop-in { animation: pop 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        @keyframes toastIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .toast-anim { animation: toastIn 0.3s ease; }
        .stat-card { border-radius: 20px; padding: 24px 28px; position: relative; overflow: hidden; }
        .income-glow { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1.5px solid #a7f3d0; }
        .expense-glow { background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%); border: 1.5px solid #fecdd3; }
        .balance-card { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); color: #fff; border: none; }
        .type-toggle { display: flex; background: #f1f5f9; border-radius: 10px; padding: 4px; gap: 4px; }
        .type-btn { flex: 1; padding: 9px; border: none; border-radius: 7px; cursor: pointer; font-family: 'Syne', sans-serif; font-weight: 600; font-size: 13px; transition: all 0.2s; background: none; color: #94a3b8; }
        .type-btn.sel { background: #fff; color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .type-btn.income.sel { color: #10b981; }
        .type-btn.expense.sel { color: #f43f5e; }
        
        .hamburger { display: none; background: none; border: none; cursor: pointer; font-size: 24px; color: #0f172a; width: 40px; height: 40px; align-items: center; justify-content: center; padding: 0; }
        .sidebar-overlay { display: none; }
        
        @media (max-width: 768px) {
          .hamburger { display: flex; }
          .layout-container { flex-direction: column !important; }
          aside { position: fixed; left: 0; top: 0; height: 100vh; z-index: 99; transform: translateX(-100%); transition: transform 0.3s ease; box-shadow: 4px 0 12px rgba(0,0,0,0.1); }
          aside.open { transform: translateX(0); }
          .sidebar-overlay { display: none; }
          .sidebar-overlay.open { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 98; }
          main { padding: 16px 16px !important; }
          h1 { font-size: 24px !important; margin: 16px 0 !important; }
          .stat-cards-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .dashboard-2col { grid-template-columns: 1fr !important; gap: 16px !important; }
          .analytics-2col { grid-template-columns: 1fr !important; gap: 16px !important; }
          .modal-dialog { max-width: calc(100% - 40px) !important; }
          .filter-row { flex-direction: column !important; gap: 10px !important; }
          .search-box { min-width: 100% !important; }
          .stat-card { padding: 16px 20px !important; }
          .card { border-radius: 16px !important; }
        }
        
        @media (max-width: 480px) {
          main { padding: 12px 12px !important; }
          h1 { font-size: 20px !important; margin: 12px 0 !important; }
          .stat-card { padding: 12px 16px !important; font-size: 13px !important; }
          .stat-card > div:first-child { font-size: 10px !important; margin-bottom: 6px !important; }
          .stat-card > div:nth-child(2) { font-size: 24px !important; margin-bottom: 4px !important; }
          input, select, textarea { font-size: 16px !important; padding: 10px 12px !important; }
          .btn-primary, .btn-secondary { padding: 10px 16px !important; font-size: 13px !important; }
          .modal-dialog { padding: 20px !important; }
          .modal-dialog h2 { font-size: 18px !important; }
          aside { width: 100% !important; padding: 20px 16px !important; }
          .tx-row { gap: 10px !important; padding: 10px 8px !important; flex-wrap: wrap !important; }
          .filter-row { gap: 8px !important; }
          .filter-chip { padding: 4px 10px !important; font-size: 11px !important; }
          .card { border-radius: 14px !important; padding: 12px 16px !important; }
          .donut-legend { gap: 6px !important; }
          .donut-legend > div { font-size: 12px !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="toast-anim" style={{ position: "fixed", bottom: 28, right: 28, zIndex: 200, background: toast.ok ? "#0f172a" : "#f43f5e", color: "#fff", padding: "13px 22px", borderRadius: 12, fontFamily: "'Plus Jakarta Sans'", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
          <span>{toast.ok ? "✓" : "✕"}</span> {toast.msg}
        </div>
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay open" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar + Content Layout */}
      <div className="layout-container" style={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <aside className={sidebarOpen ? "open" : ""} style={{ width: 240, background: "#fff", borderRight: "1px solid #e2e8f0", padding: "32px 20px", display: "flex", flexDirection: "column", gap: 8, position: "sticky", top: 0, height: "100vh", overflow: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, paddingLeft: 8 }}>
            <div style={{ width: 36, height: 36, background: "#0f172a", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💰</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.5 }}>SPENDLY</div>
              <div className="jakarta" style={{ fontSize: 11, color: "#94a3b8", fontWeight: 400 }}>expense tracker</div>
            </div>
            <button className="hamburger" onClick={() => setSidebarOpen(false)} style={{ marginLeft: "auto", display: "none" }}>✕</button>
          </div>

          {[
            { id: "dashboard", icon: "▦", label: "Dashboard" },
            { id: "transactions", icon: "≡", label: "Transactions" },
            { id: "analytics", icon: "◑", label: "Analytics" },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 14, transition: "all 0.2s", background: activeTab === item.id ? "#0f172a" : "none", color: activeTab === item.id ? "#fff" : "#64748b", textAlign: "left" }}>
              <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <button className="btn-primary" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }} onClick={openAdd}>
            <span style={{ fontSize: 18, fontWeight: 400 }}>+</span> Add Entry
          </button>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 40, gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>
                  {activeTab === "dashboard" ? "Overview" : activeTab === "transactions" ? "Transactions" : "Analytics"}
                </h1>
                <p className="jakarta" style={{ color: "#94a3b8", fontSize: 14 }}>April 2026</p>
              </div>
            </div>
            <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }} onClick={openAdd}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Entry
            </button>
          </div>

          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {/* Stat Cards */}
              <div className="stat-cards-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
                <div className="stat-card balance-card">
                  <div className="jakarta" style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Net Balance</div>
                  <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, marginBottom: 8, color: balance >= 0 ? "#4ade80" : "#f87171" }}>{fmt(balance)}</div>
                  <div className="jakarta" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{transactions.length} transactions total</div>
                  <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
                  <div style={{ position: "absolute", right: 20, bottom: -30, width: 80, height: 80, background: "rgba(255,255,255,0.03)", borderRadius: "50%" }} />
                </div>
                <div className="stat-card income-glow">
                  <div className="jakarta" style={{ fontSize: 12, color: "#059669", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Total Income</div>
                  <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, color: "#059669", marginBottom: 8 }}>{fmt(totalIncome)}</div>
                  <div className="jakarta" style={{ fontSize: 12, color: "#6ee7b7" }}>{transactions.filter(t => t.type === "income").length} income entries</div>
                </div>
                <div className="stat-card expense-glow">
                  <div className="jakarta" style={{ fontSize: 12, color: "#e11d48", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, fontWeight: 600 }}>Total Expenses</div>
                  <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, color: "#e11d48", marginBottom: 8 }}>{fmt(totalExpense)}</div>
                  <div className="jakarta" style={{ fontSize: 12, color: "#fda4af" }}>{transactions.filter(t => t.type === "expense").length} expense entries</div>
                </div>
              </div>

              <div className="dashboard-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24 }}>
                {/* Donut */}
                <div className="card" style={{ padding: 28 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Spending Breakdown</h3>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                    <div style={{ position: "relative" }}>
                      <DonutChart data={catBreakdown} size={160} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ fontSize: 14, fontWeight: 800 }}>{fmt(totalExpense).replace(".00", "")}</div>
                        <div className="jakarta" style={{ fontSize: 11, color: "#94a3b8" }}>total</div>
                      </div>
                    </div>
                    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                      {catBreakdown.slice(0, 5).map(c => (
                        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color, flexShrink: 0 }} />
                          <span className="jakarta" style={{ fontSize: 13, color: "#334155", flex: 1 }}>{c.label}</span>
                          <span className="jakarta" style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{fmt(c.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="card" style={{ padding: 28 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Activity</h3>
                    <button onClick={() => setActiveTab("transactions")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontFamily: "'Plus Jakarta Sans'", fontSize: 12 }}>View all →</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {transactions.slice(0, 6).sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => (
                      <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 11, background: CATEGORIES[t.category]?.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                          {CATEGORIES[t.category]?.icon || "📦"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{t.label}</div>
                          <div className="jakarta" style={{ fontSize: 12, color: "#94a3b8" }}>{fmtDate(t.date)}</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 15, color: t.type === "income" ? "#10b981" : "#f43f5e" }}>
                          {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === "transactions" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Filters */}
              <div className="card filter-row" style={{ padding: "18px 22px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <div className="search-box" style={{ position: "relative", flex: 1, minWidth: 180 }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#cbd5e1", fontSize: 15 }}>⌕</span>
                  <input placeholder="Search transactions..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36, height: 40 }} />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["all", "income", "expense"].map(type => (
                    <button key={type} className={`filter-chip ${filterType === type ? "on" : ""}`} onClick={() => setFilterType(type)}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["All", ...Object.keys(CATEGORIES)].map(cat => (
                    <button key={cat} className={`filter-chip ${filterCat === cat ? "on" : ""}`} onClick={() => setFilterCat(cat)}>
                      {CATEGORIES[cat] ? `${CATEGORIES[cat].icon} ` : ""}{cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction List */}
              <div className="card" style={{ padding: "8px 16px" }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: "60px 0", textAlign: "center", color: "#94a3b8", fontFamily: "'Plus Jakarta Sans'", fontSize: 14 }}>No transactions found.</div>
                ) : filtered.map((t, i) => (
                  <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 10px", borderBottom: i < filtered.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: CATEGORIES[t.category]?.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                      {CATEGORIES[t.category]?.icon || "📦"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 2 }}>{t.label}</div>
                      <div className="jakarta" style={{ fontSize: 12, color: "#94a3b8", display: "flex", gap: 10 }}>
                        <span>{fmtDate(t.date)}</span>
                        <span style={{ background: CATEGORIES[t.category]?.color + "15", color: CATEGORIES[t.category]?.color || "#64748b", padding: "1px 8px", borderRadius: 20, fontWeight: 500 }}>{t.category}</span>
                        {t.note && <span style={{ color: "#cbd5e1" }}>· {t.note}</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginRight: 12 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: t.type === "income" ? "#10b981" : "#f43f5e" }}>
                        {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                      </div>
                      <div className="jakarta" style={{ fontSize: 11, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: 0.5 }}>{t.type}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => openEdit(t)} style={{ background: "#f1f5f9", border: "none", borderRadius: 9, width: 34, height: 34, cursor: "pointer", fontSize: 14, color: "#64748b", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={e => { e.target.style.background = "#e2e8f0"; e.target.style.color = "#0f172a"; }}
                        onMouseLeave={e => { e.target.style.background = "#f1f5f9"; e.target.style.color = "#64748b"; }}>✎</button>
                      <button onClick={() => del(t.id)} style={{ background: "#fff1f2", border: "none", borderRadius: 9, width: 34, height: 34, cursor: "pointer", fontSize: 14, color: "#f43f5e", transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={e => { e.target.style.background = "#ffe4e6"; }}
                        onMouseLeave={e => { e.target.style.background = "#fff1f2"; }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="analytics-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {/* Category Bars */}
                <div className="card" style={{ padding: 28 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>Spending by Category</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {catBreakdown.map(c => (
                      <div key={c.label}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span className="jakarta" style={{ fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                            {c.icon} {c.label}
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{fmt(c.value)}</span>
                        </div>
                        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: c.color, borderRadius: 99, width: `${(c.value / maxCat) * 100}%`, transition: "width 0.6s cubic-bezier(0.34,1.2,0.64,1)" }} />
                        </div>
                        <div className="jakarta" style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                          {((c.value / totalExpense) * 100).toFixed(1)}% of total
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Stats */}
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Financial Summary</h3>
                    {[
                      { label: "Savings Rate", value: `${totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%`, color: balance >= 0 ? "#10b981" : "#f43f5e" },
                      { label: "Largest Expense", value: fmt(Math.max(...transactions.filter(t => t.type === "expense").map(t => t.amount), 0)), color: "#f43f5e" },
                      { label: "Avg Transaction", value: fmt(totalExpense / (transactions.filter(t => t.type === "expense").length || 1)), color: "#3b82f6" },
                      { label: "Top Category", value: catBreakdown[0] ? `${catBreakdown[0].icon} ${catBreakdown[0].label}` : "—", color: catBreakdown[0]?.color || "#64748b" },
                    ].map(s => (
                      <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                        <span className="jakarta" style={{ fontSize: 13, color: "#64748b" }}>{s.label}</span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Income vs Expenses</h3>
                    {[
                      { label: "Income", value: totalIncome, color: "#10b981", bg: "#ecfdf5" },
                      { label: "Expenses", value: totalExpense, color: "#f43f5e", bg: "#fff1f2" },
                    ].map(s => (
                      <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: s.bg, borderRadius: 14, marginBottom: 10 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                        <span className="jakarta" style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{s.label}</span>
                        <span style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{fmt(s.value)}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 4, padding: "12px 16px", background: balance >= 0 ? "#f0fdf4" : "#fff1f2", borderRadius: 14, display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: balance >= 0 ? "#0f172a" : "#f43f5e" }} />
                      <span className="jakarta" style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>Net Balance</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: balance >= 0 ? "#0f172a" : "#f43f5e" }}>{fmt(balance)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="pop-in card modal-dialog" style={{ width: "100%", maxWidth: 480, padding: 36, boxShadow: "0 32px 80px rgba(0,0,0,0.18)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 800 }}>{editId ? "Edit Entry" : "New Entry"}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: 9, width: 34, height: 34, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            {/* Type Toggle */}
            <div className="type-toggle" style={{ marginBottom: 20 }}>
              <button className={`type-btn income ${form.type === "income" ? "sel" : ""}`} onClick={() => setForm({ ...form, type: "income" })}>↑ Income</button>
              <button className={`type-btn expense ${form.type === "expense" ? "sel" : ""}`} onClick={() => setForm({ ...form, type: "expense" })}>↓ Expense</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="jakarta" style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}>Label *</label>
                <input placeholder="e.g. Grocery Shopping" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="jakarta" style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}>Amount *</label>
                  <input placeholder="0.00" type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div>
                  <label className="jakarta" style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="jakarta" style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}>Category</label>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {k}</option>)}
                </select>
              </div>

              <div>
                <label className="jakarta" style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.5 }}>Note (optional)</label>
                <input placeholder="Add a note..." value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} />
              </div>

              <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={save}>{editId ? "Save Changes" : `Add ${form.type.charAt(0).toUpperCase() + form.type.slice(1)}`}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

