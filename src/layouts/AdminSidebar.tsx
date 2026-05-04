import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, LayoutDashboard, FileText, BarChart2, LogOut, Home } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(["basic-registration"]);

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev =>
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const isActive = (path: string) => location.pathname === path;

  const SubMenuItem = ({ label, to }: { label: string; to: string }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 pl-9 pr-3 py-2 text-xs transition-colors rounded-md mx-2 ${
          active
            ? "bg-brand-orange-light text-brand-orange font-medium"
            : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
        }`}
      >
        <span className={`w-1 h-1 rounded-full shrink-0 ${active ? "bg-brand-orange" : "bg-border-strong"}`} />
        {label}
      </Link>
    );
  };

  const MenuButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => {
    const isOpen = openMenus.includes(id);
    return (
      <button
        onClick={() => toggleMenu(id)}
        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors rounded-md mx-2 ${
          isOpen ? "text-text-primary bg-surface-muted" : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
        }`}
        style={{ width: "calc(100% - 16px)" }}
      >
        <div className="flex items-center gap-2.5">
          <Icon size={15} className={isOpen ? "text-brand-orange" : "text-text-muted"} />
          <span>{label}</span>
        </div>
        <ChevronDown size={13} className={`text-text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
    );
  };

  return (
    <div className="flex-1 py-3 flex flex-col bg-white overflow-y-auto">
      {/* Dashboard link */}
      <div className="px-2 mb-1">
        <Link
          to="/admin"
          className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium rounded-md transition-colors ${
            location.pathname === "/admin"
              ? "bg-brand-orange-light text-brand-orange"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
          }`}
        >
          <Home size={15} className={location.pathname === "/admin" ? "text-brand-orange" : "text-text-muted"} />
          Dashboard
        </Link>
      </div>

      <div className="px-3 py-2">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Modules</span>
      </div>

      {/* Basic Registration */}
      <div className="px-2">
        <MenuButton id="basic-registration" label="Basic Registration" icon={LayoutDashboard} />
        <AnimatePresence>
          {openMenus.includes("basic-registration") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden mt-0.5 mb-1 flex flex-col gap-0.5"
            >
              <SubMenuItem label="Party Registration" to="/admin/basic-registration/party" />
              <SubMenuItem label="Gauge Info Registration" to="/admin/basic-registration/gauge-info" />
              <SubMenuItem label="New Equipment" to="/admin/basic-registration/new-equipment" />
              <SubMenuItem label="Equipment History" to="/admin/basic-registration/equipment-hist" />
              <SubMenuItem label="Uncertainty Reg" to="/admin/basic-registration/uncertainty" />
              <SubMenuItem label="Scope Registration" to="/admin/basic-registration/scope" />
              <SubMenuItem label="Thread / Ring / Plug" to="/admin/basic-registration/thread-specs" />
              <SubMenuItem label="Taper Thread Reading" to="/admin/basic-registration/taper-thread" />
              <SubMenuItem label="Reading Masters" to="/admin/basic-registration/reading-masters" />
              <SubMenuItem label="Instrument Repair" to="/admin/basic-registration/inst-repair" />
              <SubMenuItem label="Dial Table Master" to="/admin/basic-registration/dial-table" />
              <SubMenuItem label="Rate Register" to="/admin/basic-registration/rate" />
              <SubMenuItem label="Custom PO Rate" to="/admin/basic-registration/custom-po" />
              <SubMenuItem label="Firm Creation" to="/admin/basic-registration/firm-creation" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Daily Transactions */}
      <div className="px-2">
        <MenuButton id="daily-transactions" label="Daily Transactions" icon={FileText} />
        <AnimatePresence>
          {openMenus.includes("daily-transactions") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden mt-0.5 mb-1 flex flex-col gap-0.5"
            >
              <SubMenuItem label="Quotation" to="/admin/transactions/quotation" />
              <SubMenuItem label="Purchase Order" to="/admin/transactions/purchase-order" />
              <SubMenuItem label="Inward" to="/admin/transactions/inward" />
              <SubMenuItem label="Calibration Status" to="/admin/transactions/calib-status" />
              <SubMenuItem label="Dispatch" to="/admin/transactions/dispatch" />
              <SubMenuItem label="Sales Invoice" to="/admin/transactions/sales-invoice" />
              <SubMenuItem label="Receipt" to="/admin/transactions/receipt" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reports */}
      <div className="px-2">
        <MenuButton id="reports" label="Reports" icon={BarChart2} />
        <AnimatePresence>
          {openMenus.includes("reports") && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden mt-0.5 mb-1 flex flex-col gap-0.5"
            >
              <SubMenuItem label="Total Quotations" to="/admin/reports/total-quotations" />
              <SubMenuItem label="Total POs" to="/admin/reports/total-pos" />
              <SubMenuItem label="Certificate History" to="/admin/reports/cert-history" />
              <SubMenuItem label="Outstanding" to="/admin/reports/outstanding" />
              <SubMenuItem label="Ledger" to="/admin/reports/ledger" />
              <SubMenuItem label="Sales GST Report" to="/admin/reports/sales-gst" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exit */}
      <div className="mt-auto px-2 pt-3 border-t border-border">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md transition-colors"
        >
          <LogOut size={15} className="text-text-muted" />
          Exit Dashboard
        </Link>
      </div>
    </div>
  );
}
