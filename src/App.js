import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const API = "https://ai-sales-agent-production-6a6b.up.railway.app";

const api = axios.create({
  baseURL: API,
});

const THEME = {
  bg: "#f6f4ef",
  surface: "#ffffff",
  surfaceSoft: "#f1eee7",
  border: "#ded8cc",
  text: "#20231f",
  muted: "#74766f",
  faint: "#9a9b93",
  brand: "#24594d",
  brandDark: "#173d35",
  teal: "#2f7f75",
  amber: "#c9812f",
  red: "#c2413d",
  shadow: "0 20px 48px rgba(41, 35, 26, 0.12)",
};

const brandMark = (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M5 6.5h14M5 12h9M5 17.5h7"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
    <path
      d="M15.5 15.5 19 19l-3.5 1.1 1.1-3.5Z"
      fill="currentColor"
    />
  </svg>
);

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  config.headers = config.headers || {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("business_id");
      localStorage.removeItem("business_name");

      if (!window.location.pathname.includes("auth-resetting")) {
        window.location.reload();
      }
    }

    return Promise.reject(error);
  }
);

function Notification({ msg, type, onClose }) {
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [msg, onClose]);

  if (!msg) return null;

  const bg =
    type === "error" ? THEME.red : type === "warn" ? THEME.amber : THEME.brand;

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        background: bg,
        color: "#fff",
        padding: "12px 20px",
        borderRadius: 8,
        zIndex: 9999,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        boxShadow: THEME.shadow,
      }}
    >
      {msg}
    </div>
  );
}

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    business_name: "",
    sector: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const submit = async () => {
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const r = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        const payload = {
          token: r.data.token,
          business_id: r.data.business_id,
          business_name: r.data.business_name,
        };

        localStorage.setItem("token", payload.token);
        localStorage.setItem("business_id", String(payload.business_id ?? ""));
        localStorage.setItem("business_name", payload.business_name ?? "");
        onLogin(payload);
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

        const r = await api.post("/auth/register", {
          email: form.email,
          password: form.password,
          business_name: form.business_name,
          sector: form.sector,
          phone: form.phone,
        });

        const payload = {
          token: r.data.token,
          business_id: r.data.business_id,
          business_name: r.data.business_name,
        };

        localStorage.setItem("token", payload.token);
        localStorage.setItem("business_id", String(payload.business_id ?? ""));
        localStorage.setItem("business_name", payload.business_name ?? "");
        onLogin(payload);
      }
    } catch (e) {
      console.error("AUTH ERROR:", e?.response?.data || e);
      setError(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Giriş başarısız"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        display: "grid",
        gridTemplateColumns: "minmax(420px, 1fr) minmax(360px, 520px)",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif",
        padding: 28,
        boxSizing: "border-box",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          minHeight: 640,
          alignSelf: "stretch",
          borderRadius: 8,
          overflow: "hidden",
          backgroundImage:
            "linear-gradient(180deg, rgba(23,61,53,0.15), rgba(23,61,53,0.72)), url('/dashboard-hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: THEME.shadow,
          display: "flex",
          alignItems: "flex-end",
          padding: 36,
          boxSizing: "border-box",
        }}
      >
        <div style={{ maxWidth: 520 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: "rgba(255,255,255,0.92)",
              color: THEME.brand,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            {brandMark}
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: 34,
              lineHeight: 1.08,
              fontWeight: 800,
              margin: "0 0 12px",
            }}
          >
            Müşteri mesajlarını tek panelden yönetin.
          </h1>
          <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 15, lineHeight: 1.6, margin: 0 }}>
            WhatsApp ve Telegram konuşmaları, talepler, hizmetler ve sık sorulan sorular düzenli bir satış akışında birleşir.
          </p>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          maxWidth: 440,
          justifySelf: "center",
          background: THEME.surface,
          borderRadius: 8,
          padding: "42px 38px",
          border: `1px solid ${THEME.border}`,
          boxShadow: THEME.shadow,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div
            style={{
              width: 52,
              height: 52,
              background: THEME.surfaceSoft,
              color: THEME.brand,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {brandMark}
          </div>

          <h1
            style={{
              color: THEME.text,
              fontSize: 24,
              fontWeight: 800,
              margin: 0,
            }}
          >
            AI Sales Agent
          </h1>

          <p
            style={{
              color: THEME.muted,
              fontSize: 13,
              margin: "6px 0 0",
            }}
          >
            İşletmeniz için müşteri iletişim paneli
          </p>
        </div>

        <div
          style={{
            display: "flex",
            background: THEME.surfaceSoft,
            borderRadius: 8,
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
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                background: mode === m ? THEME.surface : "transparent",
                color: mode === m ? THEME.text : THEME.muted,
                boxShadow: mode === m ? "0 1px 4px rgba(28, 31, 29, 0.08)" : "none",
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
              background: "#fff4f2",
              border: `1px solid ${THEME.red}`,
              borderRadius: 8,
              padding: "10px 14px",
              color: THEME.red,
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
            background: loading ? THEME.faint : THEME.brand,
            color: "#fff",
            border: "none",
            borderRadius: 8,
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
          color: THEME.muted,
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 5,
          textTransform: "uppercase",
          letterSpacing: 0,
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
          background: THEME.surface,
          border: `1px solid ${THEME.border}`,
          borderRadius: 8,
          color: THEME.text,
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
  { id: "dashboard", icon: "GB", label: "Genel Bakış" },
  { id: "products", icon: "ÜH", label: "Ürünler & Hizmetler" },
  { id: "faqs", icon: "SS", label: "Sık Sorulan Sorular" },
  { id: "ai", icon: "AS", label: "Asistan" },
  { id: "customers", icon: "MÜ", label: "Müşteriler" },
  { id: "leads", icon: "TA", label: "Talepler" },
  { id: "whatsapp", icon: "WA", label: "WhatsApp" },
  { id: "telegram", icon: "TG", label: "Telegram" },
];

const STATUS_META = {
  new: { label: "Yeni", color: "#f59e0b" },
  contacted: { label: "İletişime Geçildi", color: THEME.teal },
  qualified: { label: "Nitelikli", color: "#31708f" },
  closed: { label: "Kapatıldı", color: THEME.brand },
  lost: { label: "Kaybedildi", color: THEME.red },
};

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("tr-TR");
}

function formatCustomerChannel(value) {
  if (!value) return "-";
  if (value.startsWith("telegram:")) {
    return `Telegram ${value.replace("telegram:", "")}`;
  }
  return `WhatsApp ${value}`;
}

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
    localStorage.removeItem("token");
    localStorage.removeItem("business_id");
    localStorage.removeItem("business_name");
    setAuth(null);
  };

  if (!auth) {
    return <AuthPage onLogin={(data) => setAuth(data)} />;
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: THEME.bg,
        fontFamily: "'DM Sans', sans-serif",
        color: THEME.text,
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
          width: 252,
          background: THEME.surface,
          borderRight: `1px solid ${THEME.border}`,
          display: "flex",
          flexDirection: "column",
          padding: "22px 0",
          boxShadow: "8px 0 28px rgba(35, 31, 24, 0.04)",
        }}
      >
        <div
          style={{
            padding: "0 20px 24px",
            borderBottom: `1px solid ${THEME.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                background: THEME.surfaceSoft,
                color: THEME.brand,
                borderRadius: 8,
                border: `1px solid ${THEME.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {brandMark}
            </div>

            <div>
              <div
                style={{
                  color: THEME.text,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                AI Sales Agent
              </div>

              <div
                style={{
                  color: THEME.brand,
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
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background:
                  page === m.id
                    ? THEME.surfaceSoft
                    : "transparent",
                color: page === m.id ? THEME.brandDark : THEME.muted,
                fontSize: 13,
                fontWeight: page === m.id ? 700 : 500,
                textAlign: "left",
                marginBottom: 2,
                borderLeft:
                  page === m.id
                    ? `2px solid ${THEME.brand}`
                    : "2px solid transparent",
                transition: "all .15s",
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: page === m.id ? THEME.surface : "transparent",
                  border: page === m.id ? `1px solid ${THEME.border}` : "1px solid transparent",
                  color: page === m.id ? THEME.brand : THEME.faint,
                  fontSize: 10,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {m.icon}
              </span>
              {m.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: `1px solid ${THEME.border}` }}>
          <button
            onClick={logout}
            style={{
              width: "100%",
              padding: "9px 12px",
              background: "transparent",
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              color: THEME.muted,
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
        {page === "dashboard" && <DashboardPage auth={auth} />}
        {page === "products" && <ProductsPage notify={notify} />}
        {page === "faqs" && <FAQsPage notify={notify} />}
        {page === "ai" && <AIPage notify={notify} auth={auth} />}
        {page === "customers" && <CustomersPage notify={notify} />}
        {page === "leads" && <LeadsPage notify={notify} />}
        {page === "whatsapp" && <WhatsAppPage notify={notify} />}
        {page === "telegram" && <TelegramPage notify={notify} />}
      </div>
    </div>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div style={{ padding: "34px 36px 0" }}>
      <h1
        style={{
          color: THEME.text,
          fontSize: 25,
          fontWeight: 800,
          margin: "0 0 4px",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: THEME.muted, fontSize: 13, margin: 0 }}>{subtitle}</p>
      )}
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 8,
        padding: 24,
        boxShadow: "0 10px 30px rgba(35, 31, 24, 0.05)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Btn({
  children,
  onClick,
  color = THEME.brand,
  small = false,
  disabled = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: small ? "7px 14px" : "10px 20px",
        background: disabled ? THEME.faint : color,
        color: "#fff",
        border: "none",
        borderRadius: 8,
        cursor: disabled ? "default" : "pointer",
        fontSize: small ? 12 : 13,
        fontWeight: 700,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {children}
    </button>
  );
}

function DashboardPage({ auth }) {
  const [stats, setStats] = useState({
    products: 0,
    faqs: 0,
    customers: 0,
    leads: 0,
  });
  const [business, setBusiness] = useState(null);
  const [leadBreakdown, setLeadBreakdown] = useState(
    Object.fromEntries(
      Object.entries(STATUS_META).map(([key, meta]) => [
        key,
        { ...meta, count: 0 },
      ])
    )
  );
  const [recentCustomers, setRecentCustomers] = useState([]);

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

        const leads = Array.isArray(l.data) ? l.data : [];
        setLeadBreakdown(
          Object.fromEntries(
            Object.entries(STATUS_META).map(([key, meta]) => [
              key,
              {
                ...meta,
                count: leads.filter((lead) => lead.status === key).length,
              },
            ])
          )
        );

        const customers = Array.isArray(c.data) ? c.data : [];
        setRecentCustomers(
          customers
            .slice()
            .sort(
              (a, b) =>
                new Date(
                  b.messages?.[b.messages.length - 1]?.created_at || 0
                ) -
                new Date(
                  a.messages?.[a.messages.length - 1]?.created_at || 0
                )
            )
            .slice(0, 4)
        );

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
    { label: "Ürün & Hizmet", value: stats.products, icon: "ÜH", color: THEME.brand },
    { label: "SSS", value: stats.faqs, icon: "SS", color: THEME.teal },
    { label: "Müşteri", value: stats.customers, icon: "MÜ", color: "#31708f" },
    { label: "Talep", value: stats.leads, icon: "TA", color: THEME.amber },
  ];

  return (
    <div style={{ padding: 36 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 0.9fr)",
          gap: 22,
          alignItems: "stretch",
        }}
      >
        <Card
          style={{
            background: THEME.brandDark,
            color: "#fff",
            minHeight: 230,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
              {business ? `${business.name} / ${business.sector}` : "İşletme paneli"}
            </div>
            <h1 style={{ fontSize: 32, lineHeight: 1.12, margin: "0 0 12px", maxWidth: 620 }}>
              Satış konuşmaları ve müşteri talepleri kontrol altında.
            </h1>
            <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 1.6, margin: 0, maxWidth: 560 }}>
              Hizmet bilgileri, sık sorulan sorular ve kanal bağlantıları burada güncel kaldıkça asistan müşterilere daha net yanıt verir.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
            <span style={{ padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)", fontSize: 12 }}>WhatsApp</span>
            <span style={{ padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)", fontSize: 12 }}>Telegram</span>
            <span style={{ padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.1)", fontSize: 12 }}>Talepler</span>
          </div>
        </Card>

        <div
          style={{
            minHeight: 230,
            borderRadius: 8,
            backgroundImage:
              "linear-gradient(180deg, rgba(23,61,53,0.05), rgba(23,61,53,0.22)), url('/dashboard-hero.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            border: `1px solid ${THEME.border}`,
            boxShadow: "0 10px 30px rgba(35, 31, 24, 0.05)",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginTop: 28,
        }}
      >
        {statCards.map((s) => (
          <Card key={s.label}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: THEME.surfaceSoft,
                color: s.color,
                border: `1px solid ${THEME.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
                marginBottom: 12,
              }}
            >
              {s.icon}
            </div>
            <div
              style={{
                color: s.color,
                fontSize: 32,
                fontWeight: 800,
              }}
            >
              {s.value}
            </div>
            <div style={{ color: THEME.muted, fontSize: 12, marginTop: 2 }}>
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      {business && (
        <Card style={{ marginTop: 20 }}>
          <h3
            style={{
              color: THEME.text,
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
                    color: THEME.muted,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0,
                    marginBottom: 4,
                  }}
                >
                  {k}
                </div>
                <div
                  style={{
                    color: THEME.text,
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginTop: 20,
        }}
      >
        <Card>
          <h3
            style={{
              color: THEME.text,
              margin: "0 0 16px",
            }}
          >
            Lead Durum Dağılımı
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(leadBreakdown).map(([key, meta]) => (
              <div key={key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    color: THEME.muted,
                    fontSize: 12,
                    marginBottom: 6,
                  }}
                >
                  <span>{meta.label}</span>
                  <span>{meta.count}</span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: THEME.surfaceSoft,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${stats.leads ? (meta.count / stats.leads) * 100 : 0}%`,
                      height: "100%",
                      background: meta.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3
            style={{
              color: THEME.text,
              margin: "0 0 16px",
            }}
          >
            Son Konuşmalar
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentCustomers.length === 0 && (
              <div style={{ color: THEME.muted, fontSize: 13 }}>
                Henüz kayıtlı konuşma yok.
              </div>
            )}

            {recentCustomers.map((customer) => {
              const lastMessage =
                customer.messages?.[customer.messages.length - 1];

              return (
                <div
                  key={customer.customer_id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 8,
                    background: THEME.surfaceSoft,
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <div
                    style={{
                      color: THEME.text,
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {customer.whatsapp}
                  </div>
                  <div
                    style={{
                      color: THEME.muted,
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {lastMessage?.text || "Mesaj yok"}
                  </div>
                  <div
                    style={{ color: THEME.faint, fontSize: 11, marginTop: 6 }}
                  >
                    {formatDate(lastMessage?.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function ProductsPage({ notify }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", description: "" });

  const load = useCallback(async () => {
    try {
      const r = await api.get("/products/");
      setProducts(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error("PRODUCTS LOAD ERROR:", e?.response?.data || e);
      notify("Ürünler yüklenemedi", "error");
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

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
              <div style={{ color: THEME.muted, fontSize: 13 }}>
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
                  background: THEME.surfaceSoft,
                  borderRadius: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      color: THEME.text,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {p.name}
                  </div>
                  <div
                    style={{
                      color: THEME.brand,
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

function FAQsPage({ notify }) {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({ question: "", answer: "" });

  const load = useCallback(async () => {
    try {
      const r = await api.get("/faqs/");
      setFaqs(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error("FAQ LOAD ERROR:", e?.response?.data || e);
      notify("SSS yüklenemedi", "error");
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

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
              <div style={{ color: THEME.muted, fontSize: 13 }}>
                Henüz SSS eklenmedi
              </div>
            )}

            {faqs.map((f) => (
              <div
                key={f.id}
                style={{
                  padding: "12px 14px",
                  background: THEME.surfaceSoft,
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
                    <div style={{ color: THEME.muted, fontSize: 12 }}>
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

function AIPage({ notify }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [replySource, setReplySource] = useState("llm");
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
      setReplySource(r.data.source || "llm");

      if (
        messages.length >= 2 ||
        /randevu|fiyat|telefon|ulaş|iletisim/i.test(userMsg)
      ) {
        setShowLead(true);
      }
    } catch (e) {
      console.error("CHAT ERROR:", e?.response?.data || e);
      notify(e?.response?.data?.detail || "AI yanıt vermedi", "error");
    } finally {
      setLoading(false);
    }
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
              borderBottom: `1px solid ${THEME.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
              <span
                style={{ color: THEME.text, fontSize: 13, fontWeight: 600 }}
              >
                AI Asistan Aktif
              </span>
            </div>

            <div
              style={{
                padding: "4px 8px",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                color: replySource === "fallback" ? "#fbbf24" : "#86efac",
                background:
                  replySource === "fallback"
                    ? "rgba(245,158,11,0.12)"
                    : "rgba(16,185,129,0.12)",
              }}
            >
              {replySource === "fallback" ? "Yedek cevap modu" : "LLM aktif"}
            </div>
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
                <div style={{ color: THEME.brand, marginBottom: 12 }}>{brandMark}</div>
                <div style={{ color: THEME.muted, fontSize: 13 }}>
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
                        background: THEME.surfaceSoft,
                        border: `1px solid ${THEME.border}`,
                        borderRadius: 20,
                        color: THEME.muted,
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
                        ? THEME.brand
                        : THEME.surfaceSoft,
                    color: m.role === "assistant" ? "#fff" : THEME.text,
                    fontSize: 13,
                    lineHeight: 1.5,
                    border:
                      m.role === "assistant" ? `1px solid ${THEME.border}` : "none",
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
                      background: THEME.brand,
                      animation: `bounce 1s ${i * 0.2}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div
            style={{
              padding: "12px 16px",
              borderTop: `1px solid ${THEME.border}`,
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
                background: THEME.surface,
                border: `1px solid ${THEME.border}`,
                borderRadius: 8,
                color: THEME.text,
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
              Talep Oluştur
            </h3>

            <p
              style={{
                color: THEME.muted,
                fontSize: 12,
                margin: "0 0 14px",
                lineHeight: 1.6,
              }}
            >
              Konuşmadan bir müşteri talebi oluşturun. Müşteri bilgileri ve notu
              kaydedin.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <FInput
                label="Müşteri Adı"
                value={leadForm.customer_name}
                onChange={(v) =>
                  setLeadForm((p) => ({ ...p, customer_name: v }))
                }
                placeholder="Ad Soyad"
              />
              <FInput
                label="Telefon"
                value={leadForm.customer_phone}
                onChange={(v) =>
                  setLeadForm((p) => ({ ...p, customer_phone: v }))
                }
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
              <div style={{ color: THEME.muted, fontSize: 12, marginTop: 6 }}>
                Müşteri ilgileniyor gibi görünüyor. Talep oluşturmayı unutmayın!
              </div>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-4px) }
        }
      `}</style>
    </div>
  );
}

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
              borderBottom: `1px solid ${THEME.border}`,
              color: THEME.muted,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            MÜŞTERİLER ({customers.length})
          </div>

          {customers.length === 0 && (
            <div style={{ padding: 20, color: THEME.muted, fontSize: 13 }}>
              Henüz müşteri yok
            </div>
          )}

          {customers.map((c) => (
            <div
              key={c.customer_id}
              onClick={() => setSelected(c)}
              style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${THEME.border}`,
                cursor: "pointer",
                background:
                  selected?.customer_id === c.customer_id
                    ? "rgba(99,102,241,0.1)"
                    : "transparent",
              }}
            >
              <div style={{ color: THEME.text, fontSize: 13, fontWeight: 500 }}>
                {formatCustomerChannel(c.whatsapp)}
              </div>
              <div style={{ color: THEME.muted, fontSize: 11, marginTop: 2 }}>
                {c.messages.length} mesaj
              </div>
            </div>
          ))}
        </Card>

        <Card>
          {!selected ? (
            <div style={{ textAlign: "center", marginTop: 60, color: THEME.muted }}>
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
                {formatCustomerChannel(selected.whatsapp)}
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
                            : THEME.surfaceSoft,
                        border: `1px solid ${THEME.border}`,
                      }}
                    >
                      <div
                        style={{
                          color: m.role === "user" ? THEME.brand : THEME.muted,
                          fontSize: 10,
                          marginBottom: 3,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {m.role === "user" ? "Müşteri" : "AI"}
                      </div>

                      <div style={{ color: THEME.text, fontSize: 13 }}>
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

function WhatsAppPage({ notify }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [testForm, setTestForm] = useState({
    to: "",
    text: "Merhaba, AI Sales Agent WhatsApp entegrasyonu aktif.",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/whatsapp/status");
      setStatus(r.data);
    } catch (e) {
      console.error("WHATSAPP STATUS ERROR:", e?.response?.data || e);
      notify("WhatsApp durumu yüklenemedi", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const copy = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      notify("Kopyalandı");
    } catch (e) {
      notify("Kopyalama başarısız", "error");
    }
  };

  const sendTest = async () => {
    if (!testForm.to || !testForm.text) {
      notify("Test numarası ve mesaj gerekli", "warn");
      return;
    }

    setSending(true);
    try {
      await api.post("/whatsapp/test-message", testForm);
      notify("Test mesajı gönderildi");
    } catch (e) {
      console.error("WHATSAPP TEST ERROR:", e?.response?.data || e);
      notify(e?.response?.data?.detail || "Test mesajı gönderilemedi", "error");
    } finally {
      setSending(false);
    }
  };

  const checks = [
    ["verify_token", "Verify Token"],
    ["access_token", "Access Token"],
    ["phone_number_id", "Phone Number ID"],
    ["app_secret", "App Secret"],
    ["business_mapping", "İşletme Eşleşmesi"],
  ];

  return (
    <div style={{ padding: 36 }}>
      <PageHeader
        title="WhatsApp"
        subtitle="Meta Cloud API bağlantısı ve canlı mesaj testi"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 20,
          marginTop: 28,
        }}
      >
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div>
              <h3
                style={{
                  color: "#fff",
                  fontFamily: "'Syne', sans-serif",
                  margin: 0,
                  fontSize: 16,
                }}
              >
                Bağlantı Durumu
              </h3>
              <div style={{ color: THEME.muted, fontSize: 12, marginTop: 4 }}>
                {loading
                  ? "Kontrol ediliyor..."
                  : status?.ready
                  ? "WhatsApp mesaj almaya hazır"
                  : "Eksik ayar var"}
              </div>
            </div>

            <div
              style={{
                padding: "7px 12px",
                borderRadius: 999,
                color: status?.ready ? "#86efac" : "#fbbf24",
                background: status?.ready
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(245,158,11,0.12)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {status?.ready ? "Aktif" : "Kurulum Bekliyor"}
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {checks.map(([key, label]) => {
              const ok = Boolean(status?.checks?.[key]);
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: THEME.surfaceSoft,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 10,
                  }}
                >
                  <span style={{ color: THEME.text, fontSize: 13 }}>{label}</span>
                  <span
                    style={{
                      color: ok ? "#10b981" : "#f59e0b",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {ok ? "Tamam" : "Eksik"}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <SetupValue
              label="Callback URL"
              value={status?.callback_url || ""}
              onCopy={copy}
            />
            <SetupValue
              label="Verify Token"
              value={status?.verify_token || ""}
              onCopy={copy}
              hidden={!status?.verify_token}
            />
            <SetupValue label="Phone Number ID" value={status?.phone_number_id || "-"} />
            <SetupValue label="API Version" value={status?.api_version || "v23.0"} />
          </div>
        </Card>

        <Card>
          <h3
            style={{
              color: "#fff",
              fontFamily: "'Syne', sans-serif",
              margin: "0 0 14px",
              fontSize: 14,
            }}
          >
            Test Mesajı
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <FInput
              label="Alıcı Numarası"
              value={testForm.to}
              onChange={(v) => setTestForm((p) => ({ ...p, to: v }))}
              placeholder="905551234567"
            />
            <FInput
              label="Mesaj"
              value={testForm.text}
              onChange={(v) => setTestForm((p) => ({ ...p, text: v }))}
              placeholder="Test mesajı"
              textarea
            />
            <Btn onClick={sendTest} disabled={sending || !status?.ready}>
              {sending ? "Gönderiliyor..." : "Gönder"}
            </Btn>
          </div>

          {status?.missing?.length > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.35)",
                borderRadius: 10,
                color: "#fbbf24",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Eksik env: {status.missing.join(", ")}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function TelegramPage({ notify }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingWebhook, setSettingWebhook] = useState(false);
  const [sending, setSending] = useState(false);
  const [testForm, setTestForm] = useState({
    chat_id: "",
    text: "Merhaba, AI Sales Agent Telegram entegrasyonu aktif.",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get("/telegram/status");
      setStatus(r.data);
    } catch (e) {
      console.error("TELEGRAM STATUS ERROR:", e?.response?.data || e);
      notify("Telegram durumu yuklenemedi", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const copy = async (value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      notify("Kopyalandi");
    } catch (e) {
      notify("Kopyalama basarisiz", "error");
    }
  };

  const setupWebhook = async () => {
    setSettingWebhook(true);
    try {
      await api.post("/telegram/setup-webhook");
      notify("Telegram webhook kuruldu");
      await load();
    } catch (e) {
      console.error("TELEGRAM WEBHOOK ERROR:", e?.response?.data || e);
      notify(e?.response?.data?.detail || "Telegram webhook kurulamadi", "error");
    } finally {
      setSettingWebhook(false);
    }
  };

  const sendTest = async () => {
    if (!testForm.chat_id || !testForm.text) {
      notify("Chat ID ve mesaj gerekli", "warn");
      return;
    }

    setSending(true);
    try {
      await api.post("/telegram/test-message", testForm);
      notify("Telegram test mesaji gonderildi");
    } catch (e) {
      console.error("TELEGRAM TEST ERROR:", e?.response?.data || e);
      notify(e?.response?.data?.detail || "Telegram test mesaji gonderilemedi", "error");
    } finally {
      setSending(false);
    }
  };

  const checks = [
    ["bot_token", "Bot Token"],
    ["default_business_id", "Business ID"],
    ["webhook_secret", "Webhook Secret"],
  ];

  return (
    <div style={{ padding: 36 }}>
      <PageHeader
        title="Telegram"
        subtitle="BotFather botu, webhook kurulumu ve canli mesaj testi"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 360px",
          gap: 20,
          marginTop: 28,
        }}
      >
        <Card>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div>
              <h3
                style={{
                  color: "#fff",
                  fontFamily: "'Syne', sans-serif",
                  margin: 0,
                  fontSize: 16,
                }}
              >
                Baglanti Durumu
              </h3>
              <div style={{ color: THEME.muted, fontSize: 12, marginTop: 4 }}>
                {loading
                  ? "Kontrol ediliyor..."
                  : status?.ready
                  ? "Telegram mesaj almaya hazir"
                  : "Eksik ayar var"}
              </div>
            </div>

            <div
              style={{
                padding: "7px 12px",
                borderRadius: 999,
                color: status?.ready ? "#86efac" : "#fbbf24",
                background: status?.ready
                  ? "rgba(16,185,129,0.12)"
                  : "rgba(245,158,11,0.12)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {status?.ready ? "Aktif" : "Kurulum Bekliyor"}
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {checks.map(([key, label]) => {
              const ok = Boolean(status?.checks?.[key]);
              return (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 14px",
                    background: THEME.surfaceSoft,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 10,
                  }}
                >
                  <span style={{ color: THEME.text, fontSize: 13 }}>{label}</span>
                  <span
                    style={{
                      color: ok ? "#10b981" : "#f59e0b",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {ok ? "Tamam" : "Eksik"}
                  </span>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <SetupValue
              label="Callback URL"
              value={status?.callback_url || ""}
              onCopy={copy}
            />
            <SetupValue
              label="Secret Token"
              value="ai-sales-agent-telegram-2026"
              onCopy={copy}
            />
          </div>

          {status?.missing?.length > 0 && (
            <div
              style={{
                marginTop: 16,
                padding: "12px 14px",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.35)",
                borderRadius: 10,
                color: "#fbbf24",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              Eksik env: {status.missing.join(", ")}
            </div>
          )}
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card>
            <h3
              style={{
                color: "#fff",
                fontFamily: "'Syne', sans-serif",
                margin: "0 0 14px",
                fontSize: 14,
              }}
            >
              Webhook
            </h3>

            <div style={{ color: THEME.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 14 }}>
              BotFather token Railway ortam degiskenlerine eklendikten sonra bu buton Telegram'a webhook adresini kaydeder.
            </div>

            <Btn onClick={setupWebhook} disabled={settingWebhook || !status?.ready}>
              {settingWebhook ? "Kuruluyor..." : "Webhook Kur"}
            </Btn>
          </Card>

          <Card>
            <h3
              style={{
                color: "#fff",
                fontFamily: "'Syne', sans-serif",
                margin: "0 0 14px",
                fontSize: 14,
              }}
            >
              Test Mesaji
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <FInput
                label="Chat ID"
                value={testForm.chat_id}
                onChange={(v) => setTestForm((p) => ({ ...p, chat_id: v }))}
                placeholder="123456789"
              />
              <FInput
                label="Mesaj"
                value={testForm.text}
                onChange={(v) => setTestForm((p) => ({ ...p, text: v }))}
                placeholder="Test mesaji"
                textarea
              />
              <Btn onClick={sendTest} disabled={sending || !status?.ready}>
                {sending ? "Gonderiliyor..." : "Gonder"}
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SetupValue({ label, value, onCopy, hidden = false }) {
  return (
    <div
      style={{
        background: THEME.surfaceSoft,
        border: `1px solid ${THEME.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          color: THEME.muted,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div
          style={{
            color: THEME.text,
            fontSize: 12,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
          title={value}
        >
          {hidden ? "Tanımlı değil" : value || "-"}
        </div>
        {onCopy && value && (
          <button
            onClick={() => onCopy(value)}
            style={{
              padding: "6px 9px",
              background: THEME.surface,
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              color: THEME.brand,
              fontSize: 11,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Kopyala
          </button>
        )}
      </div>
    </div>
  );
}

function LeadsPage({ notify }) {
  const [leads, setLeads] = useState([]);

  const load = useCallback(async () => {
    try {
      const r = await api.get("/leads/");
      setLeads(Array.isArray(r.data) ? r.data : []);
    } catch (e) {
      console.error("LEADS LOAD ERROR:", e?.response?.data || e);
      notify("Talepler yüklenemedi", "error");
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

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
          <div style={{ color: THEME.muted, fontSize: 13 }}>
            Henüz talep yok. AI Asistan sayfasından talep oluşturabilirsiniz.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {leads.map((l) => (
            <div
              key={l.id}
              style={{
                padding: "14px 16px",
                background: THEME.surfaceSoft,
                borderRadius: 10,
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                border: `1px solid ${THEME.border}`,
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
                      color: THEME.text,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {l.customer_name || "İsimsiz Müşteri"}
                  </span>

                  {l.customer_phone && (
                    <span style={{ color: THEME.muted, fontSize: 12 }}>
                      • {l.customer_phone}
                    </span>
                  )}

                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: `${(STATUS_META[l.status] || STATUS_META.new).color}22`,
                      color: (STATUS_META[l.status] || STATUS_META.new).color,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {(STATUS_META[l.status] || STATUS_META.new).label}
                  </span>
                </div>

                {l.note && (
                  <div style={{ color: THEME.muted, fontSize: 12, lineHeight: 1.5 }}>
                    {l.note.substring(0, 120)}
                    {l.note.length > 120 ? "..." : ""}
                  </div>
                )}

                <div style={{ color: "#4a4a5a", fontSize: 11, marginTop: 6 }}>
                  {formatDate(l.created_at)}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <select
                  value={l.status}
                  onChange={(e) => updateStatus(l.id, e.target.value)}
                  style={{
                    padding: "8px 10px",
                    background: "#11131a",
                    color: THEME.text,
                    border: `1px solid ${THEME.border}`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {Object.entries(STATUS_META).map(([value, meta]) => (
                    <option key={value} value={value}>
                      {meta.label}
                    </option>
                  ))}
                </select>

                <Btn
                  onClick={() => updateStatus(l.id, "closed")}
                  small
                  color="#10b981"
                  disabled={l.status === "closed"}
                >
                  Tamamlandı
                </Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function FInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  textarea = false,
}) {
  const style = {
    width: "100%",
    padding: "9px 12px",
    background: THEME.surface,
    border: `1px solid ${THEME.border}`,
    borderRadius: 8,
    color: THEME.text,
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
            color: THEME.muted,
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
