import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { Printer, FileDown, Plus, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const MOCK_CLIENTS: Record<string, any> = {
  "T-1000": { name: "CYBERDYNE SYSTEMS", address: "Tech Tower, Sector 7, Neo-Tokyo, Japan" },
  "W-40K":  { name: "ADEPTUS MECHANICUS", address: "Iron Temple, Forge World Mars, Sol System" },
  "ST-01":  { name: "STARFLEET COMMAND", address: "Presidio, San Francisco, United Earth" },
};

interface POItem {
  id: string;
  poCode: string;
  particular: string;
  category: string;
  size: string;
  qty: number;
  repair: number;
  calibration: number;
  discount: number;
}

export default function PurchaseOrderPage() {
  const [poNumber] = useState(`PO-${Math.floor(100000 + Math.random() * 900000)}`);
  const [poDate] = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [clientIdSearch, setClientIdSearch] = useState("");
  const [items, setItems] = useState<POItem[]>([
    { id: "1", poCode: "", particular: "", category: "", size: "", qty: 1, repair: 0, calibration: 0, discount: 0 },
  ]);

  const fetchClientDetails = () => {
    const data = MOCK_CLIENTS[clientIdSearch.toUpperCase()];
    if (data) {
      setCustomerName(data.name);
      setAddress(data.address);
    } else {
      alert("CLIENT NODE NOT FOUND IN REGISTRY");
    }
  };

  const addItem = () =>
    setItems([...items, { id: Date.now().toString(), poCode: "", particular: "", category: "", size: "", qty: 1, repair: 0, calibration: 0, discount: 0 }]);

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof POItem, value: any) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      if (["qty", "repair", "calibration", "discount"].includes(field)) {
        return { ...item, [field]: Math.max(0, parseFloat(value) || 0) };
      }
      return { ...item, [field]: value };
    }));
  };

  const calcRate = (item: POItem) => (item.repair + item.calibration) * (1 - item.discount / 100);
  const calcTotal = (item: POItem) => calcRate(item) * item.qty;

  const summary = useMemo(() =>
    items.reduce((acc, item) => ({ qty: acc.qty + item.qty, total: acc.total + calcTotal(item) }), { qty: 0, total: 0 }),
    [items]
  );

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Purchase Order", 105, 20, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`PO Number: ${poNumber}`, 20, 35);
    doc.text(`Date: ${poDate}`, 150, 35);
    doc.text(`Customer Name: ${customerName}`, 20, 45);
    doc.text(`Address: ${address}`, 20, 50);

    doc.autoTable({
      startY: 70,
      head: [["Code", "Particular", "Category", "Size", "Qty", "Repair", "Calib.", "Disc%", "Rate", "Total"]],
      body: items.map(item => [
        item.poCode, item.particular, item.category, item.size, item.qty,
        item.repair.toFixed(2), item.calibration.toFixed(2), `${item.discount}%`,
        calcRate(item).toFixed(2), calcTotal(item).toFixed(2),
      ]),
      theme: "grid",
      headStyles: { fillColor: [249, 115, 22] },
      styles: { fontSize: 8 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Quantity: ${summary.qty}`, 150, finalY);
    doc.text(`Total Amount: ${summary.total.toFixed(2)}`, 150, finalY + 5);
    doc.save(`${poNumber}.pdf`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 lg:p-10 print:p-0 max-w-[1400px] mx-auto w-full flex flex-col gap-6 font-sans">
      <div className="bg-white border border-gray-300 print:border-none shadow-sm print:shadow-none flex flex-col">

        {/* Print Header */}
        <div className="hidden print:flex flex-col items-center py-6 border-b-2 border-black mb-4">
          <h1 className="text-3xl font-black uppercase tracking-widest text-black text-center">Vikramaditya Precision</h1>
          <p className="text-sm font-medium text-black mt-1 text-center">123 Metrology Park, Neo-Tech Sector, Phase 4</p>
          <p className="text-xs font-mono text-black mt-1 text-center">Phone: +91 9876543210 | Email: contact@vikramaditya.com</p>
        </div>

        {/* Screen Header */}
        <div className="bg-gray-50 border-b border-gray-300 print:hidden p-5 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800">Purchase Order</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">INTERNAL_DOC // GENERATION_NODE</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
              <Printer size={14} /> Print
            </button>
            <button onClick={exportPDF} className="bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
              <FileDown size={14} /> Export PDF
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-8 print:p-0">
          {/* Header Data */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 block">Customer PO No</label>
                <input value={poNumber} readOnly className="w-full bg-gray-50 border border-gray-300 p-2 text-sm text-gray-600 cursor-not-allowed font-mono" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 block">PO Date</label>
                <input type="date" value={poDate} readOnly className="w-full bg-gray-50 border border-gray-300 p-2 text-sm text-gray-600 cursor-not-allowed font-mono" />
              </div>
            </div>
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 block">Customer Name</label>
                  <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-white border border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 text-black" placeholder="Enter customer name..." />
                </div>
                <div className="w-full md:w-48 print:hidden">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 block">Fetch By ID</label>
                  <div className="flex h-[38px]">
                    <input value={clientIdSearch} onChange={e => setClientIdSearch(e.target.value)} className="w-full bg-white border border-r-0 border-gray-300 p-2 text-sm focus:outline-none text-black font-mono" placeholder="ID..." />
                    <button onClick={fetchClientDetails} className="bg-gray-800 text-white px-3 font-bold text-xs uppercase tracking-widest hover:bg-gray-700 transition-colors flex-1">
                      Sync
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 block">Customer Address</label>
                <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} className="w-full bg-white border border-gray-300 p-2 text-sm focus:outline-none text-black" placeholder="Client location details..." />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-4">
            <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-4 print:hidden">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Item Matrix</h3>
              <button onClick={addItem} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase">
                <Plus size={14} /> Add Row
              </button>
            </div>
            <div className="border border-gray-300 print:border-none overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[1000px] print:min-w-full">
                <thead className="bg-gray-100 border-b border-gray-300 text-gray-700">
                  <tr>
                    <th className="p-3 font-bold border-r border-gray-300 w-24">Code</th>
                    <th className="p-3 font-bold border-r border-gray-300">Particular</th>
                    <th className="p-3 font-bold border-r border-gray-300 w-28">Category</th>
                    <th className="p-3 font-bold border-r border-gray-300 w-24">Size</th>
                    <th className="p-3 font-bold border-r border-gray-300 w-16 text-right">Qty</th>
                    <th className="p-3 font-bold border-r border-gray-300 w-24 text-right">Repair</th>
                    <th className="p-3 font-bold border-r border-gray-300 w-24 text-right">Calib.</th>
                    <th className="p-3 font-bold border-r border-gray-300 w-16 text-right">Disc %</th>
                    <th className="p-3 font-bold border-r border-gray-300 w-24 text-right">Rate (₹)</th>
                    <th className="p-3 font-bold border-r border-gray-300 w-24 text-right">Total (₹)</th>
                    <th className="p-3 w-10 print:hidden" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map(item => (
                    <tr key={item.id} className="group hover:bg-gray-50 text-gray-800">
                      <td className="p-0 border-r border-gray-300"><input value={item.poCode} onChange={e => updateItem(item.id, "poCode", e.target.value)} className="w-full p-2.5 bg-transparent focus:bg-blue-50 focus:outline-none font-mono text-xs text-black" /></td>
                      <td className="p-0 border-r border-gray-300"><input value={item.particular} onChange={e => updateItem(item.id, "particular", e.target.value)} className="w-full p-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-black" /></td>
                      <td className="p-0 border-r border-gray-300"><input value={item.category} onChange={e => updateItem(item.id, "category", e.target.value)} className="w-full p-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-black" /></td>
                      <td className="p-0 border-r border-gray-300"><input value={item.size} onChange={e => updateItem(item.id, "size", e.target.value)} className="w-full p-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-black" /></td>
                      <td className="p-0 border-r border-gray-300"><input type="number" min="1" value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)} className="w-full p-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-black" /></td>
                      <td className="p-0 border-r border-gray-300"><input type="number" min="0" value={item.repair} onChange={e => updateItem(item.id, "repair", e.target.value)} className="w-full p-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-black" /></td>
                      <td className="p-0 border-r border-gray-300"><input type="number" min="0" value={item.calibration} onChange={e => updateItem(item.id, "calibration", e.target.value)} className="w-full p-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-black" /></td>
                      <td className="p-0 border-r border-gray-300"><input type="number" min="0" value={item.discount} onChange={e => updateItem(item.id, "discount", e.target.value)} className="w-full p-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-black" /></td>
                      <td className="p-2.5 text-right font-mono font-semibold bg-gray-50 border-r border-gray-300 text-gray-600">{calcRate(item).toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono font-bold bg-gray-50 border-r border-gray-300 text-black">{calcTotal(item).toFixed(2)}</td>
                      <td className="p-2 text-center text-gray-400 print:hidden">
                        <button onClick={() => removeItem(item.id)} className="hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 border-t border-gray-300 text-gray-800">
                  <tr>
                    <td colSpan={4} className="p-3 text-right font-bold uppercase tracking-widest border-r border-gray-300 pr-4">Totals</td>
                    <td className="p-3 text-right font-mono font-bold text-black border-r border-gray-300 text-base">{summary.qty}</td>
                    <td colSpan={4} className="border-r border-gray-300" />
                    <td className="p-3 text-right font-mono font-bold text-black text-lg">{summary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="print:hidden" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex justify-end pt-2 print:hidden">
            <p className="text-xs font-mono text-gray-400">AUTO_CALC_ENABLED // VERIFIED_PARAMETERS</p>
          </div>

          {/* Print Footer */}
          <div className="hidden print:flex flex-row justify-between items-end mt-24 pt-8">
            <div className="text-center">
              <div className="w-48 border-b-2 border-black mb-2 mx-auto" />
              <p className="font-bold text-xs uppercase tracking-widest text-black">Prepared By</p>
            </div>
            <div className="text-center">
              <div className="w-48 border-b-2 border-black mb-2 mx-auto" />
              <p className="font-bold text-xs uppercase tracking-widest text-black">Authorized Signatory &amp; Stamp</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
