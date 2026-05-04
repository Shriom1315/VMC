import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, LayoutDashboard, FileText, BarChart2, Home, Settings, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, can, Permission } from "../context/AuthContext";

// ─── Sub-menu item ────────────────────────────────────────────────────────────

function SubMenuItem({ label, to, permission }: { label: string; to: string; permission?: Permission }) {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role ?? "staff";

  // If a permission is required and the role doesn't have it, show a locked item
  if (permission && !can(role, permission)) {
    return (
      <div className="flex items-center gap-2 pl-9 pr-3 py-2 text-xs rounded-md mx-2 text-text-muted cursor-not-allowed select-none">
        <Lock size={9} className="shrink-0 text-text-muted" />
        <span className="line-through opacity-50">{label}</span>
      </div>
    );
  }

  const active = location.pathname === to;
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
}

// ─── Section button ───────────────────────────────────────────────────────────

function MenuButton({ id, label, icon: Icon, open, onToggle }: {
  id: string; label: string; icon: any; open: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors rounded-md mx-2 ${
        open ? "text-text-primary bg-surface-muted" : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
      }`}
      style={{ width: "calc(100% - 16px)" }}
    >
      <div className="flex items-center gap-2.5">
        <Icon size={15} className={open ? "text-brand-orange" : "text-text-muted"} />
        <span>{label}</span>
      </div>
      <ChevronDown size={13} className={`text-text-muted transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  );
}

// ─── Animated section ─────────────────────────────────────────────────────────

function Section({ id, label, icon, open, onToggle, children }: {
  id: string; label: string; icon: any; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="px-2">
      <MenuButton id={id} label={label} icon={icon} open={open} onToggle={onToggle} />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden mt-0.5 mb-1 flex flex-col gap-0.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function AdminSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role ?? "staff";
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggle = (id: string) =>
    setOpenMenus(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  const isOpen = (id: string) => openMenus.includes(id);

  return (
    <div className="flex-1 py-3 flex flex-col bg-white overflow-y-auto">

      {/* Role badge */}
      <div className="px-4 pb-3 border-b border-border mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-orange text-white text-[11px] font-bold flex items-center justify-center shrink-0">
            {user?.avatar}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-medium text-text-primary truncate">{user?.name}</div>
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              role === "admin"   ? "bg-red-100 text-red-700" :
              role === "manager" ? "bg-amber-100 text-amber-700" :
                                   "bg-green-100 text-green-700"
            }`}>
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard */}
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

      <div className="px-3 py-1.5">
        <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">Modules</span>
      </div>

      {/* ── Basic Registration ── */}
      <Section id="basic-reg" label="Basic Registration" icon={LayoutDashboard} open={isOpen("basic-reg")} onToggle={() => toggle("basic-reg")}>
        {/* All roles see party (staff read-only enforced inside the page) */}
        <SubMenuItem label="Party Registration"     to="/admin/basic-registration/party"         permission="party:read" />
        <SubMenuItem label="Gauge Info"             to="/admin/basic-registration/gauge-info"     permission="gauge:read" />
        <SubMenuItem label="New Equipment"          to="/admin/basic-registration/new-equipment"  permission="equipment:read" />
        <SubMenuItem label="Equipment History"      to="/admin/basic-registration/equipment-hist" permission="equipment:read" />
        <SubMenuItem label="Uncertainty Reg"        to="/admin/basic-registration/uncertainty"    permission="uncertainty:read" />
        <SubMenuItem label="Scope Registration"     to="/admin/basic-registration/scope"          permission="scope:read" />
        <SubMenuItem label="Thread / Ring / Plug"   to="/admin/basic-registration/thread-specs"   permission="gauge:read" />
        <SubMenuItem label="Taper Thread Reading"   to="/admin/basic-registration/taper-thread"   permission="gauge:read" />
        <SubMenuItem label="Reading Masters"        to="/admin/basic-registration/reading-masters" permission="gauge:read" />
        <SubMenuItem label="Instrument Repair"      to="/admin/basic-registration/inst-repair"    permission="gauge:write" />
        <SubMenuItem label="Dial Table Master"      to="/admin/basic-registration/dial-table"     permission="gauge:read" />
        <SubMenuItem label="Rate Register"          to="/admin/basic-registration/rate"           permission="rate:read" />
        <SubMenuItem label="Custom PO Rate"         to="/admin/basic-registration/custom-po"      permission="rate:read" />
        <SubMenuItem label="Firm Creation"          to="/admin/basic-registration/firm-creation"  permission="firm:read" />
      </Section>

      {/* ── Daily Transactions ── */}
      <Section id="transactions" label="Daily Transactions" icon={FileText} open={isOpen("transactions")} onToggle={() => toggle("transactions")}>
        <SubMenuItem label="Quotation"          to="/admin/transactions/quotation"      permission="quotation:read" />
        <SubMenuItem label="Purchase Order"     to="/admin/transactions/purchase-order" permission="po:read" />
        <SubMenuItem label="Material Inward"    to="/admin/transactions/inward"         permission="inward:read" />
        <SubMenuItem label="Calibration Status" to="/admin/transactions/calib-status"   permission="calib:read" />
        <SubMenuItem label="Dispatch"           to="/admin/transactions/dispatch"       permission="dispatch:read" />
        <SubMenuItem label="Sales Invoice"      to="/admin/transactions/sales-invoice"  permission="invoice:read" />
        <SubMenuItem label="Receipt"            to="/admin/transactions/receipt"        permission="receipt:read" />
      </Section>

      {/* ── Reports ── (admin + manager only; staff sees only certificates) */}
      <Section id="reports" label="Reports" icon={BarChart2} open={isOpen("reports")} onToggle={() => toggle("reports")}>
        <SubMenuItem label="Total Quotations"    to="/admin/reports/total-quotations"  permission="reports:quotations" />
        <SubMenuItem label="Total POs"           to="/admin/reports/total-pos"         permission="reports:pos" />
        <SubMenuItem label="Certificate History" to="/admin/reports/cert-history"      permission="reports:certificates" />
        <SubMenuItem label="Outstanding"         to="/admin/reports/outstanding"       permission="reports:outstanding" />
        <SubMenuItem label="Ledger"              to="/admin/reports/ledger"            permission="reports:ledger" />
        <SubMenuItem label="Sales GST Report"    to="/admin/reports/sales-gst"         permission="reports:gst" />
      </Section>

      {/* ── User Management (admin only) ── */}
      {can(role, "users:manage") && (
        <Section id="users" label="User Management" icon={Settings} open={isOpen("users")} onToggle={() => toggle("users")}>
          <SubMenuItem label="Users & Roles" to="/admin/users" permission="users:manage" />
        </Section>
      )}

      {/* Back to site */}
      <div className="mt-auto px-2 pt-3 border-t border-border">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted rounded-md transition-colors"
        >
          <Home size={15} className="text-text-muted" />
          Back to Site
        </Link>
      </div>
    </div>
  );
}
