import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "@fontsource-variable/instrument-sans/index.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/home.css";
import "./styles/pages.css";
import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import OrderDialog from "./components/OrderDialog";
import { OrderProvider } from "./lib/order";
import { useReveal } from "./lib/useReveal";
import Home from "./pages/Home";

const Menu = lazy(() => import("./pages/Menu"));
const Locations = lazy(() => import("./pages/Locations"));
const LocationDetail = lazy(() => import("./pages/LocationDetail"));
const Catering = lazy(() => import("./pages/Catering"));
const Cakes = lazy(() => import("./pages/Cakes"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

/** Scroll to top on navigation (or to the #hash target), like a normal website. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function Shell() {
  const { pathname } = useLocation();
  useReveal();
  return (
    <>
      <ScrollManager />
      <Header />
      <main id="main" key={pathname} className="page-enter" tabIndex={-1}>
        <Suspense fallback={<div className="page-loading" aria-busy="true" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/locations/:slug" element={<LocationDetail />} />
            <Route path="/catering" element={<Catering />} />
            <Route path="/cakes" element={<Cakes />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <OrderDialog />
    </>
  );
}

export default function App() {
  return (
    <OrderProvider>
      <Shell />
    </OrderProvider>
  );
}
