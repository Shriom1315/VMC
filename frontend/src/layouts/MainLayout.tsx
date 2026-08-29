import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, LogIn } from "lucide-react";
import { Link, Routes, Route } from "react-router-dom";
import NavLink from "../components/NavLink";
import SearchAutocomplete from "../components/SearchAutocomplete";
import FooterSection from "../components/FooterSection";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import QuotationPage from "../pages/QuotationPage";
import PurchaseOrderPage from "../pages/PurchaseOrderPage";
import MaterialInwardPage from "../pages/MaterialInwardPage";

export default function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Home",       to: "/" },
    { label: "About Us",   to: "/about" },
    { label: "Contact Us", to: "/contact" },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden bg-surface-subtle">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 flex justify-between items-center w-full h-14 px-4 md:px-8 z-50 shadow-sm">
        <div className="flex items-center gap-6 overflow-hidden min-w-0">
          <Link to="/" className="text-sm font-semibold text-text-primary tracking-tight shrink-0">
            Vikramaditya Metrology
          </Link>
          <nav className="hidden md:flex items-center h-full border-l border-border pl-6 gap-1">
            {navItems.map(item => (
              <NavLink key={item.to} label={item.label} to={item.to} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <SearchAutocomplete />
          <Link
            to="/login"
            className="hidden sm:inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-4 py-1.5 rounded hover:bg-orange-700 transition-colors"
          >
            <LogIn size={13} /> Login
          </Link>
          <button
            className="md:hidden text-text-secondary hover:text-text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden fixed top-14 left-0 w-full bg-white border-b border-border z-40 py-2 flex flex-col shadow-lg"
          >
            {navItems.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-3 text-sm text-text-primary hover:bg-surface-muted transition-colors border-b border-border last:border-0"
              >
                {label}
              </Link>
            ))}
            <div className="p-4">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-brand-orange text-white py-2.5 text-sm font-medium rounded-lg"
              >
                <LogIn size={14} /> Login to Dashboard
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        <Routes>
          <Route path="/"          element={<HomePage />} />
          <Route path="/about"     element={<AboutPage />} />
          <Route path="/contact"   element={<ContactPage />} />
          <Route path="/quotation" element={<QuotationPage />} />
          <Route path="/po"        element={<PurchaseOrderPage />} />
          <Route path="/inward"    element={<MaterialInwardPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-sm p-8 md:p-12 border-t border-gray-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
        <div className="flex flex-col gap-3">
          <div className="text-white font-semibold text-sm">Vikramaditya Metrology</div>
          <p className="text-gray-500 text-xs leading-relaxed">
            © 2026 Vikramaditya Metrology Center.<br />ISO 17025 Accredited.
          </p>
        </div>

        <FooterSection title="Links">
          <Link to="/about"   className="text-xs hover:text-white transition-colors">About Us</Link>
          <Link to="/contact" className="text-xs hover:text-white transition-colors">Contact Us</Link>
          <a href="#"         className="text-xs hover:text-white transition-colors">Terms of Service</a>
          <a href="#"         className="text-xs hover:text-white transition-colors">Support</a>
        </FooterSection>

        <FooterSection title="System Status">
          <div className="flex justify-between items-center text-xs">
            <span>Main Server</span><span className="text-green-400">Online</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span>CMM Interface</span><span className="text-green-400">Online</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span>Data Vault</span><span className="text-orange-400">Syncing</span>
          </div>
        </FooterSection>

        <FooterSection title="Location">
          <div className="text-gray-500 text-xs space-y-1">
            <p>A/P Male, Tal. Panhala</p>
            <p>Dist. Kolhapur – 416122</p>
            <p>Maharashtra, India</p>
          </div>
        </FooterSection>
      </footer>
    </div>
  );
}
