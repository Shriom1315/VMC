/**
 * InwardChallan — pure printable document component.
 * Rendered by MaterialInwardPage in "challan" view mode.
 * The parent provides the Back / Print toolbar (print:hidden).
 */

import { InwardBill, InwardItem } from "./types";

// ─── Lab firm details ─────────────────────────────────────────────────────────
const FIRM = {
  name:    "VIKRAMADITYA ENTERPRISES",
  address: "Plot No. 8, Shiroli MIDC, Kolhapur – 416 122.",
  phone:   "9423468456",
  web:     "www.vikramadityacalib.com",
  email:   "vikramadityacalib@gmail.com",
};

interface Props {
  bill:          InwardBill;
  items:         InwardItem[];
  clientAddress: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function padDoc(id: number) {
  return String(id).padStart(6, "0");
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function InwardChallan({ bill, items, clientAddress }: Props) {
  const docTitle = items.some(it =>
    it.process === "Repair" || it.process === "Repair & Calibration"
  ) ? "Issue For Repair" : "Inward Challan";

  const b = "1px solid #000";

  return (
    // On screen: centred with padding. On print: padding stripped by @page + CSS rule.
    <div
      data-challan="1"
      className="font-sans text-black bg-white"
      style={{ maxWidth: "210mm", margin: "0 auto", padding: "10mm 12mm", boxSizing: "border-box" }}
    >

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: b }}>
        <tbody>
          <tr>
            <td style={{ border: b, padding: "6px 8px", width: "62%", verticalAlign: "top" }}>
              <div style={{ fontWeight: 700, fontSize: "12px", textTransform: "uppercase" }}>{FIRM.name}</div>
              <div style={{ fontSize: "10px", marginTop: 2 }}>{FIRM.address}</div>
              <div style={{ fontSize: "10px", marginTop: 1 }}>{FIRM.phone}</div>
              <div style={{ fontSize: "10px", marginTop: 1 }}>Web : {FIRM.web}</div>
              <div style={{ fontSize: "10px", marginTop: 1 }}>Email : {FIRM.email}</div>
            </td>
            <td style={{ border: b, padding: "6px 8px", verticalAlign: "middle", textAlign: "center", fontWeight: 700, fontSize: "13px" }}>
              {docTitle}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── CONSIGNEE + META ───────────────────────────────────── */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: b, borderTop: "none" }}>
        <tbody>
          <tr>
            <td style={{ border: b, borderTop: "none", padding: "5px 8px", width: "50%", verticalAlign: "top", minHeight: "90px" }}>
              <div style={{ fontSize: "9px", color: "#666", marginBottom: 3 }}>Name &amp; Address Of Consignee</div>
              <div style={{ marginLeft: 6 }}>
                <div style={{ fontWeight: 700, fontSize: "11px" }}>{bill.clientName}</div>
                {clientAddress && (
                  <div style={{ fontSize: "10px", marginTop: 3, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                    {clientAddress}
                  </div>
                )}
              </div>
            </td>
            <td style={{ border: b, borderTop: "none", padding: "5px 8px", verticalAlign: "top" }}>
              <MetaRow label="Doc No."     value={padDoc(bill.id)} />
              <MetaRow label="Date"        value={fmtDate(bill.inwardDate)} />
              <MetaRow label="Transporter" value={bill.through} />
              <MetaRow label="Vehicle No." value={bill.modeOfCollection} />
              <MetaRow label="Exp. Date"   value={fmtDate(bill.commitDate)} />
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── ITEMS TABLE ────────────────────────────────────────── */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: b, borderTop: "none" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            {([
              { label: "Sr. No",          w: "7%",  align: "center" },
              { label: "Particulars",     w: "32%", align: "left"   },
              { label: "Sub Particulars", w: "30%", align: "left"   },
              { label: "Frequency",       w: "13%", align: "center" },
              { label: "Qty.",            w: "9%",  align: "center" },
              { label: "Unit",            w: "9%",  align: "left"   },
            ] as const).map(col => (
              <th key={col.label} style={{
                border: b, borderTop: "none", padding: "3px 6px",
                fontSize: "10px", textAlign: col.align, width: col.w, fontWeight: 600,
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ border: b, borderTop: "none", padding: "10px", textAlign: "center", fontSize: "10px", color: "#888" }}>
                No Items
              </td>
            </tr>
          ) : items.map((item, idx) => (
            <tr key={item.id}>
              <td style={{ border: b, borderTop: "none", padding: "2px 6px", fontSize: "10px", textAlign: "center" }}>{idx + 1}</td>
              <td style={{ border: b, borderTop: "none", padding: "2px 6px", fontSize: "10px", fontWeight: 500 }}>{item.gaugeName}</td>
              <td style={{ border: b, borderTop: "none", padding: "2px 6px", fontSize: "10px" }}>{item.identificationNo}</td>
              <td style={{ border: b, borderTop: "none", padding: "2px 6px", fontSize: "10px", textAlign: "center" }}>{item.calibFrequency}</td>
              <td style={{ border: b, borderTop: "none", padding: "2px 6px", fontSize: "10px", textAlign: "center" }}>1</td>
              <td style={{ border: b, borderTop: "none", padding: "2px 6px", fontSize: "10px" }}>{item.unit}</td>
            </tr>
          ))}
          {/* Remarks */}
          <tr>
            <td colSpan={6} style={{ border: b, borderTop: "none", padding: "3px 8px", fontSize: "10px", height: "22px" }}>
              <span style={{ color: "#777" }}>Remarks</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── TAX INFO ───────────────────────────────────────────── */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: b, borderTop: "none" }}>
        <tbody>
          <tr>
            <td style={{ border: b, borderTop: "none", padding: "5px 8px", width: "55%", fontSize: "10px" }}>
              <div style={{ display: "flex", gap: "24px" }}>
                <div>
                  <div>CST Tin No : {bill.billingFirm === "Vikramaditya Enterprises" ? "27110113911C" : "—"}</div>
                  <div style={{ marginTop: 2 }}>SST Tin No : {bill.billingFirm === "Vikramaditya Enterprises" ? "27110113911V" : "—"}</div>
                  <div style={{ marginTop: 2 }}>ECC No &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</div>
                </div>
                <div style={{ color: "#666", display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 2 }}>
                  <div>01/04/2006</div>
                  <div>01/04/2006</div>
                </div>
              </div>
            </td>
            <td style={{ border: b, borderTop: "none", padding: "5px 8px" }}>
              {/* signature space */}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── FOOTER SIGNATURES ──────────────────────────────────── */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: b, borderTop: "none" }}>
        <tbody>
          <tr>
            <td style={{ border: b, borderTop: "none", padding: "5px 8px", width: "28%", verticalAlign: "bottom", fontSize: "10px", color: "#555" }}>
              Subject To Kolhapur Jurisdiction
            </td>
            <td style={{ border: b, borderTop: "none", padding: "5px 8px", textAlign: "center", verticalAlign: "bottom" }}>
              <div style={{ height: "38px" }} />
              <div style={{ fontSize: "10px", borderTop: "1px solid #aaa", paddingTop: "3px" }}>Received By</div>
            </td>
            <td style={{ border: b, borderTop: "none", padding: "5px 8px", textAlign: "center", verticalAlign: "bottom" }}>
              <div style={{ height: "38px" }} />
              <div style={{ fontSize: "10px", borderTop: "1px solid #aaa", paddingTop: "3px" }}>Prepared By</div>
            </td>
            <td style={{ border: b, borderTop: "none", padding: "5px 8px", textAlign: "center", verticalAlign: "bottom" }}>
              <div style={{ height: "38px" }} />
              <div style={{ fontSize: "10px", borderTop: "1px solid #aaa", paddingTop: "3px" }}>Authorised Signature</div>
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  );
}

// ─── Meta row helper ─────────────────────────────────────────────────────────
function MetaRow({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ display: "flex", gap: "6px", marginBottom: "3px", fontSize: "10px" }}>
      <span style={{ width: "82px", flexShrink: 0, color: "#555" }}>{label}</span>
      <span style={{ color: "#555", flexShrink: 0 }}>:</span>
      <span style={{ fontWeight: 600 }}>{value || ""}</span>
    </div>
  );
}
