import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "https://ai-sales-agent-production-6a6b.up.railway.app";

// Axios instance
const api = axios.create({
  baseURL: API,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Notification
function Notification({ msg, type, onClose }) {
  useEffect(() => {
    if (msg) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [msg, onClose]);

  if (!msg) return null;

  const bg =
    type === "error" ? "#ef4444" : type === "warn" ? "#f59e0b" : "#10b981";

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: bg,
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 10,
        zIndex: 9999,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {msg}
    </div>
  );
}

// Auth Pages
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | register
  const [form, setForm] = useState({
    email: "",
    password: "",
    business_name: "",
    sector: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const r = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("token", r.data.token);
        localStorage.setItem("business_id", r.data.business_id);
        localStorage.setItem("business_name", r.data.business_name);
        onLogin(r.data);
      } else {
        if (
          !form.email ||
          !form.password ||
          !form.business_name ||
          !form.sector ||
          !form.phone
        ) {
          setError("Tüm alanları doldurun");
          setLoading(false);
          return;
        }

        const r = await api.post("/auth/register", form);

        localStorage.setItem("token", r.data.token);
        localStorage.setItem("business_id", r.data.business_id);
        localStorage.setItem("business_name", r.data.business_name);
        onLogin(r.data);
      }
    } catch (e) {
      console.error("AUTH ERROR:", e?.response?.data || e);
      setError(e?.response?.data?.detail || "Bir hata oluştu");
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f13",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap"
        rel="stylesheet"
      />
      <div
        style={{
          width: 420,
          background: "#18181f",
          borderRadius: 20,
          padding: "48px 40px",
          border: "1px solid #2a2a35",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              borderRadius: 14,
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
            }}
          >
            🤖
          </div>
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              color: "#fff",
              fontSize: 24,
              fontWeight: 800,
              margin: 0,
            }}
          >
            AI Sales Agent
          </h1>
          <p
            style={{
              color: "#6b6b7e",
              fontSize: 13,
              margin: "6px 0 0",
            }}
          >
            İşletmeniz için AI destekli müşteri sistemi
          </p>
        </div>

        <div
          style={{
            display: "flex",
            background: "#0f0f13",
            borderRadius: 10,
            padding: 4,
            marginBottom: 28,
          }}
        >
          {["login", "register"].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError("");
              }}
              style={{
                flex: 1,
                padding: "8px 0",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                background: mode === m ? "#6366f1" : "transparent",
                color: mode === m ? "#fff" : "#6b6b7e",
                transition: "all .2s",
              }}
            >
              {m === "login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "register" && (
            <>
              <Input
                label="İşletme Adı"
                value={form.business_name}
                onChange={(v) => update("business_name", v)}
                placeholder="Demo Kuaför"
              />
              <Input
                label="Sektör"
                value={form.sector}
                onChange={(v) => update("sector", v)}
                placeholder="Kuaför, Restoran..."
              />
              <Input
                label="Telefon"
                value={form.phone}
                onChange={(v) => update("phone", v)}
                placeholder="0555 123 4567"
              />
            </>
          )}
          <Input
            label="Email"
            value={form.email}
            onChange={(v) => update("email", v)}
            placeholder="isletme@email.com"
            type="email"
          />
          <Input
            label="Şifre"
            value={form.password}
            onChange={(v) => update("password", v)}
            placeholder="••••••••"
            type="password"
          />
        </div>

        {error && (
          <div
            style={{
              background: "#1f1020",
              border: "1px solid #ef4444",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#ef4444",
              fontSize: 13,
              marginTop: 14,
            }}
          >
            {error}
          </div>
        )}

        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: 20,
            padding: "13px 0",
            background: loading
              ? "#3730a3"
              : "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            cursor: loading ? "default" : "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 0.3,
            transition: "all .2s",
          }}
        >
          {loading ? "..." : mode === "login" ? "Giriş Yap" : "Hesap Oluştur"}
        </button>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "#9090a0",
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 5,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "#0f0f13",
          border: "1px solid #2a2a35",
          borderRadius: 8,
          color: "#fff",
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

const MENU = [
  { id: "dashboard", icon: "📊", label: "Genel Bakış" },
  { id: "products", icon: "🛍️", label: "Ürünler & Hizmetler" },
  { id: "faqs", icon: "💬", label: "Sık Sorulan Sorular" },
  { id: "ai", icon: "🤖", label: "AI Asistan" },
  { id: "customers", icon: "👥", label: "Müşteriler" },
  { id: "leads", icon: "🎯", label: "Talepler" },
];

