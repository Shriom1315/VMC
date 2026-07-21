import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, LogOut } from "lucide-react";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminDashboardHome from "../pages/admin/AdminDashboardHome";
import PartyRegistrationPage from "../pages/admin/PartyRegistrationPage";
import PlaceholderPage from "../pages/admin/PlaceholderPage";
import CalibrationStatusPage from "../pages/admin/CalibrationStatusPage";
import DispatchPage from "../pages/admin/DispatchPage";
import SalesInvoicePage from "../pages/admin/SalesInvoicePage";
import ReceiptPage from "../pages/admin/ReceiptPage";
import UserManagementPage from "../pages/admin/UserManagementPage";
import CertificateHistoryPage from "../pages/admin/reports/CertificateHistoryPage";
import OutstandingPage from "../pages/admin/reports/OutstandingPage";
import LedgerPage from "../pages/admin/reports/LedgerPage";
import GSTReportPage from "../pages/admin/reports/GSTReportPage";
import QuotationPage from "../pages/QuotationPage";
import PurchaseOrderPage from "../pages/PurchaseOrderPage";
import MaterialInwardPage from "../pages/MaterialInwardPage";
import GaugeInfoPage from "../pages/admin/GaugeInfoPage";
import EquipmentHistoryPage from "../pages/admin/EquipmentHistoryPage";
import NewEquipmentPage from "../pages/admin/NewEquipmentPage";
import ScopeRegistrationPage from "../pages/admin/ScopeRegistrationPage";
import { useAuth, can } from "../context/AuthContext";

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.replace("/admin", "").split("/").filter(Boolean);
  const labels = parts.map(p => p.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()));

  return (
    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
      <Link to="/admin" className="hover:text-text-primary transition-colors">Dashboard</Link>
      {labels.map((label, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-border-strong">/</span>
          <span className={i === labels.length - 1 ? "text-text-primary font-medium" : ""}>{label}</span>
        </span>
      ))}
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const roleBadgeColor = {
    admin:   "bg-red-100 text-red-700",
    manager: "bg-amber-100 text-amber-700",
    staff:   "bg-green-100 text-green-700",
  }[user?.role ?? "staff"];

  return (
    <div className="h-screen print:h-auto flex font-sans overflow-hidden print:overflow-visible bg-surface-subtle text-text-primary">
      {/* Sidebar — hidden when printing */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="print:hidden h-full bg-white border-r border-border flex flex-col shrink-0 overflow-y-auto z-20"
          >
            <div className="px-4 py-4 border-b border-border flex items-center justify-between">
              <Link to="/" className="text-sm font-semibold text-text-primary hover:text-brand-orange transition-colors">
                Vikramaditya
              </Link>
              <span className="text-[10px] font-medium text-text-muted bg-surface-muted px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
            <AdminSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-subtle">
        {/* Admin Header — hidden when printing */}
        <header className="print:hidden bg-white border-b border-border h-14 flex items-center px-4 md:px-6 justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-surface-muted"
            >
              <Menu size={18} />
            </button>
            <div className="h-4 w-px bg-border" />
            <Breadcrumb />
          </div>
          {/* User info + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand-orange text-white text-[11px] font-bold flex items-center justify-center">
                {user?.avatar}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-medium text-text-primary leading-none">{user?.name}</div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${roleBadgeColor}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-red-600 transition-colors"
              title="Sign out"
            >
              <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto print:overflow-visible p-4 md:p-6 print:p-0">
          <Routes>
            {/* Dashboard */}
            <Route path="/" element={<AdminDashboardHome />} />

            {/* Basic Registration */}
            <Route path="/basic-registration/party"          element={<PartyRegistrationPage />} />
            <Route path="/basic-registration/gauge-info"     element={<GaugeInfoPage />} />
            <Route path="/basic-registration/new-equipment"  element={<NewEquipmentPage />} />
            <Route path="/basic-registration/equipment-hist" element={<EquipmentHistoryPage />} />
            <Route path="/basic-registration/uncertainty"    element={<PlaceholderPage title="Uncertainty Reg" />} />
            <Route path="/basic-registration/scope"          element={
              can(user?.role ?? "staff", "scope:read")
                ? <ScopeRegistrationPage />
                : <Navigate to="/unauthorized" replace />
            } />
            <Route path="/basic-registration/thread-specs"   element={<PlaceholderPage title="Thread / Ring / Plug Spec" />} />
            <Route path="/basic-registration/taper-thread"   element={<PlaceholderPage title="Taper Thread Reading" />} />
            <Route path="/basic-registration/reading-masters" element={<PlaceholderPage title="Reading Masters" />} />
            <Route path="/basic-registration/inst-repair"    element={<PlaceholderPage title="Instrument Repair Master" />} />
            <Route path="/basic-registration/dial-table"     element={<PlaceholderPage title="Dial Table Master" />} />
            <Route path="/basic-registration/rate"           element={
              can(user?.role ?? "staff", "rate:read")
                ? <PlaceholderPage title="Rate Register" />
                : <Navigate to="/unauthorized" replace />
            } />
            <Route path="/basic-registration/custom-po"      element={
              can(user?.role ?? "staff", "rate:read")
                ? <PlaceholderPage title="Custom PO Rate Master" />
                : <Navigate to="/unauthorized" replace />
            } />
            <Route path="/basic-registration/firm-creation"  element={
              can(user?.role ?? "staff", "firm:read")
                ? <PlaceholderPage title="Firm Creation" />
                : <Navigate to="/unauthorized" replace />
            } />

            {/* Daily Transactions */}
            <Route path="/transactions/quotation"      element={
              can(user?.role ?? "staff", "quotation:read")
                ? <QuotationPage />
                : <Navigate to="/unauthorized" replace />
            } />
            <Route path="/transactions/purchase-order" element={<PurchaseOrderPage />} />
            <Route path="/transactions/inward"         element={<MaterialInwardPage />} />
            <Route path="/transactions/calib-status"   element={<CalibrationStatusPage />} />
            <Route path="/transactions/dispatch"       element={<DispatchPage />} />
            <Route path="/transactions/sales-invoice"  element={
              can(user?.role ?? "staff", "invoice:read")
                ? <SalesInvoicePage />
                : <Navigate to="/unauthorized" replace />
            } />
            <Route path="/transactions/receipt"        element={
              can(user?.role ?? "staff", "receipt:read")
                ? <ReceiptPage />
                : <Navigate to="/unauthorized" replace />
            } />

            {/* Reports */}
            <Route path="/reports/total-quotations" element={
              can(user?.role ?? "staff", "reports:quotations")
                ? <PlaceholderPage title="Total Quotations" />
                : <Navigate to="/unauthorized" replace />
            } />
            <Route path="/reports/total-pos"        element={
              can(user?.role ?? "staff", "reports:pos")
                ? <PlaceholderPage title="Total POs" />
                : <Navigate to="/unauthorized" replace />
            } />
            <Route path="/reports/cert-history"     element={<CertificateHistoryPage />} />
            <Route path="/reports/outstanding"      element={
              can(user?.role ?? "staff", "reports:outstanding")
                ? <OutstandingPage />
                : <Navigate to="/unauthorized" replace />
            } />
            <Route path="/reports/ledger"           element={
              can(user?.role ?? "staff", "reports:ledger")
                ? <LedgerPage />
                : <Navigate to="/unauthorized" replace />
            } />
            <Route path="/reports/sales-gst"        element={
              can(user?.role ?? "staff", "reports:gst")
                ? <GSTReportPage />
                : <Navigate to="/unauthorized" replace />
            } />

            {/* User Management — admin only */}
            <Route path="/users" element={
              can(user?.role ?? "staff", "users:manage")
                ? <UserManagementPage />
                : <Navigate to="/unauthorized" replace />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}
