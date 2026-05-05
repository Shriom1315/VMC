import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Shield, UserCheck, Wrench } from "lucide-react";
import { Role, useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import ComboSelect from "../../components/ComboSelect";

interface AppUser {
  id: string; name: string; email: string; role: Role;
  status: "active" | "inactive"; lastLogin: string; createdBy: Role;
}

const ROLE_CONFIG: Record<Role, { label: string; color: string; icon: any; desc: string }> = {
  admin:   { label: "Admin",   color: "bg-red-100 text-red-700",    icon: Shield,    desc: "Full access — system config, financials, all modules. Can create managers and staff." },
  manager: { label: "Manager", color: "bg-amber-100 text-amber-700", icon: UserCheck, desc: "Operations & approvals. Can create and manage staff only." },
  staff:   { label: "Staff",   color: "bg-green-100 text-green-700", icon: Wrench,    desc: "Calibration technician — inward, calibration, dispatch only. Cannot manage users." },
};

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const currentRole = currentUser?.role ?? "admin";

  const [users,    setUsers]    = useState<AppUser[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [role,     setRole]     = useState<Role>(currentRole === "admin" ? "manager" : "staff");

  const fetchUsers = async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from("app_users").select("*").order("created_at", { ascending: true });
    if (err) { setError(err.message); }
    else { setUsers((data ?? []).map((r: any) => ({ id: r.id, name: r.name, email: r.email, role: r.role as Role, status: r.status, lastLogin: r.last_login ?? "Never", createdBy: r.created_by as Role }))); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const visibleUsers = currentRole === "admin" ? users : users.filter(u => u.role === "staff");
  const assignableRoles: Role[] = currentRole === "admin" ? ["manager", "staff"] : ["staff"];

  const handleAdd = async () => {
    if (!name || !email) return;
    const { error: err } = await supabase.from("app_users").insert({ name, email, role, status: "active", created_by: currentRole });
    if (err) { setError(err.message); return; }
    setName(""); setEmail(""); setRole(currentRole === "admin" ? "manager" : "staff"); setShowForm(false); fetchUsers();
  };

  const toggleStatus = async (id: string, currentStatus: "active" | "inactive") => {
    const { error: err } = await supabase.from("app_users").update({ status: currentStatus === "active" ? "inactive" : "active" }).eq("id", id);
    if (err) { setError(err.message); return; }
    fetchUsers();
  };

  const changeRole = async (id: string, newRole: Role) => {
    if (currentRole === "manager" && newRole !== "staff") return;
    const { error: err } = await supabase.from("app_users").update({ role: newRole }).eq("id", id);
    if (err) { setError(err.message); return; }
    fetchUsers();
  };

  const canEdit = (u: AppUser) => {
    if (currentRole === "admin") return u.id !== currentUser?.id;
    if (currentRole === "manager") return u.role === "staff";
    return false;
  };

  const inputCls = "w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const labelCls = "block text-xs font-medium text-text-secondary mb-1";

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">User Management</h1>
          <p className="text-xs text-text-secondary mt-0.5">{currentRole === "admin" ? "Manage all accounts — create managers and staff" : "Manage staff accounts under your supervision"}</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <Plus size={13} />{currentRole === "admin" ? "Add User" : "Add Staff"}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      <div className={`grid grid-cols-1 gap-4 ${currentRole === "admin" ? "sm:grid-cols-3" : "sm:grid-cols-1 max-w-sm"}`}>
        {(Object.entries(ROLE_CONFIG) as [Role, typeof ROLE_CONFIG[Role]][]).filter(([key]) => currentRole === "admin" || key === "staff").map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = users.filter(u => u.role === key && u.status === "active").length;
          return (
            <div key={key} className="bg-white rounded-lg border border-border p-4 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}><Icon size={15} /></div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-primary">{cfg.label}</span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${cfg.color}`}>{count} active</span>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">{cfg.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border text-sm font-semibold text-text-primary">{currentRole === "admin" ? "New User" : "New Staff Member"}</div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelCls}>Full Name</label><input value={name} onChange={e => setName(e.target.value)} className={inputCls} placeholder="Full name" /></div>
            <div><label className={labelCls}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="user@vikramaditya.com" /></div>
            <div><label className={labelCls}>Role</label>
              <ComboSelect
                value={role.charAt(0).toUpperCase() + role.slice(1)}
                onChange={v => setRole(v.toLowerCase() as Role)}
                options={assignableRoles.map(r => r.charAt(0).toUpperCase() + r.slice(1))}
              />
            </div>
          </div>
          <div className="px-5 pb-5 flex gap-2 border-t border-border pt-4">
            <button onClick={handleAdd} className="bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">Add User</button>
            <button onClick={() => setShowForm(false)} className="border border-border text-text-secondary text-xs font-medium px-4 py-2 rounded-lg hover:bg-surface-muted transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">{currentRole === "admin" ? `All Users (${visibleUsers.length})` : `Staff Members (${visibleUsers.length})`}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>{["User","Email","Role","Status","Last Login","Actions"].map((h, i) => <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visibleUsers.map(u => {
                const cfg = ROLE_CONFIG[u.role];
                const editable = canEdit(u);
                return (
                  <tr key={u.id} className={`hover:bg-surface-subtle transition-colors ${u.status === "inactive" ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 border-r border-border">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-orange text-white text-[10px] font-bold flex items-center justify-center shrink-0">{u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</div>
                        <div>
                          <div className="font-medium text-text-primary">{u.name}</div>
                          {u.id === currentUser?.id && <div className="text-[10px] text-text-muted">You</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary border-r border-border">{u.email}</td>
                    <td className="px-4 py-3 border-r border-border">
                      {editable && assignableRoles.includes(u.role) ? (
                        <select value={u.role} onChange={e => changeRole(u.id, e.target.value as Role)} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-0 cursor-pointer ${cfg.color}`}>
                          {assignableRoles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                        </select>
                      ) : (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 border-r border-border">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{u.status}</span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary border-r border-border">{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      {editable ? (
                        <button onClick={() => toggleStatus(u.id, u.status)} className={`text-xs font-medium hover:underline ${u.status === "active" ? "text-red-500" : "text-green-600"}`}>
                          {u.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      ) : <span className="text-xs text-text-muted">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
