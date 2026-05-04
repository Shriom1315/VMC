import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";
import { Link, Routes, Route } from "react-router-dom";
import NavLink from "../components/NavLink";
import SearchAutocomplete from "../components/SearchAutocomplete";
import FooterSection from "../components/FooterSection";
import HomePage from "../pages/HomePage";
import QuotationPage from "../pages/QuotationPage";
import PurchaseOrderPage from "../pages/PurchaseOrderPage";
import MaterialInwardPage from "../pages/MaterialInwardPage";

export default function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-black font-display tracking-widest text-xs uppercase border-b-2 border-black dark:border-white sticky top-0 flex justify-between items-center w-full h-16 px-4 md:px-6 z-50">
        <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
          <Link to="/" className="text-sm md:text-xl font-black text-black dark:text-white tracking-tighter truncate">
            VIKRAMADITYA METROLOGY
          </Link>
          <nav className="hidden md:flex items-center h-full border-l border-[#c8c6c5] dark:border-gray-800 pl-4 space-x-2">
            <NavLink label="HOME" to="/" />
            <NavLink label="QUOTATION" to="/quotation" />
            <NavLink label="PURCHASE ORDER" to="/po" />
            <NavLink label="MATERIAL INWARD" to="/inward" />
            <NavLink label="ADMIN" to="/admin" />
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <SearchAutocomplete />
          <button className="hidden sm:block bg-brand-orange text-white font-mono text-xs px-6 py-2 border-2 border-brand-orange hover:bg-black hover:text-white transition-all">
            SYSTEM_SYNC
          </button>
          <button className="hidden sm:block bg-transparent border-2 border-black dark:border-white text-black dark:text-white font-mono text-xs px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            DATA_EX
          </button>
          <button
            className="md:hidden text-black dark:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-16 left-0 w-full bg-white dark:bg-black border-b-2 border-black z-40 p-4 flex flex-col gap-4 font-display text-sm tracking-widest uppercase"
          >
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="p-2 border-b border-gray-100">HOME</Link>
            <Link to="/quotation" onClick={() => setIsMenuOpen(false)} className="p-2 border-b border-gray-100">QUOTATION</Link>
            <Link to="/po" onClick={() => setIsMenuOpen(false)} className="p-2 border-b border-gray-100">PURCHASE ORDER</Link>
            <Link to="/inward" onClick={() => setIsMenuOpen(false)} className="p-2 border-b border-gray-100">MATERIAL INWARD</Link>
            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="p-2 border-b border-gray-100">ADMIN</Link>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 bg-brand-orange text-white py-3 text-xs font-mono">SYSTEM_SYNC</button>
              <button className="flex-1 border-2 border-black dark:border-white py-3 text-xs font-mono">DATA_EX</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quotation" element={<QuotationPage />} />
          <Route path="/po" element={<PurchaseOrderPage />} />
          <Route path="/inward" element={<MaterialInwardPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-industrial-low font-display text-xs uppercase tracking-[0.2em] p-6 md:p-12 lg:p-16 border-t-2 border-black grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mt-12">
        <div className="flex flex-col gap-4">
          <div className="text-brand-orange font-black text-xl tracking-tighter">VIKRAMADITYA</div>
          <p className="text-gray-500 leading-relaxed max-w-[200px]">
            © 2026 VIKRAMADITYA METROLOGY CENTER. ALL SPECIFICATIONS SUBJECT TO ISO 17025.
          </p>
        </div>

        <FooterSection title="SYSTEM_LINKS">
          <a href="#" className="hover:text-brand-orange transition-colors">TERMS_OF_SERVICE</a>
          <a href="#" className="hover:text-brand-orange transition-colors">CALIBRATION_LOGS</a>
          <a href="#" className="hover:text-brand-orange transition-colors">CONTACT_ENG</a>
          <a href="#" className="hover:text-brand-orange transition-colors">SUPPORT_TICKET</a>
        </FooterSection>

        <FooterSection title="NODE_STATUS">
          <div className="flex justify-between items-center text-gray-500">
            <span>MAIN_SERVER</span><span className="text-green-500">ONLINE</span>
          </div>
          <div className="flex justify-between items-center text-gray-500">
            <span>CMM_INTERFACE</span><span className="text-green-500">ONLINE</span>
          </div>
          <div className="flex justify-between items-center text-gray-500">
            <span>DATA_VAULT</span><span className="text-brand-orange">SYNCING</span>
          </div>
        </FooterSection>

        <FooterSection title="LOCATION_DATA">
          <div className="text-gray-500 space-y-1">
            <p>COORD: 45.4215° N, 75.6972° W</p>
            <p>ELEV: 70M ASL</p>
            <p>TEMP_CONTROL: 20.0°C ±0.1°C</p>
          </div>
        </FooterSection>
      </footer>
    </div>
  );
}
