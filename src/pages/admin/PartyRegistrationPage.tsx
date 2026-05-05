import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { UserPlus, Search } from "lucide-react";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import ComboSelect from "../../components/ComboSelect";
import { supabase } from "../../lib/supabase";

interface Party {
  id: number; name: string; address: string; contact: string; gstNo: string; email: string;
  gstType: string; otherAccess: string; billingRateType: string; discountRate: string;
  collabMethod: string; reportingMethod: string; collationMethod: string; dispatchMethod: string;
  compliance: string; decisionRule: string; billingFirm: string;
}

export default function PartyRegistrationPage() {
  const [regNo,           setRegNo]           = useState("");
  const [companyName,     setCompanyName]     = useState("");
  const [contactPerson,   setContactPerson]   = useState("");
  const [address,         setAddress]         = useState("");
  const [email,           setEmail]           = useState("");
  const [contact,         setContact]         = useState("");
  const [gstNo,           setGstNo]           = useState("");
  const [gstType,         setGstType]         = useState("CGST/SGST");
  const [otherAccess,     setOtherAccess]     = useState("No");
  const [billingRateType, setBillingRateType] = useState("Fixed Discount %");
  const [discountRate,    setDiscountRate]    = useState("");
  const [collabMethod,    setCollabMethod]    = useState("Lab Method");
  const [reportingMethod, setReportingMethod] = useState("Lab Format");
  const [collationMethod, setCollationMethod] = useState("By Hand");
  const [dispatchMethod,  setDispatchMethod]  = useState("By Hand");
  const [compliance,      setCompliance]      = useState("Required");
  const [decisionRule,    setDecisionRule]    = useState("Yes");
  const [billingFirm,     setBillingFirm]     = useState("Vikramaditya Calibration");

  const [parties,     setParties]     = useState<Party[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const rowsPerPage = 10;

  const fetchParties = async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from("parties").select("*").order("id", { ascending: true });
    if (err) { setError(err.message); }
    else {
      setParties((data ?? []).map((r: any) => ({
        id: r.id, name: r.name, address: r.address, contact: r.contact,
        gstNo: r.gst_no, email: r.email, gstType: r.gst_type,
        otherAccess: r.other_access, billingRateType: r.billing_rate_type,
        discountRate: r.discount_rate, collabMethod: r.collab_method,
        reportingMethod: r.reporting_method, collationMethod: r.collation_method,
        dispatchMethod: r.dispatch_method, compliance: r.compliance,
        decisionRule: r.decision_rule, billingFirm: r.billing_firm,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchParties(); }, []);

  const resetForm = () => {
    setRegNo(""); setCompanyName(""); setContactPerson(""); setAddress("");
    setEmail(""); setContact(""); setGstNo(""); setEditingId(null);
    setGstType("CGST/SGST"); setOtherAccess("No"); setBillingRateType("Fixed Discount %");
    setDiscountRate(""); setCollabMethod("Lab Method"); setReportingMethod("Lab Format");
    setCollationMethod("By Hand"); setDispatchMethod("By Hand"); setCompliance("Required");
    setDecisionRule("Yes"); setBillingFirm("Vikramaditya Calibration");
  };

  const handleSave = async () => {
    if (!companyName.trim()) return;
    const payload = {
      name: companyName, address, contact, gst_no: gstNo, email,
      gst_type: gstType, other_access: otherAccess, billing_rate_type: billingRateType,
      discount_rate: discountRate, collab_method: collabMethod,
      reporting_method: reportingMethod, collation_method: collationMethod,
      dispatch_method: dispatchMethod, compliance, decision_rule: decisionRule,
      billing_firm: billingFirm,
    };
    if (editingId !== null) {
      const { error: err } = await supabase.from("parties").update(payload).eq("id", editingId);
      if (err) { setError(err.message); return; }
    } else {
      const { error: err } = await supabase.from("parties").insert(payload);
      if (err) { setError(err.message); return; }
    }
    resetForm(); fetchParties();
  };

  const handleSelect = (p: Party) => {
    setEditingId(p.id); setCompanyName(p.name); setAddress(p.address);
    setContact(p.contact === "-" ? "" : p.contact);
    setGstNo(p.gstNo === "-" ? "" : p.gstNo);
    setEmail(p.email === "-" ? "" : p.email);
    setGstType(p.gstType ?? "CGST/SGST"); setOtherAccess(p.otherAccess ?? "No");
    setBillingRateType(p.billingRateType ?? "Fixed Discount %"); setDiscountRate(p.discountRate ?? "");
    setCollabMethod(p.collabMethod ?? "Lab Method"); setReportingMethod(p.reportingMethod ?? "Lab Format");
    setCollationMethod(p.collationMethod ?? "By Hand"); setDispatchMethod(p.dispatchMethod ?? "By Hand");
    setCompliance(p.compliance ?? "Required"); setDecisionRule(p.decisionRule ?? "Yes");
    setBillingFirm(p.billingFirm ?? "Vikramaditya Calibration");
  };

  const handleDelete = async () => {
    if (editingId !== null) {
      const { error: err } = await supabase.from("parties").delete().eq("id", editingId);
      if (err) { setError(err.message); return; }
    }
    resetForm(); fetchParties();
  };

  const filtered   = parties.filter(p => [p.name, p.address, p.gstNo, p.email].some(v => (v ?? "").toLowerCase().includes(searchQuery.toLowerCase())));
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const PARTY_COLUMNS: ColumnDef[] = [
    { key: "id", label: "ID" }, { key: "name", label: "Name" },
    { key: "address", label: "Address" }, { key: "contact", label: "Contact" },
    { key: "gstNo", label: "GST No" }, { key: "email", label: "Email" },
  ];
  const [visibleCols, setVisibleCols] = useState(PARTY_COLUMNS.map(c => c.key));
  const exportData = filtered.map(p => ({ id: p.id, name: p.name, address: p.address, contact: p.contact, gstNo: p.gstNo, email: p.email }));

  const fieldCls  = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const selectCls = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange appearance-none cursor-pointer";
  const labelCls  = "block text-xs font-medium text-text-secondary mb-1";

  const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <ComboSelect value={value} onChange={onChange} options={options} />
    </div>
  );

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Party Registration</h1>
        <p className="text-xs text-text-secondary mt-0.5">Manage client and party records</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <UserPlus size={16} className="text-brand-orange" />
            {editingId !== null ? `Editing Party #${editingId}` : "New Party Entry"}
          </div>
          {editingId !== null && <span className="text-xs bg-brand-orange-light text-brand-orange font-medium px-2 py-0.5 rounded-full">Editing</span>}
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelCls}>Reg. No</label><input value={regNo} onChange={e => setRegNo(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Company Name</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Contact Person</label><input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Address</label><input value={address} onChange={e => setAddress(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Contact</label><input value={contact} onChange={e => setContact(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>GST No</label><input value={gstNo} onChange={e => setGstNo(e.target.value)} className={fieldCls} /></div>
          <SelectField label="GST Type" value={gstType} onChange={setGstType} options={["CGST/SGST","IGST","Exempt"]} />
          <SelectField label="Other Access" value={otherAccess} onChange={setOtherAccess} options={["No","Yes"]} />
          <SelectField label="Billing Rate Type" value={billingRateType} onChange={setBillingRateType} options={["Fixed Discount %","Custom Rate","Standard Rate"]} />
          <div><label className={labelCls}>Discount Rate (%)</label><input type="number" value={discountRate} onChange={e => setDiscountRate(e.target.value)} className={fieldCls} /></div>
          <SelectField label="Collaboration Method" value={collabMethod} onChange={setCollabMethod} options={["Lab Method","Customer Method"]} />
          <SelectField label="Method of Reporting" value={reportingMethod} onChange={setReportingMethod} options={["Lab Format","Customer Format"]} />
          <SelectField label="Method of Collation" value={collationMethod} onChange={setCollationMethod} options={["By Hand","Digital"]} />
          <SelectField label="Method of Dispatch" value={dispatchMethod} onChange={setDispatchMethod} options={["By Hand","Courier","Email"]} />
          <SelectField label="Compliance Statement" value={compliance} onChange={setCompliance} options={["Required","Not Required"]} />
          <SelectField label="Decision Rule Discussed & Accepted" value={decisionRule} onChange={setDecisionRule} options={["Yes","No"]} />
          <SelectField label="Billing Firm" value={billingFirm} onChange={setBillingFirm} options={["Vikramaditya Calibration","Vikramaditya Enterprises"]} />
        </div>
        <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
          <button onClick={handleSave} disabled={editingId !== null} className="bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Save</button>
          <button onClick={handleSave} disabled={editingId === null} className="border border-border text-text-primary text-xs font-medium px-4 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Update</button>
          <button onClick={handleDelete} disabled={editingId === null} className="border border-red-200 text-red-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
          {editingId !== null && <button onClick={resetForm} className="text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-2">Cancel</button>}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">All Parties</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3">
            <ExportToolbar data={exportData} columns={PARTY_COLUMNS} filename="party-registration" visibleColumns={visibleCols} onVisibilityChange={setVisibleCols} />
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="border border-border rounded-md text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-40" placeholder="Search..." />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                {["ID","Name","Address","Contact","GST No","Email","Action"].map((h, i) => {
                  const colKey = ["id","name","address","contact","gstNo","email","action"][i];
                  if (colKey !== "action" && !visibleCols.includes(colKey)) return null;
                  return <th key={h} className={`px-4 py-2.5 text-xs font-medium text-text-secondary ${i < 6 ? "border-r border-border" : "text-center"}`}>{h !== "Action" ? <span className="flex items-center gap-1">{h} <span className="text-text-muted">↕</span></span> : h}</th>;
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-text-muted text-xs">No records found</td></tr>
              ) : paginated.map((p, i) => (
                <tr key={p.id} className={`hover:bg-surface-subtle transition-colors ${editingId === p.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/50"}`}>
                  {visibleCols.includes("id")      && <td className="px-4 py-2.5 font-mono text-text-secondary border-r border-border">{p.id}</td>}
                  {visibleCols.includes("name")    && <td className="px-4 py-2.5 font-medium text-text-primary border-r border-border">{p.name}</td>}
                  {visibleCols.includes("address") && <td className="px-4 py-2.5 text-text-secondary border-r border-border max-w-xs truncate" title={p.address}>{p.address}</td>}
                  {visibleCols.includes("contact") && <td className="px-4 py-2.5 font-mono text-text-secondary border-r border-border">{p.contact}</td>}
                  {visibleCols.includes("gstNo")   && <td className="px-4 py-2.5 font-mono text-text-secondary border-r border-border">{p.gstNo}</td>}
                  {visibleCols.includes("email")   && <td className="px-4 py-2.5 text-text-secondary border-r border-border max-w-[160px] truncate" title={p.email}>{p.email}</td>}
                  <td className="px-4 py-2.5 text-center">
                    <button onClick={() => handleSelect(p)} className="bg-brand-orange text-white text-xs font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors">Select</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-xs px-3 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setCurrentPage(pg)} className={`text-xs px-3 py-1 border rounded transition-colors ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border text-text-secondary hover:bg-surface-muted"}`}>{pg}</button>
            ))}
            {totalPages > 5 && <span className="text-xs text-text-muted px-1">…</span>}
            {totalPages > 5 && <button onClick={() => setCurrentPage(totalPages)} className={`text-xs px-3 py-1 border rounded transition-colors ${currentPage === totalPages ? "bg-brand-orange text-white border-brand-orange" : "border-border text-text-secondary hover:bg-surface-muted"}`}>{totalPages}</button>}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="text-xs px-3 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
