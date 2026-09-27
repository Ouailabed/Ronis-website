import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";

// reveal-on-scroll styles only apply when scripts run (content is never hidden without JS)
document.documentElement.classList.add("js");

const root = createRoot(document.getElementById("root")!);

if (import.meta.env.DEV && window.location.pathname === "/studio") {
  // Development-only asset studio: render on a bare, transparent page (no site styles).
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => el.remove());
  import("./pages/Studio").then(({ default: Studio }) => root.render(<Studio />));
} else {
  root.render(
    <StrictMode>
      {import.meta.env.VITE_ARTIFACT ? (
        // shareable preview build: routes live after the # (e.g. #/menu)
        <HashRouter>
          <App />
        </HashRouter>
      ) : (
        <BrowserRouter>
          <App />
        </BrowserRouter>
      )}
    </StrictMode>,
  );
}
