import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./main.css";
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain="kenzo.us.auth0.com"
      clientId="TJC8y2mriGFEVBntIiuJVbEUhubglI7g"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "https://kenzo.us.auth0.com/api/v2/",
        scope: "read:current_user update:current_user_metadata",
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>,
);
