import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu } from "lucide-react";
import { Link, Routes, Route } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminDashboardHome from "../pages/admin/AdminDashboardHome";
import PartyRegistrationPage from "../pages/admin/PartyRegistrationPage";
import PlaceholderPage from "../pages/admin/PlaceholderPage";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex font-sans overflow-hidden bg-industrial-bg text-industrial-text">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, x: -280 }}
            animate={{ width: 280, x: 0 }}
            exit={{ width: 0, x: -280 }}
            className="h-full bg-white border-r-2 border-black flex flex-col shrink-0 overflow-y-auto z-20"
          >
            <div className="p-5 border-b-2 border-black flex items-center justify-between sticky top-0 bg-white z-10">
              <Link to="/" className="font-black text-xl tracking-tighter uppercase text-black hover:text-brand-orange transition-colors">
                VIKRAMADITYA
              </Link>
              <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 border border-gray-200">
                ADMIN_NODE
              </span>
            </div>
            <AdminSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-industrial-bg blueprint-grid relative">
        {/* Admin Header */}
        <header className="bg-white border-b-2 border-black h-16 flex items-center px-4 md:px-8 justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-black hover:text-brand-orange transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <span className="font-display font-bold text-sm tracking-widest uppercase">Main Dashboard</span>
          </div>
          <div className="text-[10px] font-mono tracking-widest uppercase flex gap-2">
            <Link to="/admin" className="text-gray-500 hover:text-brand-orange">Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-black font-bold">Main DashBoard</span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<AdminDashboardHome />} />
            <Route path="/basic-registration/party" element={<PartyRegistrationPage />} />
            <Route path="/basic-registration/gauge-info" element={<PlaceholderPage title="Gauge Info Registration" />} />
            <Route path="/basic-registration/new-equipment" element={<PlaceholderPage title="New Equipement" />} />
            <Route path="/basic-registration/equipment-hist" element={<PlaceholderPage title="Equipement Hist.Reg" />} />
            <Route path="/basic-registration/uncertainty" element={<PlaceholderPage title="Uncertainty Reg" />} />
            <Route path="/basic-registration/scope" element={<PlaceholderPage title="Scope Registration" />} />
            <Route path="/basic-registration/thread-specs" element={<PlaceholderPage title="Thead/Ring/Plug Spe." />} />
            <Route path="/basic-registration/taper-thread" element={<PlaceholderPage title="Taper Thread Reading" />} />
            <Route path="/basic-registration/reading-masters" element={<PlaceholderPage title="Reading Masters" />} />
            <Route path="/basic-registration/inst-repair" element={<PlaceholderPage title="Inst.Repair Master" />} />
            <Route path="/basic-registration/dial-table" element={<PlaceholderPage title="Dial Table Master" />} />
            <Route path="/basic-registration/rate" element={<PlaceholderPage title="Rate Reg." />} />
            <Route path="/basic-registration/custom-po" element={<PlaceholderPage title="Custom PO Rate Master" />} />
            <Route path="/basic-registration/firm-creation" element={<PlaceholderPage title="Firm Creation" />} />
            <Route path="/transactions/quotation" element={<PlaceholderPage title="Quotation" />} />
            <Route path="/transactions/purchase-order" element={<PlaceholderPage title="Purchase Order" />} />
            <Route path="/transactions/inward" element={<PlaceholderPage title="Material Inward" />} />
            <Route path="/transactions/calib-status" element={<PlaceholderPage title="Calibration Status" />} />
            <Route path="/transactions/dispatch" element={<PlaceholderPage title="Dispatch" />} />
            <Route path="/transactions/sales-invoice" element={<PlaceholderPage title="Sales Invoice" />} />
            <Route path="/transactions/receipt" element={<PlaceholderPage title="Reciept" />} />
            <Route path="/reports/total-quotations" element={<PlaceholderPage title="Total Quotations" />} />
            <Route path="/reports/total-pos" element={<PlaceholderPage title="Total PO's" />} />
            <Route path="/reports/cert-history" element={<PlaceholderPage title="Certificate History" />} />
            <Route path="/reports/outstanding" element={<PlaceholderPage title="Outstanding" />} />
            <Route path="/reports/ledger" element={<PlaceholderPage title="Ledger" />} />
            <Route path="/reports/sales-gst" element={<PlaceholderPage title="Sales GST Report" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
