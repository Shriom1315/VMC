import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Search, Truck } from "lucide-react";
import { useAuth, can } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

interface DispatchEntry {
  id: string;
  jobId: string;
  party: string;
  instruments: string;
  dcNo: string;
  dispatchDate: string;
  courier: string;
  trackingNo: string;
  receivedBy: string;
  status: "pending" | "dispatched" | "delivered";
}

const STATUS_COLOR = {
  pending:    "bg-amber-100 text-amber-700",
  dispatched: "bg-blue-100 text-blue-700",
  delivered:  "bg-green-100 text-green-700",
};

export default function DispatchPage() {
  const { user } = useAuth();
  const role = user?.role ?? "staff";
  const canCreate = can(role, "dispatch:create");
  const canEdit   = can(role, "dispatch:write");

  const [dispatches, setDispatches] = useState<DispatchEntry[]>([]);
  const [search,     setSearch]     = useState("");
  const [showForm,   setShowForm]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  // New dispatch form state
  const [jobId,        setJobId]        = useState("");
  const [party,        setParty]        = useState("");
  const [instruments,  setInstruments]  = useState("");
  const [dcNo,         setDcNo]         = useState("");
  const [dispatchDate, setDispatchDate] = useState(new Date().toISOString().split("T")[0]);
  const [courier,      setCourier]      = useState("By Hand");
  const [trackingNo,   setTrackingNo]   = useState("");
  const [receivedBy,   setReceivedBy]   = useState("");

  const fetchDispatches = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("dispatches")
      .select("*")
      .order("dispatch_date", { ascending: false });
    if (err) {
      setError(err.message);
    } else {
      setDispatches(
        (data ?? []).map((r: any) => ({
          id:           String(r.id),
          jobId:        r.job_id ?? "",
          party:        r.party ?? "",
          instruments:  r.instruments ?? "",
          dcNo:         r.dc_no ?? "",
          dispatchDate: r.dispatch_date ?? "",
          courier:      r.courier ?? "",
          trackingNo:   r.tracking_no ?? "",
          receivedBy:   r.received_by ?? "",
          status:       r.status ?? "pending",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchDispatches(); }, []);

  const filtered = dispatches.filter(d =>
    [d.id, d.party, d.instruments, d.dcNo].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async () => {
    if (!jobId || !party) return;
    const { error: err } = await supabase.from("dispatches").insert({
      job_id:        jobId,
      party,
      instruments,
      dc_no:         dcNo,
      dispatch_date: dispatchDate,
      courier,
      tracking_no:   trackingNo,
      received_by:   receivedBy,
      status:        "dispatched",
    });
    if (err) { setError(err.message); return; }
    setShowForm(false);
    setJobId(""); setParty(""); setInstruments(""); setTrackingNo(""); setReceivedBy("");
    fetchDispatches();
  };

  const inputCls = "w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const labelCls = "block text-xs font-medium text-text-secondary mb-1";

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Dispatch</h1>
          <p className="text-xs text-text-secondary mt-0.5">Record outgoing instrument dispatches to clients</p>
        </div>
        {canCreate && (
          <button onClick={() => setShowForm(v => !v)}
            className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            <Plus size={13} /> New Dispatch
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5 mb-4">{error}</div>}

      {/* New dispatch form */}
      {showForm && canCreate && (
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
              <Truck size={16} className="text-brand-orange" /> New Dispatch Entry
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div><label className={labelCls}>Job ID</label><input value={jobId} onChange={e => setJobId(e.target.value)} className={inputCls} placeholder="JOB-003" /></div>
            <div><label className={labelCls}>Party / Client</label><input value={party} onChange={e => setParty(e.target.value)} className={inputCls} placeholder="Client name" /></div>
            <div><label className={labelCls}>Instruments</label><input value={instruments} onChange={e => setInstruments(e.target.value)} className={inputCls} placeholder="Instrument name (serial no.)" /></div>
            <div><label className={labelCls}>DC No.</label><input value={dcNo} onChange={e => setDcNo(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Dispatch Date</label><input type="date" value={dispatchDate} onChange={e => setDispatchDate(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Courier / Mode</label>
              <select value={courier} onChange={e => setCourier(e.target.value)} className={inputCls}>
                {["By Hand","DTDC","Blue Dart","Delhivery","Speed Post","Other"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className={labelCls}>Tracking No.</label><input value={trackingNo} onChange={e => setTrackingNo(e.target.value)} className={inputCls} placeholder="Optional" /></div>
            <div><label className={labelCls}>Received By</label><input value={receivedBy} onChange={e => setReceivedBy(e.target.value)} className={inputCls} placeholder="Name of person who received" /></div>
          </div>
          <div className="px-5 pb-5 flex gap-2 border-t border-border pt-4">
            <button onClick={handleCreate} className="bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">Save Dispatch</button>
            <button onClick={() => setShowForm(false)} className="border border-border text-text-secondary text-xs font-medium px-4 py-2 rounded-lg hover:bg-surface-muted transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Dispatch Records</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="border border-border rounded-md text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44"
              placeholder="Search..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                {["DC No.","Job ID","Party","Instruments","Date","Courier","Tracking","Received By","Status"].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-text-muted">No dispatch records found</td></tr>
              ) : filtered.map(d => (
                <tr key={d.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{d.dcNo}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{d.jobId}</td>
                  <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{d.party}</td>
                  <td className="px-4 py-3 text-text-secondary border-r border-border max-w-[180px] truncate">{d.instruments}</td>
                  <td className="px-4 py-3 text-text-secondary border-r border-border">{d.dispatchDate}</td>
                  <td className="px-4 py-3 text-text-secondary border-r border-border">{d.courier}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{d.trackingNo || "—"}</td>
                  <td className="px-4 py-3 text-text-secondary border-r border-border">{d.receivedBy || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[d.status]}`}>
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
