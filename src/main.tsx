import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

const root = createRoot(document.getElementById("root")!);

if (import.meta.env.DEV && window.location.pathname === "/studio") {
  // Development-only asset studio: render on a bare, transparent page (no site styles).
  document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => el.remove());
  import("./pages/Studio").then(({ default: Studio }) => root.render(<Studio />));
} else {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  );
}
