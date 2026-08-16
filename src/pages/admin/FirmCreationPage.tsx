import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, Building2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import ComboSelect from "../../components/ComboSelect";

interface Firm {
  id: number;
  firmName: string;
  address: string;
  phone: string;
  email: string;
  gstNo: string;
  gstType: string;
  panNo: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  isDefault: boolean;
}

const GST_TYPES = ["CGST/SGST", "IGST", "Exempt"];

const COLUMNS: ColumnDef[] = [
  { key: "firmName",   label: "Firm Name"   },
  { key: "phone",      label: "Phone"       },
  { key: "email",      label: "Email"       },
  { key: "gstNo",      label: "GST No"      },
  { key: "panNo",      label: "PAN No"      },
  { key: "bankName",   label: "Bank"        },
  { key: "isDefault",  label: "Default"     },
];

export default function FirmCreationPage() {
  const [firms,       setFirms]       = useState<Firm[]>([]);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(COLUMNS.map(c => c.key));
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const rowsPerPage = 10;

  const [firmName,   setFirmName]   = useState("");
  const [address,    setAddress]    = useState("");
  const [phone,      setPhone]      = useState("");
  const [email,      setEmail]      = useState("");
  const [gstNo,      setGstNo]      = useState("");
  const [gstType,    setGstType]    = useState("CGST/SGST");
  const [panNo,      setPanNo]      = useState("");
  const [bankName,   setBankName]   = useState("");
  const [accountNo,  setAccountNo]  = useState("");
  const [ifscCode,   setIfscCode]   = useState("");
  const [isDefault,  setIsDefault]  = useState(false);

  const fetchFirms = async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from("firms").select("*").order("id");
    if (err) { setError(err.message); setFirms([]); }
    else {
      setFirms((data ?? []).map((r: any) => ({
        id:        r.id,
        firmName:  r.firm_name  ?? "",
        address:   r.address    ?? "",
        phone:     r.phone      ?? "",
        email:     r.email      ?? "",
        gstNo:     r.gst_no     ?? "",
        gstType:   r.gst_type   ?? "",
        panNo:     r.pan_no     ?? "",
        bankName:  r.bank_name  ?? "",
        accountNo: r.account_no ?? "",
        ifscCode:  r.ifsc_code  ?? "",
        isDefault: r.is_default ?? false,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchFirms(); }, []);

  const resetForm = () => {
    setFirmName(""); setAddress(""); setPhone(""); setEmail(""); setGstNo("");
    setGstType("CGST/SGST"); setPanNo(""); setBankName(""); setAccountNo("");
    setIfscCode(""); setIsDefault(false); setEditingId(null);
  };

  const buildPayload = () => ({
    firm_name:  firmName, address, phone, email,
    gst_no:     gstNo, gst_type: gstType, pan_no: panNo,
    bank_name:  bankName, account_no: accountNo, ifsc_code: ifscCode,
    is_default: isDefault,
  });

  const handleSave = async () => {
    if (!firmName.trim()) { setError("Firm Name is required."); return; }
    setError(null);
    const { error: err } = await supabase.from("firms").insert(buildPayload());
    if (err) { setError(err.message); return; }
    resetForm(); fetchFirms();
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("firms").update(buildPayload()).eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchFirms();
  };

  const handleDelete = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("firms").delete().eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchFirms();
  };

  const handleSelect = (f: Firm) => {
    setEditingId(f.id); setFirmName(f.firmName); setAddress(f.address);
    setPhone(f.phone); setEmail(f.email); setGstNo(f.gstNo); setGstType(f.gstType);
    setPanNo(f.panNo); setBankName(f.bankName); setAccountNo(f.accountNo);
    setIfscCode(f.ifscCode); setIsDefault(f.isDefault);
  };

  const filtered   = firms.filter(f =>
    [f.firmName, f.gstNo, f.email, f.phone].some(v =>
      v.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const exportData = filtered.map(f => ({
    firmName: f.firmName, phone: f.phone, email: f.email,
    gstNo: f.gstNo, panNo: f.panNo, bankName: f.bankName,
    isDefault: f.isDefault ? "Yes" : "No",
  }));

  const fc = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const lc = "block text-xs font-medium text-text-secondary mb-1";

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Firm Creation</h1>
        <p className="text-xs text-text-secondary mt-0.5">Manage billing firm profiles used across invoices and challans</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      {/* Form */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Building2 size={15} className="text-brand-orange" />
            {editingId !== null ? `Editing Firm #${editingId}` : "Add Firm"}
          </span>
          {editingId !== null && <button onClick={resetForm} className="text-xs text-text-muted hover:text-text-primary">✕ Cancel</button>}
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div className="md:col-span-2">
            <label className={lc}>Firm Name <span className="text-red-500">*</span></label>
            <input value={firmName} onChange={e => setFirmName(e.target.value)} className={fc} placeholder="Vikramaditya Metrology Center LLP" />
          </div>
          <div className="md:col-span-2">
            <label className={lc}>Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} className={fc} placeholder="Plot No., MIDC, Kolhapur..." />
          </div>
          <div>
            <label className={lc}>Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className={fc} placeholder="9503601616" />
          </div>
          <div>
            <label className={lc}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={fc} placeholder="lab@example.com" />
          </div>
          <div>
            <label className={lc}>GST No.</label>
            <input value={gstNo} onChange={e => setGstNo(e.target.value)} className={fc} placeholder="27AAACE..." />
          </div>
          <div>
            <label className={lc}>GST Type</label>
            <ComboSelect value={gstType} onChange={setGstType} options={GST_TYPES} />
          </div>
          <div>
            <label className={lc}>PAN No.</label>
            <input value={panNo} onChange={e => setPanNo(e.target.value)} className={fc} placeholder="AAAAA0000A" />
          </div>
          <div>
            <label className={lc}>Bank Name</label>
            <input value={bankName} onChange={e => setBankName(e.target.value)} className={fc} placeholder="State Bank of India" />
          </div>
          <div>
            <label className={lc}>Account No.</label>
            <input value={accountNo} onChange={e => setAccountNo(e.target.value)} className={fc} placeholder="0000000000" />
          </div>
          <div>
            <label className={lc}>IFSC Code</label>
            <input value={ifscCode} onChange={e => setIfscCode(e.target.value)} className={fc} placeholder="SBIN0000000" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <input type="checkbox" id="isDefault" checked={isDefault} onChange={e => setIsDefault(e.target.checked)}
              className="w-4 h-4 accent-brand-orange cursor-pointer" />
            <label htmlFor="isDefault" className="text-sm text-text-primary cursor-pointer">Set as default billing firm</label>
          </div>
        </div>

        <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
          <button onClick={handleSave} disabled={editingId !== null}
            className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Save</button>
          <button onClick={handleUpdate} disabled={editingId === null}
            className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Update</button>
          <button onClick={handleDelete} disabled={editingId === null}
            className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
          {editingId !== null && <button onClick={resetForm} className="text-xs text-text-secondary hover:text-text-primary px-2">Cancel</button>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Registered Firms</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExportToolbar data={exportData} columns={COLUMNS} filename="firms"
              visibleColumns={visibleCols} onVisibilityChange={cols => { setVisibleCols(cols); setCurrentPage(1); }} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">Search:</span>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44" placeholder="" />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
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
                <tr><td colSpan={visibleCols.length + 1} className="px-4 py-10 text-center text-text-muted">No firms registered yet.</td></tr>
              ) : paginated.map((f, i) => (
                <tr key={f.id}
                  className={`hover:bg-surface-subtle transition-colors ${editingId === f.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}`}>
                  {visibleCols.includes("firmName")  && <td className="px-3 py-2.5 font-medium text-text-primary border-r border-border">{f.firmName}</td>}
                  {visibleCols.includes("phone")     && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{f.phone}</td>}
                  {visibleCols.includes("email")     && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{f.email}</td>}
                  {visibleCols.includes("gstNo")     && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{f.gstNo}</td>}
                  {visibleCols.includes("panNo")     && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{f.panNo}</td>}
                  {visibleCols.includes("bankName")  && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{f.bankName}</td>}
                  {visibleCols.includes("isDefault") && (
                    <td className="px-3 py-2.5 border-r border-border">
                      {f.isDefault && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Default</span>}
                    </td>
                  )}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => handleSelect(f)}
                      className="bg-brand-orange text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors">Select</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
          <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Previous</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setCurrentPage(pg)}
                className={`px-3 py-1 border rounded transition-colors ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border hover:bg-surface-muted"}`}>{pg}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
