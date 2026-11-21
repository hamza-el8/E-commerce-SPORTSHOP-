/**
 * Navbar — Premium Dark Edition
 * Style : noir profond · or · glassmorphism
 * Logo mark carré doré + nom display uppercase
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useCartFav } from "../CartFavContext";
import { useLanguage } from "../language.js";

/* ─────────────────────────────────────────────
   ICÔNES SVG
───────────────────────────────────────────── */
const IconHeart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconBag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconChevron = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       width="13" height="13">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
       width="15" height="15">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconProfile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
       width="15" height="15">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconAdmin = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
       width="15" height="15">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
  </svg>
);

const IconBell = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
       width="12" height="12">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       width="22" height="22">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* Logo mark SVG — éclair dans carré arrondi */
const LogoMark = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.5 2 L6 10.5 L10 10.5 L8.5 18 L14 9 L10 9 Z" fill="#0a0a0a"/>
  </svg>
);

/* ─────────────────────────────────────────────
   COMPOSANT NAVBAR
───────────────────────────────────────────── */
export default function Navbar() {
  const { user, logout }        = useAuth();
  const { cartCount, favCount } = useCartFav();
  const { t }                   = useLanguage();
  const navigate                = useNavigate();
  const location                = useLocation();

  const [menuOpen,     setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [notifs,       setNotifs]       = useState([]);
  const [scrolled,     setScrolled]     = useState(false);

  const dropdownRef = useRef(null);
  const notifRef    = useRef(null);

  /* Scroll effect */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Charge les notifications */
  const loadNotifs = useCallback(() => {
    if (!user || user.role === "admin") return;
    const stored  = JSON.parse(localStorage.getItem("sportshop_client_notifs") || "[]");
    const cleaned = stored.filter((n) => !(n.statut === "message" && !n.text));
    if (cleaned.length !== stored.length)
      localStorage.setItem("sportshop_client_notifs", JSON.stringify(cleaned));
    setNotifs(cleaned);
  }, [user]);

  useEffect(() => { loadNotifs(); }, [loadNotifs]);

  useEffect(() => {
    if (!user || user.role === "admin") return;
    const id = setInterval(loadNotifs, 5000);
    return () => clearInterval(id);
  }, [user, loadNotifs]);

  const unreadNotifs = notifs.filter((n) => !n.read).length;

  const markAllRead = () => {
    const updated = notifs.map((n) => ({ ...n, read: true }));
    localStorage.setItem("sportshop_client_notifs", JSON.stringify(updated));
    setNotifs(updated);
  };

  const markRead = (id) => {
    const updated = notifs.map((n) => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem("sportshop_client_notifs", JSON.stringify(updated));
    setNotifs(updated);
  };

  const clearAll = () => {
    localStorage.removeItem("sportshop_client_notifs");
    setNotifs([]);
    setNotifOpen(false);
  };

  const formatDate = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (m < 1)  return "À l'instant";
    if (m < 60) return `${m} min`;
    if (h < 24) return `${h}h`;
    return `${d}j`;
  };

  const statutIcon = { confirmee: "✅", expediee: "🚚", livree: "🎉", annulee: "❌", en_attente: "⏳" };

  /* Ferme tout au changement de route */
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  /* Bloque le scroll body sur menu mobile */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  /* Click outside */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current    && !notifRef.current.contains(e.target))    setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Announce bar ── */}
      <div className="announce-bar">
        <div className="announce-bar__inner">
          <span>✦</span> {t("Livraison gratuite dès 500 DH", "Free shipping from 500 DH")}
          <span>✦</span> {t("Retours gratuits 30 jours", "Free 30-day returns")}
          <span>✦</span> {t("Nouvelle collection 2026 disponible", "New 2026 collection available")}
          <span>✦</span> {t("Livraison gratuite dès 500 DH", "Free shipping from 500 DH")}
          <span>✦</span> {t("Retours gratuits 30 jours", "Free 30-day returns")}
          <span>✦</span> {t("Nouvelle collection 2026 disponible", "New 2026 collection available")}
        </div>
      </div>

      {/* ── Navbar principale ── */}
      <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
        <div className="navbar__inner">

          {/* Logo */}
          <Link to="/" className="navbar__logo">
            <div className="navbar__logo-mark">
              <LogoMark />
            </div>
            <div className="navbar__logo-text">
              <span className="navbar__logo-name">SportShop</span>
              <span className="navbar__logo-tagline">{t("Performance · Style", "Performance · Style")}</span>
            </div>
          </Link>

          {/* Liens centraux */}
          <div className="navbar__links">
            <Link to="/" className={`navbar__link${isActive("/") ? " active" : ""}`}>
              {t("Produits", "Products")}
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" className="navbar__link navbar__link--admin">
                Admin
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="navbar__actions">
            {user ? (
              <>
                {/* Favoris */}
                {user.role !== "admin" && (
                  <Link to="/favoris" className="navbar__icon-btn" aria-label={t("Favoris", "Favorites")}>
                    <IconHeart />
                    {favCount > 0 && <span className="navbar__badge">{favCount > 99 ? "99+" : favCount}</span>}
                    <span className="navbar__icon-label">{t("Favoris", "Favorites")}</span>
                  </Link>
                )}

                {/* Panier */}
                {user.role !== "admin" && (
                  <Link to="/panier" className="navbar__icon-btn" aria-label={t("Panier", "Cart")}>
                    <IconBag />
                    {cartCount > 0 && <span className="navbar__badge">{cartCount > 99 ? "99+" : cartCount}</span>}
                    <span className="navbar__icon-label">{t("Panier", "Cart")}</span>
                  </Link>
                )}

                {/* Notifications */}
                {user.role !== "admin" && (
                  <div className="navbar__notif" ref={notifRef}>
                    <button
                      className="navbar__icon-btn"
                      onClick={() => { setNotifOpen((v) => !v); setDropdownOpen(false); }}
                      aria-label="Notifications"
                    >
                      <IconBell />
                      {unreadNotifs > 0 && (
                        <span className="navbar__badge navbar__badge--notif">
                          {unreadNotifs > 9 ? "9+" : unreadNotifs}
                        </span>
                      )}
                      <span className="navbar__icon-label">{t("Alertes", "Alerts")}</span>
                    </button>

                    {notifOpen && (
                      <div className="navbar__notif-dropdown">
                        <div className="navbar__notif-header">
                          <span className="navbar__notif-title">
                            {t("Notifications", "Notifications")}
                            {unreadNotifs > 0 && (
                              <span className="navbar__notif-count">{unreadNotifs}</span>
                            )}
                          </span>
                          <div className="navbar__notif-header-actions">
                            {unreadNotifs > 0 && (
                              <button className="navbar__notif-action-btn" onClick={markAllRead}>
                                <IconCheck /> {t("Lire tout", "Read all")}
                              </button>
                            )}
                            {notifs.length > 0 && (
                              <button className="navbar__notif-action-btn navbar__notif-action-btn--clear" onClick={clearAll}>
                                {t("Effacer", "Clear")}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="navbar__notif-list">
                          {notifs.length === 0 ? (
                            <div className="navbar__notif-empty">
                              <span>🔕</span>
                              <p>{t("Aucune notification", "No notifications")}</p>
                            </div>
                          ) : (
                            notifs.slice(0, 10).map((n) => (
                              <div
                                key={n.id}
                                className={`navbar__notif-item${!n.read ? " unread" : ""}`}
                                onClick={() => markRead(n.id)}
                              >
                                <span className="navbar__notif-item__icon">
                                  {n.statut === "message" ? "💬" : (statutIcon[n.statut] ?? "📦")}
                                </span>
                                <div className="navbar__notif-item__body">
                                  {n.statut === "message" ? (
                                    <>
                                      <p className="navbar__notif-item__text">
                                        <span className="navbar__notif-item__from">Admin</span>
                                        <span className="navbar__notif-item__order"> · {n.orderId}</span>
                                      </p>
                                      <p className="navbar__notif-item__status navbar__notif-item__status--msg">
                                        {n.text ?? n.message?.fr ?? t("Nouveau message", "New message")}
                                      </p>
                                    </>
                                  ) : (
                                    <>
                                      <p className="navbar__notif-item__text">
                                        {t("Commande", "Order")} <strong>{n.orderId}</strong>
                                      </p>
                                      <p className="navbar__notif-item__status">
                                        {n.message?.fr ?? n.message?.en ?? n.statut}
                                      </p>
                                    </>
                                  )}
                                  <p className="navbar__notif-item__time">{formatDate(n.date)}</p>
                                </div>
                                {!n.read && <span className="navbar__notif-item__dot" />}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Profil dropdown */}
                <div className="navbar__profile" ref={dropdownRef}>
                  <button
                    className={`navbar__profile-btn${dropdownOpen ? " open" : ""}`}
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-expanded={dropdownOpen}
                    aria-label="Profile menu"
                  >
                    <span className="navbar__user-avatar">{initials}</span>
                    <div className="navbar__profile-info">
                      <span className="navbar__profile-name">{user.name.split(" ")[0]}</span>
                      <span className="navbar__profile-role">
                        {user.role === "admin" ? "Admin" : t("Client", "Customer")}
                      </span>
                    </div>
                    <span className={`navbar__profile-chevron${dropdownOpen ? " rotated" : ""}`}>
                      <IconChevron />
                    </span>
                  </button>

                  {dropdownOpen && (
                    <div className="navbar__dropdown" role="menu">
                      <div className="navbar__dropdown-header">
                        <span className="navbar__user-avatar navbar__user-avatar--lg">{initials}</span>
                        <div>
                          <p className="navbar__dropdown-name">{user.name}</p>
                          <p className="navbar__dropdown-role">
                            {user.role === "admin" ? t("Administrateur", "Administrator") : t("Client", "Customer")}
                          </p>
                        </div>
                      </div>

                      <div className="navbar__dropdown-divider" />

                      <Link to="/profil" className="navbar__dropdown-item" role="menuitem"
                            onClick={() => setDropdownOpen(false)}>
                        <IconProfile />
                        {t("Mon profil", "My Profile")}
                      </Link>

                      {user.role === "admin" && (
                        <Link to="/admin" className="navbar__dropdown-item" role="menuitem"
                              onClick={() => setDropdownOpen(false)}>
                          <IconAdmin />
                          Administration
                        </Link>
                      )}

                      <div className="navbar__dropdown-divider" />

                      <button className="navbar__dropdown-item navbar__dropdown-item--danger"
                              role="menuitem" onClick={handleLogout}>
                        <IconLogout />
                        {t("Déconnexion", "Sign out")}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="navbar__icon-btn" aria-label={t("Connexion", "Sign in")}>
                <IconUser />
                <span className="navbar__icon-label">{t("Connexion", "Sign in")}</span>
              </Link>
            )}

            {/* Burger mobile */}
            <button
              className="navbar__burger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("Fermer", "Close") : t("Menu", "Menu")}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <IconX /> : (
                <>
                  <span className="navbar__burger-line" />
                  <span className="navbar__burger-line" />
                  <span className="navbar__burger-line" />
                </>
              )}
            </button>
          </div>

        </div>
      </nav>

      {/* Menu mobile */}
      <div className={`navbar__mobile${menuOpen ? " open" : ""}`} role="dialog"
           aria-label={t("Navigation", "Navigation")}>
        <Link to="/" className={`navbar__link${isActive("/") ? " active" : ""}`}>
          {t("Produits", "Products")}
        </Link>

        {user ? (
          <>
            {user.role !== "admin" && (
              <Link to="/favoris" className={`navbar__link${isActive("/favoris") ? " active" : ""}`}>
                {t("Mes favoris", "My Favorites")}
              </Link>
            )}
            {user.role !== "admin" && (
              <Link to="/panier" className={`navbar__link${isActive("/panier") ? " active" : ""}`}>
                {t("Mon panier", "My Cart")}
              </Link>
            )}
            <Link to="/profil" className={`navbar__link${isActive("/profil") ? " active" : ""}`}>
              {t("Mon profil", "My Profile")} — {user.name}
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" className="navbar__link navbar__link--admin">
                Administration
              </Link>
            )}
            <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "8px 0" }} />
            <button
              className="navbar__dropdown-item navbar__dropdown-item--danger"
              onClick={handleLogout}
              style={{ width: "100%", borderRadius: "6px", padding: "14px 16px" }}
            >
              <IconLogout />
              {t("Déconnexion", "Sign out")}
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className={`navbar__link${isActive("/login")    ? " active" : ""}`}>
              {t("Connexion", "Sign in")}
            </Link>
            <Link to="/register" className={`navbar__link${isActive("/register") ? " active" : ""}`}>
              {t("S'inscrire", "Sign up")}
            </Link>
          </>
        )}
      </div>
    </>
  );
}
