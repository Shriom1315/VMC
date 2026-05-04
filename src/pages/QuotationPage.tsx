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

    // ── COMPANY HEADER ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("VIKRAMADITYA ENTERPRISES.", pageW / 2, 14, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Office : A/P Male, Tal. Panhala, Dist. Kolhapur 416122", pageW / 2, 19, { align: "center" });
    doc.text("Contact No -9503601616  Email- kiranpatil24586@gmail.com", pageW / 2, 23, { align: "center" });

    // ── "Quotation" title box ──
    doc.setFillColor(255, 255, 255);
    doc.rect(marginL, 25, contentW, 8, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Quotation", pageW / 2, 31, { align: "center" });

    // ── CLIENT INFO GRID ──
    const infoY = 33;
    const leftW = contentW * 0.5;
    const rightW = contentW * 0.5;
    const rowH = 7;

    // Outer border
    doc.rect(marginL, infoY, contentW, rowH * 4, "S");
    // Vertical divider
    doc.line(marginL + leftW, infoY, marginL + leftW, infoY + rowH * 4);
    // Horizontal dividers left side
    doc.line(marginL, infoY + rowH,     marginL + leftW, infoY + rowH);
    doc.line(marginL, infoY + rowH * 2, marginL + leftW, infoY + rowH * 2);
    doc.line(marginL, infoY + rowH * 3, marginL + leftW, infoY + rowH * 3);
    // Horizontal dividers right side
    doc.line(marginL + leftW, infoY + rowH,     marginL + contentW, infoY + rowH);
    doc.line(marginL + leftW, infoY + rowH * 2, marginL + contentW, infoY + rowH * 2);
    doc.line(marginL + leftW, infoY + rowH * 3, marginL + contentW, infoY + rowH * 3);
    // Vertical divider in right half (for Quotation No / Date split)
    const rightMid = marginL + leftW + rightW * 0.5;
    doc.line(rightMid, infoY, rightMid, infoY + rowH * 2);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    // Left column
    doc.text(`M/S- ${clientName}`,        marginL + 2, infoY + 5);
    doc.text(clientAddress,               marginL + 2, infoY + rowH + 5);
    doc.text(`GSTIN No- ${clientGSTIN}`,  marginL + 2, infoY + rowH * 2 + 5);
    doc.text(`Kind Attn. ${kindAttn}`,    marginL + 2, infoY + rowH * 3 + 5);
    // Right column top row
    doc.text(`Quotation No- ${quotationNo}`, marginL + leftW + 2, infoY + 5);
    doc.text(`Date- ${date}`,                rightMid + 2,         infoY + 5);
    // Right column second row
    doc.text(`Client DC No- ${clientDCNo}`,  marginL + leftW + 2, infoY + rowH + 5);
    doc.text(`DATE- ${clientDate}`,          rightMid + 2,         infoY + rowH + 5);
    // Right column third row (PO NO spans full right)
    doc.text(`PO NO :- ${poNo}`,             marginL + leftW + 2, infoY + rowH * 2 + 5);

    // ── ITEMS TABLE ──
    const tableStartY = infoY + rowH * 4;
    const tableData = items.map((item, idx) => [
      idx + 1,
      item.desc,
      item.identification,
      item.size,
      item.hsn,
      Number(item.repair).toFixed(2),
      Number(item.calib).toFixed(2),
      item.qty,
      ((Number(item.repair) + Number(item.calib)) * Number(item.qty)).toFixed(2),
    ]);
    // Pad to at least 15 rows
    while (tableData.length < 15) tableData.push(["", "", "", "", "", "", "", "", ""]);

    doc.autoTable({
      startY: tableStartY,
      head: [["Sr. No", "Description", "Identification", "Size/Range/LC", "HSN", "Repair", "Calibration", "Qty", "Amount"]],
      body: tableData,
      theme: "grid",
      margin: { left: marginL, right: marginR },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        lineWidth: 0.3,
        lineColor: [0, 0, 0],
        halign: "center",
        fontSize: 7,
        cellPadding: 2,
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [0, 0, 0],
        lineWidth: 0.3,
        lineColor: [0, 0, 0],
        cellPadding: 2,
        minCellHeight: 6,
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 12 },
        1: { halign: "left",   cellWidth: 40 },
        2: { halign: "center", cellWidth: 28 },
        3: { halign: "center", cellWidth: 22 },
        4: { halign: "center", cellWidth: 16 },
        5: { halign: "right",  cellWidth: 18 },
        6: { halign: "right",  cellWidth: 20 },
        7: { halign: "center", cellWidth: 10 },
        8: { halign: "right",  cellWidth: 24 },
      },
    });

    const afterTableY = doc.lastAutoTable.finalY;

    // ── FOOTER SECTION ──
    const footerH  = 36;
    const footerY  = afterTableY;
    const totalsW  = 60;
    const termsW   = contentW - totalsW;

    // Outer border
    doc.rect(marginL, footerY, contentW, footerH, "S");
    // Vertical divider between terms and totals
    doc.line(marginL + termsW, footerY, marginL + termsW, footerY + footerH);

    // Terms text (left side)
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "italic");
    const termsText = "Servicing, Contact point, Bush fitting, Spring, Roller Set, Rachet, Carbid pin, Cam, Oring, Bezal, Scal, Glass, Gear, Rack, Zebra connector, Lock Ball.";
    const splitTerms = doc.splitTextToSize(termsText, termsW - 4);
    doc.text(splitTerms, marginL + 2, footerY + 4);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text("Terms & Conditions", marginL + 2, footerY + 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("Discount 15 %",                              marginL + 2, footerY + 20);
    doc.text("Validity :- 30 Days from date of our quotation", marginL + 2, footerY + 24);
    doc.text("Delivery :- 8 to 10 Day",                    marginL + 2, footerY + 28);
    doc.text("GST :-Extra as applicable 18%",              marginL + 2, footerY + 32);
    doc.text("Payment :- Against Delivery",                marginL + 2, footerY + 36);

    // Totals (right side)
    const totalsX  = marginL + termsW;
    const totRowH  = 9;
    // Horizontal lines for totals rows
    doc.line(totalsX, footerY + totRowH,     marginL + contentW, footerY + totRowH);
    doc.line(totalsX, footerY + totRowH * 2, marginL + contentW, footerY + totRowH * 2);
    doc.line(totalsX, footerY + totRowH * 3, marginL + contentW, footerY + totRowH * 3);
    // Vertical divider inside totals (label | value)
    const totLabelW = 28;
    doc.line(totalsX + totLabelW, footerY, totalsX + totLabelW, footerY + footerH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const totRows = [
      { label: "Total Qty.",                    value: String(totalQty) },
      { label: `Discount ${discountPercent} %`, value: discountAmount.toFixed(2) },
      { label: "Total",                         value: netTotal.toFixed(2) },
      { label: "R/O Amount",                    value: String(roundedTotal) },
    ];
    totRows.forEach((row, i) => {
      const rowY = footerY + totRowH * i + 6;
      doc.text(row.label, totalsX + 2, rowY);
      doc.text(row.value, marginL + contentW - 2, rowY, { align: "right" });
    });

    // ── SIGNATURE ──
    const sigY = footerY + footerH + 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Yours Faithfully", marginL + contentW, sigY, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.text("VIKRAMADITYA ENTERPRISES", marginL + contentW, sigY + 6, { align: "right" });

    doc.save(`Quotation_${quotationNo}.pdf`);
  };

  const inputCls = "w-full outline-none border-none bg-transparent text-gray-900 text-sm placeholder-gray-400";
  const labelCls = "block text-xs font-medium text-gray-500 mb-0.5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full px-4 md:px-8 py-6 print:p-0 flex flex-col gap-6"
    >
      {/* =====================================================
          PRINT-ONLY LAYOUT — exact original format
          Hidden on screen, shown only when printing
      ===================================================== */}
      <div className="hidden print:block">
        {/* Company header */}
        <div className="border border-gray-400 border-b-0">
          <div className="text-center py-2">
            <h1 className="text-[16pt] font-bold text-gray-900 leading-tight">VIKRAMADITYA ENTERPRISES.</h1>
            <p className="text-[7.5pt] text-gray-700">Office : A/P Male, Tal. Panhala, Dist. Kolhapur 416122</p>
            <p className="text-[7.5pt] text-gray-700">Contact No -9503601616 &nbsp; Email- kiranpatil24586@gmail.com</p>
          </div>
          <div className="border-t border-gray-400 text-center py-1">
            <h2 className="text-[10pt] font-semibold text-gray-900">Quotation</h2>
          </div>
        </div>

        {/* Client info grid */}
        <div className="border border-gray-400 border-t-0">
          {/* Row 1: M/S */}
          <div className="border-b border-gray-400 px-2 py-1">
            <span className="text-[8.5px] font-semibold text-gray-600">M/S —</span>
            <span className="text-[8.5px] text-gray-900 ml-1">{clientName}</span>
          </div>
          {/* Row 2: Address */}
          <div className="border-b border-gray-400 px-2 py-1">
            <span className="text-[8.5px] text-gray-700">{clientAddress}</span>
          </div>
          {/* Row 3: GSTIN */}
          <div className="border-b border-gray-400 px-2 py-1 flex items-center gap-2">
            <span className="text-[8.5px] font-semibold text-gray-600 whitespace-nowrap">GSTIN No.</span>
            <span className="text-[8.5px] text-gray-900">{clientGSTIN}</span>
          </div>
          {/* Row 4: Kind Attn | Quotation No | Date */}
          <div className="border-b border-gray-400 grid grid-cols-2">
            <div className="border-r border-gray-400 px-2 py-1">
              <span className="text-[8.5px] font-semibold text-gray-600 whitespace-nowrap">Kind Attn. </span>
              <span className="text-[8.5px] text-gray-900">{kindAttn}</span>
            </div>
            <div className="grid grid-cols-2">
              <div className="border-r border-gray-400 px-2 py-1">
                <div className="text-[8px] font-semibold text-gray-500">Quotation No.</div>
                <div className="text-[8.5px] text-gray-900">{quotationNo}</div>
              </div>
              <div className="px-2 py-1">
                <div className="text-[8px] font-semibold text-gray-500">Date</div>
                <div className="text-[8.5px] text-gray-900">{date}</div>
              </div>
            </div>
          </div>
          {/* Row 5: Client DC No | Client Date | PO No */}
          <div className="grid grid-cols-2">
            <div className="border-r border-gray-400 px-2 py-1">
              <span className="text-[8.5px] font-semibold text-gray-600">Client DC No. </span>
              <span className="text-[8.5px] text-gray-900">{clientDCNo}</span>
            </div>
            <div className="grid grid-cols-2">
              <div className="border-r border-gray-400 px-2 py-1">
                <div className="text-[8px] font-semibold text-gray-500">Client Date</div>
                <div className="text-[8.5px] text-gray-900">{clientDate}</div>
              </div>
              <div className="px-2 py-1">
                <div className="text-[8px] font-semibold text-gray-500">PO No.</div>
                <div className="text-[8.5px] text-gray-900">{poNo}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Items table */}
        <table className="w-full text-left border-collapse text-[7.5pt] border border-gray-400 border-t-0">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-400">
              <th className="px-1.5 py-1 font-semibold border-r border-gray-400 w-8 text-center text-gray-700">Sr.</th>
              <th className="px-1.5 py-1 font-semibold border-r border-gray-400 text-gray-700">Description</th>
              <th className="px-1.5 py-1 font-semibold border-r border-gray-400 text-center text-gray-700">Identification</th>
              <th className="px-1.5 py-1 font-semibold border-r border-gray-400 text-center w-20 text-gray-700">Size/Range/LC</th>
              <th className="px-1.5 py-1 font-semibold border-r border-gray-400 text-center w-12 text-gray-700">HSN</th>
              <th className="px-1.5 py-1 font-semibold border-r border-gray-400 text-right w-14 text-gray-700">Repair</th>
              <th className="px-1.5 py-1 font-semibold border-r border-gray-400 text-right w-16 text-gray-700">Calibration</th>
              <th className="px-1.5 py-1 font-semibold border-r border-gray-400 text-center w-10 text-gray-700">Qty</th>
              <th className="px-1.5 py-1 font-semibold text-right w-16 text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-gray-300">
                <td className="border-r border-gray-300 text-center text-gray-700 py-1">{idx + 1}</td>
                <td className="px-1.5 py-1 border-r border-gray-300 text-gray-900">{item.desc}</td>
                <td className="px-1.5 py-1 border-r border-gray-300 text-center text-gray-900">{item.identification}</td>
                <td className="px-1.5 py-1 border-r border-gray-300 text-center text-gray-900">{item.size}</td>
                <td className="px-1.5 py-1 border-r border-gray-300 text-center text-gray-900">{item.hsn}</td>
                <td className="px-1.5 py-1 border-r border-gray-300 text-right text-gray-900">{Number(item.repair).toFixed(2)}</td>
                <td className="px-1.5 py-1 border-r border-gray-300 text-right text-gray-900">{Number(item.calib).toFixed(2)}</td>
                <td className="px-1.5 py-1 border-r border-gray-300 text-center text-gray-900">{item.qty}</td>
                <td className="px-1.5 py-1 text-right font-semibold text-gray-900">{((Number(item.repair) + Number(item.calib)) * Number(item.qty)).toFixed(2)}</td>
              </tr>
            ))}
            {[...Array(Math.max(0, 15 - items.length))].map((_, i) => (
              <tr key={`ep-${i}`} className="border-b border-gray-200 h-5">
                <td className="border-r border-gray-200" /><td className="border-r border-gray-200" />
                <td className="border-r border-gray-200" /><td className="border-r border-gray-200" />
                <td className="border-r border-gray-200" /><td className="border-r border-gray-200" />
                <td className="border-r border-gray-200" /><td className="border-r border-gray-200" /><td />
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer: terms + totals */}
        <div className="border border-gray-400 border-t-0 grid grid-cols-[1fr_200px]">
          <div className="border-r border-gray-400">
            <div className="px-2 py-1.5 text-[7pt] italic leading-snug text-gray-600 border-b border-gray-300">
              Servicing, Contact point, Bush fitting, Spring, Roller Set, Rachet, Carbid pin, Cam, Oring, Bezal, Scal, Glass, Gear, Rack, Zebra connector, Lock Ball.
            </div>
            <div className="px-2 py-1.5">
              <p className="font-semibold text-[7pt] mb-1 text-gray-800">Terms &amp; Conditions</p>
              <div className="text-[7pt] text-gray-700 space-y-0.5">
                <p>Discount {discountPercent} %</p>
                <p>Validity :- 30 Days from date of our quotation</p>
                <p>Delivery :- 8 to 10 Days</p>
                <p>GST :- Extra as applicable 18%</p>
                <p>Payment :- Against Delivery</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col text-[7.5pt]">
            <div className="grid grid-cols-[110px_1fr] border-b border-gray-300">
              <div className="px-2 py-1.5 border-r border-gray-300 text-gray-600 font-medium">Total Qty.</div>
              <div className="px-2 py-1.5 text-right text-gray-900 font-semibold">{totalQty}</div>
            </div>
            <div className="grid grid-cols-[110px_1fr] border-b border-gray-300">
              <div className="px-2 py-1.5 border-r border-gray-300 text-gray-600 font-medium">Discount {discountPercent} %</div>
              <div className="px-2 py-1.5 text-right text-gray-900">{discountAmount.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-[110px_1fr] border-b border-gray-300">
              <div className="px-2 py-1.5 border-r border-gray-300 text-gray-600 font-medium">Total</div>
              <div className="px-2 py-1.5 text-right text-gray-900 font-semibold">{netTotal.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-[110px_1fr]">
              <div className="px-2 py-1.5 border-r border-gray-300 text-gray-700 font-semibold">R/O Amount</div>
              <div className="px-2 py-1.5 text-right text-gray-900 font-bold">{roundedTotal}</div>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="flex justify-end mt-8">
          <div className="text-right">
            <p className="text-[8pt] text-gray-600 mb-10">Yours Faithfully</p>
            <p className="font-semibold border-t border-gray-400 pt-1 text-gray-900 text-[8pt]">VIKRAMADITYA ENTERPRISES</p>
          </div>
        </div>
      </div>

      {/* =====================================================
          SCREEN-ONLY LAYOUT — new clean UI
          Hidden when printing
      ===================================================== */}
      <div className="print:hidden flex flex-col gap-6">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Quotation Generator</h1>
            <p className="text-xs text-text-secondary mt-0.5">Create and export client quotations</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 border border-border text-text-secondary text-xs font-medium px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors">
              <Printer size={13} /> Print
            </button>
            <button onClick={exportPDF} className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              <FileDown size={13} /> Export PDF
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col">
          {/* Client Info Grid */}
          <div className="border-b border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Left column */}
              <div className="divide-y divide-border">
                <div className="px-4 py-3">
                  <label className={labelCls}>M/S (Client Name)</label>
                  <input value={clientName} onChange={e => setClientName(e.target.value)} className={inputCls} placeholder="Client Name Pvt. Ltd." />
                </div>
                <div className="px-4 py-3">
                  <label className={labelCls}>Address</label>
                  <input value={clientAddress} onChange={e => setClientAddress(e.target.value)} className={inputCls} placeholder="Full address, city – pin" />
                </div>
                <div className="px-4 py-3">
                  <label className={labelCls}>GSTIN No.</label>
                  <input value={clientGSTIN} onChange={e => setClientGSTIN(e.target.value)} className={inputCls} placeholder="27AAACE..." />
                </div>
                <div className="px-4 py-3">
                  <label className={labelCls}>Kind Attn.</label>
                  <input value={kindAttn} onChange={e => setKindAttn(e.target.value)} className={inputCls} placeholder="Mr. Contact Person" />
                </div>
              </div>
              {/* Right column */}
              <div className="divide-y divide-border">
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="px-4 py-3">
                    <label className={labelCls}>Quotation No.</label>
                    <input value={quotationNo} onChange={e => setQuotationNo(e.target.value)} className={inputCls} />
                  </div>
                  <div className="px-4 py-3">
                    <label className={labelCls}>Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="px-4 py-3">
                    <label className={labelCls}>Client DC No.</label>
                    <input value={clientDCNo} onChange={e => setClientDCNo(e.target.value)} className={inputCls} placeholder="040007" />
                  </div>
                  <div className="px-4 py-3">
                    <label className={labelCls}>Client Date</label>
                    <input type="date" value={clientDate} onChange={e => setClientDate(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div className="px-4 py-3">
                  <label className={labelCls}>PO No.</label>
                  <input value={poNo} onChange={e => setPoNo(e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[860px]">
              <thead>
                <tr className="bg-surface-muted border-b border-border text-text-secondary">
                  <th className="px-3 py-2.5 font-medium border-r border-border w-10 text-center">Sr.</th>
                  <th className="px-3 py-2.5 font-medium border-r border-border">Description</th>
                  <th className="px-3 py-2.5 font-medium border-r border-border">Identification</th>
                  <th className="px-3 py-2.5 font-medium border-r border-border w-24 text-center">Size/Range/LC</th>
                  <th className="px-3 py-2.5 font-medium border-r border-border w-16 text-center">HSN</th>
                  <th className="px-3 py-2.5 font-medium border-r border-border w-20 text-right">Repair</th>
                  <th className="px-3 py-2.5 font-medium border-r border-border w-20 text-right">Calibration</th>
                  <th className="px-3 py-2.5 font-medium border-r border-border w-14 text-center">Qty</th>
                  <th className="px-3 py-2.5 font-medium w-20 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="text-text-primary">
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-border align-middle group hover:bg-surface-subtle">
                    <td className="border-r border-border text-center text-text-secondary py-1 relative">
                      {idx + 1}
                      <button onClick={() => removeItem(item.id)} className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                        <Trash2 size={10} />
                      </button>
                    </td>
                    <td className="p-0 border-r border-border">
                      <textarea value={item.desc} onChange={e => updateItem(item.id, "desc", e.target.value)} className="w-full px-3 py-2 outline-none border-none resize-none bg-transparent text-gray-900 text-xs" rows={2} />
                    </td>
                    <td className="p-0 border-r border-border">
                      <textarea value={item.identification} onChange={e => updateItem(item.id, "identification", e.target.value)} className="w-full px-3 py-2 outline-none border-none resize-none bg-transparent text-center text-gray-900 text-xs" rows={2} />
                    </td>
                    <td className="p-0 border-r border-border">
                      <input value={item.size} onChange={e => updateItem(item.id, "size", e.target.value)} className="w-full px-3 py-2 outline-none border-none bg-transparent text-center text-gray-900 text-xs" />
                    </td>
                    <td className="p-0 border-r border-border">
                      <input value={item.hsn} onChange={e => updateItem(item.id, "hsn", e.target.value)} className="w-full px-3 py-2 outline-none border-none bg-transparent text-center text-gray-900 text-xs font-mono" />
                    </td>
                    <td className="p-0 border-r border-border">
                      <input type="number" value={item.repair} onChange={e => updateItem(item.id, "repair", parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 outline-none border-none bg-transparent text-right text-gray-900 text-xs font-mono" />
                    </td>
                    <td className="p-0 border-r border-border">
                      <input type="number" value={item.calib} onChange={e => updateItem(item.id, "calib", parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 outline-none border-none bg-transparent text-right text-gray-900 text-xs font-mono" />
                    </td>
                    <td className="p-0 border-r border-border">
                      <input type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", parseInt(e.target.value) || 0)} className="w-full px-3 py-2 outline-none border-none bg-transparent text-center text-gray-900 text-xs font-mono" />
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-gray-900 text-xs font-mono">
                      {((Number(item.repair) + Number(item.calib)) * Number(item.qty)).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {[...Array(Math.max(0, 8 - items.length))].map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-border h-8">
                    {[...Array(9)].map((__, j) => (
                      <td key={j} className={j < 8 ? "border-r border-border" : ""} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer: Terms + Totals */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] border-t border-border">
            <div className="p-4 border-b md:border-b-0 md:border-r border-border">
              <p className="text-xs italic text-text-secondary leading-relaxed mb-3">
                Servicing, Contact point, Bush fitting, Spring, Roller Set, Rachet, Carbid pin, Cam, Oring, Bezal, Scal, Glass, Gear, Rack, Zebra connector, Lock Ball.
              </p>
              <p className="text-xs font-semibold text-text-primary mb-1.5">Terms &amp; Conditions</p>
              <div className="text-xs text-text-secondary space-y-0.5">
                <p>Discount {discountPercent}%</p>
                <p>Validity: 30 days from quotation date</p>
                <p>Delivery: 8–10 days</p>
                <p>GST: Extra as applicable (18%)</p>
                <p>Payment: Against delivery</p>
              </div>
            </div>
            <div className="divide-y divide-border text-xs">
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-text-secondary font-medium">Total Qty.</span>
                <span className="font-semibold text-text-primary font-mono">{totalQty}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-2.5">
                <span className="text-text-secondary font-medium flex items-center gap-1">
                  Discount
                  <input type="number" min="0" max="100" value={discountPercent} onChange={e => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} className="w-8 outline-none border-b border-border text-text-primary text-center font-mono ml-1" />%
                </span>
                <span className="font-mono text-text-primary">{discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5">
                <span className="text-text-secondary font-medium">Total</span>
                <span className="font-semibold text-text-primary font-mono">{netTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between px-4 py-2.5 bg-surface-muted">
                <span className="font-semibold text-text-primary">R/O Amount</span>
                <span className="font-bold text-text-primary font-mono text-sm">{roundedTotal}</span>
              </div>
            </div>
          </div>

          {/* Signature row */}
          <div className="px-4 py-4 flex justify-between items-end border-t border-border">
            <button onClick={addItem} className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-orange hover:underline">
              <Plus size={13} /> Add Row
            </button>
            <div className="text-right ml-auto">
              <p className="text-xs text-text-secondary mb-8">Yours Faithfully</p>
              <p className="text-xs font-semibold text-text-primary border-t border-border pt-1">VIKRAMADITYA ENTERPRISES</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
        <div className="text-center py-2">
          <h1 className="text-[18pt] font-bold text-black">VIKRAMADITYA ENTERPRISES.</h1>
          <p className="text-[7.5pt] text-black">Office : A/P Male, Tal. Panhala, Dist. Kolhapur 416122</p>
          <p className="text-[7.5pt] text-black">Contact No -9503601616 &nbsp; Email- kiranpatil24586@gmail.com</p>
        </div>
