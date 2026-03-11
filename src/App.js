import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = 'https://ai-sales-agent-production-6a6b.up.railway.app';

/* ─── Google Fonts ─── */
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
document.head.appendChild(fontLink);

/* ─── Global Styles ─── */
const globalStyle = document.createElement('style');
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Space Grotesk', sans-serif;
    background: #0a0a0f;
    color: #e8e8f0;
    min-height: 100vh;
    overflow-x: hidden;
  }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #12121a; }
  ::-webkit-scrollbar-thumb { background: #2a2a3a; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #3a3a5a; }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.4; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes typingDot {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40%            { transform: scale(1); opacity: 1; }
  }
  .fade-in { animation: fadeSlideIn 0.35s ease both; }
  .dot1 { animation: typingDot 1.2s infinite 0s; }
  .dot2 { animation: typingDot 1.2s infinite 0.2s; }
  .dot3 { animation: typingDot 1.2s infinite 0.4s; }
`;
document.head.appendChild(globalStyle);

/* ─── Color tokens ─── */
const C = {
  bg:       '#0a0a0f',
  surface:  '#12121c',
  surface2: '#1a1a28',
  border:   '#252535',
  accent:   '#6c63ff',
  accentLt: '#8b84ff',
  green:    '#22d3a0',
  red:      '#ff5f6d',
  amber:    '#f5a623',
  text:     '#e8e8f0',
  muted:    '#6b6b8a',
  white:    '#ffffff',
};

/* ─── Tiny helpers ─── */
const sidebarItems = [
  { id: 'dashboard', icon: '⬡', label: 'İşletmeler' },
  { id: 'products',  icon: '◈', label: 'Ürünler' },
  { id: 'faqs',      icon: '◉', label: 'SSS' },
  { id: 'chat',      icon: '◎', label: 'Chat Test' },
  { id: 'history',   icon: '◷', label: 'Müşteriler' },
];

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage]                     = useState('dashboard');
  const [businesses, setBusinesses]         = useState([]);
  const [selectedBiz, setSelectedBiz]       = useState(null);
  const [products, setProducts]             = useState([]);
  const [faqs, setFaqs]                     = useState([]);
  const [chatMessages, setChatMessages]     = useState([]);
  const [history, setHistory]               = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [chatInput, setChatInput]           = useState('');
  const [isTyping, setIsTyping]             = useState(false);
  const [notification, setNotification]     = useState(null);

  /* forms */
  const [bizForm,  setBizForm]  = useState({ name:'', sector:'', phone:'' });
  const [prodForm, setProdForm] = useState({ name:'', description:'', price_try:'' });
  const [faqForm,  setFaqForm]  = useState({ question:'', answer:'' });

  const chatEndRef = useRef(null);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    axios.get(`${API}/businesses/`).then(r => setBusinesses(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedBiz) {
      axios.get(`${API}/products/${selectedBiz.id}`).then(r => setProducts(r.data));
      axios.get(`${API}/faqs/${selectedBiz.id}`).then(r => setFaqs(r.data));
      axios.get(`${API}/chat/history/${selectedBiz.id}`).then(r => setHistory(r.data));
    }
  }, [selectedBiz]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const createBusiness = async () => {
    if (!bizForm.name.trim()) return notify('İşletme adı gerekli', 'error');
    try {
      const r = await axios.post(`${API}/businesses/`, { ...bizForm, tone: 'friendly_sales' });
      setBusinesses(prev => [...prev, r.data]);
      setBizForm({ name:'', sector:'', phone:'' });
      notify('İşletme eklendi ✓');
    } catch { notify('Hata oluştu', 'error'); }
  };

  const createProduct = async () => {
    if (!prodForm.name.trim()) return notify('Ürün adı gerekli', 'error');
    try {
      const r = await axios.post(`${API}/products/`, {
        business_id: selectedBiz.id, ...prodForm,
        price_try: parseInt(prodForm.price_try) || 0, is_active: true,
      });
      setProducts(prev => [...prev, r.data]);
      setProdForm({ name:'', description:'', price_try:'' });
      notify('Ürün eklendi ✓');
    } catch { notify('Hata oluştu', 'error'); }
  };

  const createFaq = async () => {
    if (!faqForm.question.trim()) return notify('Soru gerekli', 'error');
    try {
      const r = await axios.post(`${API}/faqs/`, { business_id: selectedBiz.id, ...faqForm });
      setFaqs(prev => [...prev, r.data]);
      setFaqForm({ question:'', answer:'' });
      notify('SSS eklendi ✓');
    } catch { notify('Hata oluştu', 'error'); }
  };

  const sendChat = async () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMessages(prev => [...prev, { role:'user', text:msg, ts: Date.now() }]);
    setChatInput('');
    setIsTyping(true);
    try {
      const r = await axios.post(`${API}/chat/`, {
        business_id: selectedBiz.id, whatsapp:'test123', message: msg,
      });
      setChatMessages(prev => [...prev, { role:'assistant', text:r.data.reply, ts: Date.now() }]);
    } catch {
      setChatMessages(prev => [...prev, { role:'assistant', text:'❌ Bağlantı hatası', ts: Date.now() }]);
    } finally {
      setIsTyping(false);
    }
  };

  /* ── navigate + guard ── */
  const navigate = (id) => {
    if (!selectedBiz && id !== 'dashboard') return;
    setPage(id);
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', background: C.bg }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 220, flexShrink: 0, background: C.surface,
        borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 24px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:36, height:36, borderRadius:10,
              background: `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:18, fontWeight:700,
            }}>A</div>
            <div>
              <div style={{ fontWeight:700, fontSize:14, color: C.white, lineHeight:1.2 }}>AI Sales</div>
              <div style={{ fontSize:11, color: C.muted, fontFamily:'JetBrains Mono' }}>Agent TR</div>
            </div>
          </div>
        </div>

        {/* Selected biz badge */}
        {selectedBiz && (
          <div style={{ margin:'16px 14px 0', padding:'10px 12px', background: C.surface2, borderRadius:8, border:`1px solid ${C.border}` }}>
            <div style={{ fontSize:10, color: C.muted, marginBottom:3, textTransform:'uppercase', letterSpacing:1 }}>Aktif İşletme</div>
            <div style={{ fontSize:13, fontWeight:600, color: C.green, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {selectedBiz.name}
            </div>
            <button
              onClick={() => { setSelectedBiz(null); setPage('dashboard'); }}
              style={{ marginTop:6, fontSize:10, color: C.muted, background:'none', border:'none', cursor:'pointer', padding:0 }}
            >
              ← değiştir
            </button>
          </div>
        )}

        {/* Nav */}
        <nav style={{ padding:'16px 12px', flex:1 }}>
          {sidebarItems.map(item => {
            const disabled = !selectedBiz && item.id !== 'dashboard';
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                disabled={disabled}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:10,
                  padding:'10px 12px', borderRadius:8, border:'none',
                  background: active ? `${C.accent}22` : 'none',
                  color: active ? C.accentLt : disabled ? C.border : C.muted,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  fontSize:14, fontWeight: active ? 600 : 400,
                  marginBottom:2, transition:'all 0.15s',
                  borderLeft: active ? `3px solid ${C.accent}` : '3px solid transparent',
                  fontFamily: 'Space Grotesk',
                  textAlign:'left',
                }}
              >
                <span style={{ fontSize:16 }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding:'16px 20px', borderTop:`1px solid ${C.border}` }}>
          <div style={{ fontSize:11, color: C.muted, fontFamily:'JetBrains Mono' }}>v1.0.0 · Groq AI</div>
          <div style={{ fontSize:11, color: C.muted, marginTop:2 }}>Bitirme Projesi 2025</div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

        {/* Top bar */}
        <header style={{
          height:60, borderBottom:`1px solid ${C.border}`,
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 32px', background: C.surface, flexShrink:0,
        }}>
          <h1 style={{ fontSize:16, fontWeight:600, color: C.text }}>
            {sidebarItems.find(i=>i.id===page)?.label}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{
              width:8, height:8, borderRadius:'50%', background: C.green,
              boxShadow:`0 0 8px ${C.green}`,
              animation:'pulse 2s infinite',
            }}/>
            <span style={{ fontSize:12, color: C.muted }}>Backend bağlı</span>
          </div>
        </header>

        {/* Notification */}
        {notification && (
          <div style={{
            position:'fixed', top:20, right:24, zIndex:1000,
            padding:'12px 20px', borderRadius:10,
            background: notification.type === 'error' ? `${C.red}22` : `${C.green}22`,
            border: `1px solid ${notification.type === 'error' ? C.red : C.green}`,
            color: notification.type === 'error' ? C.red : C.green,
            fontSize:13, fontWeight:500,
            animation: 'fadeSlideIn 0.3s ease',
            backdropFilter:'blur(10px)',
          }}>
            {notification.msg}
          </div>
        )}

        {/* Page content */}
        <div style={{ flex:1, padding:32, overflowY:'auto' }} className="fade-in" key={page}>

          {/* ═══ DASHBOARD ═══ */}
          {page === 'dashboard' && (
            <div>
              {/* Stats row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:32 }}>
                {[
                  { label:'Toplam İşletme', value: businesses.length, color: C.accent, icon:'⬡' },
                  { label:'Aktif İşletme',  value: selectedBiz ? 1 : 0, color: C.green,  icon:'◈' },
                  { label:'AI Durumu',      value:'Aktif', color: C.amber, icon:'◉' },
                ].map((s,i) => (
                  <div key={i} style={{
                    background: C.surface, border:`1px solid ${C.border}`,
                    borderRadius:12, padding:'20px 24px',
                    borderTop:`2px solid ${s.color}`,
                  }}>
                    <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
                    <div style={{ fontSize:28, fontWeight:700, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize:12, color: C.muted, marginTop:4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
                {/* Add business form */}
                <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:24 }}>
                  <h2 style={{ fontSize:15, fontWeight:600, marginBottom:20, color: C.text }}>
                    Yeni İşletme Ekle
                  </h2>
                  {[
                    { key:'name',   ph:'İşletme adı *',  label:'Ad' },
                    { key:'sector', ph:'Kuaför, Restoran…', label:'Sektör' },
                    { key:'phone',  ph:'05xxxxxxxxx', label:'Telefon' },
                  ].map(f => (
                    <div key={f.key} style={{ marginBottom:12 }}>
                      <label style={{ fontSize:11, color: C.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:0.8 }}>{f.label}</label>
                      <input
                        placeholder={f.ph}
                        value={bizForm[f.key]}
                        onChange={e => setBizForm(p=>({...p,[f.key]:e.target.value}))}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                  <button onClick={createBusiness} style={btnPrimary}>
                    + İşletme Ekle
                  </button>
                </div>

                {/* Business list */}
                <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:24 }}>
                  <h2 style={{ fontSize:15, fontWeight:600, marginBottom:20, color: C.text }}>
                    İşletmeler ({businesses.length})
                  </h2>
                  <div style={{ maxHeight:300, overflowY:'auto' }}>
                    {businesses.length === 0 && (
                      <div style={{ textAlign:'center', padding:'40px 0', color: C.muted, fontSize:13 }}>
                        Henüz işletme yok
                      </div>
                    )}
                    {businesses.map(b => (
                      <div key={b.id} style={{
                        padding:'12px 14px', borderRadius:10, marginBottom:8,
                        background: selectedBiz?.id === b.id ? `${C.accent}18` : C.surface2,
                        border:`1px solid ${selectedBiz?.id === b.id ? C.accent : C.border}`,
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        transition:'all 0.15s',
                      }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:14, color: C.text }}>{b.name}</div>
                          <div style={{ fontSize:11, color: C.muted, marginTop:2 }}>
                            {b.sector || '—'} · {b.phone || '—'}
                          </div>
                        </div>
                        <button
                          onClick={() => { setSelectedBiz(b); setPage('products'); }}
                          style={{ ...btnSmall, background: selectedBiz?.id===b.id ? C.accent : C.surface2 }}
                        >
                          {selectedBiz?.id===b.id ? 'Seçili' : 'Seç'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ PRODUCTS ═══ */}
          {page === 'products' && selectedBiz && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:24 }}>
              <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:24 }}>
                <h2 style={{ fontSize:15, fontWeight:600, marginBottom:20 }}>Ürün Ekle</h2>
                {[
                  { key:'name',        ph:'Saç Kesimi *',    label:'Ürün Adı' },
                  { key:'description', ph:'Kısa açıklama…',  label:'Açıklama' },
                  { key:'price_try',   ph:'150',             label:'Fiyat (₺)' },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:11, color: C.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:0.8 }}>{f.label}</label>
                    <input
                      placeholder={f.ph}
                      value={prodForm[f.key]}
                      onChange={e => setProdForm(p=>({...p,[f.key]:e.target.value}))}
                      style={inputStyle}
                    />
                  </div>
                ))}
                <button onClick={createProduct} style={btnPrimary}>+ Ürün Ekle</button>
              </div>

              <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:24 }}>
                <h2 style={{ fontSize:15, fontWeight:600, marginBottom:20 }}>Ürün Listesi ({products.length})</h2>
                <div style={{ maxHeight:400, overflowY:'auto' }}>
                  {products.length === 0 && <Empty text="Henüz ürün yok" />}
                  {products.map(p => (
                    <div key={p.id} style={cardRow}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:14, color: C.text }}>{p.name}</div>
                          <div style={{ fontSize:12, color: C.muted, marginTop:2 }}>{p.description}</div>
                        </div>
                        <div style={{
                          background:`${C.green}18`, color: C.green,
                          padding:'4px 10px', borderRadius:6, fontSize:13, fontWeight:600,
                          whiteSpace:'nowrap',
                        }}>
                          ₺{p.price_try}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ FAQS ═══ */}
          {page === 'faqs' && selectedBiz && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1.4fr', gap:24 }}>
              <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:24 }}>
                <h2 style={{ fontSize:15, fontWeight:600, marginBottom:20 }}>SSS Ekle</h2>
                {[
                  { key:'question', ph:'Çalışma saatiniz nedir?', label:'Soru', rows:2 },
                  { key:'answer',   ph:'Cevap…',                  label:'Cevap', rows:3 },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom:12 }}>
                    <label style={{ fontSize:11, color: C.muted, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:0.8 }}>{f.label}</label>
                    <textarea
                      rows={f.rows}
                      placeholder={f.ph}
                      value={faqForm[f.key]}
                      onChange={e => setFaqForm(p=>({...p,[f.key]:e.target.value}))}
                      style={{ ...inputStyle, resize:'vertical', minHeight: f.rows*36 }}
                    />
                  </div>
                ))}
                <button onClick={createFaq} style={btnPrimary}>+ SSS Ekle</button>
              </div>

              <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:24 }}>
                <h2 style={{ fontSize:15, fontWeight:600, marginBottom:20 }}>Sorular ({faqs.length})</h2>
                <div style={{ maxHeight:400, overflowY:'auto' }}>
                  {faqs.length === 0 && <Empty text="Henüz soru yok" />}
                  {faqs.map(f => (
                    <div key={f.id} style={{ ...cardRow, marginBottom:10 }}>
                      <div style={{ fontSize:12, color: C.accentLt, fontWeight:600, marginBottom:4 }}>S: {f.question}</div>
                      <div style={{ fontSize:12, color: C.muted }}>C: {f.answer}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ CHAT ═══ */}
          {page === 'chat' && selectedBiz && (
            <div style={{ maxWidth:700, margin:'0 auto' }}>
              <div style={{
                background: C.surface, border:`1px solid ${C.border}`,
                borderRadius:16, overflow:'hidden',
              }}>
                {/* Chat header */}
                <div style={{
                  padding:'16px 20px', borderBottom:`1px solid ${C.border}`,
                  display:'flex', alignItems:'center', gap:12,
                  background: C.surface2,
                }}>
                  <div style={{
                    width:36, height:36, borderRadius:'50%',
                    background:`linear-gradient(135deg, ${C.accent}, ${C.green})`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:16,
                  }}>🤖</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14 }}>{selectedBiz.name} — AI Asistan</div>
                    <div style={{ fontSize:11, color: C.green, display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ width:6, height:6, background:C.green, borderRadius:'50%', display:'inline-block' }}/>
                      Çevrimiçi · Groq AI
                    </div>
                  </div>
                  <button
                    onClick={() => setChatMessages([])}
                    style={{ marginLeft:'auto', background:'none', border:`1px solid ${C.border}`, color:C.muted, borderRadius:6, padding:'4px 10px', cursor:'pointer', fontSize:11 }}
                  >
                    Temizle
                  </button>
                </div>

                {/* Messages */}
                <div style={{ height:380, overflowY:'auto', padding:'20px 16px', display:'flex', flexDirection:'column', gap:10 }}>
                  {chatMessages.length === 0 && (
                    <div style={{ margin:'auto', textAlign:'center', color: C.muted }}>
                      <div style={{ fontSize:32, marginBottom:8 }}>💬</div>
                      <div style={{ fontSize:13 }}>AI asistanınıza bir şey sorun</div>
                    </div>
                  )}
                  {chatMessages.map((m, i) => (
                    <div key={i} style={{
                      display:'flex',
                      justifyContent: m.role==='user' ? 'flex-end' : 'flex-start',
                      animation: 'fadeSlideIn 0.25s ease',
                    }}>
                      <div style={{
                        maxWidth:'75%', padding:'10px 14px', borderRadius:12,
                        background: m.role==='user'
                          ? `linear-gradient(135deg, ${C.accent}, ${C.accentLt})`
                          : C.surface2,
                        color: C.text, fontSize:13, lineHeight:1.5,
                        borderBottomRightRadius: m.role==='user' ? 2 : 12,
                        borderBottomLeftRadius:  m.role==='assistant' ? 2 : 12,
                        border: m.role==='assistant' ? `1px solid ${C.border}` : 'none',
                      }}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div style={{ display:'flex', gap:5, padding:'10px 14px', background: C.surface2, borderRadius:12, width:64, border:`1px solid ${C.border}` }}>
                      {[0,1,2].map(i=>(
                        <span key={i} style={{
                          width:7, height:7, borderRadius:'50%', background: C.muted, display:'block',
                          animation:`typingDot 1.2s infinite ${i*0.2}s`,
                        }}/>
                      ))}
                    </div>
                  )}
                  <div ref={chatEndRef}/>
                </div>

                {/* Input */}
                <div style={{
                  padding:'12px 16px', borderTop:`1px solid ${C.border}`,
                  display:'flex', gap:10, background: C.surface2,
                }}>
                  <input
                    placeholder="Müşteri olarak mesaj yazın…"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && sendChat()}
                    style={{ ...inputStyle, flex:1, margin:0 }}
                  />
                  <button onClick={sendChat} style={{
                    padding:'10px 20px', borderRadius:8,
                    background:`linear-gradient(135deg, ${C.accent}, ${C.accentLt})`,
                    color:'#fff', border:'none', cursor:'pointer',
                    fontWeight:600, fontSize:13, fontFamily:'Space Grotesk',
                    transition:'opacity 0.15s', flexShrink:0,
                  }}>
                    Gönder ↑
                  </button>
                </div>
              </div>

              {/* Quick prompts */}
              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:11, color:C.muted, marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Hızlı Test</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {['Merhaba, ne satıyorsunuz?','Fiyatlarınız nedir?','Çalışma saatleriniz?','Nasıl randevu alabilirim?'].map(q=>(
                    <button key={q} onClick={()=>{setChatInput(q);}} style={{
                      padding:'6px 12px', borderRadius:20, border:`1px solid ${C.border}`,
                      background: C.surface, color: C.muted, fontSize:12, cursor:'pointer',
                      fontFamily:'Space Grotesk', transition:'all 0.15s',
                    }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══ HISTORY ═══ */}
          {page === 'history' && selectedBiz && (
            <div style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:24, height:'calc(100vh - 124px)' }}>
              {/* Customer list */}
              <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:14, padding:20, overflowY:'auto' }}>
                <h2 style={{ fontSize:15, fontWeight:600, marginBottom:16 }}>
                  Müşteriler ({history.length})
                </h2>
                {history.length === 0 && <Empty text="Henüz müşteri yok" />}
                {history.map((c, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedCustomer(c)}
                    style={{
                      padding:'12px 14px', borderRadius:10, marginBottom:8, cursor:'pointer',
                      background: selectedCustomer?.customer_id === c.customer_id ? `${C.accent}22` : C.surface2,
                      border:`1px solid ${selectedCustomer?.customer_id === c.customer_id ? C.accent : C.border}`,
                      transition:'all 0.15s',
                    }}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{
                        width:32, height:32, borderRadius:'50%',
                        background:`linear-gradient(135deg, ${C.accent}, ${C.green})`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:13, fontWeight:700, flexShrink:0,
                      }}>
                        {c.whatsapp.slice(-2)}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, fontFamily:'JetBrains Mono' }}>{c.whatsapp}</div>
                        <div style={{ fontSize:11, color: C.muted, marginTop:1 }}>
                          {c.messages.length} mesaj
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conversation view */}
              <div style={{ background: C.surface, border:`1px solid ${C.border}`, borderRadius:14, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                {!selectedCustomer ? (
                  <div style={{ margin:'auto', textAlign:'center', color: C.muted }}>
                    <div style={{ fontSize:32, marginBottom:8 }}>👈</div>
                    <div style={{ fontSize:13 }}>Sol taraftan bir müşteri seçin</div>
                  </div>
                ) : (
                  <>
                    <div style={{ padding:'16px 20px', borderBottom:`1px solid ${C.border}`, background: C.surface2, display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{
                        width:36, height:36, borderRadius:'50%',
                        background:`linear-gradient(135deg, ${C.accent}, ${C.green})`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:14, fontWeight:700,
                      }}>
                        {selectedCustomer.whatsapp.slice(-2)}
                      </div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14, fontFamily:'JetBrains Mono' }}>{selectedCustomer.whatsapp}</div>
                        <div style={{ fontSize:11, color: C.muted }}>{selectedCustomer.messages.length} mesaj · {selectedBiz.name}</div>
                      </div>
                    </div>
                    <div style={{ flex:1, overflowY:'auto', padding:'20px 16px', display:'flex', flexDirection:'column', gap:10 }}>
                      {selectedCustomer.messages.map((m, i) => (
                        <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth:'70%', padding:'10px 14px', borderRadius:12,
                            background: m.role==='user' ? `linear-gradient(135deg, ${C.accent}, ${C.accentLt})` : C.surface2,
                            color: C.text, fontSize:13, lineHeight:1.5,
                            border: m.role==='assistant' ? `1px solid ${C.border}` : 'none',
                            borderBottomRightRadius: m.role==='user' ? 2 : 12,
                            borderBottomLeftRadius: m.role==='assistant' ? 2 : 12,
                          }}>
                            {m.text}
                            <div style={{ fontSize:10, color: m.role==='user' ? 'rgba(255,255,255,0.5)' : C.muted, marginTop:4 }}>
                              {new Date(m.created_at).toLocaleTimeString('tr-TR', { hour:'2-digit', minute:'2-digit' })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

/* ── Shared style objects ── */
const inputStyle = {
  width:'100%', padding:'10px 12px',
  background:'#0d0d16', border:`1px solid #252535`,
  borderRadius:8, color:'#e8e8f0', fontSize:13,
  fontFamily:'Space Grotesk', outline:'none',
  transition:'border-color 0.15s',
};

const btnPrimary = {
  width:'100%', padding:'11px 0', borderRadius:8,
  background:'linear-gradient(135deg, #6c63ff, #8b84ff)',
  color:'#fff', border:'none', cursor:'pointer',
  fontWeight:600, fontSize:13, fontFamily:'Space Grotesk',
  marginTop:4,
};

const btnSmall = {
  padding:'5px 12px', borderRadius:6,
  border:'none', cursor:'pointer',
  color:'#fff', fontSize:11, fontWeight:600,
  fontFamily:'Space Grotesk',
};

const cardRow = {
  padding:'12px 14px', borderRadius:10, marginBottom:8,
  background:'#1a1a28', border:'1px solid #252535',
};

function Empty({ text }) {
  return (
    <div style={{ textAlign:'center', padding:'40px 0', color:'#6b6b8a', fontSize:13 }}>
      {text}
    </div>
  );
}
