/**
 * CartFavContext — SportShop
 * Fournit les compteurs panier et favoris à toute l'application.
 * - cartCount  : nombre total d'articles dans le panier (somme des quantités)
 * - favCount   : nombre de produits en favoris
 * - refreshCart / refreshFav : recharge depuis l'API
 * - incCart / decCart / setCartCount : mise à jour optimiste (sans appel API)
 * - incFav / decFav                  : même chose pour les favoris
 */
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "./api";
import { useAuth } from "./AuthContext";

const CartFavContext = createContext({
  cartCount: 0,
  favCount:  0,
  incCart: () => {},
  decCart: () => {},
  setCartCount: () => {},
  incFav: () => {},
  decFav: () => {},
  refreshCart: () => {},
  refreshFav:  () => {},
});

export const useCartFav = () => useContext(CartFavContext);

export function CartFavProvider({ children }) {
  const { user } = useAuth();

  const [cartCount, setCartCount] = useState(0);
  const [favCount,  setFavCount]  = useState(0);

  /* ── Charge le panier depuis l'API ── */
  const refreshCart = useCallback(() => {
    if (!user) { setCartCount(0); return; }
    api.get("/panier")
      .then((res) => {
        const items = res.data?.panier?.items ?? [];
        const total = items.reduce((s, i) => s + (i.quantite ?? 1), 0);
        setCartCount(total);
      })
      .catch(() => setCartCount(0));
  }, [user]);

  /* ── Charge les favoris depuis l'API ── */
  const refreshFav = useCallback(() => {
    if (!user) { setFavCount(0); return; }
    api.get("/favoris")
      .then((res) => setFavCount(res.data?.length ?? 0))
      .catch(() => setFavCount(0));
  }, [user]);

  /* Recharge automatiquement quand l'utilisateur se connecte/déconnecte */
  useEffect(() => {
    refreshCart();
    refreshFav();
  }, [refreshCart, refreshFav]);

  /* Helpers optimistes — évitent un aller-retour API pour les petites actions */
  const incCart = useCallback((qty = 1) => setCartCount((c) => c + qty), []);
  const decCart = useCallback((qty = 1) => setCartCount((c) => Math.max(0, c - qty)), []);
  const incFav  = useCallback(() => setFavCount((c) => c + 1), []);
  const decFav  = useCallback(() => setFavCount((c) => Math.max(0, c - 1)), []);

  return (
    <CartFavContext.Provider value={{
      cartCount, favCount,
      incCart, decCart, setCartCount,
      incFav, decFav,
      refreshCart, refreshFav,
    }}>
      {children}
    </CartFavContext.Provider>
  );
}
