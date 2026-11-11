/**
 * Navbar — SportShop
 * - Logo SVG personnalisé
 * - Icônes Favoris / Panier avec label texte en dessous
 * - Dropdown profil au clic : Mon profil + Déconnexion (plus de bouton "Sortir")
 * - Menu burger mobile
 * La logique (useAuth, logout, navigate) est inchangée.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { useCartFav } from "../CartFavContext";
import { useLanguage } from "../language.js";

/* ─────────────────────────────────────────────
   ICÔNES SVG inline
───────────────────────────────────────────── */

/* Logo SVG — hexagone + éclair, style sport premium */
const LogoIcon = () => (
  <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hexGrad" x1="0" y1="0" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ff7a45"/>
        <stop offset="100%" stopColor="#e04a12"/>
      </linearGradient>
    </defs>

    {/* Hexagone rempli orange */}
    <polygon
      points="21,2 38,11.5 38,30.5 21,40 4,30.5 4,11.5"
      fill="url(#hexGrad)"
    />

    {/* Hexagone bordure intérieure fine blanche semi-transparente */}
    <polygon
      points="21,5.5 35,13.75 35,30.25 21,38.5 7,30.25 7,13.75"
      fill="none"
      stroke="rgba(255,255,255,0.18)"
      strokeWidth="1"
    />

    {/* Éclair blanc — gras, centré */}
    <path
      d="M23.5 7 L14 22 L20.5 22 L18 35 L28 19 L21.5 19 Z"
      fill="white"
    />
  </svg>
);

const IconHeart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const IconBag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
);

const IconUser = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconChevron = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
       width="14" height="14">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const IconLogout = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
       width="16" height="16">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconProfile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
       width="16" height="16">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
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

const IconBell = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const IconCheck2 = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
       width="13" height="13">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* ─────────────────────────────────────────────
   COMPOSANT NAVBAR
