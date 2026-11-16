/**
 * Admin — SportShop
 * Dashboard d'administration : gestion des produits, catégories et commandes.
 * Les commandes arrivent depuis localStorage (posées par Checkout.jsx).
 * Design premium avec stats, tableaux stylés, formulaires en modal/sidebar.
 */
import { useEffect, useState, useCallback } from "react";
import api from "../api.js";
import { translateCategory, useLanguage } from "../language.js";
import OrderChat, { unreadCount as chatUnreadCount } from "../components/OrderChat.jsx";

/* ── Error Boundary pour déboguer les crashs runtime ── */
import { Component } from "react";
class AdminErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: "monospace", background: "#fff5f5", borderRadius: 12, margin: 24, border: "1px solid #feb2b2" }}>
          <h2 style={{ color: "#c53030", marginBottom: 16 }}>⚠️ Erreur Admin</h2>
          <pre style={{ color: "#742a2a", whiteSpace: "pre-wrap", fontSize: 13 }}>
            {this.state.error?.message}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
          <button
            style={{ marginTop: 20, padding: "8px 20px", background: "#c53030", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}
            onClick={() => { this.setState({ error: null }); }}
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const emptyProduit = { categorie_id: "", nom: "", description: "", prix: "", prix_promo: "", stock: "", image: "" };

/* ── Icônes SVG ── */
const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const IconBox = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const IconTag = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);
const IconOrder = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.65 4.93 2 2 0 0 1 3.62 2.73h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l1.42-1.42a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const IconMap = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconSave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconAlert = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24"
       fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconStarEmpty = () => (
  <svg width="16" height="16" viewBox="0 0 24 24"
       fill="none" stroke="#d1d1d1" strokeWidth="1.5"
       strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const IconReviews = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    <line x1="9" y1="10" x2="15" y2="10"/>
    <line x1="9" y1="14" x2="13" y2="14"/>
  </svg>
);

const IconChatMsg = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