export default function App() {
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const business_id = localStorage.getItem("business_id");
    const business_name = localStorage.getItem("business_name");
    return token ? { token, business_id, business_name } : null;
  });
  const [page, setPage] = useState("dashboard");
  const [notif, setNotif] = useState({ msg: "", type: "success" });

  const notify = (msg, type = "success") => setNotif({ msg, type });
  const logout = () => {
    localStorage.clear();
    setAuth(null);
  };

  if (!auth) return <AuthPage onLogin={(d) => setAuth(d)} />;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0f0f13",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap"
        rel="stylesheet"
      />
      <Notification
        msg={notif.msg}
        type={notif.type}
        onClose={() => setNotif({ msg: "", type: "success" })}
      />

      <div
        style={{
          width: 240,
          background: "#18181f",
          borderRight: "1px solid #2a2a35",
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
        }}
      >
        <div
          style={{
            padding: "0 20px 28px",
            borderBottom: "1px solid #2a2a35",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
              }}
            >
              🤖
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                AI Sales Agent
              </div>
              <div
                style={{
                  color: "#6366f1",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {auth.business_name || "İşletme"}
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {MENU.map((m) => (
            <button
              key={m.id}
              onClick={() => setPage(m.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background:
                  page === m.id
                    ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))"
                    : "transparent",
                color: page === m.id ? "#a5b4fc" : "#6b6b7e",
                fontSize: 13,
                fontWeight: page === m.id ? 600 : 400,
                textAlign: "left",
                marginBottom: 2,
                borderLeft:
                  page === m.id
                    ? "2px solid #6366f1"
                    : "2px solid transparent",
                transition: "all .15s",
              }}
            >
              <span style={{ fontSize: 16 }}>{m.icon}</span> {m.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid #2a2a35" }}>
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "9px 12px",
              background: "transparent",
              border: "1px solid #2a2a35",
              borderRadius: 8,
              color: "#6b6b7e",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Çıkış Yap
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {page === "dashboard" && <DashboardPage notify={notify} auth={auth} />}
        {page === "products" && <ProductsPage notify={notify} />}
        {page === "faqs" && <FAQsPage notify={notify} />}
        {page === "ai" && <AIPage notify={notify} auth={auth} />}
        {page === "customers" && <CustomersPage notify={notify} />}
        {page === "leads" && <LeadsPage notify={notify} />}
      </div>
    </div>
  );
}

// --- PAGES ---

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ padding: "32px 36px 0" }}>
      <h1
        style={{
          fontFamily: "'Syne', sans-serif",
          color: "#fff",
          fontSize: 22,
          fontWeight: 800,
          margin: "0 0 4px",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: "#6b6b7e", fontSize: 13, margin: 0 }}>{subtitle}</p>
      )}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: "#18181f",
        border: "1px solid #2a2a35",
        borderRadius: 14,
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, color = "#6366f1", small = false, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? "7px 14px" : "10px 20px",
        background: disabled ? "#333" : color,
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: disabled ? "default" : "pointer",
        fontSize: small ? 12 : 13,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