───────────────────────────────────────────── */
export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, favCount } = useCartFav();
  const { t } = useLanguage();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [menuOpen,     setMenuOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen,    setNotifOpen]    = useState(false);
  const [notifs,       setNotifs]       = useState([]);

  const dropdownRef = useRef(null);
  const notifRef    = useRef(null);

  /* Charge les notifications depuis localStorage */
  const loadNotifs = useCallback(() => {
    if (!user || user.role === "admin") return;
    const stored = JSON.parse(localStorage.getItem("sportshop_client_notifs") || "[]");
    /* Nettoie les vieilles notifs "message" sans champ text (ancien format) */
    const cleaned = stored.filter(
      (n) => !(n.statut === "message" && !n.text)
    );
    if (cleaned.length !== stored.length) {
      localStorage.setItem("sportshop_client_notifs", JSON.stringify(cleaned));
    }
    setNotifs(cleaned);
  }, [user]);

  useEffect(() => { loadNotifs(); }, [loadNotifs]);

  /* Poll toutes les 5 secondes pour détecter les mises à jour de l'admin */
  useEffect(() => {
    if (!user || user.role === "admin") return;
    const interval = setInterval(loadNotifs, 5000);
    return () => clearInterval(interval);
  }, [user, loadNotifs]);

  const unreadNotifs = notifs.filter((n) => !n.read).length;

  const markAllNotifsRead = () => {
    const updated = notifs.map((n) => ({ ...n, read: true }));
    localStorage.setItem("sportshop_client_notifs", JSON.stringify(updated));
    setNotifs(updated);
  };

  const markNotifRead = (id) => {
    const updated = notifs.map((n) => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem("sportshop_client_notifs", JSON.stringify(updated));
    setNotifs(updated);
  };

  const clearAllNotifs = () => {
    localStorage.removeItem("sportshop_client_notifs");
    setNotifs([]);
    setNotifOpen(false);
  };

  const formatNotifDate = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffH   = Math.floor(diffMs / 3600000);
    const diffD   = Math.floor(diffMs / 86400000);
    if (diffMin < 1)  return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffH   < 24) return `Il y a ${diffH}h`;
    return `Il y a ${diffD}j`;
  };

  const statutIcon = {
    confirmee: "✅",
    expediee:  "🚚",
    livree:    "🎉",
    annulee:   "❌",
    en_attente: "⏳",
  };

  /* Ferme le menu burger à chaque changement de route */
  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  /* Bloque le scroll du body quand le menu mobile est ouvert */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  /* Ferme les dropdowns en cliquant en dehors */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  };

  /* Initiales pour l'avatar */
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <div className="navbar__inner">

          {/* ── Logo ── */}
          <Link to="/" className="navbar__logo">
            <LogoIcon />
            <span className="navbar__logo-text">
              SPORT<span className="navbar__logo-accent">SHOP</span>
            </span>
          </Link>

          {/* ── Liens centraux (desktop) ── */}
          <div className="navbar__links">
            <Link to="/" className={`navbar__link${isActive("/") ? " active" : ""}`}>
              {t("Produits", "Products")}
            </Link>

            {user && user.role === "admin" && (
              /* Lien admin masqué du centre — accessible via le dropdown profil */
              null
            )}

            {!user && (
              <>
                {/* Connexion/Inscription masqués du centre — disponibles via l'icône à droite */}
              </>
            )}
          </div>

          {/* ── Actions à droite ── */}
          <div className="navbar__actions">
            {user ? (
              <>
                {/* ── Icône Favoris avec label (clients uniquement) ── */}
                {user.role !== "admin" && (
                  <Link to="/favoris" className="navbar__icon-btn" aria-label={t("Mes favoris", "My favorites")}>
                    <IconHeart />
                    {favCount > 0 && (
                      <span className="navbar__badge">{favCount > 99 ? "99+" : favCount}</span>
                    )}
                    <span className="navbar__icon-label">{t("Favoris", "Favorites")}</span>
                  </Link>
                )}

                {/* ── Cart icon with label (clients uniquement) ── */}
                {user.role !== "admin" && (
                  <Link to="/panier" className="navbar__icon-btn" aria-label={t("Mon panier", "My cart")}>
                    <IconBag />
                    {cartCount > 0 && (
                      <span className="navbar__badge">{cartCount > 99 ? "99+" : cartCount}</span>
                    )}
                    <span className="navbar__icon-label">{t("Panier", "Cart")}</span>
                  </Link>
                )}

                {/* ── Notification Bell (clients uniquement) ── */}
                {user.role !== "admin" && (
                  <div className="navbar__notif" ref={notifRef}>
                    <button
                      className={`navbar__icon-btn navbar__notif-btn${notifOpen ? " open" : ""}`}
                      onClick={() => {
                        setNotifOpen((v) => !v);
                        setDropdownOpen(false);
                      }}
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

                    {/* Dropdown notifications */}
                    {notifOpen && (
                      <div className="navbar__notif-dropdown">
                        <div className="navbar__notif-header">
                          <span className="navbar__notif-title">
                            🔔 {t("Notifications", "Notifications")}
                            {unreadNotifs > 0 && (
                              <span className="navbar__notif-count">{unreadNotifs} {t("nouvelles", "new")}</span>
                            )}
                          </span>
                          <div className="navbar__notif-header-actions">
                            {unreadNotifs > 0 && (
                              <button className="navbar__notif-action-btn" onClick={markAllNotifsRead} title={t("Tout marquer comme lu", "Mark all as read")}>
                                <IconCheck2 /> {t("Tout lire", "All read")}
                              </button>
                            )}
                            {notifs.length > 0 && (
                              <button className="navbar__notif-action-btn navbar__notif-action-btn--clear" onClick={clearAllNotifs} title={t("Tout effacer", "Clear all")}>
                                {t("Effacer", "Clear")}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="navbar__notif-list">
                          {notifs.length === 0 ? (
                            <div className="navbar__notif-empty">
                              <span>🔕</span>
                              <p>{t("Aucune notification", "No notifications yet")}</p>
                            </div>
                          ) : (
                            notifs.slice(0, 10).map((n) => (
                              <div
                                key={n.id}
                                className={`navbar__notif-item${!n.read ? " unread" : ""}`}
                                onClick={() => markNotifRead(n.id)}
                              >
                                <span className="navbar__notif-item__icon">
                                  {n.statut === "message" ? "💬" : (statutIcon[n.statut] ?? "📦")}
                                </span>
                                <div className="navbar__notif-item__body">
                                  {n.statut === "message" ? (
                                    <>
                                      <p className="navbar__notif-item__text">
                                        <span className="navbar__notif-item__from">{t("Admin", "Admin")}</span>
                                        <span className="navbar__notif-item__order"> · {n.orderId}</span>
                                      </p>
                                      <p className="navbar__notif-item__status navbar__notif-item__status--msg">
                                        {n.text ?? n.message?.fr ?? n.message?.en ?? t("Nouveau message", "New message")}
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
                                  <p className="navbar__notif-item__time">{formatNotifDate(n.date)}</p>
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

                {/* ── Dropdown Profil ── */}
                <div className="navbar__profile" ref={dropdownRef}>
                  <button
                    className={`navbar__profile-btn${dropdownOpen ? " open" : ""}`}
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-label="Profile menu"
                    aria-expanded={dropdownOpen}
                  >
                    <span className="navbar__user-avatar navbar__user-avatar--ring">
                      {initials}
                    </span>
                    <div className="navbar__profile-info">
                      <span className="navbar__profile-name">{user.name.split(" ")[0]}</span>
                      <span className="navbar__profile-role">
                        {user.role === "admin" ? t("Admin", "Admin") : t("Client", "Customer")}
                      </span>
                    </div>
                    <span className={`navbar__profile-chevron${dropdownOpen ? " rotated" : ""}`}>
                      <IconChevron />
                    </span>
                  </button>

                  {/* Menu déroulant */}
                  {dropdownOpen && (
                    <div className="navbar__dropdown" role="menu">
                      <div className="navbar__dropdown-header">
                        <span className="navbar__user-avatar navbar__user-avatar--lg">{initials}</span>
                        <div>
                          <p className="navbar__dropdown-name">{user.name}</p>
                          <p className="navbar__dropdown-role">{user.role === "admin" ? t("Administrateur", "Administrator") : t("Client", "Customer")}</p>
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
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                          </svg>
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
              /* Non connecté — icône user */
              <Link to="/login" className="navbar__icon-btn" aria-label={t("Connexion", "Sign in")}>
                <IconUser />
                <span className="navbar__icon-label">{t("Connexion", "Sign in")}</span>
              </Link>
            )}

            {/* ── Burger (mobile) ── */}
            <button
              className="navbar__burger"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("Fermer le menu", "Close menu") : t("Ouvrir le menu", "Open menu")}
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

      {/* ── Menu mobile overlay ── */}
      <div className={`navbar__mobile${menuOpen ? " open" : ""}`} role="dialog" aria-label={t("Menu de navigation", "Navigation menu")}>
        <Link to="/" className={`navbar__link${isActive("/") ? " active" : ""}`}>🏠 {t("Accueil", "Home")}</Link>

        {user ? (
          <>
            <Link to="/favoris" className={`navbar__link${isActive("/favoris") ? " active" : ""}`}>❤️ {t("Mes favoris", "My Favorites")}</Link>
            <Link to="/panier"  className={`navbar__link${isActive("/panier")  ? " active" : ""}`}>🛒 {t("Mon panier", "My Cart")}</Link>
            <Link to="/profil"  className={`navbar__link${isActive("/profil")  ? " active" : ""}`}>👤 {t("Mon profil", "My Profile")} — {user.name}</Link>
            {user.role === "admin" && (
              <Link to="/admin" className="navbar__link navbar__link--admin">⚙️ Administration</Link>
            )}
            <hr style={{ border: "none", borderTop: "1px solid var(--color-gray-200)", margin: "8px 0" }} />
            <button
              className="navbar__dropdown-item navbar__dropdown-item--danger"
              onClick={handleLogout}
              style={{ width: "100%", borderRadius: "var(--radius-md)", padding: "14px 16px" }}
            >
              🚪 {t("Déconnexion", "Sign out")}
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className={`navbar__link${isActive("/login")    ? " active" : ""}`}>🔑 {t("Connexion", "Sign in")}</Link>
            <Link to="/register" className={`navbar__link${isActive("/register") ? " active" : ""}`}>✨ {t("S'inscrire", "Sign up")}</Link>
          </>
        )}
      </div>
    </>
  );
}
