import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/fraunces/full-italic.css";
import "@fontsource-variable/fraunces/full.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/home.css";
import "./styles/pages.css";
import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import OrderDialog from "./components/OrderDialog";
import { ScrollTrigger, scrollToTarget, startSmoothScroll } from "./lib/motion";
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
  // layout effect: reset the scroll before the new page is painted (no flash at the old position)
  useLayoutEffect(() => {
    const el = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (el) scrollToTarget(el, true);
    else scrollToTarget(0, true);
    // new page content: let scroll-driven animations re-measure
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => window.clearTimeout(id);
  }, [pathname, hash]);
  return null;
}

function Shell() {
  const { pathname } = useLocation();
  useReveal();
  useEffect(() => startSmoothScroll(), []);
  return (
    <>
      <ScrollManager />
      <Header />
      <main id="main" key={pathname} className={`page-enter${pathname === "/" ? " is-home" : ""}`} tabIndex={-1}>
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