export default function Admin() {
  const { lang, t } = useLanguage();
  const [produits,   setProduits]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [form,       setForm]       = useState(emptyProduit);
  const [editId,     setEditId]     = useState(null);
  const [catForm,    setCatForm]    = useState({ nom: "", description: "" });
  const [catEditId,  setCatEditId]  = useState(null);
  const [error,      setError]      = useState("");
  const [saving,     setSaving]     = useState(false);
  const [activeTab,  setActiveTab]  = useState("produits"); /* "produits" | "categories" | "commandes" | "avis" */

  /* ─── Avis ─── */
  const [avis,         setAvis]         = useState([]);
  const [avisLoading,  setAvisLoading]  = useState(false);
  const [deletingAvis, setDeletingAvis] = useState(null);
  const [avisFilter,   setAvisFilter]   = useState(""); /* filtre texte */

  /* Notifs avis non lus (localStorage) */
  const [avisNotifs,    setAvisNotifs]    = useState([]);
  const avisUnreadCount = avisNotifs.filter((n) => !n.read).length;

  const loadAvisNotifs = useCallback(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("sportshop_avis_notifs") || "[]");
      setAvisNotifs(Array.isArray(stored) ? stored : []);
    } catch {
      setAvisNotifs([]);
    }
  }, []);

  const markAvisNotifsRead = useCallback(() => {
    try {
      const updated = JSON.parse(localStorage.getItem("sportshop_avis_notifs") || "[]")
        .map((n) => ({ ...n, read: true }));
      localStorage.setItem("sportshop_avis_notifs", JSON.stringify(updated));
      setAvisNotifs(updated);
    } catch {
      setAvisNotifs([]);
    }
  }, []);

  const loadAvis = useCallback(() => {
    setAvisLoading(true);
    api.get("/admin/avis")
      .then((res) => setAvis(res.data))
      .catch(() => setAvis([]))
      .finally(() => setAvisLoading(false));
  }, []);

  const handleDeleteAvis = async (avisId) => {
    if (!confirm(t("Supprimer cet avis ?", "Delete this review?"))) return;
    setDeletingAvis(avisId);
    try {
      await api.delete(`/avis/${avisId}`);
      setAvis((prev) => prev.filter((a) => a.id !== avisId));
    } finally {
      setDeletingAvis(null);
    }
  };

  /* ─── Commandes (API) ─── */
  const [orders, setOrders] = useState([]);

  /* ─── Chat : quel orderId est ouvert + badge non-lus ─── */
  const [openChatId,   setOpenChatId]   = useState(null);
  const [chatUnreads,  setChatUnreads]  = useState({});  /* { orderId: number } */

  /* Recalcule les badges non-lus de tous les chats (admin) */
  const refreshChatUnreads = useCallback(() => {
    try {
      const counts = {};
      orders.forEach((o) => {
        try { counts[o.id] = chatUnreadCount(o.id, "admin"); } catch { counts[o.id] = 0; }
      });
      setChatUnreads(counts);
    } catch {
      setChatUnreads({});
    }
  }, [orders]);

  /* Polling badge chat toutes les 3s */
  useEffect(() => {
    refreshChatUnreads();
    const interval = setInterval(refreshChatUnreads, 3000);
    return () => clearInterval(interval);
  }, [refreshChatUnreads]);

  const loadOrders = async () => {
    try {
      const res = await api.get("/admin/commandes");
      const read = new Set(JSON.parse(localStorage.getItem("sportshop_orders_read") || "[]"));
      const mapped = (Array.isArray(res.data) ? res.data : []).map((o) => ({
        id: o.id,
        numero: o.numero,
        client: `${o.prenom} ${o.nom}`,
        telephone: o.telephone,
        adresse: o.adresse,
        items: (o.items || []).map((i) => ({ nom: i.nom, quantite: i.quantite, prix: i.prix })),
        total: o.total,
        livraison: o.livraison,
        statut: o.statut,
        mode_paiement: o.mode_paiement,
        statut_paiement: o.statut_paiement,
        transaction_id: o.transaction_id,
        date: o.created_at,
        read: read.has(o.id),
      }));
      setOrders(mapped);
    } catch {
      setOrders([]);
    }
  };

  const unreadCount = orders.filter((o) => !o.read).length;

  const markAllRead = () => {
    const set = new Set(JSON.parse(localStorage.getItem("sportshop_orders_read") || "[]"));
    orders.forEach((o) => set.add(o.id));
    localStorage.setItem("sportshop_orders_read", JSON.stringify([...set]));
    setOrders(orders.map((o) => ({ ...o, read: true })));
  };

  const updateOrderStatus = async (id, statut) => {
    try {
      const res = await api.put(`/admin/commandes/${id}/statut`, { statut });
      const updatedCmd = res.data;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, statut: updatedCmd.statut, statut_paiement: updatedCmd.statut_paiement, transaction_id: updatedCmd.transaction_id }
            : o
        )
      );

      /* ── Notifier le client ── */
      const order = orders.find((o) => o.id === id);
      if (!order) return;

      const statutMessages = {
        en_attente: { fr: "En attente de traitement",   en: "Pending processing" },
        confirmee:  { fr: "Confirmée ✅",                en: "Confirmed ✅" },
        expediee:   { fr: "Expédiée 🚚",                 en: "Shipped 🚚" },
        livree:     { fr: "Livrée 🎉",                   en: "Delivered 🎉" },
        annulee:    { fr: "Annulée ❌",                  en: "Cancelled ❌" },
      };

      const notif = {
        id:       `notif-${Date.now()}`,
        orderId:  order.numero,
        statut,
        message:  statutMessages[statut] ?? { fr: statut, en: statut },
        date:     new Date().toISOString(),
        read:     false,
        clientId: null,
      };

      const existing = JSON.parse(localStorage.getItem("sportshop_client_notifs") || "[]");
      localStorage.setItem(
        "sportshop_client_notifs",
        JSON.stringify([notif, ...existing])
      );
    } catch (err) {
      alert(err.response?.data?.message || t("Une erreur est survenue.", "Something went wrong."));
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm(t("Supprimer cette commande ?", "Delete this order?"))) return;
    try {
      await api.delete(`/admin/commandes/${id}`);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      const set = new Set(JSON.parse(localStorage.getItem("sportshop_orders_read") || "[]"));
      set.delete(id);
      localStorage.setItem("sportshop_orders_read", JSON.stringify([...set]));
    } catch (err) {
      alert(err.response?.data?.message || t("Une erreur est survenue.", "Something went wrong."));
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "—";
      const locale = lang === "fr" ? "fr-MA" : "en-US";
      return d.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
        + " " + d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "—";
    }
  };

  const statutLabel = {
    en_attente:  { label: t("En attente", "Pending"),  cls: "order-status--pending"  },
    confirmee:   { label: t("Confirmée", "Confirmed"),   cls: "order-status--confirmed" },
    expediee:    { label: t("Expédiée", "Shipped"),    cls: "order-status--shipped"   },
    livree:      { label: t("Livrée", "Delivered"),      cls: "order-status--delivered" },
    annulee:     { label: t("Annulée", "Cancelled"),     cls: "order-status--cancelled" },
  };

  const loadAll = () => {
    api.get("/produits").then((res) => setProduits(res.data));
    api.get("/categories").then((res) => setCategories(res.data));
  };

  useEffect(() => {
    loadAll();
    loadOrders();
    loadAvis();
    loadAvisNotifs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* Polling notifs avis toutes les 5s */
  useEffect(() => {
    const interval = setInterval(loadAvisNotifs, 5000);
    return () => clearInterval(interval);
  }, [loadAvisNotifs]);

  /* Stats rapides */
  const totalStock  = produits.reduce((s, p) => s + Number(p.stock), 0);
  const ruptures    = produits.filter((p) => p.stock === 0).length;
  const stockBas    = produits.filter((p) => p.stock > 0 && p.stock <= 5).length;

  /* ─── Produits ─── */
  const submitProduit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await api.put(`/produits/${editId}`, form);
      else        await api.post("/produits", form);
      setForm(emptyProduit); setEditId(null); setError(""); loadAll();
    } catch (err) {
      setError(JSON.stringify(err.response?.data?.errors || err.response?.data));
    } finally { setSaving(false); }
  };

  const editProduit = (p) => {
    setActiveTab("produits");
    setEditId(p.id);
    setForm({ categorie_id: p.categorie_id ?? "", nom: p.nom,
              description: p.description ?? "", prix: p.prix,
              prix_promo: p.prix_promo ?? "", stock: p.stock, image: p.image ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduit = async (id) => {
    if (!confirm(t("Supprimer ce produit ?", "Delete this product?"))) return;
    await api.delete(`/produits/${id}`);
    loadAll();
  };

  /* ─── Catégories ─── */
  const submitCat = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (catEditId) await api.put(`/categories/${catEditId}`, catForm);
      else           await api.post("/categories", catForm);
      setCatForm({ nom: "", description: "" }); setCatEditId(null); loadAll();
    } finally { setSaving(false); }
  };

  const deleteCat = async (id) => {
    if (!confirm(t("Supprimer cette catégorie ?", "Delete this category?"))) return;
    await api.delete(`/categories/${id}`); loadAll();
  };

  /* ─── Rendu ─── */
  return (
    <AdminErrorBoundary>
    <div className="admin-page">

      {/* ════════════════ EN-TÊTE ════════════════ */}
      <div className="admin-header">
        <div>
          <h1 className="admin-title">{t("Dashboard Admin", "Admin dashboard")}</h1>
          <p className="admin-subtitle">{t("Gérez vos produits et catégories SportShop", "Manage your SportShop products and categories")}</p>
        </div>
      </div>

      {/* ════════════════ STATS ════════════════ */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-card__icon" style={{ background: "rgba(99,102,241,0.12)", color: "#6366f1" }}>
            <IconBox />
          </span>
          <div>
            <p className="admin-stat-card__value">{produits.length}</p>
            <p className="admin-stat-card__label">{t("Produits", "Products")}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__icon" style={{ background: "rgba(255,90,31,0.12)", color: "#ff5a1f" }}>
            <IconTag />
          </span>
          <div>
            <p className="admin-stat-card__value">{categories.length}</p>
            <p className="admin-stat-card__label">{t("Catégories", "Categories")}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__icon" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
            <IconBox />
          </span>
          <div>
            <p className="admin-stat-card__value">{totalStock}</p>
            <p className="admin-stat-card__label">{t("Unités en stock", "Units in stock")}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-card__icon" style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
            <IconAlert />
          </span>
          <div>
            <p className="admin-stat-card__value">{ruptures}</p>
            <p className="admin-stat-card__label">{t("Ruptures", "Out of stock")}</p>
            {stockBas > 0 && <p className="admin-stat-card__sub">{stockBas} {t("stock bas", "low-stock items")}</p>}
          </div>
        </div>
        <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => { setActiveTab("commandes"); markAllRead(); }}>
          <span className="admin-stat-card__icon" style={{ background: "rgba(255,171,0,0.12)", color: "#f59e0b" }} >
            <IconOrder />
          </span>
          <div>
            <p className="admin-stat-card__value">
              {orders.length}
              {unreadCount > 0 && (
                <span className="admin-notif-badge admin-notif-badge--stat">{unreadCount}</span>
              )}
            </p>
            <p className="admin-stat-card__label">{t("Commandes", "Orders")}</p>
            {unreadCount > 0 && <p className="admin-stat-card__sub">{t(`${unreadCount} nouvelle${unreadCount > 1 ? "s" : ""}`, `${unreadCount} new`)}</p>}
          </div>
        </div>
        <div className="admin-stat-card" style={{ cursor: "pointer" }} onClick={() => { setActiveTab("avis"); markAvisNotifsRead(); }}>
          <span className="admin-stat-card__icon" style={{ background: "rgba(245,158,11,0.12)", color: "#d97706" }}>
            <IconReviews />
          </span>
          <div>
            <p className="admin-stat-card__value">
              {avis.length}
              {avisUnreadCount > 0 && (
                <span className="admin-notif-badge admin-notif-badge--stat">{avisUnreadCount}</span>
              )}
            </p>
            <p className="admin-stat-card__label">{t("Avis clients", "Reviews")}</p>
            {avisUnreadCount > 0 && (
              <p className="admin-stat-card__sub">
                {t(`${avisUnreadCount} nouveau${avisUnreadCount > 1 ? "x" : ""}`, `${avisUnreadCount} new`)}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="admin-tabs">
        <button
          className={`admin-tab${activeTab === "produits" ? " active" : ""}`}
          onClick={() => setActiveTab("produits")}
        >
          <IconBox /> {t("Produits", "Products")} ({produits.length})
        </button>
        <button
          className={`admin-tab${activeTab === "categories" ? " active" : ""}`}
          onClick={() => setActiveTab("categories")}
        >
          <IconTag /> {t("Catégories", "Categories")} ({categories.length})
        </button>
        <button
          className={`admin-tab${activeTab === "commandes" ? " active" : ""}`}
          onClick={() => { setActiveTab("commandes"); markAllRead(); }}
        >
          <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconOrder /> {t("Commandes", "Orders")} ({orders.length})
            {unreadCount > 0 && (
              <span className="admin-notif-badge">{unreadCount}</span>
            )}
          </span>
        </button>
        <button
          className={`admin-tab${activeTab === "avis" ? " active" : ""}`}
          onClick={() => { setActiveTab("avis"); markAvisNotifsRead(); }}
        >
          <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconReviews /> {t("Avis clients", "Reviews")} ({avis.length})
            {avisUnreadCount > 0 && (
              <span className="admin-notif-badge">{avisUnreadCount}</span>
            )}
          </span>
        </button>
      </div>

      {/* ════════════════ SECTION PRODUITS ════════════════ */}
      {activeTab === "produits" && (
        <div className="admin-section">

          {/* Formulaire produit */}
          <div className="admin-form-card">
            <div className="admin-form-card__header">
              <h2>{editId ? t("✏️ Modifier le produit", "✏️ Edit product") : t("➕ Nouveau produit", "➕ New product")}</h2>
              {editId && (
                <button className="admin-btn-icon" onClick={() => { setEditId(null); setForm(emptyProduit); }}>
                  <IconX />
                </button>
              )}
            </div>

            {error && (
              <div className="admin-alert">
                <IconAlert /> {error}
              </div>
            )}

            <form className="admin-form" onSubmit={submitProduit}>
              <div className="admin-form__row">
                {/* Catégorie */}
                <div className="admin-form__field">
                  <label className="admin-form__label">{t("Catégorie", "Category")} *</label>
                  <div className="admin-form__input-wrap">
                    <select
                      className="admin-form__input"
                      value={form.categorie_id}
                      onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}
                      required
                    >
                      <option value="">{t("Sélectionner…", "Select…")}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{translateCategory(c.nom, lang)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Nom */}
                <div className="admin-form__field admin-form__field--grow">
                  <label className="admin-form__label">{t("Nom du produit", "Product name")} *</label>
                  <div className="admin-form__input-wrap">
                    <input className="admin-form__input" placeholder={t("Ex : T-shirt running homme", "e.g. Men's running shirt")}
                      value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} required />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="admin-form__field">
                <label className="admin-form__label">{t("Description", "Description")}</label>
                <textarea className="admin-form__input admin-form__textarea"
                  placeholder={t("Description du produit…", "Product description…")} rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="admin-form__row">
                {/* Prix */}
                <div className="admin-form__field">
                  <label className="admin-form__label">{t("Prix", "Price")} (DH) *</label>
                  <div className="admin-form__input-wrap">
                    <span className="admin-form__prefix">DH</span>
                    <input className="admin-form__input admin-form__input--prefixed"
                      type="number" step="0.01" min="0" placeholder="0.00"
                      value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} required />
                  </div>
                </div>

                {/* Prix promo */}
                <div className="admin-form__field">
                  <label className="admin-form__label">
                    {t("Prix promo", "Promo price")} (DH)
                    <span style={{ marginLeft: 6, fontSize: 11, color: "var(--color-gray-400)", fontWeight: 400 }}>
                      {t("optionnel", "optional")}
                    </span>
                  </label>
                  <div className="admin-form__input-wrap">
                    <span className="admin-form__prefix" style={{ color: "#e53e3e" }}>DH</span>
                    <input className="admin-form__input admin-form__input--prefixed"
                      type="number" step="0.01" min="0" placeholder="0.00"
                      value={form.prix_promo}
                      onChange={(e) => setForm({ ...form, prix_promo: e.target.value })} />
                  </div>
                  {form.prix_promo && form.prix && Number(form.prix_promo) >= Number(form.prix) && (
                    <p style={{ color: "#e53e3e", fontSize: 11, marginTop: 4 }}>
                      {t("Le prix promo doit être inférieur au prix normal.", "Promo price must be less than the regular price.")}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div className="admin-form__field">
                  <label className="admin-form__label">Stock *</label>
                  <div className="admin-form__input-wrap">
                    <input className="admin-form__input"
                      type="number" min="0" placeholder="0"
                      value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
                  </div>
                </div>

                {/* URL image */}
                <div className="admin-form__field admin-form__field--grow">
                  <label className="admin-form__label">{t("URL de l'image", "Image URL")}</label>
                  <div className="admin-form__input-wrap">
                    <input className="admin-form__input" placeholder="https://…"
                      value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Preview image */}
              {form.image && (
                <div className="admin-img-preview">
                  <img src={form.image} alt={t("Aperçu", "Preview")}
                    onError={(e) => { e.target.style.display = "none"; }} />
                  <span>{t("Aperçu de l'image", "Image preview")}</span>
                </div>
              )}

              <div className="admin-form__actions">
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? <span className="admin-spinner"/> : <IconSave />}
                  {editId ? t("Enregistrer les modifications", "Save changes") : t("Ajouter le produit", "Add product")}
                </button>
                {editId && (
                  <button type="button" className="admin-btn-outline"
                    onClick={() => { setEditId(null); setForm(emptyProduit); }}>
                    {t("Annuler", "Cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Tableau produits */}
          <div className="admin-table-card">
            <div className="admin-table-card__header">
              <h3>{t("Liste des produits", "Product list")}</h3>
              <span className="admin-table-card__count">{produits.length} {t("produits", "products")}</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>{t("Nom", "Name")}</th>
                    <th>{t("Catégorie", "Category")}</th>
                    <th>{t("Prix", "Price")}</th>
                    <th>{t("Promo", "Promo")}</th>
                    <th>Stock</th>
                    <th>{t("Actions", "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {produits.map((p) => (
                    <tr key={p.id} className={p.stock === 0 ? "admin-table__row--rupture" : ""}>
                      <td>
                        <img
                          className="admin-table__thumb"
                          src={p.image || "https://placehold.co/48x48/f5f5f5/767676?text=S"}
                          alt={p.nom}
                          onError={(e) => { e.target.src = "https://placehold.co/48x48/f5f5f5/767676?text=S"; }}
                        />
                      </td>
                      <td className="admin-table__name">{p.nom}</td>
                      <td>
                        <span className="admin-table__cat-badge">{translateCategory(p.categorie?.nom, lang)}</span>
                      </td>
                      <td className="admin-table__price">
                        {Number(p.prix).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
                      </td>
                      <td className="admin-table__price">
                        {p.prix_promo ? (
                          <span style={{ color: "#e53e3e", fontWeight: 600 }}>
                            {Number(p.prix_promo).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
                          </span>
                        ) : (
                          <span style={{ color: "var(--color-gray-400)" }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={`admin-table__stock${
                          p.stock === 0 ? " out" : p.stock <= 5 ? " low" : " ok"
                        }`}>
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table__actions">
                          <button className="admin-action-btn admin-action-btn--edit"
                            onClick={() => editProduit(p)} title={t("Modifier", "Edit")}>
                            <IconEdit />
                          </button>
                          <button className="admin-action-btn admin-action-btn--delete"
                            onClick={() => deleteProduit(p.id)} title={t("Supprimer", "Delete")}>
                            <IconTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ SECTION CATÉGORIES ════════════════ */}
      {activeTab === "categories" && (
        <div className="admin-section">

          {/* Formulaire catégorie */}
          <div className="admin-form-card">
            <div className="admin-form-card__header">
              <h2>{catEditId ? t("✏️ Modifier la catégorie", "✏️ Edit category") : t("➕ Nouvelle catégorie", "➕ New category")}</h2>
              {catEditId && (
                <button className="admin-btn-icon"
                  onClick={() => { setCatEditId(null); setCatForm({ nom: "", description: "" }); }}>
                  <IconX />
                </button>
              )}
            </div>

            <form className="admin-form" onSubmit={submitCat}>
              <div className="admin-form__row">
                <div className="admin-form__field admin-form__field--grow">
                  <label className="admin-form__label">{t("Nom de la catégorie", "Category name")} *</label>
                  <input className="admin-form__input" placeholder={t("Ex : Chaussures", "e.g. Shoes")}
                    value={catForm.nom}
                    onChange={(e) => setCatForm({ ...catForm, nom: e.target.value })} required />
                </div>
                <div className="admin-form__field admin-form__field--grow">
                  <label className="admin-form__label">{t("Description", "Description")}</label>
                  <input className="admin-form__input" placeholder={t("Description courte…", "Short description…")}
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
                </div>
              </div>
              <div className="admin-form__actions">
                <button type="submit" className="admin-btn-primary" disabled={saving}>
                  {saving ? <span className="admin-spinner"/> : <IconSave />}
                  {catEditId ? t("Enregistrer", "Save") : t("Ajouter la catégorie", "Add category")}
                </button>
                {catEditId && (
                  <button type="button" className="admin-btn-outline"
                    onClick={() => { setCatEditId(null); setCatForm({ nom: "", description: "" }); }}>
                    {t("Annuler", "Cancel")}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Grille catégories */}
          <div className="admin-table-card">
            <div className="admin-table-card__header">
              <h3>{t("Catégories existantes", "Existing categories")}</h3>
              <span className="admin-table-card__count">{categories.length} {t("catégories", "categories")}</span>
            </div>
            <div className="admin-cat-grid">
              {categories.map((c) => (
                <div className="admin-cat-item" key={c.id}>
                  <div className="admin-cat-item__icon">
                    <IconTag />
                  </div>
                  <div className="admin-cat-item__info">
                    <p className="admin-cat-item__name">{translateCategory(c.nom, lang)}</p>
                    {c.description && (
                      <p className="admin-cat-item__desc">{c.description}</p>
                    )}
                    <p className="admin-cat-item__count">
                      {produits.filter((p) => p.categorie?.nom === c.nom).length} produits
                    </p>
                  </div>
                  <div className="admin-cat-item__actions">
                    <button className="admin-action-btn admin-action-btn--edit"
                      title={t("Modifier", "Edit")}
                      onClick={() => {
                        setCatEditId(c.id);
                        setCatForm({ nom: c.nom, description: c.description ?? "" });
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}>
                      <IconEdit />
                    </button>
                    <button className="admin-action-btn admin-action-btn--delete"
                      title={t("Supprimer", "Delete")}
                      onClick={() => deleteCat(c.id)}>
                      <IconTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ SECTION COMMANDES ════════════════ */}
      {activeTab === "commandes" && (
        <div className="admin-section">
          <div className="admin-table-card">
            <div className="admin-table-card__header">
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconBell /> Commandes reçues
              </h3>
              <span className="admin-table-card__count">
                {t(
                  `${orders.length} commande${orders.length !== 1 ? "s" : ""}`,
                  `${orders.length} order${orders.length !== 1 ? "s" : ""}`
                )}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="admin-orders-empty">
                <IconOrder />
                <p>{t("Aucune commande pour le moment.", "No orders yet.")}</p>
              </div>
            ) : (
              <div className="admin-orders-list">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`admin-order-card${!order.read ? " admin-order-card--new" : ""}`}
                  >
                    {/* Badge nouvelle commande */}
                    {!order.read && (
                      <span className="admin-order-card__new-badge">{t("Nouvelle", "New")}</span>
                    )}

                    <div className="admin-order-card__top">
                      <div className="admin-order-card__id">
                        <span className="admin-order-card__num">{order.numero}</span>
                        <span className="admin-order-card__date">{formatDate(order.date)}</span>
                      </div>
                      <div className="admin-order-card__total">
                        {Number(order.total).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
                      </div>
                    </div>

                    <div className="admin-order-card__body">
                      {/* Infos client */}
                      <div className="admin-order-card__client">
                        <p className="admin-order-card__client-name">{order.client}</p>
                        <p className="admin-order-card__client-detail">
                          <IconPhone /> {order.telephone}
                        </p>
                        <p className="admin-order-card__client-detail">
                          <IconMap /> {order.adresse}
                        </p>
                      </div>

                      {/* Articles */}
                      <div className="admin-order-card__items">
                        {(order.items ?? []).map((item, idx) => (
                          <div key={idx} className="admin-order-card__item">
                            <span className="admin-order-card__item-name">{item.nom}</span>
                            <span className="admin-order-card__item-qty">× {item.quantite}</span>
                            <span className="admin-order-card__item-price">
                              {(item.prix * item.quantite).toLocaleString(lang === "fr" ? "fr-MA" : "en-US")} DH
                            </span>
                          </div>
                        ))}
                        {order.livraison > 0 && (
                          <div className="admin-order-card__item admin-order-card__item--livraison">
                            <span>{t("Livraison", "Shipping")}</span>
                            <span></span>
                            <span>{order.livraison} DH</span>
                          </div>
                        )}
                      </div>

                      <div className="admin-order-card__payment">
                        <span className="admin-order-card__payment-method">
                          {order.mode_paiement === "card" ? t("💳 Carte", "💳 Card") : t("💵 COD", "💵 COD")}
                        </span>
                        <span className={`admin-order-card__payment-status admin-order-card__payment-status--${order.statut_paiement}`}>
                          {order.statut_paiement === "paye"
                            ? t("Payé", "Paid")
                            : order.statut_paiement === "rembourse"
                            ? t("Remboursé", "Refunded")
                            : t("En attente", "Pending")}
                        </span>
                        {order.transaction_id && (
                          <span className="admin-order-card__payment-txn">{order.transaction_id}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions statut */}
                    <div className="admin-order-card__footer">
                      <div className={`order-status ${statutLabel[order.statut]?.cls ?? ""}`}>
                        {statutLabel[order.statut]?.label ?? order.statut}
                      </div>
                      <div className="admin-order-card__actions">
                        <select
                          className="admin-order-card__select"
                          value={order.statut}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="en_attente">{t("En attente", "Pending")}</option>
                          <option value="confirmee">{t("Confirmée", "Confirmed")}</option>
                          <option value="expediee">{t("Expédiée", "Shipped")}</option>
                          <option value="livree">{t("Livrée", "Delivered")}</option>
                          <option value="annulee">{t("Annulée", "Cancelled")}</option>
                        </select>

                        {/* Bouton Chat */}
                        <button
                          className={`admin-action-btn admin-action-btn--chat${openChatId === order.id ? " active" : ""}`}
                          title={t("Messagerie", "Chat")}
                          onClick={() => {
                            setOpenChatId((prev) => prev === order.id ? null : order.id);
                            refreshChatUnreads();
                          }}
                          style={{ position: "relative" }}
                        >
                          <IconChatMsg />
                          {(chatUnreads[order.id] ?? 0) > 0 && (
                            <span className="admin-chat-badge">
                              {chatUnreads[order.id]}
                            </span>
                          )}
                        </button>

                        <button
                          className="admin-action-btn admin-action-btn--delete"
                          onClick={() => deleteOrder(order.id)}
                          title={t("Supprimer", "Delete")}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>

                    {/* Panel Chat */}
                    {openChatId === order.id && (
                      <div className="admin-order-chat-panel">
                        <OrderChat
                          orderId={order.id}
                          role="admin"
                          clientName={order.client}
                          onClose={() => setOpenChatId(null)}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════ SECTION AVIS CLIENTS ════════════════ */}
      {activeTab === "avis" && (
        <div className="admin-section">

          {/* Bandeau notifs récentes non lues */}
          {avisNotifs.filter((n) => !n.read).length > 0 && (
            <div className="admin-avis-notif-banner">
              <div className="admin-avis-notif-banner__icon">
                <IconReviews />
              </div>
              <div className="admin-avis-notif-banner__content">
                <p className="admin-avis-notif-banner__title">
                  {avisUnreadCount === 1
                    ? t("1 nouvel avis client reçu", "1 new customer review received")
                    : t(`${avisUnreadCount} nouveaux avis clients reçus`, `${avisUnreadCount} new customer reviews received`)}
                </p>
                <div className="admin-avis-notif-banner__list">
                  {avisNotifs.filter((n) => !n.read).slice(0, 3).map((n) => (
                    <span key={n.id} className="admin-avis-notif-banner__item">
                      <strong>{n.clientName}</strong>
                      {" "}{n.isUpdate ? t("a modifié son avis", "updated their review") : t("a laissé un avis", "left a review")}
                      {n.produitNom ? <> {t("sur", "on")} <em>{n.produitNom}</em></> : ""}{" "}
                      — {"⭐".repeat(Math.min(5, Math.max(0, Number(n.note) || 0)))}
                    </span>
                  ))}
                  {avisNotifs.filter((n) => !n.read).length > 3 && (
                    <span className="admin-avis-notif-banner__more">
                      +{avisNotifs.filter((n) => !n.read).length - 3} {t("autres", "more")}
                    </span>
                  )}
                </div>
              </div>
              <button
                className="admin-avis-notif-banner__dismiss"
                onClick={markAvisNotifsRead}
                title={t("Marquer comme lu", "Mark as read")}
              >
                <IconX />
              </button>
            </div>
          )}
          <div className="admin-table-card">
            <div className="admin-table-card__header">
              <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <IconReviews /> {t("Avis clients", "Customer reviews")}
              </h3>
              <span className="admin-table-card__count">
                {avis.length} {t("avis", "reviews")}
              </span>
            </div>

            {/* Barre de recherche */}
            <div className="admin-avis-search">
              <input
                type="text"
                className="admin-form__input"
                placeholder={t("Rechercher par client, produit ou commentaire…", "Search by client, product or comment…")}
                value={avisFilter}
                onChange={(e) => setAvisFilter(e.target.value)}
              />
            </div>

            {avisLoading ? (
              <div className="admin-orders-empty">
                <span className="admin-spinner" style={{ borderTopColor: "#f59e0b" }} />
              </div>
            ) : avis.length === 0 ? (
              <div className="admin-orders-empty">
                <IconReviews />
                <p>{t("Aucun avis pour le moment.", "No reviews yet.")}</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>{t("Client", "Client")}</th>
                      <th>{t("Produit", "Product")}</th>
                      <th>{t("Note", "Rating")}</th>
                      <th>{t("Commentaire", "Comment")}</th>
                      <th>{t("Date", "Date")}</th>
                      <th>{t("Action", "Action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avis
                      .filter((a) => {
                        if (!avisFilter) return true;
                        const q = avisFilter.toLowerCase();
                        return (
                          a.user?.name?.toLowerCase().includes(q) ||
                          a.produit?.nom?.toLowerCase().includes(q) ||
                          a.commentaire?.toLowerCase().includes(q)
                        );
                      })
                      .map((a) => (
                        <tr key={a.id}>
                          {/* Client */}
                          <td>
                            <div className="admin-avis-client">
                              <div className="admin-avis-avatar">
                                {(a.user?.name ?? "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="admin-avis-client__name">{a.user?.name ?? "—"}</p>
                                <p className="admin-avis-client__email">{a.user?.email ?? ""}</p>
                              </div>
                            </div>
                          </td>

                          {/* Produit */}
                          <td>
                            <div className="admin-avis-produit">
                              {a.produit?.image && (
                                <img
                                  className="admin-table__thumb"
                                  src={a.produit.image}
                                  alt={a.produit.nom}
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                              )}
                              <span className="admin-table__name">{a.produit?.nom ?? "—"}</span>
                            </div>
                          </td>

                          {/* Note étoiles */}
                          <td>
                            <div className="admin-avis-stars">
                              {[1,2,3,4,5].map((s) =>
                                s <= a.note
                                  ? <IconStar key={s} />
                                  : <IconStarEmpty key={s} />
                              )}
                              <span className="admin-avis-note">{a.note}/5</span>
                            </div>
                          </td>

                          {/* Commentaire */}
                          <td>
                            {a.commentaire ? (
                              <p className="admin-avis-comment">{a.commentaire}</p>
                            ) : (
                              <span className="admin-avis-no-comment">
                                {t("Aucun commentaire", "No comment")}
                              </span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="admin-avis-date">
                            {formatDate(a.created_at)}
                          </td>

                          {/* Supprimer */}
                          <td>
                            <button
                              className="admin-action-btn admin-action-btn--delete"
                              title={t("Supprimer", "Delete")}
                              disabled={deletingAvis === a.id}
                              onClick={() => handleDeleteAvis(a.id)}
                            >
                              {deletingAvis === a.id
                                ? <span className="admin-spinner" style={{ width: 12, height: 12 }} />
                                : <IconTrash />
                              }
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
    </AdminErrorBoundary>
  );
}
