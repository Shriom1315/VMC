import { motion } from "motion/react";
import { useState } from "react";
import { ChevronDown, UserPlus, Search } from "lucide-react";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";

interface Party {
  id: number; name: string; address: string; contact: string; gstNo: string; email: string;
}

const INITIAL_PARTIES: Party[] = [
  { id: 12,  name: "ANWITA ENTERPRISES",                        address: "DR. J.J. MAGDUM HSG. SOC. PLOT NO. 37, MOUJE AGAR JAYSINGPUR, TAL. SHIROL, DIST- KOLHAPUR", contact: "7757865993", gstNo: "27APJPC2174D1Z8",  email: "-" },
  { id: 56,  name: "Sound Castings Pvt. Ltd. Unit-3",           address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.",        contact: "7744053500", gstNo: "27AACCS5263N1ZW", email: "pratiraj.patil@soundcastings.com" },
  { id: 105, name: "SHRI DATTA FOUNDERS AND ENGINEERS PVT.LTD.",address: "B-33, M.I.D.C. SHIROLI, KOLHAPUR-416122",                                                    contact: "9049879305", gstNo: "27AANCS0625R1ZM", email: "vishalpadalkar.sdf@gmail.com" },
  { id: 572, name: "ASHTVINAYAK ENGINEERS",                     address: "KUSHIRE",                                                                                      contact: "-",          gstNo: "-",              email: "-" },
  { id: 686, name: "SAMRUDDHI ENGINEERS",                       address: "Gat No. 522/1, Plot No. 2, Vijaynagar, Nerli, MIDC Gokul Shirgaon, Kolhapur- 416 234",        contact: "9890249086", gstNo: "27AKYPM5715A1ZY", email: "smruddhi.3@gmail.com" },
  { id: 843, name: "EAGAR STAR",                                address: "G-95, SHIROLI MIDC, KOLHAPUR",                                                                 contact: "-",          gstNo: "27AAJFE7714N1ZX", email: "-" },
  { id: 848, name: "Sound Castings Pvt. Ltd. Unit-3 (IFDC)",    address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.",        contact: "9970678872", gstNo: "27AACCS5263N1ZW", email: "Shekhar.Khot@soundcastings.com" },
  { id: 849, name: "QA SOUND CASTING PVT. LTD.",                address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.",        contact: "8805967627", gstNo: "27AACCS5263N1ZW", email: "paresh.bhagwat@soundcastings.com" },
  { id: 850, name: "AATHARV ENTERPRISES",                       address: "G-95, SHIROLI MIDC, KOLHAPUR",                                                                 contact: "8180909007", gstNo: "27EMHPP4751A1Z2",  email: "-" },
  { id: 859, name: "METACAST AUTO PRIVATE LIMITED",             address: "PLOT NO.T-26 KAGAL - HATKANANGALE FIVE STAR INDUSTRIAL AREA KOLHAPUR",                        contact: "-",          gstNo: "27AAQCM8947H1ZO", email: "-" },
];

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

  const [parties,     setParties]     = useState<Party[]>(INITIAL_PARTIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const resetForm = () => {
    setRegNo(""); setCompanyName(""); setContactPerson(""); setAddress("");
    setEmail(""); setContact(""); setGstNo(""); setEditingId(null);
  };

  const handleSave = () => {
    if (!companyName.trim()) return;
    if (editingId !== null) {
      setParties(parties.map(p => p.id === editingId ? { ...p, name: companyName, address, contact, gstNo, email } : p));
    } else {
      const newId = Math.max(...parties.map(p => p.id)) + 1;
      setParties([...parties, { id: newId, name: companyName, address, contact, gstNo, email }]);
    }
    resetForm();
  };

  const handleSelect = (p: Party) => {
    setEditingId(p.id); setCompanyName(p.name); setAddress(p.address);
    setContact(p.contact === "-" ? "" : p.contact);
    setGstNo(p.gstNo === "-" ? "" : p.gstNo);
    setEmail(p.email === "-" ? "" : p.email);
  };

  const handleDelete = () => {
    if (editingId !== null) setParties(parties.filter(p => p.id !== editingId));
    resetForm();
  };

  const filtered   = parties.filter(p => [p.name, p.address, p.gstNo, p.email].some(v => v.toLowerCase().includes(searchQuery.toLowerCase())));
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // ── Export config ──
  const PARTY_COLUMNS: ColumnDef[] = [
    { key: "id",      label: "ID" },
    { key: "name",    label: "Name" },
    { key: "address", label: "Address" },
    { key: "contact", label: "Contact" },
    { key: "gstNo",   label: "GST No" },
    { key: "email",   label: "Email" },
  ];
  const [visibleCols, setVisibleCols] = useState(PARTY_COLUMNS.map(c => c.key));
  const exportData = filtered.map(p => ({
    id: p.id, name: p.name, address: p.address,
    contact: p.contact, gstNo: p.gstNo, email: p.email,
  }));

  const fieldCls  = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const selectCls = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange appearance-none cursor-pointer";
  const labelCls  = "block text-xs font-medium text-text-secondary mb-1";

  const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Party Registration</h1>
        <p className="text-xs text-text-secondary mt-0.5">Manage client and party records</p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <UserPlus size={16} className="text-brand-orange" />
            {editingId !== null ? `Editing Party #${editingId}` : "New Party Entry"}
          </div>
          {editingId !== null && (
            <span className="text-xs bg-brand-orange-light text-brand-orange font-medium px-2 py-0.5 rounded-full">Editing</span>
          )}
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
          <button onClick={handleSave} className="bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Save
          </button>
          <button onClick={handleSave} disabled={editingId === null} className="border border-border text-text-primary text-xs font-medium px-4 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Update
          </button>
          <button onClick={handleDelete} disabled={editingId === null} className="border border-red-200 text-red-600 text-xs font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Delete
          </button>
          {editingId !== null && (
            <button onClick={resetForm} className="text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-2">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Party table card */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">All Parties</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 flex-wrap">
              <ExportToolbar
                data={exportData}
                columns={PARTY_COLUMNS}
                filename="party-registration"
                visibleColumns={visibleCols}
                onVisibilityChange={setVisibleCols}
              />
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="border border-border rounded-md text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-40"
                placeholder="Search..."
              />
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
                  return (
                    <th key={h} className={`px-4 py-2.5 text-xs font-medium text-text-secondary ${i < 6 ? "border-r border-border" : "text-center"}`}>
                      {h !== "Action" ? <span className="flex items-center gap-1">{h} <span className="text-text-muted">↕</span></span> : h}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-text-muted text-xs">No records found</td></tr>
              ) : (
                paginated.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-surface-subtle transition-colors ${editingId === p.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/50"}`}
                  >
                    <td className="px-4 py-2.5 font-mono text-text-secondary border-r border-border">{p.id}</td>
                    <td className="px-4 py-2.5 font-medium text-text-primary border-r border-border">{p.name}</td>
                    <td className="px-4 py-2.5 text-text-secondary border-r border-border max-w-xs truncate" title={p.address}>{p.address}</td>
                    <td className="px-4 py-2.5 font-mono text-text-secondary border-r border-border">{p.contact}</td>
                    <td className="px-4 py-2.5 font-mono text-text-secondary border-r border-border">{p.gstNo}</td>
                    <td className="px-4 py-2.5 text-text-secondary border-r border-border max-w-[160px] truncate" title={p.email}>{p.email}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button onClick={() => handleSelect(p)} className="bg-brand-orange text-white text-xs font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors">
                        Select
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-xs px-3 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setCurrentPage(pg)} className={`text-xs px-3 py-1 border rounded transition-colors ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border text-text-secondary hover:bg-surface-muted"}`}>
                {pg}
              </button>
            ))}
            {totalPages > 5 && <span className="text-xs text-text-muted px-1">…</span>}
            {totalPages > 5 && (
              <button onClick={() => setCurrentPage(totalPages)} className={`text-xs px-3 py-1 border rounded transition-colors ${currentPage === totalPages ? "bg-brand-orange text-white border-brand-orange" : "border-border text-text-secondary hover:bg-surface-muted"}`}>
                {totalPages}
              </button>
            )}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="text-xs px-3 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
