import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, Gauge, FileText, ShoppingBag, PackageOpen,
  ClipboardCheck, Truck, Receipt, BarChart2, Settings,
  TrendingUp, AlertCircle, CheckCircle, Clock, ArrowRight,
  UserPlus, Shield, Activity,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

// ─── Shared components ────────────────────────────────────────────────────────

function MetricCard({ label, value, delta, color = "text-text-primary" }: { label: string; value: string | number; delta?: string; color?: string }) {
  const isPos = typeof delta === "string" && delta.startsWith("+");
  const isNeg = typeof delta === "string" && delta.startsWith("-");
  return (
    <div className="bg-white rounded-lg border border-border p-4 flex flex-col gap-1 hover:shadow-md transition-shadow">
      <div className="text-xs font-medium text-text-secondary">{label}</div>
      <div className={`text-2xl font-semibold mt-1 ${color}`}>{value}</div>
      {delta && (
        <div className={`text-xs font-medium mt-0.5 ${isPos ? "text-green-600" : isNeg ? "text-red-500" : "text-text-muted"}`}>
          {delta}
        </div>
      )}
    </div>
  );
}

function QuickLink({ to, icon: Icon, label, desc, color }: { to: string; icon: any; label: string; desc: string; color: string }) {
  return (
    <Link to={to} className="bg-white rounded-xl border border-border p-4 flex items-start gap-3 hover:shadow-md hover:border-border-strong transition-all group">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-text-primary group-hover:text-brand-orange transition-colors">{label}</div>
        <div className="text-xs text-text-secondary mt-0.5 leading-relaxed">{desc}</div>
      </div>
      <ArrowRight size={14} className="text-text-muted group-hover:text-brand-orange transition-colors ml-auto shrink-0 mt-1" />
    </Link>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-text-primary">{title}</h2>
      {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminDashboard({ name }: { name: string }) {
  const [counts, setCounts] = useState({ parties: 0, gauges: 0, calibJobs: 0, invoices: 0, receipts: 0, users: 0 });
  const [outstanding, setOutstanding] = useState(0);
  const [overdueEquipment, setOverdueEquipment] = useState<{ name: string; dueDate: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const today = new Date().toISOString().split("T")[0];
      const [p, g, c, inv, rcp, u, eq] = await Promise.all([
        supabase.from("parties").select("id", { count: "exact", head: true }),
        supabase.from("gauges").select("id", { count: "exact", head: true }),
        supabase.from("calib_jobs").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("total, status"),
        supabase.from("receipts").select("amount"),
        supabase.from("app_users").select("id", { count: "exact", head: true }),
        supabase.from("equipment_history").select("master_equipment_name, calibration_due_dt")
          .lte("calibration_due_dt", today).order("calibration_due_dt"),
      ]);
      const totalInvoiced = (inv.data ?? []).reduce((s: number, r: any) => s + Number(r.total ?? 0), 0);
      const totalReceived = (rcp.data ?? []).reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
      setOutstanding(totalInvoiced - totalReceived);
      setCounts({ parties: p.count ?? 0, gauges: g.count ?? 0, calibJobs: c.count ?? 0, invoices: (inv.data ?? []).length, receipts: (rcp.data ?? []).length, users: u.count ?? 0 });
      setOverdueEquipment((eq.data ?? []).map((r: any) => ({
        name: r.master_equipment_name, dueDate: r.calibration_due_dt ?? "",
      })));
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      {/* Welcome */}
      <div className="bg-white rounded-xl border border-border p-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Welcome back, {name} 👋</h1>
          <p className="text-xs text-text-secondary mt-1">You have full access to all modules. Here's your system overview.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
            <Shield size={10} /> Admin
          </span>
        </div>
      </div>

      {/* Key metrics */}
      <div>
        <SectionTitle title="Business Overview" subtitle="Live counts from the database" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          <MetricCard label="Total Parties" value={loading ? "—" : counts.parties} delta={`${counts.parties} registered`} />
          <MetricCard label="Gauge Records" value={loading ? "—" : counts.gauges} delta="In master" />
          <MetricCard label="Calib. Jobs" value={loading ? "—" : counts.calibJobs} delta="All time" />
          <MetricCard label="Active Users" value={loading ? "—" : counts.users} delta="In system" />
        </div>
      </div>

      {/* Financial snapshot */}
      <div>
        <SectionTitle title="Financial Snapshot" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
          <MetricCard label="Total Invoices" value={loading ? "—" : counts.invoices} />
          <MetricCard label="Receipts Recorded" value={loading ? "—" : counts.receipts} />
          <MetricCard label="Outstanding Amount" value={loading ? "—" : `₹${outstanding.toLocaleString()}`} color={outstanding > 0 ? "text-red-600" : "text-green-600"} delta={outstanding > 0 ? "Pending collection" : "All collected"} />
        </div>
      </div>

      {/* Equipment overdue alert */}
      {overdueEquipment.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={15} className="text-red-600 shrink-0" />
            <span className="text-sm font-semibold text-red-800">
              {overdueEquipment.length} Lab Equipment Past Calibration Due Date
            </span>
          </div>
          <p className="text-xs text-red-700 mb-3">
            ISO 17025 requires these instruments NOT be used for calibration until recalibrated.
          </p>
          <div className="flex flex-col gap-1">
            {overdueEquipment.slice(0, 5).map((eq, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                <span className="font-medium">{eq.name}</span>
                <span className="text-red-500">— due {eq.dueDate}</span>
              </div>
            ))}
            {overdueEquipment.length > 5 && (
              <p className="text-xs text-red-600 mt-1">
                +{overdueEquipment.length - 5} more…
                <Link to="/admin/basic-registration/equipment-hist" className="underline ml-1">View all</Link>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <SectionTitle title="Quick Actions" subtitle="Jump directly to key modules" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          <QuickLink to="/admin/basic-registration/party"         icon={Users}         label="Party Registration"    desc="Add or manage client records"                color="bg-blue-100 text-blue-700" />
          <QuickLink to="/admin/basic-registration/gauge-info"    icon={Gauge}         label="Gauge Info"            desc="Register and manage gauge master data"       color="bg-purple-100 text-purple-700" />
          <QuickLink to="/admin/transactions/quotation"           icon={FileText}      label="Quotation"             desc="Create and export client quotations"         color="bg-orange-100 text-orange-700" />
          <QuickLink to="/admin/transactions/purchase-order"      icon={ShoppingBag}   label="Purchase Order"        desc="Log and manage purchase orders"              color="bg-green-100 text-green-700" />
          <QuickLink to="/admin/transactions/sales-invoice"       icon={Receipt}       label="Sales Invoice"         desc="Generate and manage GST invoices"            color="bg-amber-100 text-amber-700" />
          <QuickLink to="/admin/reports/sales-gst"                icon={BarChart2}     label="GST Report"            desc="Monthly CGST/SGST/IGST summary"              color="bg-red-100 text-red-700" />
          <QuickLink to="/admin/reports/outstanding"              icon={AlertCircle}   label="Outstanding"           desc="Unpaid invoices and ageing analysis"         color="bg-rose-100 text-rose-700" />
          <QuickLink to="/admin/reports/ledger"                   icon={TrendingUp}    label="Ledger"                desc="Client-wise account statement"               color="bg-indigo-100 text-indigo-700" />
          <QuickLink to="/admin/users"                            icon={Settings}      label="User Management"       desc="Manage staff accounts and roles"             color="bg-gray-100 text-gray-700" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Manager Dashboard ────────────────────────────────────────────────────────

function ManagerDashboard({ name }: { name: string }) {
  const [counts, setCounts] = useState({ parties: 0, calibPending: 0, calibGenerated: 0, dispatches: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const [p, cp, cg, d] = await Promise.all([
        supabase.from("parties").select("id", { count: "exact", head: true }),
        supabase.from("calib_jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("calib_jobs").select("id", { count: "exact", head: true }).eq("status", "generated"),
        supabase.from("dispatches").select("id", { count: "exact", head: true }),
      ]);
      setCounts({ parties: p.count ?? 0, calibPending: cp.count ?? 0, calibGenerated: cg.count ?? 0, dispatches: d.count ?? 0 });
      setLoading(false);
    };
    fetchAll();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      {/* Welcome */}
      <div className="bg-white rounded-xl border border-border p-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Welcome back, {name} 👋</h1>
          <p className="text-xs text-text-secondary mt-1">Manage daily operations, approvals, and client transactions.</p>
        </div>
        <span className="hidden sm:flex text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 items-center gap-1">
          <ClipboardCheck size={10} /> Manager
        </span>
      </div>

      {/* Operational metrics */}
      <div>
        <SectionTitle title="Operations Overview" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          <MetricCard label="Total Parties" value={loading ? "—" : counts.parties} />
          <MetricCard label="Pending Certificates" value={loading ? "—" : counts.calibPending} color={counts.calibPending > 0 ? "text-amber-600" : "text-green-600"} delta={counts.calibPending > 0 ? "Needs attention" : "All clear"} />
          <MetricCard label="Generated Certs." value={loading ? "—" : counts.calibGenerated} delta="Completed" />
          <MetricCard label="Dispatches" value={loading ? "—" : counts.dispatches} delta="Total logged" />
        </div>
      </div>

      {/* Priority actions */}
      <div>
        <SectionTitle title="Priority Actions" subtitle="Items that need your attention" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Clock size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-amber-800">Pending Certificates</div>
              <div className="text-xs text-amber-700 mt-0.5">{loading ? "Loading..." : `${counts.calibPending} calibration jobs awaiting certificate generation`}</div>
              <Link to="/admin/transactions/calib-status" className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:underline mt-2">
                View jobs <ArrowRight size={11} />
              </Link>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-blue-800">Quotation Approvals</div>
              <div className="text-xs text-blue-700 mt-0.5">Review and approve pending quotations for clients</div>
              <Link to="/admin/transactions/quotation" className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline mt-2">
                Open quotations <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick access */}
      <div>
        <SectionTitle title="Quick Access" subtitle="Your most-used modules" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          <QuickLink to="/admin/transactions/quotation"           icon={FileText}      label="Quotation"             desc="Create and approve client quotations"        color="bg-orange-100 text-orange-700" />
          <QuickLink to="/admin/transactions/purchase-order"      icon={ShoppingBag}   label="Purchase Order"        desc="Log and manage purchase orders"              color="bg-green-100 text-green-700" />
          <QuickLink to="/admin/transactions/inward"              icon={PackageOpen}   label="Material Inward"       desc="Record incoming instruments (GRN)"           color="bg-blue-100 text-blue-700" />
          <QuickLink to="/admin/transactions/calib-status"        icon={ClipboardCheck}label="Calibration Status"    desc="Track and update calibration jobs"           color="bg-purple-100 text-purple-700" />
          <QuickLink to="/admin/transactions/dispatch"            icon={Truck}         label="Dispatch"              desc="Log outgoing instrument dispatches"          color="bg-teal-100 text-teal-700" />
          <QuickLink to="/admin/transactions/sales-invoice"       icon={Receipt}       label="Sales Invoice"         desc="Generate and manage GST invoices"            color="bg-amber-100 text-amber-700" />
          <QuickLink to="/admin/reports/cert-history"             icon={BarChart2}     label="Certificate History"   desc="Search and reprint calibration certificates" color="bg-indigo-100 text-indigo-700" />
          <QuickLink to="/admin/reports/outstanding"              icon={AlertCircle}   label="Outstanding"           desc="Unpaid invoices and ageing"                  color="bg-red-100 text-red-700" />
          <QuickLink to="/admin/basic-registration/party"         icon={Users}         label="Party Registration"    desc="Manage client and party records"             color="bg-gray-100 text-gray-700" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Staff Dashboard ──────────────────────────────────────────────────────────

function StaffDashboard({ name }: { name: string }) {
  const [counts, setCounts] = useState({ inwardToday: 0, calibPending: 0, calibInProgress: 0, dispatchReady: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const fetchAll = async () => {
      const [inw, cp, ci, dr] = await Promise.all([
        supabase.from("inward_bills").select("id", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("calib_jobs").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("calib_jobs").select("id", { count: "exact", head: true }).eq("status", "generated"),
        supabase.from("dispatches").select("id", { count: "exact", head: true }).eq("status", "dispatched"),
      ]);
      setCounts({ inwardToday: inw.count ?? 0, calibPending: cp.count ?? 0, calibInProgress: ci.count ?? 0, dispatchReady: dr.count ?? 0 });
      setLoading(false);
    };
    fetchAll();
  }, []);

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      {/* Welcome */}
      <div className="bg-white rounded-xl border border-border p-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Good day, {name} 👋</h1>
          <p className="text-xs text-text-secondary mt-1">{today} — Here's your work summary for today.</p>
        </div>
        <span className="hidden sm:flex text-[10px] font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 items-center gap-1">
          <Activity size={10} /> Staff
        </span>
      </div>

      {/* Today's status */}
      <div>
        <SectionTitle title="Today's Status" subtitle="Your active work items" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
          <MetricCard label="Inward Today" value={loading ? "—" : counts.inwardToday} delta="New entries" color="text-blue-600" />
          <MetricCard label="Pending Calib." value={loading ? "—" : counts.calibPending} color={counts.calibPending > 0 ? "text-amber-600" : "text-green-600"} delta={counts.calibPending > 0 ? "Needs work" : "All done"} />
          <MetricCard label="Certs. Generated" value={loading ? "—" : counts.calibInProgress} delta="Completed" color="text-green-600" />
          <MetricCard label="Dispatched" value={loading ? "—" : counts.dispatchReady} delta="In transit" color="text-purple-600" />
        </div>
      </div>

      {/* Primary work actions — large cards for easy access */}
      <div>
        <SectionTitle title="Your Work" subtitle="Everything you need — no sidebar navigation required" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          {/* Inward — primary task */}
          <Link to="/admin/transactions/inward"
            className="bg-blue-600 text-white rounded-xl p-5 flex items-start gap-4 hover:bg-blue-700 transition-colors group">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <PackageOpen size={22} />
            </div>
            <div>
              <div className="text-base font-semibold">Material Inward</div>
              <div className="text-sm text-blue-100 mt-1">Record incoming instruments from clients (GRN)</div>
              <div className="flex items-center gap-1 text-xs text-blue-200 mt-3 group-hover:text-white transition-colors">
                Open module <ArrowRight size={12} />
              </div>
            </div>
          </Link>

          {/* Calibration — primary task */}
          <Link to="/admin/transactions/calib-status"
            className="bg-purple-600 text-white rounded-xl p-5 flex items-start gap-4 hover:bg-purple-700 transition-colors group">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ClipboardCheck size={22} />
            </div>
            <div>
              <div className="text-base font-semibold">Calibration Status</div>
              <div className="text-sm text-purple-100 mt-1">Update job progress and generate certificates</div>
              <div className="flex items-center gap-1 text-xs text-purple-200 mt-3 group-hover:text-white transition-colors">
                Open module <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Secondary actions */}
      <div>
        <SectionTitle title="Other Tasks" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
          <QuickLink to="/admin/transactions/dispatch"            icon={Truck}         label="Dispatch"              desc="Log outgoing instrument dispatches"          color="bg-teal-100 text-teal-700" />
          <QuickLink to="/admin/reports/cert-history"             icon={BarChart2}     label="Certificate History"   desc="Search and reprint calibration certificates" color="bg-indigo-100 text-indigo-700" />
          <QuickLink to="/admin/basic-registration/party"         icon={Users}         label="View Parties"          desc="Look up client and party records"            color="bg-gray-100 text-gray-700" />
          <QuickLink to="/admin/basic-registration/gauge-info"    icon={Gauge}         label="Gauge Info"            desc="Look up gauge master records"                color="bg-purple-100 text-purple-700" />
          <QuickLink to="/admin/transactions/purchase-order"      icon={ShoppingBag}   label="View POs"              desc="Check authorized purchase orders"            color="bg-green-100 text-green-700" />
        </div>
      </div>

      {/* Workflow reminder */}
      <div className="bg-surface-subtle rounded-xl border border-border p-4">
        <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">Daily Workflow</div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs text-text-secondary">
          {[
            { step: "1", label: "Log Material Inward", color: "bg-blue-500" },
            { step: "2", label: "Update Calibration Status", color: "bg-purple-500" },
            { step: "3", label: "Generate Certificates", color: "bg-green-500" },
            { step: "4", label: "Log Dispatch", color: "bg-teal-500" },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center gap-2">
              {i > 0 && <ArrowRight size={12} className="text-text-muted hidden sm:block" />}
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full ${s.color} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>{s.step}</span>
                <span className="font-medium text-text-primary">{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main export — switches by role ──────────────────────────────────────────

export default function AdminDashboardHome() {
  const { user } = useAuth();
  const name = user?.name ?? "User";

  if (user?.role === "staff")   return <StaffDashboard   name={name} />;
  if (user?.role === "manager") return <ManagerDashboard name={name} />;
  return <AdminDashboard name={name} />;
}
