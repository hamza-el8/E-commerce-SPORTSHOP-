/**
 * Profile — SportShop
 * Design premium avec :
 *  - Onglets : Informations / Sécurité / Paramètres
 *  - Dark mode / Light mode (sauvegardé dans localStorage)
 *  - Multi-langue : Français / English (sauvegardé dans localStorage)
 *  - Horloge en temps réel
 *  - Avatar avec initiales
 * Logique API inchangée (useAuth, api.put).
 */
import { useState, useEffect, useCallback } from "react";
import api from "../api.js";
import { useAuth } from "../AuthContext.jsx";
import { useLanguage } from "../language.js";

/* ─────────────────────────────────────────────
   TRADUCTIONS fr / en
───────────────────────────────────────────── */
const T = {
  fr: {
    title:         "Mon Profil",
    member:        "Membre depuis",
    role_admin:    "Administrateur",
    role_client:   "Client",
    tab_info:      "Informations",
    tab_security:  "Sécurité",
    tab_settings:  "Paramètres",
    /* Onglet infos */
    section_info:  "Informations personnelles",
    label_name:    "Nom complet",
    label_email:   "Adresse email",
    btn_save:      "Enregistrer",
    saving:        "Enregistrement…",
    saved_ok:      "Profil mis à jour avec succès !",
    /* Onglet sécurité */
    section_pwd:   "Changer le mot de passe",
    label_newpwd:  "Nouveau mot de passe",
    label_confirm: "Confirmer le mot de passe",
    pwd_hint:      "Laissez vide pour ne pas changer",
    /* Onglet paramètres */
    section_appear:"Apparence",
    dark_mode:     "Mode sombre",
    light_mode:    "Mode clair",
    section_lang:  "Langue",
    lang_fr:       "Français",
    lang_en:       "English",
    section_notif: "Notifications",
    notif_email:   "Recevoir les offres par email",
    notif_promo:   "Alertes promotions",
    section_danger:"Zone dangereuse",
    logout_all:    "Se déconnecter de tous les appareils",
    /* Divers */
    placeholder_name:  "Votre nom complet",
    placeholder_email: "exemple@email.com",
    placeholder_pwd:   "Minimum 6 caractères",
    placeholder_conf:  "Répétez le mot de passe",
  },
  en: {
    title:         "My Profile",
    member:        "Member since",
    role_admin:    "Administrator",
    role_client:   "Customer",
    tab_info:      "Information",
    tab_security:  "Security",
    tab_settings:  "Settings",
    section_info:  "Personal information",
    label_name:    "Full name",
    label_email:   "Email address",
    btn_save:      "Save changes",
    saving:        "Saving…",
    saved_ok:      "Profile updated successfully!",
    section_pwd:   "Change password",
    label_newpwd:  "New password",
    label_confirm: "Confirm password",
    pwd_hint:      "Leave blank to keep current password",
    section_appear:"Appearance",
    dark_mode:     "Dark mode",
    light_mode:    "Light mode",
    section_lang:  "Language",
    lang_fr:       "Français",
    lang_en:       "English",
    section_notif: "Notifications",
    notif_email:   "Receive offers by email",
    notif_promo:   "Promotion alerts",
    section_danger:"Danger zone",
    logout_all:    "Sign out from all devices",
    placeholder_name:  "Your full name",
    placeholder_email: "example@email.com",
    placeholder_pwd:   "Minimum 6 characters",
    placeholder_conf:  "Repeat your password",
  },
};

/* ─────────────────────────────────────────────
   ICÔNES SVG
───────────────────────────────────────────── */
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const IconGlobe = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconAlertTriangle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconSave = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
);
const IconLogOut = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconClock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

/* ─────────────────────────────────────────────
   COMPOSANT TOGGLE (switch on/off)
───────────────────────────────────────────── */
function Toggle({ checked, onChange, id }) {
  return (
    <label className="prof-toggle" htmlFor={id}>
      <input
        type="checkbox" id={id}
        checked={checked} onChange={onChange}
        style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
      />
      <span className={`prof-toggle__track${checked ? " on" : ""}`}>
        <span className="prof-toggle__thumb" />
      </span>
    </label>
  );
}