// Dashboard
function DashboardPage({ auth }) {
  const [stats, setStats] = useState({
    products: 0,
    faqs: 0,
    customers: 0,
    leads: 0,
  });
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, f, c, l, b] = await Promise.all([
          api.get("/products/"),
          api.get("/faqs/"),
          api.get("/chat/history"),
          api.get("/leads/"),
          api.get("/businesses/"),
        ]);

        setStats({
          products: Array.isArray(p.data) ? p.data.length : 0,
          faqs: Array.isArray(f.data) ? f.data.length : 0,
          customers: Array.isArray(c.data) ? c.data.length : 0,
          leads: Array.isArray(l.data) ? l.data.length : 0,
        });

        if (Array.isArray(b.data) && b.data.length > 0) {
          const currentBusiness =
            b.data.find((x) => String(x.id) === String(auth.business_id)) ||
            b.data[0];
          setBusiness(currentBusiness);
        }
      } catch (e) {
        console.error("DASHBOARD LOAD ERROR:", e?.response?.data || e);
      }
    };

    load();
  }, [auth.business_id]);

  const statCards = [
    { label: "Ürün & Hizmet", value: stats.products, icon: "🛍️", color: "#6366f1" },
    { label: "SSS", value: stats.faqs, icon: "💬", color: "#8b5cf6" },
    { label: "Müşteri", value: stats.customers, icon: "👥", color: "#06b6d4" },
    { label: "Talep", value: stats.leads, icon: "🎯", color: "#10b981" },
  ];

  return (
    <div style={{ padding: 36 }}>
      <PageHeader
        title="Hoş geldiniz 👋"
        subtitle={business ? `${business.name} — ${business.sector}` : "İşletme paneli"}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginTop: 28,
        }}
      >
        {statCards.map((s) => (
          <Card key={s.label}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div
              style={{
                color: s.color,
                fontSize: 32,
                fontWeight: 800,
                fontFamily: "'Syne', sans-serif",
              }}
            >
              {s.value}
            </div>
            <div style={{ color: "#6b6b7e", fontSize: 12, marginTop: 2 }}>
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      {business && (
        <Card style={{ marginTop: 20 }}>
          <h3
            style={{
              color: "#fff",
              fontFamily: "'Syne', sans-serif",
              margin: "0 0 16px",
            }}
          >
            İşletme Bilgileri
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            {[
              ["İşletme Adı", business.name],
              ["Sektör", business.sector],
              ["Telefon", business.phone],
            ].map(([k, v]) => (
              <div key={k}>
                <div
                  style={{
                    color: "#6b6b7e",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  {k}
                </div>
                <div
                  style={{
                    color: "#e0e0f0",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// Products
function ProductsPage({ notify }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });

  const load = async () => {
    try {
      const r = await api.get("/products/");
      setProducts(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error("PRODUCTS LOAD ERROR:", e?.response?.data || e);
      notify("Ürünler yüklenemedi", "error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!form.name || !form.price) {
      notify("Ad ve fiyat gerekli", "error");
      return;
    }

    try {
      await api.post("/products/", {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
      });

      setForm({ name: "", price: "", description: "" });
      await load();
      notify("Ürün eklendi ✓");
    } catch (e) {
      console.error("PRODUCT ADD ERROR:", e?.response?.data || e);
      notify(e?.response?.data?.detail || "Ürün eklenemedi", "error");
    }
  };

  const del = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      await load();
      notify("Silindi");
    } catch (e) {
      console.error("PRODUCT DELETE ERROR:", e?.response?.data || e);
      notify("Silinemedi", "error");
    }
  };

  return (
    <div style={{ padding: 36 }}>
      <PageHeader
        title="Ürünler & Hizmetler"
        subtitle="AI asistanın fiyat ve hizmet bilgisi bu verilerden oluşur"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 28,
        }}
      >
        <Card>
          <h3
            style={{
              color: "#fff",
              fontFamily: "'Syne', sans-serif",
              margin: "0 0 16px",
              fontSize: 15,
            }}
          >
            Yeni Ekle
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FInput
              label="Ürün / Hizmet Adı"
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
              placeholder="Saç Kesimi"
            />
            <FInput
              label="Fiyat (TL)"
              value={form.price}
              onChange={(v) => setForm((p) => ({ ...p, price: v }))}
              placeholder="150"
              type="number"
            />
            <FInput
              label="Açıklama (opsiyonel)"
              value={form.description}
              onChange={(v) => setForm((p) => ({ ...p, description: v }))}
              placeholder="Kısa açıklama..."
            />
            <Btn onClick={add}>+ Ekle</Btn>
          </div>
        </Card>

        <Card>
          <h3
            style={{
              color: "#fff",
              fontFamily: "'Syne', sans-serif",
              margin: "0 0 16px",
              fontSize: 15,
            }}
          >
            Ürün Listesi ({products.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {products.length === 0 && (
              <div style={{ color: "#6b6b7e", fontSize: 13 }}>
                Henüz ürün eklenmedi
              </div>
            )}

            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "#0f0f13",
                  borderRadius: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      color: "#e0e0f0",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      color: "#6366f1",
                      fontSize: 12,
                      marginTop: 2,
                    }}
                  >
                    {p.price} TL
                  </div>
                </div>
                <Btn onClick={() => del(p.id)} color="#ef4444" small>
                  Sil
                </Btn>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// FAQs
function FAQsPage({ notify }) {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ question: "", answer: "" });

  const load = async () => {
    try {
      const r = await api.get("/faqs/");
      setFaqs(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error("FAQ LOAD ERROR:", e?.response?.data || e);
      notify("SSS yüklenemedi", "error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!form.question || !form.answer) {
      notify("Soru ve cevap gerekli", "error");
      return;
    }

    try {
      await api.post("/faqs/", form);
      setForm({ question: "", answer: "" });
      await load();
      notify("SSS eklendi ✓");
    } catch (e) {
      console.error("FAQ ADD ERROR:", e?.response?.data || e);
      notify(e?.response?.data?.detail || "SSS eklenemedi", "error");
    }
  };

  const del = async (id) => {
    try {
      await api.delete(`/faqs/${id}`);
      await load();
      notify("Silindi");
    } catch (e) {
      console.error("FAQ DELETE ERROR:", e?.response?.data || e);
      notify("Silinemedi", "error");
    }
  };

  return (
    <div style={{ padding: 36 }}>
      <PageHeader
        title="Sık Sorulan Sorular"
        subtitle="Müşterilerin sık sorduğu sorulara AI otomatik cevap verir"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 28,
        }}
      >
        <Card>
          <h3
            style={{
              color: "#fff",
              fontFamily: "'Syne', sans-serif",
              margin: "0 0 16px",
              fontSize: 15,
            }}
          >
            Yeni SSS Ekle
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FInput
              label="Soru"
              value={form.question}
              onChange={(v) => setForm((p) => ({ ...p, question: v }))}
              placeholder="Saat kaçta açılıyorsunuz?"
            />
            <FInput
              label="Cevap"
              value={form.answer}
              onChange={(v) => setForm((p) => ({ ...p, answer: v }))}
              placeholder="09:00 - 20:00 arası..."
              textarea
            />
            <Btn onClick={add}>+ Ekle</Btn>
          </div>
        </Card>

        <Card>
          <h3
            style={{
              color: "#fff",
              fontFamily: "'Syne', sans-serif",
              margin: "0 0 16px",
              fontSize: 15,
            }}
          >
            SSS Listesi ({faqs.length})
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 400,
              overflow: "auto",
            }}
          >
            {faqs.length === 0 && (
              <div style={{ color: "#6b6b7e", fontSize: 13 }}>
                Henüz SSS eklenmedi
              </div>
            )}

            {faqs.map((f) => (
              <div
                key={f.id}
                style={{
                  padding: "12px 14px",
                  background: "#0f0f13",
                  borderRadius: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        color: "#a5b4fc",
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 4,
                      }}
                    >
                      S: {f.question}
                    </div>
                    <div style={{ color: "#9090a0", fontSize: 12 }}>
                      C: {f.answer}
                    </div>
                  </div>
                  <Btn onClick={() => del(f.id)} color="#ef4444" small>
                    Sil
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// AI Asistan
function AIPage({ notify }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [leadForm, setLeadForm] = useState({
    customer_name: "",
    customer_phone: "",
    note: "",
  });
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const r = await api.post("/chat/", {
        message: userMsg,
        customer_phone: "panel_test",
      });

      setMessages((p) => [...p, { role: "assistant", text: r.data.reply }]);

      if (messages.length >= 3) {
        setShowLead(true);
      }
    } catch (e) {
      console.error("CHAT ERROR:", e?.response?.data || e);
      notify(e?.response?.data?.detail || "AI yanıt vermedi", "error");
    }

    setLoading(false);
  };

  const saveLead = async () => {
    try {
      const note =
        leadForm.note ||
        messages
          .map((m) => `${m.role === "user" ? "Müşteri" : "AI"}: ${m.text}`)
          .join("\n");

      await api.post("/leads/", { ...leadForm, note });

      setShowLead(false);
      setLeadForm({ customer_name: "", customer_phone: "", note: "" });
      notify("Talep oluşturuldu ✓");
    } catch (e) {
      console.error("LEAD SAVE ERROR:", e?.response?.data || e);
      notify(e?.response?.data?.detail || "Talep kaydedilemedi", "error");
    }
  };

  const quickBtns = [
    "Fiyatlarınız nedir?",
    "Çalışma saatleriniz?",
    "Randevu alabilir miyim?",
  ];

  return (
    <div style={{ padding: 36 }}>
      <PageHeader
        title="AI Asistan"
        subtitle="Müşteri sorularına AI'nın nasıl yanıt verdiğini test edin"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 20,
          marginTop: 28,
        }}
      >
        <Card
          style={{
            display: "flex",
            flexDirection: "column",
            height: 520,
            padding: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #2a2a35",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#10b981",
              }}
            ></div>
            <span style={{ color: "#e0e0f0", fontSize: 13, fontWeight: 600 }}>
              AI Asistan Aktif
            </span>
          </div>

          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: "center", marginTop: 60 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🤖</div>
                <div style={{ color: "#6b6b7e", fontSize: 13 }}>
                  Test mesajı göndererek başlayın
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "center",
                    marginTop: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {quickBtns.map((b) => (
                    <button
                      key={b}
                      onClick={() => setInput(b)}
                      style={{
                        padding: "7px 12px",
                        background: "#0f0f13",
                        border: "1px solid #2a2a35",
                        borderRadius: 20,
                        color: "#9090a0",
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "75%",
                    padding: "10px 14px",
                    borderRadius:
                      m.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    background:
                      m.role === "user"
                        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                        : "#0f0f13",
                    color: "#fff",
                    fontSize: 13,
                    lineHeight: 1.5,
                    border: m.role === "assistant" ? "1px solid #2a2a35" : "none",
                  }}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", gap: 4, padding: "10px 14px" }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#6366f1",
                      animation: `bounce 1s ${i * 0.2}s infinite`,
                    }}
                  ></div>
                ))}
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #2a2a35",
              display: "flex",
              gap: 8,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Mesajınızı yazın..."
              style={{
                flex: 1,
                padding: "10px 14px",
                background: "#0f0f13",
                border: "1px solid #2a2a35",
                borderRadius: 8,
                color: "#fff",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
              }}
            />
            <Btn onClick={send} disabled={loading}>
              Gönder
            </Btn>
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card>
            <h3
              style={{
                color: "#fff",
                fontFamily: "'Syne', sans-serif",
                margin: "0 0 14px",
                fontSize: 14,
              }}
            >
              🎯 Talep Oluştur
            </h3>
            <p
              style={{
                color: "#6b6b7e",
                fontSize: 12,
                margin: "0 0 14px",
                lineHeight: 1.6,
              }}
            >
              Konuşmadan bir müşteri talebi oluşturun. Müşteri bilgileri ve notu kaydedin.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <FInput
                label="Müşteri Adı"
                value={leadForm.customer_name}
                onChange={(v) => setLeadForm((p) => ({ ...p, customer_name: v }))}
                placeholder="Ad Soyad"
              />
              <FInput
                label="Telefon"
                value={leadForm.customer_phone}
                onChange={(v) => setLeadForm((p) => ({ ...p, customer_phone: v }))}
                placeholder="0555..."
              />
              <FInput
                label="Not"
                value={leadForm.note}
                onChange={(v) => setLeadForm((p) => ({ ...p, note: v }))}
                placeholder="Talep notu..."
                textarea
              />
              <Btn onClick={saveLead} disabled={messages.length === 0}>
                Talebi Kaydet
              </Btn>
            </div>
          </Card>

          {showLead && (
            <Card
              style={{
                border: "1px solid #10b981",
                background: "rgba(16,185,129,0.05)",
              }}
            >
              <div style={{ color: "#10b981", fontSize: 13, fontWeight: 600 }}>
                💡 Konuşma devam ediyor
              </div>
              <div style={{ color: "#6b6b7e", fontSize: 12, marginTop: 6 }}>
                Müşteri ilgileniyor gibi görünüyor. Talep oluşturmayı unutmayın!
              </div>
            </Card>
          )}
        </div>
      </div>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </div>
  );
}

// Customers
function CustomersPage({ notify }) {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get("/chat/history");
        setCustomers(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        console.error("CUSTOMERS LOAD ERROR:", e?.response?.data || e);
        notify("Müşteriler yüklenemedi", "error");
      }
    };

    load();
  }, [notify]);

  return (
    <div style={{ padding: 36 }}>
      <PageHeader
        title="Müşteriler"
        subtitle="WhatsApp ve panel üzerinden gelen tüm konuşmalar"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 20,
          marginTop: 28,
        }}
      >
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #2a2a35",
              color: "#9090a0",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            MÜŞTERİLER ({customers.length})
          </div>

          {customers.length === 0 && (
            <div style={{ padding: 20, color: "#6b6b7e", fontSize: 13 }}>
              Henüz müşteri yok
            </div>
          )}

          {customers.map((c) => (
            <div
              key={c.customer_id}
              onClick={() => setSelected(c)}
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid #2a2a35",
                cursor: "pointer",
                background:
                  selected?.customer_id === c.customer_id
                    ? "rgba(99,102,241,0.1)"
                    : "transparent",
              }}
            >
              <div style={{ color: "#e0e0f0", fontSize: 13, fontWeight: 500 }}>
                📱 {c.whatsapp}
              </div>
              <div style={{ color: "#6b6b7e", fontSize: 11, marginTop: 2 }}>
                {c.messages.length} mesaj
              </div>
            </div>
          ))}
        </Card>

        <Card>
          {!selected ? (
            <div style={{ textAlign: "center", marginTop: 60, color: "#6b6b7e" }}>
              Sol listeden müşteri seçin
            </div>
          ) : (
            <>
              <h3
                style={{
                  color: "#fff",
                  fontFamily: "'Syne', sans-serif",
                  margin: "0 0 16px",
                }}
              >
                📱 {selected.whatsapp}
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 400,
                  overflow: "auto",
                }}
              >
                {selected.messages.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent:
                        m.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "9px 13px",
                        borderRadius: 10,
                        background:
                          m.role === "user"
                            ? "rgba(99,102,241,0.2)"
                            : "#0f0f13",
                        border: "1px solid #2a2a35",
                      }}
                    >
                      <div
                        style={{
                          color: m.role === "user" ? "#a5b4fc" : "#9090a0",
                          fontSize: 10,
                          marginBottom: 3,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {m.role === "user" ? "Müşteri" : "AI"}
                      </div>
                      <div style={{ color: "#e0e0f0", fontSize: 13 }}>
                        {m.text}
                      </div>
                      <div style={{ color: "#4a4a5a", fontSize: 10, marginTop: 3 }}>
                        {new Date(m.created_at).toLocaleString("tr-TR")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

// Leads
function LeadsPage({ notify }) {
  const [leads, setLeads] = useState([]);

  const load = async () => {
    try {
      const r = await api.get("/leads/");
      setLeads(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error("LEADS LOAD ERROR:", e?.response?.data || e);
      notify("Talepler yüklenemedi", "error");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statusColors = { new: "#f59e0b", contacted: "#6366f1", closed: "#10b981" };
  const statusLabels = { new: "Yeni", contacted: "İletişime Geçildi", closed: "Kapatıldı" };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/leads/${id}/status?status=${status}`, {});
      await load();
      notify("Durum güncellendi");
    } catch (e) {
      console.error("LEAD STATUS ERROR:", e?.response?.data || e);
      notify("Durum güncellenemedi", "error");
    }
  };

  return (
    <div style={{ padding: 36 }}>
      <PageHeader
        title="Talepler"
        subtitle="AI asistan konuşmalarından oluşturulan müşteri talepleri"
      />
      <Card style={{ marginTop: 28 }}>
        {leads.length === 0 && (
          <div style={{ color: "#6b6b7e", fontSize: 13 }}>
            Henüz talep yok. AI Asistan sayfasından talep oluşturabilirsiniz.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {leads.map((l) => (
            <div
              key={l.id}
              style={{
                padding: "14px 16px",
                background: "#0f0f13",
                borderRadius: 10,
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                border: "1px solid #2a2a35",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      color: "#e0e0f0",
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {l.customer_name || "İsimsiz Müşteri"}
                  </span>
                  {l.customer_phone && (
                    <span style={{ color: "#6b6b7e", fontSize: 12 }}>
                      • {l.customer_phone}
                    </span>
                  )}
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: `${statusColors[l.status]}22`,
                      color: statusColors[l.status],
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {statusLabels[l.status]}
                  </span>
                </div>
                {l.note && (
                  <div style={{ color: "#9090a0", fontSize: 12, lineHeight: 1.5 }}>
                    {l.note.substring(0, 120)}
                    {l.note.length > 120 ? "..." : ""}
                  </div>
                )}
                <div style={{ color: "#4a4a5a", fontSize: 11, marginTop: 6 }}>
                  {new Date(l.created_at).toLocaleString("tr-TR")}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {l.status === "new" && (
                  <Btn onClick={() => updateStatus(l.id, "contacted")} small color="#6366f1">
                    İletişime Geç
                  </Btn>
                )}
                {l.status !== "closed" && (
                  <Btn onClick={() => updateStatus(l.id, "closed")} small color="#10b981">
                    Kapat
                  </Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Shared form input
function FInput({ label, value, onChange, placeholder, type = "text", textarea = false }) {
  const style = {
    width: "100%",
    padding: "9px 12px",
    background: "#0f0f13",
    border: "1px solid #2a2a35",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  };

  return (
    <div>
      {label && (
        <label
          style={{
            display: "block",
            color: "#9090a0",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 4,
          }}
        >
          {label}
        </label>
      )}
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...style, minHeight: 70 }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={style}
        />
      )}
    </div>
  );
}