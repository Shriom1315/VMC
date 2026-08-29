import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, UserPlus } from "lucide-react";
import { supabase } from "../../lib/supabase";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";

interface Employee {
  id: number;
  name: string;
  designation: string;
  department: string;
  employeeCode: string;
  phone: string;
  email: string;
  joinDate: string;
  isActive: boolean;
  signatureAuthority: boolean;
  remark: string;
}

const DEPARTMENTS = [
  "Calibration", "Quality", "Administration", "Management", "Technical", "Accounts",
];

const DESIGNATIONS = [
  "Calibration Engineer", "Sr. Calibration Engineer", "Calibration Technician",
  "Quality Manager", "Lab Manager", "Director", "Accountant", "Admin",
  "Authorized Signatory", "Technical Head",
];

const COLUMNS: ColumnDef[] = [
  { key: "id",           label: "ID"           },
  { key: "name",         label: "Name"         },
  { key: "designation",  label: "Designation"  },
  { key: "department",   label: "Department"   },
  { key: "employeeCode", label: "Emp. Code"    },
  { key: "phone",        label: "Phone"        },
  { key: "isActive",     label: "Status"       },
];

export default function EmployeesPage() {
  const [employees,   setEmployees]   = useState<Employee[]>([]);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(COLUMNS.map(c => c.key));
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const rowsPerPage = 10;

  // Form
  const [name,               setName]               = useState("");
  const [designation,        setDesignation]        = useState("");
  const [department,         setDepartment]         = useState("Calibration");
  const [employeeCode,       setEmployeeCode]       = useState("");
  const [phone,              setPhone]              = useState("");
  const [email,              setEmail]              = useState("");
  const [joinDate,           setJoinDate]           = useState("");
  const [isActive,           setIsActive]           = useState(true);
  const [signatureAuthority, setSignatureAuthority] = useState(false);
  const [remark,             setRemark]             = useState("");

  const fetchEmployees = async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from("employees").select("*").order("id");
    if (err) { setError(err.message); setEmployees([]); }
    else {
      setEmployees((data ?? []).map((r: any) => ({
        id: r.id, name: r.name, designation: r.designation ?? "",
        department: r.department ?? "", employeeCode: r.employee_code ?? "",
        phone: r.phone ?? "", email: r.email ?? "",
        joinDate: r.join_date ?? "", isActive: r.is_active ?? true,
        signatureAuthority: r.signature_authority ?? false, remark: r.remark ?? "",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const resetForm = () => {
    setName(""); setDesignation(""); setDepartment("Calibration");
    setEmployeeCode(""); setPhone(""); setEmail(""); setJoinDate("");
    setIsActive(true); setSignatureAuthority(false); setRemark("");
    setEditingId(null);
  };

  const payload = () => ({
    name, designation, department, employee_code: employeeCode,
    phone, email, join_date: joinDate || null,
    is_active: isActive, signature_authority: signatureAuthority, remark,
  });

  const handleSave = async () => {
    if (!name.trim()) { setError("Employee Name is required."); return; }
    setError(null);
    const { error: err } = await supabase.from("employees").insert(payload());
    if (err) { setError(err.message); return; }
    resetForm(); fetchEmployees();
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("employees").update(payload()).eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchEmployees();
  };

  const handleDelete = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("employees").delete().eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchEmployees();
  };

  const handleSelect = (e: Employee) => {
    setEditingId(e.id); setName(e.name); setDesignation(e.designation);
    setDepartment(e.department); setEmployeeCode(e.employeeCode);
    setPhone(e.phone); setEmail(e.email); setJoinDate(e.joinDate);
    setIsActive(e.isActive); setSignatureAuthority(e.signatureAuthority);
    setRemark(e.remark);
  };

  const filtered   = employees.filter(e =>
    [e.name, e.designation, e.department, e.employeeCode].some(v =>
      v.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const exportData = filtered.map(e => ({
    id: e.id, name: e.name, designation: e.designation, department: e.department,
    employeeCode: e.employeeCode, phone: e.phone,
    isActive: e.isActive ? "Active" : "Inactive",
  }));

  const fc = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const lc = "block text-xs font-medium text-text-secondary mb-1";

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Employee Master</h1>
        <p className="text-xs text-text-secondary mt-0.5">Manage staff records — names and designations used across all modules</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      {/* Form */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <UserPlus size={15} className="text-brand-orange" />
            {editingId !== null ? `Editing Employee #${editingId}` : "Add Employee"}
          </span>
          {editingId !== null && <button onClick={resetForm} className="text-xs text-text-muted hover:text-text-primary">✕ Cancel</button>}
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className={lc}>Employee Name <span className="text-red-500">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} className={fc} placeholder="Full name" />
          </div>
          <div>
            <label className={lc}>Employee Code</label>
            <input value={employeeCode} onChange={e => setEmployeeCode(e.target.value)} className={fc} placeholder="VMC-EMP-001" />
          </div>
          <div>
            <label className={lc}>Designation</label>
            <input
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              list="designations-list"
              className={fc}
              placeholder="Select or type..."
            />
            <datalist id="designations-list">
              {DESIGNATIONS.map(d => <option key={d} value={d} />)}
            </datalist>
          </div>
          <div>
            <label className={lc}>Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)} className={`${fc} appearance-none cursor-pointer`}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={lc}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className={fc} placeholder="9XXXXXXXXX" />
          </div>
          <div>
            <label className={lc}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={fc} />
          </div>
          <div>
            <label className={lc}>Join Date</label>
            <input type="date" value={joinDate} onChange={e => setJoinDate(e.target.value)} className={fc} />
          </div>
          <div>
            <label className={lc}>Remark</label>
            <input value={remark} onChange={e => setRemark(e.target.value)} className={fc} />
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 accent-brand-orange" />
              <span className="text-sm text-text-primary">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={signatureAuthority} onChange={e => setSignatureAuthority(e.target.checked)} className="w-4 h-4 accent-brand-orange" />
              <span className="text-sm text-text-primary">Signature Authority</span>
            </label>
          </div>
        </div>
        <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
          <button onClick={handleSave} disabled={editingId !== null} className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Save</button>
          <button onClick={handleUpdate} disabled={editingId === null} className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Update</button>
          <button onClick={handleDelete} disabled={editingId === null} className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
          {editingId !== null && <button onClick={resetForm} className="text-xs text-text-secondary hover:text-text-primary px-2">Cancel</button>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Employees</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExportToolbar data={exportData} columns={COLUMNS} filename="employees" visibleColumns={visibleCols} onVisibilityChange={cols => { setVisibleCols(cols); setCurrentPage(1); }} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">Search:</span>
              <div className="relative"><Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44" placeholder="" />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                {COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => (
                  <th key={col.key} className="px-3 py-2.5 text-xs font-medium text-text-secondary border-r border-border">
                    <span className="flex items-center gap-1">{col.label} <span className="text-text-muted">↕</span></span>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-xs font-medium text-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr><td colSpan={visibleCols.length + 1} className="px-4 py-10 text-center text-text-muted">No employees found</td></tr>
              ) : paginated.map((e, i) => (
                <tr key={e.id} className={`hover:bg-surface-subtle transition-colors ${editingId === e.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}`}>
                  {visibleCols.includes("id")           && <td className="px-3 py-2.5 font-mono font-semibold text-brand-orange border-r border-border">{e.id}</td>}
                  {visibleCols.includes("name")         && <td className="px-3 py-2.5 font-medium text-text-primary border-r border-border">{e.name}</td>}
                  {visibleCols.includes("designation")  && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{e.designation}</td>}
                  {visibleCols.includes("department")   && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{e.department}</td>}
                  {visibleCols.includes("employeeCode") && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{e.employeeCode}</td>}
                  {visibleCols.includes("phone")        && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{e.phone}</td>}
                  {visibleCols.includes("isActive")     && (
                    <td className="px-3 py-2.5 border-r border-border">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${e.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {e.isActive ? "Active" : "Inactive"}
                      </span>
                      {e.signatureAuthority && <span className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Sig. Auth.</span>}
                    </td>
                  )}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => handleSelect(e)} className="bg-brand-orange text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors">Select</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
          <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Previous</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setCurrentPage(pg)} className={`px-3 py-1 border rounded transition-colors ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border hover:bg-surface-muted"}`}>{pg}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