/* ─────────────────────────────────────────────
   COMPOSANT HORLOGE
───────────────────────────────────────────── */
function Clock({ lang }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = time.toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-US", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const dateFmt = time.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="prof-clock">
      <span className="prof-clock__icon"><IconClock /></span>
      <div>
        <span className="prof-clock__time">{fmt}</span>
        <span className="prof-clock__date">{dateFmt}</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PAGE PROFILE
───────────────────────────────────────────── */
export default function Profile() {
  const { user, setUser } = useAuth();
  const { lang, setLang } = useLanguage();

  /* ── Onglet actif ── */
  const [tab, setTab] = useState("info"); /* "info" | "security" | "settings" */

  /* ── Dark mode (localStorage + classe sur <html>) ── */
  const [dark, setDark] = useState(() => localStorage.getItem("ss_dark") === "true");

  /* ── Notifications ── */
  const [notifEmail, setNotifEmail] = useState(() => localStorage.getItem("ss_notif_email") !== "false");
  const [notifPromo, setNotifPromo] = useState(() => localStorage.getItem("ss_notif_promo") !== "false");

  /* ── Formulaire infos ── */
  const [form, setForm] = useState({ name: user.name, email: user.email });

  /* ── Formulaire sécurité ── */
  const [pwd, setPwd]   = useState({ password: "", password_confirmation: "" });
  const [showPwd, setShowPwd]   = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  /* ── Feedback ── */
  const [msg,    setMsg]    = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /* t() — traduction courante */
  const t = useCallback((key) => T[lang][key] ?? key, [lang]);

  /* Applique dark mode sur <html> */
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    localStorage.setItem("ss_dark", dark);
  }, [dark]);

  /* Sauvegarde notifications */
  useEffect(() => { localStorage.setItem("ss_notif_email", notifEmail); }, [notifEmail]);
  useEffect(() => { localStorage.setItem("ss_notif_promo", notifPromo); }, [notifPromo]);

  /* Efface les messages après 4s */
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(""), 4000);
    return () => clearTimeout(id);
  }, [msg]);

  /* Initiales avatar */
  const initials = user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  /* Date d'inscription simulée */
  const memberSince = new Date().toLocaleDateString(
    lang === "fr" ? "fr-FR" : "en-US",
    { month: "long", year: "numeric" }
  );

  /* ── Submit infos ── */
  const submitInfo = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    try {
      const res = await api.put("/profile", form);
      setUser(res.data);
      setMsg(t("saved_ok"));
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally { setSaving(false); }
  };

  /* ── Submit sécurité ── */
  const submitSecurity = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    try {
      const res = await api.put("/profile", { ...form, ...pwd });
      setUser(res.data);
      setPwd({ password: "", password_confirmation: "" });
      setMsg(t("saved_ok"));
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    } finally { setSaving(false); }
  };

  /* ── Rendu ── */
  return (
    <div className="prof-page">

      {/* ══════════════════════════
          SIDEBAR — carte profil
      ══════════════════════════ */}
      <aside className="prof-sidebar">

        {/* Avatar */}
        <div className="prof-avatar-wrap">
          <div className="prof-avatar">{initials}</div>
          <div className="prof-avatar__ring" />
        </div>

        {/* Nom + rôle */}
        <h2 className="prof-name">{user.name}</h2>
        <p className="prof-email">{user.email}</p>

        <span className={`prof-role-badge${user.role === "admin" ? " admin" : ""}`}>
          {user.role === "admin" ? t("role_admin") : t("role_client")}
        </span>

        {/* Membre depuis */}
        <p className="prof-member">
          {t("member")} {memberSince}
        </p>

        {/* Horloge */}
        <Clock lang={lang} />

        {/* Raccourcis dark/langue dans sidebar */}
        <div className="prof-sidebar__quick">
          <button
            className={`prof-quick-btn${dark ? " active" : ""}`}
            onClick={() => setDark((v) => !v)}
            title={dark ? t("light_mode") : t("dark_mode")}
          >
            {dark ? <IconSun /> : <IconMoon />}
            {dark ? t("light_mode") : t("dark_mode")}
          </button>

          <button
            className="prof-quick-btn"
            onClick={() => setLang((l) => l === "fr" ? "en" : "fr")}
            title={lang === "fr" ? "Changer la langue" : "Change language"}
          >
            <IconGlobe />
            {lang === "fr" ? "EN" : "FR"}
          </button>
        </div>

      </aside>

      {/* ══════════════════════════
          CONTENU PRINCIPAL
      ══════════════════════════ */}
      <div className="prof-main">

        {/* En-tête */}
        <div className="prof-header">
          <h1 className="prof-title">{t("title")}</h1>
        </div>

        {/* Onglets */}
        <div className="prof-tabs" role="tablist">
          {[
            { id: "info",     icon: <IconUser />,   label: t("tab_info") },
            { id: "security", icon: <IconShield />, label: t("tab_security") },
            { id: "settings", icon: <IconGlobe />,  label: t("tab_settings") },
          ].map(({ id, icon, label }) => (
            <button
              key={id}
              className={`prof-tab${tab === id ? " active" : ""}`}
              onClick={() => { setTab(id); setMsg(""); setErrors({}); }}
              role="tab"
              aria-selected={tab === id}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* ── Toast succès ── */}
        {msg && (
          <div className="prof-alert prof-alert--success">
            <IconCheck /> {msg}
          </div>
        )}

        {/* ═══════════════════════════════
            ONGLET : INFORMATIONS
        ═══════════════════════════════ */}
        {tab === "info" && (
          <form className="prof-card" onSubmit={submitInfo}>
            <div className="prof-card__header">
              <IconUser />
              <h3>{t("section_info")}</h3>
            </div>

            <div className="prof-fields">
              {/* Nom */}
              <div className="prof-field">
                <label className="prof-label">{t("label_name")}</label>
                <div className="prof-input-wrap">
                  <span className="prof-input-icon"><IconUser /></span>
                  <input
                    className={`prof-input${errors.name ? " error" : ""}`}
                    name="name" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t("placeholder_name")}
                    required
                  />
                </div>
                {errors.name && <p className="prof-error">{errors.name[0]}</p>}
              </div>

              {/* Email */}
              <div className="prof-field">
                <label className="prof-label">{t("label_email")}</label>
                <div className="prof-input-wrap">
                  <span className="prof-input-icon"><IconMail /></span>
                  <input
                    className={`prof-input${errors.email ? " error" : ""}`}
                    name="email" type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t("placeholder_email")}
                    required
                  />
                </div>
                {errors.email && <p className="prof-error">{errors.email[0]}</p>}
              </div>
            </div>

            <div className="prof-card__footer">
              <button type="submit" className="prof-btn" disabled={saving}>
                {saving ? <><span className="prof-spinner"/>{t("saving")}</> : <><IconSave />{t("btn_save")}</>}
              </button>
            </div>
          </form>
        )}

        {/* ═══════════════════════════════
            ONGLET : SÉCURITÉ
        ═══════════════════════════════ */}
        {tab === "security" && (
          <form className="prof-card" onSubmit={submitSecurity}>
            <div className="prof-card__header">
              <IconShield />
              <h3>{t("section_pwd")}</h3>
            </div>

            <p className="prof-hint">{t("pwd_hint")}</p>

            <div className="prof-fields">
              {/* Nouveau mot de passe */}
              <div className="prof-field">
                <label className="prof-label">{t("label_newpwd")}</label>
                <div className="prof-input-wrap">
                  <span className="prof-input-icon"><IconLock /></span>
                  <input
                    className={`prof-input${errors.password ? " error" : ""}`}
                    type={showPwd ? "text" : "password"}
                    value={pwd.password}
                    onChange={(e) => setPwd({ ...pwd, password: e.target.value })}
                    placeholder={t("placeholder_pwd")}
                    autoComplete="new-password"
                  />
                  <button type="button" className="prof-eye" onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {errors.password && <p className="prof-error">{errors.password[0]}</p>}

                {/* Barre de force */}
                {pwd.password.length > 0 && (
                  <div className="prof-pwd-strength">
                    <span className={`prof-pwd-bar${pwd.password.length >= 1 ? " weak" : ""}`}/>
                    <span className={`prof-pwd-bar${pwd.password.length >= 4 ? " medium" : ""}`}/>
                    <span className={`prof-pwd-bar${pwd.password.length >= 8 ? " strong" : ""}`}/>
                    <span className="prof-pwd-label">
                      {pwd.password.length < 4 ? (lang==="fr"?"Faible":"Weak")
                        : pwd.password.length < 8 ? (lang==="fr"?"Moyen":"Medium")
                        : (lang==="fr"?"Fort":"Strong")}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirmation */}
              <div className="prof-field">
                <label className="prof-label">{t("label_confirm")}</label>
                <div className="prof-input-wrap">
                  <span className="prof-input-icon"><IconShield /></span>
                  <input
                    className="prof-input"
                    type={showPwd2 ? "text" : "password"}
                    value={pwd.password_confirmation}
                    onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })}
                    placeholder={t("placeholder_conf")}
                    autoComplete="new-password"
                  />
                  <button type="button" className="prof-eye" onClick={() => setShowPwd2(v => !v)}>
                    {showPwd2 ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="prof-card__footer">
              <button type="submit" className="prof-btn" disabled={saving}>
                {saving ? <><span className="prof-spinner"/>{t("saving")}</> : <><IconSave />{t("btn_save")}</>}
              </button>
            </div>
          </form>
        )}

        {/* ═══════════════════════════════
            ONGLET : PARAMÈTRES
        ═══════════════════════════════ */}
        {tab === "settings" && (
          <div className="prof-settings">

            {/* ── Apparence ── */}
            <div className="prof-card">
              <div className="prof-card__header">
                {dark ? <IconMoon /> : <IconSun />}
                <h3>{t("section_appear")}</h3>
              </div>

              <div className="prof-setting-row">
                <div className="prof-setting-info">
                  <span className="prof-setting-icon">{dark ? <IconMoon /> : <IconSun />}</span>
                  <div>
                    <p className="prof-setting-label">{dark ? t("dark_mode") : t("light_mode")}</p>
                    <p className="prof-setting-desc">
                      {dark
                        ? (lang === "fr" ? "Interface sombre, économise la batterie" : "Dark interface, saves battery")
                        : (lang === "fr" ? "Interface claire et lumineuse" : "Clean and bright interface")}
                    </p>
                  </div>
                </div>
                <Toggle checked={dark} onChange={() => setDark(v => !v)} id="toggle-dark" />
              </div>
            </div>

            {/* ── Langue ── */}
            <div className="prof-card">
              <div className="prof-card__header">
                <IconGlobe />
                <h3>{t("section_lang")}</h3>
              </div>

              <div className="prof-lang-btns">
                {["fr", "en"].map((l) => (
                  <button
                    key={l}
                    className={`prof-lang-btn${lang === l ? " active" : ""}`}
                    onClick={() => setLang(l)}
                  >
                    <span className="prof-lang-flag">{l === "fr" ? "🇫🇷" : "🇬🇧"}</span>
                    {l === "fr" ? t("lang_fr") : t("lang_en")}
                    {lang === l && <span className="prof-lang-check"><IconCheck /></span>}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Notifications ── */}
            <div className="prof-card">
              <div className="prof-card__header">
                <IconBell />
                <h3>{t("section_notif")}</h3>
              </div>

              {[
                { id: "toggle-email", checked: notifEmail, onChange: () => setNotifEmail(v => !v), label: t("notif_email"),
                  desc: lang === "fr" ? "Newsletters, nouveautés et offres exclusives" : "Newsletters, new arrivals and exclusive offers" },
                { id: "toggle-promo", checked: notifPromo, onChange: () => setNotifPromo(v => !v), label: t("notif_promo"),
                  desc: lang === "fr" ? "Soldes, codes promo et ventes flash" : "Sales, promo codes and flash deals" },
              ].map(({ id, checked, onChange, label, desc }) => (
                <div className="prof-setting-row" key={id}>
                  <div className="prof-setting-info">
                    <span className="prof-setting-icon"><IconBell /></span>
                    <div>
                      <p className="prof-setting-label">{label}</p>
                      <p className="prof-setting-desc">{desc}</p>
                    </div>
                  </div>
                  <Toggle checked={checked} onChange={onChange} id={id} />
                </div>
              ))}
            </div>

            {/* ── Zone dangereuse ── */}
            <div className="prof-card prof-card--danger">
              <div className="prof-card__header">
                <IconAlertTriangle />
                <h3>{t("section_danger")}</h3>
              </div>

              <div className="prof-setting-row">
                <div className="prof-setting-info">
                  <span className="prof-setting-icon danger"><IconLogOut /></span>
                  <div>
                    <p className="prof-setting-label">{t("logout_all")}</p>
                    <p className="prof-setting-desc">
                      {lang === "fr"
                        ? "Révoque tous les tokens actifs sur vos appareils"
                        : "Revokes all active tokens on your devices"}
                    </p>
                  </div>
                </div>
                <button className="prof-btn prof-btn--danger" type="button">
                  <IconLogOut />
                  {lang === "fr" ? "Déconnecter" : "Sign out"}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
