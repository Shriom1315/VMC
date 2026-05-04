import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, LayoutDashboard, FileText, BarChart2, LogOut } from "lucide-react";
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
        className={`flex items-center pl-10 pr-4 py-2.5 text-[13px] font-sans font-medium transition-colors border-l-2 ${
          active
            ? "border-brand-orange bg-orange-50 text-brand-orange font-bold"
            : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-black"
        }`}
      >
        <span className="w-4 h-4 mr-2 flex justify-center items-center">
          {active
            ? <span className="w-1.5 h-1.5 bg-brand-orange rounded-full" />
            : <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />}
        </span>
        {label}
      </Link>
    );
  };

  const MenuButton = ({ id, label, icon: Icon }: { id: string; label: string; icon: any }) => {
    const isOpen = openMenus.includes(id);
    return (
      <button
        onClick={() => toggleMenu(id)}
        className={`w-full flex items-center justify-between px-5 py-4 text-sm font-semibold font-sans hover:bg-gray-50 transition-colors border-b ${
          isOpen ? "border-gray-200 bg-gray-50 text-black" : "border-gray-100 text-gray-700"
        } group`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className={`${isOpen ? "text-brand-orange" : "text-gray-400 group-hover:text-brand-orange"} transition-colors`} />
          <span>{label}</span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180 text-black" : ""}`} />
      </button>
    );
  };

  return (
    <div className="flex-1 py-2 flex flex-col bg-white">
      {/* Basic Registration */}
      <div>
        <MenuButton id="basic-registration" label="Basic Registration" icon={LayoutDashboard} />
        <AnimatePresence>
          {openMenus.includes("basic-registration") && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-b border-gray-100">
              <SubMenuItem label="Party Registartion" to="/admin/basic-registration/party" />
              <SubMenuItem label="Gauge Info Registartion" to="/admin/basic-registration/gauge-info" />
              <SubMenuItem label="New Equipement" to="/admin/basic-registration/new-equipment" />
              <SubMenuItem label="Equipement Hist.Reg" to="/admin/basic-registration/equipment-hist" />
              <SubMenuItem label="Uncertainty Reg" to="/admin/basic-registration/uncertainty" />
              <SubMenuItem label="Scope Registration" to="/admin/basic-registration/scope" />
              <SubMenuItem label="Thead/Ring/Plug Spe." to="/admin/basic-registration/thread-specs" />
              <SubMenuItem label="Taper Thread Reading" to="/admin/basic-registration/taper-thread" />
              <SubMenuItem label="Reading Masters" to="/admin/basic-registration/reading-masters" />
              <SubMenuItem label="Inst.Repair Master" to="/admin/basic-registration/inst-repair" />
              <SubMenuItem label="Dial Table Master" to="/admin/basic-registration/dial-table" />
              <SubMenuItem label="Rate Reg." to="/admin/basic-registration/rate" />
              <SubMenuItem label="Custom PO Rate Master" to="/admin/basic-registration/custom-po" />
              <SubMenuItem label="Firm Creation" to="/admin/basic-registration/firm-creation" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Daily Transactions */}
      <div>
        <MenuButton id="daily-transactions" label="Daily Transactions" icon={FileText} />
        <AnimatePresence>
          {openMenus.includes("daily-transactions") && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-b border-gray-100">
              <SubMenuItem label="Quotation" to="/admin/transactions/quotation" />
              <SubMenuItem label="Purchase Order" to="/admin/transactions/purchase-order" />
              <SubMenuItem label="Inward" to="/admin/transactions/inward" />
              <SubMenuItem label="Calibration Status" to="/admin/transactions/calib-status" />
              <SubMenuItem label="Dispatch" to="/admin/transactions/dispatch" />
              <SubMenuItem label="Sales Invoice" to="/admin/transactions/sales-invoice" />
              <SubMenuItem label="Reciept" to="/admin/transactions/receipt" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reports */}
      <div>
        <MenuButton id="reports" label="Reports" icon={BarChart2} />
        <AnimatePresence>
          {openMenus.includes("reports") && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-b border-gray-100">
              <SubMenuItem label="Total Quotations" to="/admin/reports/total-quotations" />
              <SubMenuItem label="Total PO's" to="/admin/reports/total-pos" />
              <SubMenuItem label="Certificate History" to="/admin/reports/cert-history" />
              <SubMenuItem label="Outstanding" to="/admin/reports/outstanding" />
              <SubMenuItem label="Ledger" to="/admin/reports/ledger" />
              <SubMenuItem label="Sales GST Report" to="/admin/reports/sales-gst" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Link
        to="/"
        className="w-full flex items-center gap-3 px-5 py-4 mt-auto text-sm font-semibold font-sans text-black border-t-2 border-black hover:bg-brand-orange hover:text-white transition-colors group bg-white"
      >
        <LogOut size={18} className="text-brand-orange group-hover:text-white transition-colors" />
        <span>Exit Dashboard</span>
      </Link>
    </div>
  );
}
