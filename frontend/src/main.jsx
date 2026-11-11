import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import { CartFavProvider } from "./CartFavContext.jsx";
import { LanguageProvider } from "./LanguageContext.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* CartFavProvider doit être DANS AuthProvider pour accéder à useAuth */}
        <CartFavProvider>
          <LanguageProvider>
            <App />
          </LanguageProvider>
        </CartFavProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);