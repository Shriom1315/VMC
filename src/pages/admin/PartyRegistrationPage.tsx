import { motion } from "motion/react";
import { useState } from "react";
import { ChevronDown, UserPlus, Search } from "lucide-react";

interface Party {
  id: number;
  name: string;
  address: string;
  contact: string;
  gstNo: string;
  email: string;
}

const INITIAL_PARTIES: Party[] = [
  { id: 12,  name: "ANWITA ENTERPRISES",                       address: "DR. J.J. MAGDUM HSG. SOC. PLOT NO. 37, MOUJE AGAR JAYSINGPUR, TAL. SHIROL, DIST- KOLHAPUR", contact: "7757865993", gstNo: "27APJPC2174D1Z8",  email: "-" },
  { id: 56,  name: "Sound Castings Pvt. Ltd. Unit-3",          address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.",        contact: "7744053500", gstNo: "27AACCS5263N1ZW", email: "pratiraj.patil@soundcastings.com" },
  { id: 105, name: "SHRI DATTA FOUNDERS AND ENGINEERS PVT.LTD.", address: "B-33, M.I.D.C. SHIROLI, KOLHAPUR-416122",                                                  contact: "9049879305", gstNo: "27AANCS0625R1ZM", email: "vishalpadalkar.sdf@gmail.com" },
  { id: 572, name: "ASHTVINAYAK ENGINEERS",                    address: "KUSHIRE",                                                                                      contact: "-",          gstNo: "-",              email: "-" },
  { id: 686, name: "SAMRUDDHI ENGINEERS",                      address: "Gat No. 522/1, Plot No. 2, Vijaynagar, Nerli, MIDC Gokul Shirgaon, Kolhapur- 416 234",        contact: "9890249086", gstNo: "27AKYPM5715A1ZY", email: "smruddhi.3@gmail.com" },
  { id: 843, name: "EAGAR STAR",                               address: "G-95, SHIROLI MIDC, KOLHAPUR",                                                                 contact: "-",          gstNo: "27AAJFE7714N1ZX", email: "-" },
  { id: 848, name: "Sound Castings Pvt. Ltd. Unit-3 (IFDC)",   address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.",        contact: "9970678872", gstNo: "27AACCS5263N1ZW", email: "Shekhar.Khot@soundcastings.com" },
  { id: 849, name: "QA SOUND CASTING PVT. LTD.",               address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.",        contact: "8805967627", gstNo: "27AACCS5263N1ZW", email: "paresh.bhagwat@soundcastings.com" },
  { id: 850, name: "AATHARV ENTERPRISES",                      address: "G-95, SHIROLI MIDC, KOLHAPUR",                                                                 contact: "8180909007", gstNo: "27EMHPP4751A1Z2",  email: "-" },
  { id: 859, name: "METACAST AUTO PRIVATE LIMITED",            address: "PLOT NO.T-26 KAGAL - HATKANANGALE FIVE STAR INDUSTRIAL AREA KOLHAPUR",                        contact: "-",          gstNo: "27AAQCM8947H1ZO", email: "-" },
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
      setParties(parties.map(p =>
        p.id === editingId ? { ...p, name: companyName, address, contact, gstNo, email } : p
      ));
    } else {
      const newId = Math.max(...parties.map(p => p.id)) + 1;
      setParties([...parties, { id: newId, name: companyName, address, contact, gstNo, email }]);
    }
    resetForm();
  };

  const handleSelect = (p: Party) => {
    setEditingId(p.id);
    setCompanyName(p.name);
    setAddress(p.address);
    setContact(p.contact === "-" ? "" : p.contact);
    setGstNo(p.gstNo === "-" ? "" : p.gstNo);
    setEmail(p.email === "-" ? "" : p.email);
  };

  const handleDelete = () => {
    if (editingId !== null) setParties(parties.filter(p => p.id !== editingId));
    resetForm();
  };

  const filtered = parties.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.gstNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const fieldCls  = "w-full bg-white border border-gray-300 text-black text-xs px-2 py-1.5 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors";
  const selectCls = "w-full bg-white border border-gray-300 text-black text-xs px-2 py-1.5 focus:outline-none focus:border-brand-orange appearance-none cursor-pointer";
  const labelCls  = "block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1";

  const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)} className={selectCls}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-black uppercase tracking-tight text-black">Party Registration</h1>
          <p className="font-mono text-[10px] text-gray-400 mt-0.5">BASIC_REG // PARTY_NODE</p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-gray-400">
          <span>ADMIN</span><span className="text-gray-300">/</span>
          <span>BASIC REGISTRATION</span><span className="text-gray-300">/</span>
          <span className="text-brand-orange font-bold">PARTY</span>
        </div>
      </div>

      {/* Form Panel */}
      <div className="bg-white border-2 border-black shadow-sm">
        <div className="bg-black text-white px-4 py-2 flex items-center justify-between">
          <span className="font-display font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <UserPlus size={13} /> Enter Party Details
          </span>
          <span className="font-mono text-[10px] text-gray-400">
            {editingId !== null ? `EDITING ID: ${editingId}` : "NEW ENTRY"}
          </span>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label className={labelCls}>Reg. No</label>
            <input value={regNo} onChange={e => setRegNo(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Company Name</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Person</label>
            <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Contact</label>
            <input value={contact} onChange={e => setContact(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>GST No</label>
            <input value={gstNo} onChange={e => setGstNo(e.target.value)} className={fieldCls} />
          </div>
          <SelectField label="GST Type" value={gstType} onChange={setGstType} options={["CGST/SGST", "IGST", "Exempt"]} />
          <SelectField label="Other Access to" value={otherAccess} onChange={setOtherAccess} options={["No", "Yes"]} />
          <SelectField label="Billing Rate Type" value={billingRateType} onChange={setBillingRateType} options={["Fixed Discount %", "Custom Rate", "Standard Rate"]} />
          <div>
            <label className={labelCls}>Discount Rate (%)</label>
            <input type="number" value={discountRate} onChange={e => setDiscountRate(e.target.value)} className={fieldCls} />
          </div>
          <SelectField label="Collaboration Method to be used" value={collabMethod} onChange={setCollabMethod} options={["Lab Method", "Customer Method"]} />
          <SelectField label="Method of Reporting" value={reportingMethod} onChange={setReportingMethod} options={["Lab Format", "Customer Format"]} />
          <SelectField label="Method of Collation" value={collationMethod} onChange={setCollationMethod} options={["By Hand", "Digital"]} />
          <SelectField label="Method of Dispatch" value={dispatchMethod} onChange={setDispatchMethod} options={["By Hand", "Courier", "Email"]} />
          <SelectField label="Compliance Statement" value={compliance} onChange={setCompliance} options={["Required", "Not Required"]} />
          <SelectField label="If yes Decision Rule is discussed, understand & acceptable or not" value={decisionRule} onChange={setDecisionRule} options={["Yes", "No"]} />
          <SelectField label="Billing Firm" value={billingFirm} onChange={setBillingFirm} options={["Vikramaditya Calibration", "Vikramaditya Enterprises"]} />
        </div>

        <div className="px-5 pb-5 flex items-center gap-2 border-t border-gray-100 pt-4">
          <button onClick={handleSave} className="bg-brand-orange text-white font-mono text-xs font-bold px-5 py-2 border-2 border-brand-orange hover:bg-black transition-all uppercase tracking-widest">
            Save
          </button>
          <button onClick={handleSave} disabled={editingId === null} className="bg-white text-black font-mono text-xs font-bold px-5 py-2 border-2 border-black hover:bg-gray-100 transition-all uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed">
            Update
          </button>
          <button onClick={handleDelete} disabled={editingId === null} className="bg-white text-red-600 font-mono text-xs font-bold px-5 py-2 border-2 border-red-300 hover:bg-red-50 transition-all uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed">
            Delete
          </button>
          {editingId !== null && (
            <button onClick={resetForm} className="bg-white text-gray-500 font-mono text-xs px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-all uppercase tracking-widest">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Party Table */}
      <div className="bg-white border-2 border-black shadow-sm">
        <div className="bg-black text-white px-4 py-2 flex items-center justify-between">
          <span className="font-display font-bold text-xs uppercase tracking-widest">Total Party</span>
          <span className="font-mono text-[10px] text-gray-400">{filtered.length} RECORDS</span>
        </div>

        <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {["Copy", "CSV", "Excel", "PDF", "Print"].map(btn => (
              <button key={btn} className="font-mono text-[10px] font-bold uppercase px-3 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-black transition-all">
                {btn}
              </button>
            ))}
            <button className="font-mono text-[10px] font-bold uppercase px-3 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-black transition-all flex items-center gap-1">
              Column Visibility <ChevronDown size={10} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-gray-500 uppercase">Search:</span>
            <div className="relative">
              <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="border border-gray-300 text-xs pl-6 pr-3 py-1 focus:outline-none focus:border-brand-orange w-44"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b-2 border-black bg-gray-50">
                <th className="px-3 py-2 font-bold uppercase tracking-wider text-gray-700 border-r border-gray-200 w-14">
                  <span className="flex items-center gap-1">Id <span className="text-gray-400 font-normal">↕</span></span>
                </th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider text-gray-700 border-r border-gray-200 w-52">
                  <span className="flex items-center gap-1">Name <span className="text-gray-400 font-normal">↕</span></span>
                </th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider text-gray-700 border-r border-gray-200">
                  <span className="flex items-center gap-1">Address <span className="text-gray-400 font-normal">↕</span></span>
                </th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider text-gray-700 border-r border-gray-200 w-28">
                  <span className="flex items-center gap-1">Contact <span className="text-gray-400 font-normal">↕</span></span>
                </th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider text-gray-700 border-r border-gray-200 w-36">
                  <span className="flex items-center gap-1">GST No <span className="text-gray-400 font-normal">↕</span></span>
                </th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider text-gray-700 border-r border-gray-200">
                  <span className="flex items-center gap-1">Email <span className="text-gray-400 font-normal">↕</span></span>
                </th>
                <th className="px-3 py-2 font-bold uppercase tracking-wider text-gray-700 w-20 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 font-mono text-xs">NO_RECORDS_FOUND</td>
                </tr>
              ) : (
                paginated.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-100 hover:bg-orange-50 transition-colors ${
                      editingId === p.id ? "bg-orange-50 border-l-2 border-l-brand-orange" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="px-3 py-2 font-mono text-gray-500 border-r border-gray-100">{p.id}</td>
                    <td className="px-3 py-2 font-bold text-black border-r border-gray-100">{p.name}</td>
                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 max-w-xs truncate" title={p.address}>{p.address}</td>
                    <td className="px-3 py-2 font-mono text-gray-600 border-r border-gray-100">{p.contact}</td>
                    <td className="px-3 py-2 font-mono text-gray-600 border-r border-gray-100">{p.gstNo}</td>
                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 max-w-[180px] truncate" title={p.email}>{p.email}</td>
                    <td className="px-3 py-2 text-center">
                      <button onClick={() => handleSelect(p)} className="bg-brand-orange text-white font-mono text-[10px] font-bold px-3 py-1 hover:bg-black transition-all uppercase">
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
        <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-gray-500">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="font-mono text-[10px] px-3 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setCurrentPage(pg)} className={`font-mono text-[10px] px-3 py-1 border transition-all ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                {pg}
              </button>
            ))}
            {totalPages > 5 && <span className="font-mono text-[10px] text-gray-400 px-1">...</span>}
            {totalPages > 5 && (
              <button onClick={() => setCurrentPage(totalPages)} className={`font-mono text-[10px] px-3 py-1 border transition-all ${currentPage === totalPages ? "bg-brand-orange text-white border-brand-orange" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                {totalPages}
              </button>
            )}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="font-mono text-[10px] px-3 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
