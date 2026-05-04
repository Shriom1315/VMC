import { motion } from "motion/react";
import { useState } from "react";
import { Printer, FileDown, Plus, Trash2 } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function QuotationPage() {
  const [quotationNo, setQuotationNo] = useState(
    `VE-${Math.floor(2000 + Math.random() * 1000)}-${new Date().getFullYear().toString().slice(-2)}`
  );
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [clientDate, setClientDate] = useState(new Date().toISOString().split("T")[0]);
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientGSTIN, setClientGSTIN] = useState("");
  const [kindAttn, setKindAttn] = useState("");
  const [clientDCNo, setClientDCNo] = useState("");
  const [poNo, setPoNo] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);

  const [items, setItems] = useState([
    { id: 1, desc: "", identification: "", size: "", hsn: "", repair: 0, calib: 0, qty: 1 },
  ]);

  const addItem = () =>
    setItems([...items, { id: Date.now(), desc: "", identification: "", size: "", hsn: "", repair: 0, calib: 0, qty: 1 }]);

  const updateItem = (id: number, field: string, value: any) =>
    setItems(items.map(i => (i.id === id ? { ...i, [field]: value } : i)));

  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter(i => i.id !== id));
  };

  const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const baseTotal = items.reduce((sum, item) => sum + (Number(item.repair) + Number(item.calib)) * Number(item.qty), 0);
  const discountAmount = baseTotal * (discountPercent / 100);
  const netTotal = baseTotal - discountAmount;
  const roundedTotal = Math.round(netTotal);

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }) as any;
    const pageW = 210;
    const marginL = 10;
    const marginR = 10;
    const contentW = pageW - marginL - marginR;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("VIKRAMADITYA ENTERPRISES.", pageW / 2, 14, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Office : A/P Male, Tal. Panhala, Dist. Kolhapur 416122", pageW / 2, 19, { align: "center" });
    doc.text("Contact No -9503601616  Email- kiranpatil24586@gmail.com", pageW / 2, 23, { align: "center" });

    doc.setFillColor(255, 255, 255);
    doc.rect(marginL, 25, contentW, 8, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Quotation", pageW / 2, 31, { align: "center" });

    const infoY = 33;
    const leftW = contentW * 0.5;
    const rightW = contentW * 0.5;
    const rowH = 7;

    doc.rect(marginL, infoY, contentW, rowH * 4, "S");
    doc.line(marginL + leftW, infoY, marginL + leftW, infoY + rowH * 4);
    doc.line(marginL, infoY + rowH, marginL + leftW, infoY + rowH);
    doc.line(marginL, infoY + rowH * 2, marginL + leftW, infoY + rowH * 2);
    doc.line(marginL, infoY + rowH * 3, marginL + leftW, infoY + rowH * 3);
    doc.line(marginL + leftW, infoY + rowH, marginL + contentW, infoY + rowH);
    doc.line(marginL + leftW, infoY + rowH * 2, marginL + contentW, infoY + rowH * 2);
    doc.line(marginL + leftW, infoY + rowH * 3, marginL + contentW, infoY + rowH * 3);
    const rightMid = marginL + leftW + rightW * 0.5;
    doc.line(rightMid, infoY, rightMid, infoY + rowH * 2);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`M/S- ${clientName}`, marginL + 2, infoY + 5);
    doc.text(clientAddress, marginL + 2, infoY + rowH + 5);
    doc.text(`GSTIN No- ${clientGSTIN}`, marginL + 2, infoY + rowH * 2 + 5);
    doc.text(`Kind Attn. ${kindAttn}`, marginL + 2, infoY + rowH * 3 + 5);
    doc.text(`Quotation No- ${quotationNo}`, marginL + leftW + 2, infoY + 5);
    doc.text(`Date- ${date}`, rightMid + 2, infoY + 5);
    doc.text(`Client DC No- ${clientDCNo}`, marginL + leftW + 2, infoY + rowH + 5);
    doc.text(`DATE- ${clientDate}`, rightMid + 2, infoY + rowH + 5);
    doc.text(`PO NO :- ${poNo}`, marginL + leftW + 2, infoY + rowH * 2 + 5);

    const tableStartY = infoY + rowH * 4;
    const tableData = items.map((item, idx) => [
      idx + 1, item.desc, item.identification, item.size, item.hsn,
      Number(item.repair).toFixed(2), Number(item.calib).toFixed(2), item.qty,
      ((Number(item.repair) + Number(item.calib)) * Number(item.qty)).toFixed(2),
    ]);
    while (tableData.length < 15) tableData.push(["", "", "", "", "", "", "", "", ""]);

    doc.autoTable({
      startY: tableStartY,
      head: [["Sr. No", "Description", "Identification", "Size/Range/LC", "HSN", "Repair", "Calibration", "Qty", "Amount"]],
      body: tableData,
      theme: "grid",
      margin: { left: marginL, right: marginR },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: "bold", lineWidth: 0.3, lineColor: [0, 0, 0], halign: "center", fontSize: 7, cellPadding: 2 },
      bodyStyles: { fontSize: 7, textColor: [0, 0, 0], lineWidth: 0.3, lineColor: [0, 0, 0], cellPadding: 2, minCellHeight: 6 },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 }, 1: { halign: "left", cellWidth: 40 },
        2: { halign: "center", cellWidth: 28 }, 3: { halign: "center", cellWidth: 22 },
        4: { halign: "center", cellWidth: 16 }, 5: { halign: "right", cellWidth: 18 },
        6: { halign: "right", cellWidth: 20 },  7: { halign: "center", cellWidth: 10 },
        8: { halign: "right", cellWidth: 24 },
      },
    });

    const afterTableY = doc.lastAutoTable.finalY;
    const footerH = 36;
    const footerY = afterTableY;
    const totalsW = 60;
    const termsW = contentW - totalsW;

    doc.rect(marginL, footerY, contentW, footerH, "S");
    doc.line(marginL + termsW, footerY, marginL + termsW, footerY + footerH);

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "italic");
    const termsText = "Servicing, Contact point, Bush fitting, Spring, Roller Set, Rachet, Carbid pin, Cam, Oring, Bezal, Scal, Glass, Gear, Rack, Zebra connector, Lock Ball.";
    doc.text(doc.splitTextToSize(termsText, termsW - 4), marginL + 2, footerY + 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("Terms & Conditions", marginL + 2, footerY + 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("Discount 15 %", marginL + 2, footerY + 20);
    doc.text("Validity :- 30 Days from date of our quotation", marginL + 2, footerY + 24);
    doc.text("Delivery :- 8 to 10 Day", marginL + 2, footerY + 28);
    doc.text("GST :-Extra as applicable 18%", marginL + 2, footerY + 32);
    doc.text("Payment :- Against Delivery", marginL + 2, footerY + 36);

    const totalsX = marginL + termsW;
    const totRowH = 9;
    doc.line(totalsX, footerY + totRowH, marginL + contentW, footerY + totRowH);
    doc.line(totalsX, footerY + totRowH * 2, marginL + contentW, footerY + totRowH * 2);
    doc.line(totalsX, footerY + totRowH * 3, marginL + contentW, footerY + totRowH * 3);
    const totLabelW = 28;
    doc.line(totalsX + totLabelW, footerY, totalsX + totLabelW, footerY + footerH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    [
      { label: "Total Qty.", value: String(totalQty) },
      { label: `Discount ${discountPercent} %`, value: discountAmount.toFixed(2) },
      { label: "Total", value: netTotal.toFixed(2) },
      { label: "R/O Amount", value: String(roundedTotal) },
    ].forEach((row, i) => {
      const rowY = footerY + totRowH * i + 6;
      doc.text(row.label, totalsX + 2, rowY);
      doc.text(row.value, marginL + contentW - 2, rowY, { align: "right" });
    });

    const sigY = footerY + footerH + 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Yours Faithfully", marginL + contentW, sigY, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text("VIKRAMADITYA ENTERPRISES", marginL + contentW, sigY + 6, { align: "right" });

    doc.save(`Quotation_${quotationNo}.pdf`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 lg:p-10 print:p-0 max-w-[1400px] mx-auto w-full flex flex-col gap-6 font-sans">
      <div className="bg-white border border-gray-300 print:border-none shadow-sm print:shadow-none flex flex-col">

        {/* Print Header */}
        <div className="hidden print:block border-2 border-black border-b-0">
          <div className="text-center py-2">
            <h1 className="text-[18pt] font-black uppercase text-black tracking-tight leading-tight">VIKRAMADITYA ENTERPRISES.</h1>
            <p className="text-[7.5pt] text-black">Office : A/P Male, Tal. Panhala, Dist. Kolhapur 416122</p>
            <p className="text-[7.5pt] text-black">Contact No -9503601616 &nbsp; Email- kiranpatil24586@gmail.com</p>
          </div>
          <div className="border-t-2 border-black text-center py-1">
            <h2 className="text-[11pt] font-bold uppercase text-black">Quotation</h2>
          </div>
        </div>

        {/* Screen Header */}
        <div className="bg-gray-50 border-b border-gray-300 print:hidden p-5 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-black">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800 flex items-center gap-2">
              <FileDown className="text-blue-600" size={20} /> Quotation Generator
            </h2>
            <p className="text-xs text-gray-500 font-mono mt-1">VE_CORE // QUOTATION_NODE_V2</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
              <Printer size={14} /> Print
            </button>
            <button onClick={exportPDF} className="bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
              Export PDF
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col print:p-0">
          {/* Client Info */}
          <div className="border-2 border-black">
            <div className="border-b-2 border-black px-2 py-1">
              <span className="text-[9px] font-bold text-gray-500 uppercase print:text-black">M/S-</span>
              <input value={clientName} onChange={e => setClientName(e.target.value)} className="w-full font-bold text-sm outline-none border-none bg-transparent text-black mt-0.5" placeholder="CLIENT NAME PVT LTD" />
            </div>
            <div className="border-b-2 border-black px-2 py-1">
              <input value={clientAddress} onChange={e => setClientAddress(e.target.value)} className="w-full text-xs outline-none border-none bg-transparent text-black" placeholder="CLIENT FULL ADDRESS, CITY - PIN" />
            </div>
            <div className="border-b-2 border-black px-2 py-1 flex items-center gap-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase print:text-black whitespace-nowrap">GSTIN No-</span>
              <input value={clientGSTIN} onChange={e => setClientGSTIN(e.target.value)} className="flex-1 font-bold text-sm outline-none border-none bg-transparent text-black" placeholder="27AAACE..." />
            </div>
            <div className="border-b-2 border-black px-2 py-1 flex items-center gap-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase print:text-black whitespace-nowrap">Kind Attn.</span>
              <input value={kindAttn} onChange={e => setKindAttn(e.target.value)} className="flex-1 font-bold text-sm outline-none border-none bg-transparent text-black" placeholder="Mr. Contact Person" />
            </div>
            <div className="border-b-2 border-black grid grid-cols-2">
              <div className="border-r-2 border-black px-2 py-1">
                <div className="text-[9px] font-bold text-gray-500 uppercase print:text-black">Quotation No-</div>
                <input value={quotationNo} onChange={e => setQuotationNo(e.target.value)} className="w-full font-bold text-sm outline-none border-none bg-transparent text-black" />
              </div>
              <div className="px-2 py-1">
                <div className="text-[9px] font-bold text-gray-500 uppercase print:text-black">Date-</div>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full font-bold text-sm outline-none border-none bg-transparent text-black" />
              </div>
            </div>
            <div className="border-b-2 border-black grid grid-cols-2">
              <div className="border-r-2 border-black px-2 py-1">
                <div className="text-[9px] font-bold text-gray-500 uppercase print:text-black">Client DC No-</div>
                <input value={clientDCNo} onChange={e => setClientDCNo(e.target.value)} className="w-full font-bold text-sm outline-none border-none bg-transparent text-black" placeholder="040007" />
              </div>
              <div className="px-2 py-1">
                <div className="text-[9px] font-bold text-gray-500 uppercase print:text-black">DATE-</div>
                <input type="date" value={clientDate} onChange={e => setClientDate(e.target.value)} className="w-full font-bold text-sm outline-none border-none bg-transparent text-black" />
              </div>
            </div>
            <div className="px-2 py-1 flex items-center gap-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase print:text-black whitespace-nowrap">PO NO :-</span>
              <input value={poNo} onChange={e => setPoNo(e.target.value)} className="flex-1 font-bold text-sm outline-none border-none bg-transparent text-black" />
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto print:overflow-visible mt-0">
            <table className="w-full text-left border-collapse font-sans text-xs min-w-[900px] print:min-w-full border-2 border-black border-t-0">
              <thead>
                <tr className="border-b-2 border-black text-black bg-white">
                  <th className="p-1.5 font-bold border-r-2 border-black w-10 text-center uppercase text-[10px]">Sr.<br />No</th>
                  <th className="p-1.5 font-bold border-r-2 border-black uppercase text-center text-[10px]">Description</th>
                  <th className="p-1.5 font-bold border-r-2 border-black uppercase text-center text-[10px]">Identification</th>
                  <th className="p-1.5 font-bold border-r-2 border-black uppercase text-center w-24 text-[10px]">Size/Range/LC</th>
                  <th className="p-1.5 font-bold border-r-2 border-black uppercase text-center w-16 text-[10px]">HSN</th>
                  <th className="p-1.5 font-bold border-r-2 border-black uppercase text-center w-16 text-[10px]">Repair</th>
                  <th className="p-1.5 font-bold border-r-2 border-black uppercase text-center w-20 text-[10px]">Calibration</th>
                  <th className="p-1.5 font-bold border-r-2 border-black uppercase text-center w-16 text-[10px]">Qty</th>
                  <th className="p-1.5 font-bold uppercase text-center w-20 text-[10px]">Amount</th>
                </tr>
              </thead>
              <tbody className="text-black">
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-black text-black align-middle group">
                    <td className="border-r-2 border-black text-center font-mono text-xs py-1 relative">
                      {idx + 1}
                      <button onClick={() => removeItem(item.id)} className="print:hidden absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                        <Trash2 size={10} />
                      </button>
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <textarea value={item.desc} onChange={e => updateItem(item.id, "desc", e.target.value)} className="w-full p-1.5 outline-none border-none resize-none bg-transparent text-black text-xs" rows={2} />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <textarea value={item.identification} onChange={e => updateItem(item.id, "identification", e.target.value)} className="w-full p-1.5 outline-none border-none resize-none bg-transparent text-center text-black text-xs" rows={2} />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <input value={item.size} onChange={e => updateItem(item.id, "size", e.target.value)} className="w-full p-1.5 outline-none border-none bg-transparent text-center text-black text-xs" />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <input value={item.hsn} onChange={e => updateItem(item.id, "hsn", e.target.value)} className="w-full p-1.5 outline-none border-none bg-transparent text-center font-mono text-black text-xs" />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <input type="number" value={item.repair} onChange={e => updateItem(item.id, "repair", parseFloat(e.target.value) || 0)} className="w-full p-1.5 outline-none border-none bg-transparent text-right font-mono text-black text-xs" />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <input type="number" value={item.calib} onChange={e => updateItem(item.id, "calib", parseFloat(e.target.value) || 0)} className="w-full p-1.5 outline-none border-none bg-transparent text-right font-mono text-black text-xs" />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <input type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", parseInt(e.target.value) || 0)} className="w-full p-1.5 outline-none border-none bg-transparent text-center font-mono text-black text-xs" />
                    </td>
                    <td className="p-1.5 text-right font-bold text-black text-xs">
                      {((Number(item.repair) + Number(item.calib)) * Number(item.qty)).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {[...Array(Math.max(0, 10 - items.length))].map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-black h-7">
                    <td className="border-r-2 border-black" /><td className="border-r-2 border-black" />
                    <td className="border-r-2 border-black" /><td className="border-r-2 border-black" />
                    <td className="border-r-2 border-black" /><td className="border-r-2 border-black" />
                    <td className="border-r-2 border-black" /><td className="border-r-2 border-black" /><td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom: Notes + Totals */}
          <div className="border-2 border-black border-t-0 grid grid-cols-[1fr_220px]">
            <div>
              <div className="px-2 py-1.5 text-[9px] italic leading-snug text-black border-b border-black">
                Servicing, Contact point, Bush fitting, Spring, Roller Set, Rachet, Carbid pin, Cam, Oring, Bezal, Scal, Glass, Gear, Rack, Zebra connector, Lock Ball.
              </div>
              <div className="px-2 py-1.5">
                <p className="font-bold underline text-[9px] uppercase mb-1 text-black">Terms &amp; Conditions</p>
                <div className="text-[9px] text-black space-y-0.5">
                  <p>Discount {discountPercent} %</p>
                  <p>Validity :- 30 Days from date of our quotation</p>
                  <p>Delivery :- 8 to 10 Days</p>
                  <p>GST :-Extra as applicable 18%</p>
                  <p>Payment :- Against Delivery</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col text-[10px] font-bold self-stretch border-l-2 border-black">
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                <div className="px-2 py-1 border-r border-black uppercase text-gray-700">Total Qty.</div>
                <div className="px-2 py-1 text-right text-black">{totalQty}</div>
              </div>
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                <div className="px-2 py-1 border-r border-black uppercase text-gray-700 flex items-center gap-1">
                  Discount
                  <span className="print:hidden">
                    <input type="number" min="0" max="100" value={discountPercent} onChange={e => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} className="w-7 outline-none border-b border-black text-black text-center" />
                  </span>
                  <span className="hidden print:inline">{discountPercent}</span>
                  &nbsp;%
                </div>
                <div className="px-2 py-1 text-right text-black">{discountAmount.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                <div className="px-2 py-1 border-r border-black uppercase text-gray-700">Total</div>
                <div className="px-2 py-1 text-right text-black">{netTotal.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                <div className="px-2 py-1 border-r border-black uppercase text-gray-700">R/O Amount</div>
                <div className="px-2 py-1 text-right text-black font-black">{roundedTotal}</div>
              </div>
            </div>
          </div>

          {/* Signature + Add Row */}
          <div className="flex justify-between items-end mt-6 print:mt-4 mb-2">
            <button onClick={addItem} className="print:hidden text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
              <Plus size={14} /> Add Row
            </button>
            <div className="text-right flex flex-col items-end ml-auto">
              <p className="text-xs text-black mb-6">Yours Faithfully</p>
              <p className="font-bold border-t-2 border-black pt-1 uppercase text-black text-xs tracking-wide">VIKRAMADITYA ENTERPRISES</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
