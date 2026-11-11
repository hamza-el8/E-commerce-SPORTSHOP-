/**
 * OrderChat — SportShop
 * Composant chat réutilisable pour la messagerie client ↔ admin par commande.
 * Storage : localStorage clé "sportshop_chat_<orderId>"
 * Chaque message : { id, from ("client"|"admin"), text, date, read: false }
 * Polling toutes les 3 secondes pour simuler le temps réel.
 */
import { useState, useEffect, useRef, useCallback } from "react";

/* ── Icônes ── */
const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const IconChat = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const IconX = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

/* ─────────────────────────────────────────
   Helpers localStorage
───────────────────────────────────────── */
const chatKey   = (orderId) => `sportshop_chat_${orderId}`;

export const getChatMessages = (orderId) => {
  try {
    return JSON.parse(localStorage.getItem(chatKey(orderId)) || "[]");
  } catch {
    return [];
  }
};

export const saveChatMessages = (orderId, msgs) =>
  localStorage.setItem(chatKey(orderId), JSON.stringify(msgs));

/** Nombre de messages non lus pour une vue donnée ("client" ou "admin") */
export const unreadCount = (orderId, viewerRole) => {
  const msgs = getChatMessages(orderId);
  /* non lus = messages envoyés par l'AUTRE côté, pas encore lus */
  return msgs.filter((m) => m.from !== viewerRole && !m.read).length;
};

/** Marque tous les messages non lus comme lus pour ce viewer */
export const markChatRead = (orderId, viewerRole) => {
  const msgs = getChatMessages(orderId);
  const updated = msgs.map((m) =>
    m.from !== viewerRole && !m.read ? { ...m, read: true } : m
  );
  saveChatMessages(orderId, updated);
  return updated;
};

/* ─────────────────────────────────────────
   Composant principal
   Props:
     orderId   — string  identifiant commande
     role      — "client" | "admin"
     clientName— string  nom du client (affiché côté admin)
     onClose   — () => void  (optionnel, pour fermer)
───────────────────────────────────────── */
export default function OrderChat({ orderId, role, clientName, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text,     setText]     = useState("");
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  /* Charge et marque les messages comme lus */
  const load = useCallback(() => {
    const msgs = markChatRead(orderId, role);
    setMessages(msgs);
  }, [orderId, role]);

  useEffect(() => {
    load();
    inputRef.current?.focus();
  }, [load]);

  /* Polling 3s */
  useEffect(() => {
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [load]);

  /* Scroll bas à chaque nouveau message */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  /* Envoi */
  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    const newMsg = {
      id:   `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      from: role,
      text: trimmed,
      date: new Date().toISOString(),
      read: false,
    };

    const existing = getChatMessages(orderId);
    const updated  = [...existing, newMsg];
    saveChatMessages(orderId, updated);
    setMessages(updated);
    setText("");

    /* Génère une notification pour le destinataire */
    if (role === "client") {
      /* Notif admin : clé "sportshop_admin_chat_notifs" */
      const adminNotifs = JSON.parse(localStorage.getItem("sportshop_admin_chat_notifs") || "[]");
      localStorage.setItem("sportshop_admin_chat_notifs", JSON.stringify([
        { id: `cn-${Date.now()}`, orderId, from: clientName || "Client", date: newMsg.date, read: false },
        ...adminNotifs,
      ]));
    } else {
      /* Notif client : réutilise la clé "sportshop_client_notifs" */
      const clientNotifs = JSON.parse(localStorage.getItem("sportshop_client_notifs") || "[]");
      localStorage.setItem("sportshop_client_notifs", JSON.stringify([
        {
          id:      `cn-${Date.now()}`,
          orderId,
          statut:  "message",
          text:    trimmed,          /* ← nص الرسالة directement */
          message: {
            fr: `Admin : ${trimmed}`,
            en: `Admin: ${trimmed}`,
          },
          date:    newMsg.date,
          read:    false,
        },
        ...clientNotifs,
      ]));
    }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { day: "2-digit", month: "short" });
  };

  /* Groupe les messages par jour */
  const grouped = messages.reduce((acc, msg) => {
    const day = formatDate(msg.date);
    if (!acc[day]) acc[day] = [];
    acc[day].push(msg);
    return acc;
  }, {});

  return (
    <div className="order-chat">
      {/* Header */}
      <div className="order-chat__header">
        <span className="order-chat__header-icon"><IconChat /></span>
        <div className="order-chat__header-info">
          <p className="order-chat__header-title">
            {role === "admin"
              ? `Chat — ${clientName || "Client"}`
              : "Chat with Support"}
          </p>
          <p className="order-chat__header-sub">Order {orderId}</p>
        </div>
        {onClose && (
          <button className="order-chat__close-btn" onClick={onClose} title="Close chat">
            <IconX />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="order-chat__body">
        {messages.length === 0 ? (
          <div className="order-chat__empty">
            <span>💬</span>
            <p>No messages yet.<br/>Start the conversation!</p>
          </div>
        ) : (
          Object.entries(grouped).map(([day, msgs]) => (
            <div key={day}>
              {/* Séparateur de jour */}
              <div className="order-chat__day-sep">
                <span>{day}</span>
              </div>
              {msgs.map((msg) => {
                const isMine = msg.from === role;
                return (
                  <div
                    key={msg.id}
                    className={`order-chat__msg${isMine ? " mine" : " theirs"}`}
                  >
                    {!isMine && (
                      <div className="order-chat__msg-avatar">
                        {msg.from === "admin" ? "A" : (clientName?.[0] ?? "C")}
                      </div>
                    )}
                    <div className="order-chat__msg-bubble">
                      <p className="order-chat__msg-text">{msg.text}</p>
                      <span className="order-chat__msg-time">{formatTime(msg.date)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Saisie */}
      <form className="order-chat__footer" onSubmit={handleSend}>
        <input
          ref={inputRef}
          className="order-chat__input"
          type="text"
          placeholder="Write a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={500}
        />
        <button
          type="submit"
          className="order-chat__send-btn"
          disabled={!text.trim()}
          title="Send"
        >
          <IconSend />
        </button>
      </form>
    </div>
  );
}
