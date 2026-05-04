/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  QrCode, 
  Cpu, 
  Rotate3d, 
  ClipboardCheck, 
  Menu, 
  X,
  Plus,
  Compass,
  Thermometer,
  Droplets,
  ShieldAlert,
  HardDrive,
  FileText,
  Lock,
  ChevronRight,
  Activity,
  Layers,
  Printer,
  FileDown,
  Trash2,
  ChevronDown,
  ShoppingBag,
  BarChart2,
  UserPlus,
  PieChart,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { useState, ReactNode, ChangeEvent, useEffect, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import "jspdf-autotable";

const METROLOGY_TERMS = [
  "Absolute Tolerance",
  "Angular Resolution",
  "AS9100D Certification",
  "CMM Metrology",
  "Calibration Logs",
  "Concentricity Validation",
  "Coordinate Measuring Machine",
  "Dimensional Metrology",
  "Geometric Dimensioning",
  "ISO 17025 Standard",
  "ISO Certification",
  "Linear Error Correction",
  "Micron-Level Verification",
  "Point Cloud Generation",
  "Surface Roughness",
  "Surface Scanning",
  "Topographic Analysis",
  "Thermal Stabilization",
  "Traceability Chain",
  "Quotation Generator",
  "Purchase Order Registry",
  "Material Inward Log",
  "Client Data Fetch",
];

function SearchAutocomplete() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length > 0) {
      const filtered = METROLOGY_TERMS.filter(term => 
        term.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (term: string) => {
    setQuery(term);
    setShowSuggestions(false);
  };

  return (
    <div className="relative hidden lg:block">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
      <input 
        className="bg-industrial-low border-b-2 border-black dark:border-white focus:outline-none focus:border-brand-orange font-mono text-xs pl-7 pr-2 py-1 w-32 xl:w-48 text-industrial-text placeholder-gray-500 transition-all" 
        placeholder="SEARCH SPECS..." 
        type="text"
        value={query}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onFocus={() => query.length > 0 && setShowSuggestions(true)}
      />
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full left-0 w-full bg-white dark:bg-black hairline-border border-t-0 shadow-xl z-[60] mt-1"
          >
            <div className="blueprint-grid opacity-20 absolute inset-0 pointer-events-none" />
            <ul className="relative font-mono text-[11px] uppercase tracking-wider">
              {suggestions.map((term) => (
                <li 
                  key={term}
                  onClick={() => selectSuggestion(term)}
                  className="p-2 border-b border-gray-100 last:border-0 hover:bg-brand-orange hover:text-white cursor-pointer transition-colors flex justify-between items-center group"
                >
                  <span>{term}</span>
                  <ChevronRight size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </Router>
  );
}

function MainLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-x-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-black font-display tracking-widest text-xs uppercase border-b-2 border-black dark:border-white sticky top-0 flex justify-between items-center w-full h-16 px-4 md:px-6 z-50">
        <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
          <Link to="/" className="text-sm md:text-xl font-black text-black dark:text-white tracking-tighter truncate">
            VIKRAMADITYA METROLOGY
          </Link>
          <nav className="hidden md:flex items-center h-full border-l border-[#c8c6c5] dark:border-gray-800 pl-4 space-x-2">
            <NavLink label="HOME" to="/" />
            <NavLink label="QUOTATION" to="/quotation" />
            <NavLink label="PURCHASE ORDER" to="/po" />
            <NavLink label="MATERIAL INWARD" to="/inward" />
            <NavLink label="ADMIN" to="/admin" />
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <SearchAutocomplete />
          <button className="hidden sm:block bg-brand-orange text-white font-mono text-xs px-6 py-2 border-2 border-brand-orange hover:bg-black hover:text-white transition-all">
            SYSTEM_SYNC
          </button>
          <button className="hidden sm:block bg-transparent border-2 border-black dark:border-white text-black dark:text-white font-mono text-xs px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors">
            DATA_EX
          </button>
          <button 
            className="md:hidden text-black dark:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-16 left-0 w-full bg-white dark:bg-black border-b-2 border-black z-40 p-4 flex flex-col gap-4 font-display text-sm tracking-widest uppercase"
          >
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="p-2 border-b border-gray-100">HOME</Link>
            <Link to="/quotation" onClick={() => setIsMenuOpen(false)} className="p-2 border-b border-gray-100">QUOTATION</Link>
            <Link to="/po" onClick={() => setIsMenuOpen(false)} className="p-2 border-b border-gray-100">PURCHASE ORDER</Link>
            <Link to="/inward" onClick={() => setIsMenuOpen(false)} className="p-2 border-b border-gray-100">MATERIAL INWARD</Link>
            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="p-2 border-b border-gray-100">ADMIN</Link>
            <div className="flex gap-2 pt-2">
              <button className="flex-1 bg-brand-orange text-white py-3 text-xs font-mono">SYSTEM_SYNC</button>
              <button className="flex-1 border-2 border-black dark:border-white py-3 text-xs font-mono">DATA_EX</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quotation" element={<QuotationPage />} />
          <Route path="/po" element={<PurchaseOrderPage />} />
          <Route path="/inward" element={<MaterialInwardPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-industrial-low font-display text-xs uppercase tracking-[0.2em] p-6 md:p-12 lg:p-16 border-t-2 border-black grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mt-12">
        <div className="flex flex-col gap-4">
          <div className="text-brand-orange font-black text-xl tracking-tighter">VIKRAMADITYA</div>
          <p className="text-gray-500 leading-relaxed max-w-[200px]">
            © 2026 VIKRAMADITYA METROLOGY CENTER. ALL SPECIFICATIONS SUBJECT TO ISO 17025.
          </p>
        </div>
        
        <FooterSection title="SYSTEM_LINKS">
          <a href="#" className="hover:text-brand-orange transition-colors">TERMS_OF_SERVICE</a>
          <a href="#" className="hover:text-brand-orange transition-colors">CALIBRATION_LOGS</a>
          <a href="#" className="hover:text-brand-orange transition-colors">CONTACT_ENG</a>
          <a href="#" className="hover:text-brand-orange transition-colors">SUPPORT_TICKET</a>
        </FooterSection>

        <FooterSection title="NODE_STATUS">
          <div className="flex justify-between items-center text-gray-500">
            <span>MAIN_SERVER</span>
            <span className="text-green-500">ONLINE</span>
          </div>
          <div className="flex justify-between items-center text-gray-500">
            <span>CMM_INTERFACE</span>
            <span className="text-green-500">ONLINE</span>
          </div>
          <div className="flex justify-between items-center text-gray-500">
            <span>DATA_VAULT</span>
            <span className="text-brand-orange">SYNCING</span>
          </div>
        </FooterSection>

        <FooterSection title="LOCATION_DATA">
          <div className="text-gray-500 space-y-1">
            <p>COORD: 45.4215° N, 75.6972° W</p>
            <p>ELEV: 70M ASL</p>
            <p>TEMP_CONTROL: 20.0°C ±0.1°C</p>
          </div>
        </FooterSection>
      </footer>
    </div>
  );
}

// --- Navigation Components ---

function NavLink({ label, to }: { label: string; to: string }) {
  const location = useLocation();
  const active = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`h-full flex items-center px-3 transition-all duration-200 border-b-2 hover:bg-orange-50 ${
        active ? "text-brand-orange border-brand-orange font-bold" : "text-gray-500 border-transparent hover:text-black"
      }`}
    >
      {label}
    </Link>
  );
}

// --- Page Components ---

function HomePage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-12"
    >
      <section className="relative bg-white hairline-border p-6 md:p-10 lg:p-12 flex flex-col lg:flex-row gap-12 shadow-sm">
        <ModuleAccents label="SEC_01.H / DASHBOARD" />
        <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6 md:gap-8 pt-4">
          <h1 className="font-display text-5xl md:text-7xl xl:text-8xl uppercase text-industrial-text leading-[0.9] tracking-tighter font-bold">
            Vikramaditya<br />Operational Hub
          </h1>
          <p className="font-sans text-base md:text-lg text-industrial-text-variant max-w-md">
            Welcome to the central command node. Manage quotations, purchase orders, and material movements with absolute precision and zero latency.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Link to="/quotation" className="bg-brand-orange text-white font-mono text-xs md:text-sm px-6 py-3 border-2 border-brand-orange hover:bg-black transition-all flex items-center gap-2">
              NEW_QUOTATION <Plus size={14} />
            </Link>
            <Link to="/po" className="bg-transparent text-industrial-text font-mono text-xs md:text-sm px-6 py-3 border-2 border-industrial-text hover:bg-industrial-low transition-all">
              PO_REGISTRY
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-1/2 relative min-h-[300px] md:min-h-[400px] bg-industrial-low hairline-border flex items-center justify-center blueprint-grid overflow-hidden group">
          <div className="absolute top-2 left-2 font-mono text-xs text-gray-400">STATUS: SYSTEM_READY</div>
          <div className="relative w-4/5 h-4/5">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPsG0c89IfSrn0IkQgilVgI8eLTEzu4wP6p-V53mumyqnJ9eB3UAbPXdafzMKuqSYbE9S1SyTMqXqvoEsPtUDjdbLVl__phucwQRj009-vQK23JfoXB3P5NPgxWDAiIldeK_PAUlnF5ERahaOddB-1SWsuMItyBqDfeUTCZH623V53ZMN2B33Q2zOp6uprjGRTKnMqF6ZX1-76-cCr8Dtahl34_VwZCPzHkcJ3p_jRDPmxdb6M9DCmN5VOUfASWXPsJEjmsUxqxB0" 
              alt="Mechanical part" 
              className="w-full h-full object-contain opacity-40 mix-blend-multiply grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="ACTIVE_QUOTES" value="128" delta="+12%" />
        <StatCard label="PENDING_POs" value="45" delta="-3%" />
        <StatCard label="INWARD_LOTS" value="892" delta="+24%" />
        <StatCard label="SYS_UPTIME" value="99.9%" delta="STABLE" />
      </div>
    </motion.div>
  );
}

function QuotationPage() {
  const [quotationNo, setQuotationNo] = useState(`VE-${Math.floor(2000 + Math.random() * 1000)}-${new Date().getFullYear().toString().slice(-2)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientDate, setClientDate] = useState(new Date().toISOString().split('T')[0]);
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientGSTIN, setClientGSTIN] = useState("");
  const [kindAttn, setKindAttn] = useState("");
  const [clientDCNo, setClientDCNo] = useState("");
  const [poNo, setPoNo] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  
  const [items, setItems] = useState([
    { id: 1, desc: '', identification: '', size: '', hsn: '', repair: 0, calib: 0, qty: 1 }
  ]);

  const addItem = () => setItems([...items, { id: Date.now(), desc: '', identification: '', size: '', hsn: '', repair: 0, calib: 0, qty: 1 }]);
  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i));
  };
  const removeItem = (id: number) => {
    if (items.length > 1) setItems(items.filter(i => i.id !== id));
  };

  const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const baseTotal = items.reduce((sum, item) => sum + ((Number(item.repair) + Number(item.calib)) * Number(item.qty)), 0);
  const discountAmount = (baseTotal * (discountPercent / 100));
  const netTotal = baseTotal - discountAmount;
  const roundedTotal = Math.round(netTotal);

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }) as any;
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
    doc.rect(marginL, 25, contentW, 8, 'S');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Quotation", pageW / 2, 31, { align: "center" });

    // ── CLIENT INFO GRID ──
    const infoY = 33;
    const leftW = contentW * 0.5;
    const rightW = contentW * 0.5;
    const rowH = 7;

    // Outer border
    doc.rect(marginL, infoY, contentW, rowH * 4, 'S');
    // Vertical divider
    doc.line(marginL + leftW, infoY, marginL + leftW, infoY + rowH * 4);
    // Horizontal dividers left side
    doc.line(marginL, infoY + rowH, marginL + leftW, infoY + rowH);
    doc.line(marginL, infoY + rowH * 2, marginL + leftW, infoY + rowH * 2);
    doc.line(marginL, infoY + rowH * 3, marginL + leftW, infoY + rowH * 3);
    // Horizontal dividers right side
    doc.line(marginL + leftW, infoY + rowH, marginL + contentW, infoY + rowH);
    doc.line(marginL + leftW, infoY + rowH * 2, marginL + contentW, infoY + rowH * 2);
    doc.line(marginL + leftW, infoY + rowH * 3, marginL + contentW, infoY + rowH * 3);
    // Vertical divider in right half (for Quotation No / Date split)
    const rightMid = marginL + leftW + rightW * 0.5;
    doc.line(rightMid, infoY, rightMid, infoY + rowH * 2);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    // Left column
    doc.text(`M/S- ${clientName}`, marginL + 2, infoY + 5);
    doc.text(clientAddress, marginL + 2, infoY + rowH + 5);
    doc.text(`GSTIN No- ${clientGSTIN}`, marginL + 2, infoY + rowH * 2 + 5);
    doc.text(`Kind Attn. ${kindAttn}`, marginL + 2, infoY + rowH * 3 + 5);
    // Right column top row
    doc.text(`Quotation No- ${quotationNo}`, marginL + leftW + 2, infoY + 5);
    doc.text(`Date- ${date}`, rightMid + 2, infoY + 5);
    // Right column second row
    doc.text(`Client DC No- ${clientDCNo}`, marginL + leftW + 2, infoY + rowH + 5);
    doc.text(`DATE- ${clientDate}`, rightMid + 2, infoY + rowH + 5);
    // Right column third row (PO NO spans full right)
    doc.text(`PO NO :- ${poNo}`, marginL + leftW + 2, infoY + rowH * 2 + 5);

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
      ((Number(item.repair) + Number(item.calib)) * Number(item.qty)).toFixed(2)
    ]);

    // Add empty rows to fill up to at least 15 rows
    const minRows = 15;
    while (tableData.length < minRows) {
      tableData.push(['', '', '', '', '', '', '', '', '']);
    }

    doc.autoTable({
      startY: tableStartY,
      head: [['Sr. No', 'Description', 'Identification', 'Size/Range/LC', 'HSN', 'Repair', 'Calibration', 'Qty', 'Amount']],
      body: tableData,
      theme: 'grid',
      margin: { left: marginL, right: marginR },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.3,
        lineColor: [0, 0, 0],
        halign: 'center',
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
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'left', cellWidth: 40 },
        2: { halign: 'center', cellWidth: 28 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'right', cellWidth: 18 },
        6: { halign: 'right', cellWidth: 20 },
        7: { halign: 'center', cellWidth: 10 },
        8: { halign: 'right', cellWidth: 24 },
      },
    });

    const afterTableY = (doc as any).lastAutoTable.finalY;

    // ── FOOTER SECTION ──
    const footerH = 36;
    const footerY = afterTableY;
    const totalsW = 60;
    const termsW = contentW - totalsW;

    // Outer border
    doc.rect(marginL, footerY, contentW, footerH, 'S');
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
    doc.text("Discount 15 %", marginL + 2, footerY + 20);
    doc.text("Validity :- 30 Days from date of our quotation", marginL + 2, footerY + 24);
    doc.text("Delivery :- 8 to 10 Day", marginL + 2, footerY + 28);
    doc.text("GST :-Extra as applicable 18%", marginL + 2, footerY + 32);
    doc.text("Payment :- Against Delivery", marginL + 2, footerY + 36);

    // Totals (right side)
    const totalsX = marginL + termsW;
    const totRowH = 9;
    // Horizontal lines for totals rows
    doc.line(totalsX, footerY + totRowH, marginL + contentW, footerY + totRowH);
    doc.line(totalsX, footerY + totRowH * 2, marginL + contentW, footerY + totRowH * 2);
    doc.line(totalsX, footerY + totRowH * 3, marginL + contentW, footerY + totRowH * 3);
    // Vertical divider inside totals (label | value)
    const totLabelW = 28;
    doc.line(totalsX + totLabelW, footerY, totalsX + totLabelW, footerY + footerH);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    const totRows = [
      { label: 'Total Qty.', value: String(totalQty) },
      { label: `Discount ${discountPercent} %`, value: discountAmount.toFixed(2) },
      { label: 'Total', value: netTotal.toFixed(2) },
      { label: 'R/O Amount', value: String(roundedTotal) },
    ];
    totRows.forEach((row, i) => {
      const rowY = footerY + totRowH * i + 6;
      doc.text(row.label, totalsX + 2, rowY);
      doc.text(row.value, marginL + contentW - 2, rowY, { align: 'right' });
    });

    // ── SIGNATURE ──
    const sigY = footerY + footerH + 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Yours Faithfully", marginL + contentW, sigY, { align: 'right' });
    doc.setFont("helvetica", "bold");
    doc.text("VIKRAMADITYA ENTERPRISES", marginL + contentW, sigY + 6, { align: 'right' });

    doc.save(`Quotation_${quotationNo}.pdf`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 lg:p-10 print:p-0 max-w-[1400px] mx-auto w-full flex flex-col gap-6 font-sans">
      <div className="bg-white border border-gray-300 print:border-none shadow-sm print:shadow-none flex flex-col">

        {/* --- PRINT HEADER (only visible when printing) --- */}
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

        {/* --- SCREEN HEADER --- */}
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

        {/* ================================================================
            QUOTATION FORM BODY
            On screen: normal padded layout
            On print:  zero padding, compact, fits A4
        ================================================================ */}
        <div className="p-6 md:p-8 flex flex-col print:p-0">

          {/* ── CLIENT INFO: single-column full-width rows ── */}
          <div className="border-2 border-black">

            {/* Row 1: M/S */}
            <div className="border-b-2 border-black px-2 py-1">
              <span className="text-[9px] font-bold text-gray-500 uppercase print:text-black">M/S-</span>
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full font-bold text-sm outline-none border-none bg-transparent text-black mt-0.5"
                placeholder="CLIENT NAME PVT LTD"
              />
            </div>

            {/* Row 2: Address */}
            <div className="border-b-2 border-black px-2 py-1">
              <input
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                className="w-full text-xs outline-none border-none bg-transparent text-black"
                placeholder="CLIENT FULL ADDRESS, CITY - PIN"
              />
            </div>

            {/* Row 3: GSTIN */}
            <div className="border-b-2 border-black px-2 py-1 flex items-center gap-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase print:text-black whitespace-nowrap">GSTIN No-</span>
              <input
                value={clientGSTIN}
                onChange={(e) => setClientGSTIN(e.target.value)}
                className="flex-1 font-bold text-sm outline-none border-none bg-transparent text-black"
                placeholder="27AAACE..."
              />
            </div>

            {/* Row 4: Kind Attn */}
            <div className="border-b-2 border-black px-2 py-1 flex items-center gap-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase print:text-black whitespace-nowrap">Kind Attn.</span>
              <input
                value={kindAttn}
                onChange={(e) => setKindAttn(e.target.value)}
                className="flex-1 font-bold text-sm outline-none border-none bg-transparent text-black"
                placeholder="Mr. Contact Person"
              />
            </div>

            {/* Row 5: Quotation No | Date */}
            <div className="border-b-2 border-black grid grid-cols-2">
              <div className="border-r-2 border-black px-2 py-1">
                <div className="text-[9px] font-bold text-gray-500 uppercase print:text-black">Quotation No-</div>
                <input
                  value={quotationNo}
                  onChange={(e) => setQuotationNo(e.target.value)}
                  className="w-full font-bold text-sm outline-none border-none bg-transparent text-black"
                />
              </div>
              <div className="px-2 py-1">
                <div className="text-[9px] font-bold text-gray-500 uppercase print:text-black">Date-</div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full font-bold text-sm outline-none border-none bg-transparent text-black"
                />
              </div>
            </div>

            {/* Row 6: Client DC No | DATE */}
            <div className="border-b-2 border-black grid grid-cols-2">
              <div className="border-r-2 border-black px-2 py-1">
                <div className="text-[9px] font-bold text-gray-500 uppercase print:text-black">Client DC No-</div>
                <input
                  value={clientDCNo}
                  onChange={(e) => setClientDCNo(e.target.value)}
                  className="w-full font-bold text-sm outline-none border-none bg-transparent text-black"
                  placeholder="040007"
                />
              </div>
              <div className="px-2 py-1">
                <div className="text-[9px] font-bold text-gray-500 uppercase print:text-black">DATE-</div>
                <input
                  type="date"
                  value={clientDate}
                  onChange={(e) => setClientDate(e.target.value)}
                  className="w-full font-bold text-sm outline-none border-none bg-transparent text-black"
                />
              </div>
            </div>

            {/* Row 7: PO NO */}
            <div className="px-2 py-1 flex items-center gap-2">
              <span className="text-[9px] font-bold text-gray-500 uppercase print:text-black whitespace-nowrap">PO NO :-</span>
              <input
                value={poNo}
                onChange={(e) => setPoNo(e.target.value)}
                className="flex-1 font-bold text-sm outline-none border-none bg-transparent text-black"
              />
            </div>
          </div>

          {/* ── ITEMS TABLE ── */}
          <div className="overflow-x-auto print:overflow-visible mt-0">
            <table className="w-full text-left border-collapse font-sans text-xs min-w-[900px] print:min-w-full border-2 border-black border-t-0">
              <thead>
                <tr className="border-b-2 border-black text-black bg-white">
                  <th className="p-1.5 font-bold border-r-2 border-black w-10 text-center uppercase text-[10px]">Sr.<br/>No</th>
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
                  <tr key={item.id} className="border-b border-black text-black align-middle">
                    <td className="border-r-2 border-black text-center font-mono text-xs py-1">{idx + 1}</td>
                    <td className="p-0 border-r-2 border-black">
                      <textarea
                        value={item.desc}
                        onChange={(e) => updateItem(item.id, 'desc', e.target.value)}
                        className="w-full p-1.5 outline-none border-none resize-none bg-transparent text-black text-xs"
                        rows={2}
                      />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <textarea
                        value={item.identification}
                        onChange={(e) => updateItem(item.id, 'identification', e.target.value)}
                        className="w-full p-1.5 outline-none border-none resize-none bg-transparent text-center text-black text-xs"
                        rows={2}
                      />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <input value={item.size} onChange={(e) => updateItem(item.id, 'size', e.target.value)} className="w-full p-1.5 outline-none border-none bg-transparent text-center text-black text-xs" />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <input value={item.hsn} onChange={(e) => updateItem(item.id, 'hsn', e.target.value)} className="w-full p-1.5 outline-none border-none bg-transparent text-center font-mono text-black text-xs" />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <input type="number" value={item.repair} onChange={(e) => updateItem(item.id, 'repair', parseFloat(e.target.value) || 0)} className="w-full p-1.5 outline-none border-none bg-transparent text-right font-mono text-black text-xs" />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <input type="number" value={item.calib} onChange={(e) => updateItem(item.id, 'calib', parseFloat(e.target.value) || 0)} className="w-full p-1.5 outline-none border-none bg-transparent text-right font-mono text-black text-xs" />
                    </td>
                    <td className="p-0 border-r-2 border-black">
                      <input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseInt(e.target.value) || 0)} className="w-full p-1.5 outline-none border-none bg-transparent text-center font-mono text-black text-xs" />
                    </td>
                    <td className="p-1.5 text-right font-bold text-black text-xs">
                      {((Number(item.repair) + Number(item.calib)) * Number(item.qty)).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {/* Empty filler rows */}
                {[...Array(Math.max(0, 10 - items.length))].map((_, i) => (
                  <tr key={`empty-${i}`} className="border-b border-black h-7">
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td className="border-r-2 border-black"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── BOTTOM SECTION: Notes + Totals side by side ── */}
          <div className="border-2 border-black border-t-0 grid grid-cols-[1fr_220px]">

            {/* Left: italic note + Terms */}
            <div className="">
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

            {/* Right: Totals */}
            <div className="flex flex-col text-[10px] font-bold self-stretch border-l-2 border-black">
              {/* Total Qty */}
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                <div className="px-2 py-1 border-r border-black uppercase text-gray-700">Total Qty.</div>
                <div className="px-2 py-1 text-right text-black">{totalQty}</div>
              </div>
              {/* Discount */}
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                <div className="px-2 py-1 border-r border-black uppercase text-gray-700 flex items-center gap-1">
                  Discount
                  <span className="print:hidden">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-7 outline-none border-b border-black text-black text-center"
                    />
                  </span>
                  <span className="hidden print:inline">{discountPercent}</span>
                  &nbsp;%
                </div>
                <div className="px-2 py-1 text-right text-black">{discountAmount.toFixed(2)}</div>
              </div>
              {/* Total */}
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                <div className="px-2 py-1 border-r border-black uppercase text-gray-700">Total</div>
                <div className="px-2 py-1 text-right text-black">{netTotal.toFixed(2)}</div>
              </div>
              {/* R/O Amount */}
              <div className="grid grid-cols-[130px_1fr] border-b border-black">
                <div className="px-2 py-1 border-r border-black uppercase text-gray-700">R/O Amount</div>
                <div className="px-2 py-1 text-right text-black font-black">{roundedTotal}</div>
              </div>
            </div>
          </div>

          {/* ── SIGNATURE + ADD ROW ── */}
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

const MOCK_CLIENTS: any = {
  "T-1000": { name: "CYBERDYNE SYSTEMS", address: "Tech Tower, Sector 7, Neo-Tokyo, Japan", contact: "SARAH CONNOR", email: "sc@cyberdyne.io", lastWork: "2024-03-12" },
  "W-40K": { name: "ADEPTUS MECHANICUS", address: "Iron Temple, Forge World Mars, Sol System", contact: "BELISARIUS CAWL", email: "cawl@mars.tech", lastWork: "2024-04-01" },
  "ST-01": { name: "STARFLEET COMMAND", address: "Presidio, San Francisco, United Earth", contact: "GEORDI LA FORGE", email: "geordi@utc.sf", lastWork: "2024-01-20" }
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

function PurchaseOrderPage() {
  const [poNumber, setPoNumber] = useState(`PO-${Math.floor(100000 + Math.random() * 900000)}`);
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [clientIdSearch, setClientIdSearch] = useState("");
  const [items, setItems] = useState<POItem[]>([
    { id: '1', poCode: '', particular: '', category: '', size: '', qty: 1, repair: 0, calibration: 0, discount: 0 }
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

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), poCode: '', particular: '', category: '', size: '', qty: 1, repair: 0, calibration: 0, discount: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof POItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (['qty', 'repair', 'calibration', 'discount'].includes(field)) {
          const numValue = parseFloat(value) || 0;
          return { ...item, [field]: Math.max(0, numValue) };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateFinalRate = (item: POItem) => {
    const base = item.repair + item.calibration;
    const discounted = base * (1 - item.discount / 100);
    return discounted;
  };

  const calculateRowTotal = (item: POItem) => {
    return calculateFinalRate(item) * item.qty;
  };

  const summary = useMemo(() => {
    return items.reduce((acc, item) => ({
      qty: acc.qty + item.qty,
      total: acc.total + calculateRowTotal(item)
    }), { qty: 0, total: 0 });
  }, [items]);

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

    const tableData = items.map(item => [
      item.poCode,
      item.particular,
      item.category,
      item.size,
      item.qty,
      item.repair.toFixed(2),
      item.calibration.toFixed(2),
      `${item.discount}%`,
      calculateFinalRate(item).toFixed(2),
      calculateRowTotal(item).toFixed(2)
    ]);

    doc.autoTable({
      startY: 70,
      head: [['Code', 'Particular', 'Category', 'Size', 'Qty', 'Repair', 'Calib.', 'Disc%', 'Rate', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [249, 115, 22] }, // brand-orange
      styles: { fontSize: 8 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total Quantity: ${summary.qty}`, 150, finalY);
    doc.text(`Total Amount: ${summary.total.toFixed(2)}`, 150, finalY + 5);

    doc.save(`${poNumber}.pdf`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 lg:p-10 print:p-0 max-w-[1400px] mx-auto w-full flex flex-col gap-6 font-sans">
      <div className="bg-white border border-gray-300 print:border-none shadow-sm print:shadow-none flex flex-col">
        {/* Print Only Company Header */}
        <div className="hidden print:flex flex-col items-center py-6 border-b-2 border-black mb-4">
          <h1 className="text-3xl font-black uppercase tracking-widest text-black text-center">Vikramaditya Precision</h1>
          <p className="text-sm font-medium text-black mt-1 text-center">123 Metrology Park, Neo-Tech Sector, Phase 4</p>
          <p className="text-xs font-mono text-black mt-1 text-center">Phone: +91 9876543210 | Email: contact@vikramaditya.com</p>
        </div>

        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-300 print:hidden p-5 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800">Purchase Order</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">INTERNAL_DOC // GENERATION_NODE</p>
          </div>
          <div className="flex gap-3 print:hidden">
            <button onClick={() => window.print()} className="bg-white border border-gray-300 text-gray-700 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 flex items-center gap-2">
              <Printer size={14} /> Print
            </button>
            <button onClick={exportPDF} className="bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2">
              <FileDown size={14} /> Export PDF
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col gap-8 print:p-0">
           {/* Section 1: Header Data */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-6 flex-1">
             <div className="flex flex-col gap-4">
               <div>
                 <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 block">Customer PO No</label>
                 <input value={poNumber} readOnly className="w-full bg-gray-50 border border-gray-300 print:border-b print:border-gray-400 p-2 text-sm text-gray-600 cursor-not-allowed font-mono" />
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 block">PO Date</label>
                 <input type="date" value={poDate} readOnly className="w-full bg-gray-50 border border-gray-300 print:border-b print:border-gray-400 p-2 text-sm text-gray-600 cursor-not-allowed font-mono" />
               </div>
             </div>

             <div className="lg:col-span-2 flex flex-col gap-4">
               <div className="flex flex-col md:flex-row gap-4">
                 <div className="flex-1">
                   <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 block">Customer Name</label>
                   <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-white border border-gray-300 print:border-b print:border-gray-400 p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow text-black" placeholder="Enter customer name..." />
                 </div>
                 <div className="w-full md:w-48 print:hidden">
                   <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 block">Fetch By ID</label>
                   <div className="flex h-[38px]">
                     <input value={clientIdSearch} onChange={(e) => setClientIdSearch(e.target.value)} className="w-full bg-white border border-r-0 border-gray-300 p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-black font-mono w-24" placeholder="ID..." />
                     <button onClick={fetchClientDetails} className="bg-gray-800 text-white px-3 font-bold text-xs uppercase tracking-widest hover:bg-gray-700 transition-colors flex-1">
                       Sync
                     </button>
                   </div>
                 </div>
               </div>
               <div>
                 <label className="text-xs font-bold text-gray-700 uppercase tracking-widest mb-1.5 block">Customer Address</label>
                 <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} className="w-full bg-white border border-gray-300 print:border-b print:border-gray-400 p-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow text-black" placeholder="Client location details..." />
               </div>
             </div>
           </div>

           {/* Section 2: Items Table */}
           <div className="mt-4">
             <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-4 print:hidden">
               <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Item Matrix</h3>
               <button onClick={addItem} className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 uppercase">
                 <Plus size={14} /> Add Row
               </button>
             </div>
             
             <div className="border border-gray-300 print:border-none overflow-x-auto">
               <table className="w-full text-left text-sm min-w-[1000px] print:min-w-full">
                 <thead className="bg-gray-100 print:bg-gray-100 border-b border-gray-300 text-gray-700">
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
                     <th className="p-3 w-10 print:hidden"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200">
                   {items.map((item) => (
                     <tr key={item.id} className="group hover:bg-gray-50 text-gray-800 print:break-inside-avoid">
                       <td className="p-0 border-r border-gray-300">
                         <input value={item.poCode} onChange={(e) => updateItem(item.id, 'poCode', e.target.value)} className="w-full p-2.5 print:px-1 bg-transparent focus:bg-blue-50 focus:outline-none font-mono text-xs text-black" />
                       </td>
                       <td className="p-0 border-r border-gray-300">
                         <input value={item.particular} onChange={(e) => updateItem(item.id, 'particular', e.target.value)} className="w-full p-2.5 print:px-1 bg-transparent focus:bg-blue-50 focus:outline-none text-black" />
                       </td>
                       <td className="p-0 border-r border-gray-300">
                         <input value={item.category} onChange={(e) => updateItem(item.id, 'category', e.target.value)} className="w-full p-2.5 print:px-1 bg-transparent focus:bg-blue-50 focus:outline-none text-black" />
                       </td>
                       <td className="p-0 border-r border-gray-300">
                         <input value={item.size} onChange={(e) => updateItem(item.id, 'size', e.target.value)} className="w-full p-2.5 print:px-1 bg-transparent focus:bg-blue-50 focus:outline-none text-black" />
                       </td>
                       <td className="p-0 border-r border-gray-300">
                         <input type="number" min="1" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} className="w-full p-2.5 print:px-1 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-black" />
                       </td>
                       <td className="p-0 border-r border-gray-300">
                         <input type="number" min="0" value={item.repair} onChange={(e) => updateItem(item.id, 'repair', e.target.value)} className="w-full p-2.5 print:px-1 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-black" />
                       </td>
                       <td className="p-0 border-r border-gray-300">
                         <input type="number" min="0" value={item.calibration} onChange={(e) => updateItem(item.id, 'calibration', e.target.value)} className="w-full p-2.5 print:px-1 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-black" />
                       </td>
                       <td className="p-0 border-r border-gray-300">
                         <input type="number" min="0" value={item.discount} onChange={(e) => updateItem(item.id, 'discount', e.target.value)} className="w-full p-2.5 print:px-1 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-black" />
                       </td>
                       <td className="p-2.5 print:px-1 text-right font-mono font-semibold bg-gray-50 print:bg-transparent border-r border-gray-300 text-gray-600">
                         {calculateFinalRate(item).toFixed(2)}
                       </td>
                       <td className="p-2.5 print:px-1 text-right font-mono font-bold bg-gray-50 print:bg-transparent border-r border-gray-300 text-black">
                         {calculateRowTotal(item).toFixed(2)}
                       </td>
                       <td className="p-2 text-center text-gray-400 print:hidden">
                         <button onClick={() => removeItem(item.id)} className="hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Trash2 size={16} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
                 <tfoot className="bg-gray-100 print:bg-gray-100 border-t border-gray-300 text-gray-800">
                   <tr>
                     <td colSpan={4} className="p-3 text-right font-bold uppercase tracking-widest border-r border-gray-300 pr-4">Totals</td>
                     <td className="p-3 text-right font-mono font-bold text-black border-r border-gray-300 text-base">{summary.qty}</td>
                     <td colSpan={4} className="border-r border-gray-300"></td>
                     <td className="p-3 text-right font-mono font-bold text-black text-lg">{summary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                     <td className="print:hidden"></td>
                   </tr>
                 </tfoot>
               </table>
             </div>
           </div>

           <div className="flex justify-end pt-2 print:hidden">
             <p className="text-xs font-mono text-gray-400">
               AUTO_CALC_ENABLED // VERIFIED_PARAMETERS
             </p>
           </div>
           
           {/* Print Only Footer */}
           <div className="hidden print:flex flex-row justify-between items-end mt-24 pt-8">
             <div className="text-center">
               <div className="w-48 border-b-2 border-black mb-2 mx-auto"></div>
               <p className="font-bold text-xs uppercase tracking-widest text-black">Prepared By</p>
             </div>
             <div className="text-center">
               <div className="w-48 border-b-2 border-black mb-2 mx-auto"></div>
               <p className="font-bold text-xs uppercase tracking-widest text-black">Authorized Signatory & Stamp</p>
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function MaterialInwardPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full flex flex-col gap-6 font-sans">
      {/* Module Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Pending Inspect" value="12" delta="+3 from yesterday" />
        <StatCard label="QC Passed Today" value="48" delta="+12%" />
        <StatCard label="Rejected Units" value="02" delta="-5% improvement" />
        <StatCard label="Avg Turnaround" value="4.2h" delta="Target: <6h" />
      </div>

      <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-300 p-5 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800">Material Inward Log (GRN)</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">INTERNAL_LOG // NODE_ACCESS_STABLE</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
              <Printer size={14} /> Reports
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
              <Plus size={14} /> Log Inward
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">
           <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-4">
             <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Incoming Consignments</h3>
             <div className="flex gap-2 text-[11px] font-mono">
               <span className="text-gray-400">FILTER_BY:</span>
               <button className="text-blue-600 font-bold hover:underline">ALL</button>
               <span className="text-gray-300">|</span>
               <button className="text-gray-500 hover:text-blue-600">PENDING</button>
               <span className="text-gray-300">|</span>
               <button className="text-gray-500 hover:text-blue-600">COMPLETED</button>
             </div>
           </div>

           <div className="border border-gray-300 overflow-x-auto">
             <table className="w-full text-left text-sm min-w-[1000px]">
               <thead className="bg-gray-100 border-b border-gray-300 text-gray-700">
                 <tr>
                   <th className="p-3 font-bold border-r border-gray-300 w-32">Inward ID</th>
                   <th className="p-3 font-bold border-r border-gray-300 w-32">PO Ref</th>
                   <th className="p-3 font-bold border-r border-gray-300">Client / Source</th>
                   <th className="p-3 font-bold border-r border-gray-300">Description</th>
                   <th className="p-3 font-bold border-r border-gray-300 w-24 text-right">Qty</th>
                   <th className="p-3 font-bold border-gray-300 w-44">Inward Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200">
                 <InwardRow id="IN-8892" po="PO-2991" client="CYBERDYNE SYSTEMS" desc="CPU_DIE_CAST_HOUSING_V4" qty="250 NOS" status="INSPECTION_PENDING" />
                 <InwardRow id="IN-8893" po="PO-2995" client="STARFLEET COMMAND" desc="WARP_COIL_CASING_PRIMARY" qty="12 NOS" status="STORED" />
                 <InwardRow id="IN-8894" po="PO-3001" client="ADEPTUS MECHANICUS" desc="CERAMITE_PLATES_HEAVY" qty="1,500 NOS" status="QC_PASS" active />
                 <InwardRow id="IN-8895" po="PO-3002" client="CYBERDYNE SYSTEMS" desc="HYDRAULIC_ACTUATORS_L" qty="45 NOS" status="QC_REJECT" alert />
                 <InwardRow id="IN-8896" po="PO-3011" client="WEYLAND-YUTANI" desc="ATMOSPHERIC_PROCESSOR_VALVE" qty="8 NOS" status="IN_TRANSIT" />
                 <InwardRow id="IN-8897" po="PO-3015" client="OSCORP CORP" desc="BIO_MODULAR_UNIT_ALPHA" qty="1 UNIT" status="INSPECTION_PENDING" />
               </tbody>
             </table>
           </div>
           
           <div className="mt-6 flex justify-between items-center text-xs text-gray-400 font-mono">
             <div>SYSTEM_TIME: {new Date().toLocaleTimeString()} // NODE_LOCAL</div>
             <div>SHOWING 6 OF 1,244 RECORDS</div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Helper Components ---

function StatCard({ label, value, delta }: any) {
  return (
    <div className="bg-white hairline-border p-6 flex flex-col gap-2 hover:bg-industrial-low transition-colors group">
      <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">{label}</div>
      <div className="text-4xl font-black text-black group-hover:text-brand-orange transition-colors tracking-tighter">{value}</div>
      <div className={`text-xs font-mono ${delta.includes('+') ? 'text-green-500' : delta.includes('-') ? 'text-red-500' : 'text-gray-400'}`}>
        {delta}
      </div>
    </div>
  );
}

function InwardRow({ id, po, client, desc, qty, status, alert = false, active = false }: any) {
  return (
    <tr className={`hover:bg-gray-50 text-gray-800 transition-colors ${alert ? 'bg-red-50/50' : active ? 'bg-green-50/50' : ''}`}>
       <td className="p-3 border-r border-gray-300 font-mono text-xs font-bold text-blue-600">{id}</td>
       <td className="p-3 border-r border-gray-300 font-mono text-xs text-gray-500">{po}</td>
       <td className="p-3 border-r border-gray-300 font-bold">{client}</td>
       <td className="p-3 border-r border-gray-300 text-gray-600 text-xs">{desc}</td>
       <td className="p-3 border-r border-gray-300 text-right font-mono text-xs font-semibold">{qty}</td>
       <td className="p-3">
         <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${alert ? 'bg-red-500 animate-pulse' : active ? 'bg-green-500' : status === 'STORED' ? 'bg-blue-500' : 'bg-yellow-500 animate-pulse'}`} />
           <span className={`text-[10px] font-bold uppercase tracking-wider ${alert ? 'text-red-700' : active ? 'text-green-700' : 'text-gray-600'}`}>
             {status}
           </span>
         </div>
       </td>
    </tr>
  );
}

// --- Helper Components ---

function ModuleAccents({ label }: { label?: string }) {
  return (
    <>
      <div className="crosshair crosshair-tl -top-[1px] -left-[1px]" />
      <div className="crosshair crosshair-tr -top-[1px] -right-[1px]" />
      <div className="crosshair crosshair-bl -bottom-[1px] -left-[1px]" />
      <div className="crosshair crosshair-br -bottom-[1px] -right-[1px]" />
    </>
  );
}

function DiagnosticCard({ icon, title, description, metricLabel, metricValue, status }: any) {
  return (
    <div className="bg-white p-6 flex flex-col gap-4 hover:bg-industrial-low transition-colors group cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        <span className="font-mono text-[11px] text-gray-400">{status}</span>
      </div>
      <h3 className="font-display text-xl uppercase leading-none mt-2">{title}</h3>
      <p className="font-sans text-xs text-industrial-text-variant leading-relaxed min-h-[3rem]">
        {description}
      </p>
      <div className="mt-auto pt-4 border-t border-[#c8c6c5] flex justify-between font-mono text-[11px] tracking-wider">
        <span className="text-gray-400">{metricLabel}</span>
        <span className={metricValue.includes('<') ? "text-brand-orange font-bold" : "text-black"}>
          {metricValue}
        </span>
      </div>
    </div>
  );
}

function TelemetryRow({ id, nominal, measured, deviation, status, alert = false }: any) {
  return (
    <tr className={`group hover:bg-industrial-low transition-colors ${alert ? "bg-industrial-high/50" : ""}`}>
      <td className="p-4 text-black font-semibold">{id}</td>
      <td className="p-4 text-gray-500">{nominal}</td>
      <td className={`p-4 font-bold ${alert ? "text-brand-orange" : "text-black"}`}>{measured}</td>
      <td className={`p-4 font-bold ${alert ? "text-brand-orange" : "text-black"}`}>{deviation}</td>
      <td className="p-4">
        <span className={`px-2 py-0.5 text-xs font-bold ${alert ? "bg-brand-orange text-white" : "bg-industrial-low text-black"}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

function LabMetric({ icon, label, value, delta, status }: any) {
  return (
    <div className="bg-white hairline-border p-4 flex flex-col gap-2">
      <div className="flex justify-between">
        <div className="text-gray-400">{icon}</div>
        <span className="bg-gray-100 px-1 font-mono text-[8px] flex items-center">{status}</span>
      </div>
      <div className="text-xs font-mono text-gray-500">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tighter">{value}</span>
        <span className="text-xs text-gray-400">{delta}</span>
      </div>
    </div>
  );
}

function EquipmentRow({ name, type, accuracy }: any) {
  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-industrial-low transition-colors">
      <div className="flex flex-col">
        <span className="text-sm font-bold">{name}</span>
        <span className="text-[11px] font-mono text-gray-400">{type}</span>
      </div>
      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5">{accuracy}</span>
    </div>
  );
}

function CertCard({ icon, title, description, date }: any) {
  return (
    <div className="bg-white hairline-border p-6 flex flex-col gap-4">
      <div className="text-brand-orange">{icon}</div>
      <h3 className="font-display text-xl uppercase tracking-tighter">{title}</h3>
      <p className="text-sm text-industrial-text-variant leading-relaxed">{description}</p>
      <div className="text-xs font-mono text-gray-400 mt-2">{date}</div>
    </div>
  );
}

function FooterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <span className="text-white border-b border-gray-800 pb-2 mb-2 font-black">{title}</span>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}

// --- Party Registration Page ---
interface Party {
  id: number;
  name: string;
  address: string;
  contact: string;
  gstNo: string;
  email: string;
}

const INITIAL_PARTIES: Party[] = [
  { id: 12,  name: "ANWITA ENTERPRISES",                    address: "DR. J.J. MAGDUM HSG. SOC. PLOT NO. 37, MOUJE AGAR JAYSINGPUR, TAL. SHIROL, DIST- KOLHAPUR", contact: "7757865993", gstNo: "27APJPC2174D1Z8", email: "-" },
  { id: 56,  name: "Sound Castings Pvt. Ltd. Unit-3",       address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.", contact: "7744053500", gstNo: "27AACCS5263N1ZW", email: "pratiraj.patil@soundcastings.com" },
  { id: 105, name: "SHRI DATTA FOUNDERS AND ENGINEERS PVT.LTD.", address: "B-33, M.I.D.C. SHIROLI, KOLHAPUR-416122", contact: "9049879305", gstNo: "27AANCS0625R1ZM", email: "vishalpadalkar.sdf@gmail.com" },
  { id: 572, name: "ASHTVINAYAK ENGINEERS",                 address: "KUSHIRE",                                                                                    contact: "-",          gstNo: "-",              email: "-" },
  { id: 686, name: "SAMRUDDHI ENGINEERS",                   address: "Gat No. 522/1, Plot No. 2, Vijaynagar, Nerli, MIDC Gokul Shirgaon, Kolhapur- 416 234",      contact: "9890249086", gstNo: "27AKYPM5715A1ZY", email: "smruddhi.3@gmail.com" },
  { id: 843, name: "EAGAR STAR",                            address: "G-95, SHIROLI MIDC, KOLHAPUR",                                                               contact: "-",          gstNo: "27AAJFE7714N1ZX", email: "-" },
  { id: 848, name: "Sound Castings Pvt. Ltd. Unit-3 (IFDC)", address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.",      contact: "9970678872", gstNo: "27AACCS5263N1ZW", email: "Shekhar.Khot@soundcastings.com" },
  { id: 849, name: "QA SOUND CASTING PVT. LTD.",            address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.",       contact: "8805967627", gstNo: "27AACCS5263N1ZW", email: "paresh.bhagwat@soundcastings.com" },
  { id: 850, name: "AATHARV ENTERPRISES",                   address: "G-95, SHIROLI MIDC, KOLHAPUR",                                                               contact: "8180909007", gstNo: "27EMHPP4751A1Z2", email: "-" },
  { id: 859, name: "METACAST AUTO PRIVATE LIMITED",         address: "PLOT NO.T-26 KAGAL - HATKANANGALE FIVE STAR INDUSTRIAL AREA KOLHAPUR",                       contact: "-",          gstNo: "27AAQCM8947H1ZO", email: "-" },
];

function PartyRegistrationPage() {
  // ── Form state ──
  const [regNo,          setRegNo]          = useState("");
  const [companyName,    setCompanyName]    = useState("");
  const [contactPerson,  setContactPerson]  = useState("");
  const [address,        setAddress]        = useState("");
  const [email,          setEmail]          = useState("");
  const [contact,        setContact]        = useState("");
  const [gstNo,          setGstNo]          = useState("");
  const [gstType,        setGstType]        = useState("CGST/SGST");
  const [otherAccess,    setOtherAccess]    = useState("No");
  const [billingRateType,setBillingRateType]= useState("Fixed Discount %");
  const [discountRate,   setDiscountRate]   = useState("");
  const [collabMethod,   setCollabMethod]   = useState("Lab Method");
  const [reportingMethod,setReportingMethod]= useState("Lab Format");
  const [collationMethod,setCollationMethod]= useState("By Hand");
  const [dispatchMethod, setDispatchMethod] = useState("By Hand");
  const [compliance,     setCompliance]     = useState("Required");
  const [decisionRule,   setDecisionRule]   = useState("Yes");
  const [billingFirm,    setBillingFirm]    = useState("Vikramaditya Calibration");

  // ── Table state ──
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
      setParties(parties.map(p => p.id === editingId
        ? { ...p, name: companyName, address, contact, gstNo, email }
        : p
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

  const fieldCls = "w-full bg-white border border-gray-300 text-black text-xs px-2 py-1.5 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange transition-colors";
  const selectCls = "w-full bg-white border border-gray-300 text-black text-xs px-2 py-1.5 focus:outline-none focus:border-brand-orange appearance-none cursor-pointer";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1400px] mx-auto w-full flex flex-col gap-6">

      {/* ── PAGE TITLE BAR ── */}
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

      {/* ── FORM PANEL ── */}
      <div className="bg-white border-2 border-black shadow-sm">
        {/* Panel header */}
        <div className="bg-black text-white px-4 py-2 flex items-center justify-between">
          <span className="font-display font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <UserPlus size={13} /> Enter Party Details
          </span>
          <div className="flex items-center gap-3 font-mono text-[10px] text-gray-400">
            <span>{editingId !== null ? `EDITING ID: ${editingId}` : "NEW ENTRY"}</span>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">

          {/* Row 1 */}
          <div>
            <label className={labelCls}>Reg. No</label>
            <input value={regNo} onChange={e => setRegNo(e.target.value)} className={fieldCls} placeholder="" />
          </div>
          <div>
            <label className={labelCls}>Company Name</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} className={fieldCls} placeholder="" />
          </div>

          {/* Row 2 */}
          <div>
            <label className={labelCls}>Contact Person</label>
            <input value={contactPerson} onChange={e => setContactPerson(e.target.value)} className={fieldCls} placeholder="" />
          </div>
          <div>
            <label className={labelCls}>Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} className={fieldCls} placeholder="" />
          </div>

          {/* Row 3 */}
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={fieldCls} placeholder="" />
          </div>
          <div>
            <label className={labelCls}>Contact</label>
            <input value={contact} onChange={e => setContact(e.target.value)} className={fieldCls} placeholder="" />
          </div>

          {/* Row 4 */}
          <div>
            <label className={labelCls}>GST No</label>
            <input value={gstNo} onChange={e => setGstNo(e.target.value)} className={fieldCls} placeholder="" />
          </div>
          <div>
            <label className={labelCls}>GST Type</label>
            <div className="relative">
              <select value={gstType} onChange={e => setGstType(e.target.value)} className={selectCls}>
                <option>CGST/SGST</option><option>IGST</option><option>Exempt</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 5 */}
          <div>
            <label className={labelCls}>Other Access to</label>
            <div className="relative">
              <select value={otherAccess} onChange={e => setOtherAccess(e.target.value)} className={selectCls}>
                <option>No</option><option>Yes</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Billing Rate Type</label>
            <div className="relative">
              <select value={billingRateType} onChange={e => setBillingRateType(e.target.value)} className={selectCls}>
                <option>Fixed Discount %</option><option>Custom Rate</option><option>Standard Rate</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 6 */}
          <div>
            <label className={labelCls}>Discount Rate (%)</label>
            <input type="number" value={discountRate} onChange={e => setDiscountRate(e.target.value)} className={fieldCls} placeholder="" />
          </div>
          <div>
            <label className={labelCls}>Collaboration Method to be used</label>
            <div className="relative">
              <select value={collabMethod} onChange={e => setCollabMethod(e.target.value)} className={selectCls}>
                <option>Lab Method</option><option>Customer Method</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 7 */}
          <div>
            <label className={labelCls}>Method of Reporting</label>
            <div className="relative">
              <select value={reportingMethod} onChange={e => setReportingMethod(e.target.value)} className={selectCls}>
                <option>Lab Format</option><option>Customer Format</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Method of Collation</label>
            <div className="relative">
              <select value={collationMethod} onChange={e => setCollationMethod(e.target.value)} className={selectCls}>
                <option>By Hand</option><option>Digital</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 8 */}
          <div>
            <label className={labelCls}>Method of Dispatch</label>
            <div className="relative">
              <select value={dispatchMethod} onChange={e => setDispatchMethod(e.target.value)} className={selectCls}>
                <option>By Hand</option><option>Courier</option><option>Email</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Compliance Statement</label>
            <div className="relative">
              <select value={compliance} onChange={e => setCompliance(e.target.value)} className={selectCls}>
                <option>Required</option><option>Not Required</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Row 9 */}
          <div>
            <label className={labelCls}>If yes Decision Rule is discussed, understand &amp; acceptable or not</label>
            <div className="relative">
              <select value={decisionRule} onChange={e => setDecisionRule(e.target.value)} className={selectCls}>
                <option>Yes</option><option>No</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={labelCls}>Billing Firm</label>
            <div className="relative">
              <select value={billingFirm} onChange={e => setBillingFirm(e.target.value)} className={selectCls}>
                <option>Vikramaditya Calibration</option><option>Vikramaditya Enterprises</option>
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 flex items-center gap-2 border-t border-gray-100 pt-4">
          <button
            onClick={handleSave}
            className="bg-brand-orange text-white font-mono text-xs font-bold px-5 py-2 border-2 border-brand-orange hover:bg-black transition-all uppercase tracking-widest"
          >
            Save
          </button>
          <button
            onClick={handleSave}
            disabled={editingId === null}
            className="bg-white text-black font-mono text-xs font-bold px-5 py-2 border-2 border-black hover:bg-gray-100 transition-all uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Update
          </button>
          <button
            onClick={handleDelete}
            disabled={editingId === null}
            className="bg-white text-red-600 font-mono text-xs font-bold px-5 py-2 border-2 border-red-300 hover:bg-red-50 transition-all uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Delete
          </button>
          {editingId !== null && (
            <button
              onClick={resetForm}
              className="bg-white text-gray-500 font-mono text-xs px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── PARTY TABLE ── */}
      <div className="bg-white border-2 border-black shadow-sm">
        {/* Table header bar */}
        <div className="bg-black text-white px-4 py-2 flex items-center justify-between">
          <span className="font-display font-bold text-xs uppercase tracking-widest">Total Party</span>
          <span className="font-mono text-[10px] text-gray-400">{filtered.length} RECORDS</span>
        </div>

        {/* Toolbar */}
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
                placeholder=""
              />
            </div>
          </div>
        </div>

        {/* Table */}
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
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 font-mono text-xs">
                    NO_RECORDS_FOUND
                  </td>
                </tr>
              ) : (
                paginated.map((p, i) => (
                  <tr
                    key={p.id}
                    className={`border-b border-gray-100 hover:bg-orange-50 transition-colors ${editingId === p.id ? "bg-orange-50 border-l-2 border-l-brand-orange" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                  >
                    <td className="px-3 py-2 font-mono text-gray-500 border-r border-gray-100">{p.id}</td>
                    <td className="px-3 py-2 font-bold text-black border-r border-gray-100">{p.name}</td>
                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 max-w-xs truncate" title={p.address}>{p.address}</td>
                    <td className="px-3 py-2 font-mono text-gray-600 border-r border-gray-100">{p.contact}</td>
                    <td className="px-3 py-2 font-mono text-gray-600 border-r border-gray-100">{p.gstNo}</td>
                    <td className="px-3 py-2 text-gray-600 border-r border-gray-100 max-w-[180px] truncate" title={p.email}>{p.email}</td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleSelect(p)}
                        className="bg-brand-orange text-white font-mono text-[10px] font-bold px-3 py-1 hover:bg-black transition-all uppercase"
                      >
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
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="font-mono text-[10px] px-3 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(pg => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`font-mono text-[10px] px-3 py-1 border transition-all ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                {pg}
              </button>
            ))}
            {totalPages > 5 && <span className="font-mono text-[10px] text-gray-400 px-1">...</span>}
            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`font-mono text-[10px] px-3 py-1 border transition-all ${currentPage === totalPages ? "bg-brand-orange text-white border-brand-orange" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="font-mono text-[10px] px-3 py-1 border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </motion.div>
  );
}

// --- Admin Components ---
const PlaceholderPage = ({ title }: { title: string }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1600px] mx-auto w-full">
    <div className="bg-white border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center min-h-[400px] shadow-sm relative overflow-hidden">
       <div className="absolute inset-0 blueprint-grid opacity-[0.03] pointer-events-none" />
       
       <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 relative z-10 border border-gray-100">
         <HardDrive size={32} className="text-gray-400" />
       </div>
       <h1 className="text-xl md:text-2xl font-semibold font-sans text-gray-900 mb-3 relative z-10 text-center">{title}</h1>
       <p className="font-sans text-sm text-gray-500 relative z-10 text-center max-w-sm">
         This module is currently under development. Please check back later for updates.
       </p>
       
       <Link to="/admin" className="mt-8 bg-white text-gray-700 font-sans font-medium text-sm px-6 py-2 border border-gray-300 hover:bg-gray-50 transition-all relative z-10 rounded-md shadow-sm">
          Return to Dashboard
       </Link>
    </div>
  </motion.div>
);

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex font-sans overflow-hidden bg-industrial-bg text-industrial-text">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, x: -280 }}
            animate={{ width: 280, x: 0 }}
            exit={{ width: 0, x: -280 }}
            className="h-screen sticky top-0 bg-white border-r-2 border-black flex flex-col shrink-0 overflow-y-auto z-20"
          >
            <div className="p-5 border-b-2 border-black flex items-center justify-between sticky top-0 bg-white z-10">
               <Link to="/" className="font-black text-xl tracking-tighter uppercase text-black hover:text-brand-orange transition-colors">VIKRAMADITYA</Link>
               <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 border border-gray-200">ADMIN_NODE</span>
            </div>
            <AdminSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-industrial-bg blueprint-grid relative">
        {/* Admin Header */}
        <header className="bg-white border-b-2 border-black h-16 flex items-center px-4 md:px-8 justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-black hover:text-brand-orange transition-colors">
              <Menu size={20} />
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <span className="font-display font-bold text-sm tracking-widest uppercase">Main Dashboard</span>
          </div>
          <div className="text-[10px] font-mono tracking-widest uppercase flex gap-2">
            <Link to="/admin" className="text-gray-500 hover:text-brand-orange">Home</Link> 
            <span className="text-gray-300">/</span> 
            <span className="text-black font-bold">Main DashBoard</span>
          </div>
        </header>
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<AdminDashboardHome />} />
            <Route path="/basic-registration/party" element={<PartyRegistrationPage />} />
            <Route path="/basic-registration/gauge-info" element={<PlaceholderPage title="Gauge Info Registration" />} />
            <Route path="/basic-registration/new-equipment" element={<PlaceholderPage title="New Equipement" />} />
            <Route path="/basic-registration/equipment-hist" element={<PlaceholderPage title="Equipement Hist.Reg" />} />
            <Route path="/basic-registration/uncertainty" element={<PlaceholderPage title="Uncertainty Reg" />} />
            <Route path="/basic-registration/scope" element={<PlaceholderPage title="Scope Registration" />} />
            <Route path="/basic-registration/thread-specs" element={<PlaceholderPage title="Thead/Ring/Plug Spe." />} />
            <Route path="/basic-registration/taper-thread" element={<PlaceholderPage title="Taper Thread Reading" />} />
            <Route path="/basic-registration/reading-masters" element={<PlaceholderPage title="Reading Masters" />} />
            <Route path="/basic-registration/inst-repair" element={<PlaceholderPage title="Inst.Repair Master" />} />
            <Route path="/basic-registration/dial-table" element={<PlaceholderPage title="Dial Table Master" />} />
            <Route path="/basic-registration/rate" element={<PlaceholderPage title="Rate Reg." />} />
            <Route path="/basic-registration/custom-po" element={<PlaceholderPage title="Custom PO Rate Master" />} />
            <Route path="/basic-registration/firm-creation" element={<PlaceholderPage title="Firm Creation" />} />
            <Route path="/transactions/quotation" element={<PlaceholderPage title="Quotation" />} />
            <Route path="/transactions/purchase-order" element={<PlaceholderPage title="Purchase Order" />} />
            <Route path="/transactions/inward" element={<PlaceholderPage title="Material Inward" />} />
            <Route path="/transactions/calib-status" element={<PlaceholderPage title="Calibration Status" />} />
            <Route path="/transactions/dispatch" element={<PlaceholderPage title="Dispatch" />} />
            <Route path="/transactions/sales-invoice" element={<PlaceholderPage title="Sales Invoice" />} />
            <Route path="/transactions/receipt" element={<PlaceholderPage title="Reciept" />} />
            <Route path="/reports/total-quotations" element={<PlaceholderPage title="Total Quotations" />} />
            <Route path="/reports/total-pos" element={<PlaceholderPage title="Total PO's" />} />
            <Route path="/reports/cert-history" element={<PlaceholderPage title="Certificate History" />} />
            <Route path="/reports/outstanding" element={<PlaceholderPage title="Outstanding" />} />
            <Route path="/reports/ledger" element={<PlaceholderPage title="Ledger" />} />
            <Route path="/reports/sales-gst" element={<PlaceholderPage title="Sales GST Report" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(['basic-registration']);

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]);
  };

  const isActive = (path: string) => location.pathname === path;

  const SubMenuItem = ({ label, to }: { label: string; to: string }) => {
    const active = isActive(to);
    return (
      <Link to={to} className={`flex items-center pl-10 pr-4 py-2.5 text-[13px] font-sans font-medium transition-colors border-l-2 ${active ? 'border-brand-orange bg-orange-50 text-brand-orange font-bold' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-black'}`}>
        <span className="w-4 h-4 mr-2 flex justify-center items-center">
          {active ? <span className="w-1.5 h-1.5 bg-brand-orange rounded-full"></span> : <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>}
        </span>
        {label}
      </Link>
    );
  };

  const MenuButton = ({ id, label, icon: Icon }: any) => {
    const isOpen = openMenus.includes(id);
    return (
      <button onClick={() => toggleMenu(id)} className={`w-full flex items-center justify-between px-5 py-4 text-sm font-semibold font-sans hover:bg-gray-50 transition-colors border-b ${isOpen ? 'border-gray-200 bg-gray-50 text-black' : 'border-gray-100 text-gray-700'} group`}>
        <div className="flex items-center gap-3">
          <Icon size={18} className={`${isOpen ? 'text-brand-orange' : 'text-gray-400 group-hover:text-brand-orange'} transition-colors`} />
          <span>{label}</span>
        </div>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-black' : ''}`} />
      </button>
    );
  };

  return (
    <div className="flex-1 py-2 flex flex-col bg-white">
      {/* Basic Registration */}
      <div>
        <MenuButton id="basic-registration" label="Basic Registration" icon={LayoutDashboard} />
        <AnimatePresence>
          {openMenus.includes('basic-registration') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-b border-gray-100">
              <SubMenuItem label="Party Registartion" to="/admin/basic-registration/party" />
              <SubMenuItem label="Gauge Info Registartion" to="/admin/basic-registration/gauge-info" />
              <SubMenuItem label="New Equipement" to="/admin/basic-registration/new-equipment" />
              <SubMenuItem label="Equipement Hist.Reg" to="/admin/basic-registration/equipment-hist" />
              <SubMenuItem label="Uncertainty Reg" to="/admin/basic-registration/uncertainty" />
              <SubMenuItem label="Scope Registration" to="/admin/basic-registration/scope" />
              <SubMenuItem label="Thead/Ring/Plug Spe." to="/admin/basic-registration/thread-specs" />
              <SubMenuItem label="Taper Thread Reading" to="/admin/basic-registration/taper-thread" />
              <SubMenuItem label="Reading Masters" to="/admin/basic-registration/reading-masters" />
              <SubMenuItem label="Inst.Repair Master" to="/admin/basic-registration/inst-repair" />
              <SubMenuItem label="Dial Table Master" to="/admin/basic-registration/dial-table" />
              <SubMenuItem label="Rate Reg." to="/admin/basic-registration/rate" />
              <SubMenuItem label="Custom PO Rate Master" to="/admin/basic-registration/custom-po" />
              <SubMenuItem label="Firm Creation" to="/admin/basic-registration/firm-creation" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Daily Transactions */}
      <div>
        <MenuButton id="daily-transactions" label="Daily Transactions" icon={FileText} />
        <AnimatePresence>
          {openMenus.includes('daily-transactions') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-b border-gray-100">
              <SubMenuItem label="Quotation" to="/admin/transactions/quotation" />
              <SubMenuItem label="Purchase Order" to="/admin/transactions/purchase-order" />
              <SubMenuItem label="Inward" to="/admin/transactions/inward" />
              <SubMenuItem label="Calibration Status" to="/admin/transactions/calib-status" />
              <SubMenuItem label="Dispatch" to="/admin/transactions/dispatch" />
              <SubMenuItem label="Sales Invoice" to="/admin/transactions/sales-invoice" />
              <SubMenuItem label="Reciept" to="/admin/transactions/receipt" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reports */}
      <div>
        <MenuButton id="reports" label="Reports" icon={BarChart2} />
        <AnimatePresence>
          {openMenus.includes('reports') && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-white border-b border-gray-100">
              <SubMenuItem label="Total Quotations" to="/admin/reports/total-quotations" />
              <SubMenuItem label="Total PO's" to="/admin/reports/total-pos" />
              <SubMenuItem label="Certificate History" to="/admin/reports/cert-history" />
              <SubMenuItem label="Outstanding" to="/admin/reports/outstanding" />
              <SubMenuItem label="Ledger" to="/admin/reports/ledger" />
              <SubMenuItem label="Sales GST Report" to="/admin/reports/sales-gst" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Link to="/" className="w-full flex items-center gap-3 px-5 py-4 mt-auto text-sm font-semibold font-sans text-black border-t-2 border-black hover:bg-brand-orange hover:text-white transition-colors group bg-white">
        <LogOut size={18} className="text-brand-orange group-hover:text-white transition-colors" />
        <span>Exit Dashboard</span>
      </Link>
    </div>
  );
}

function AdminDashboardHome() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1600px] mx-auto w-full flex flex-col gap-8">
      {/* Overview Banner */}
      <section className="relative bg-white hairline-border p-6 md:p-8 lg:p-10 shadow-sm flex flex-col md:flex-row justify-between md:items-end gap-6 group">
         <ModuleAccents label="SYS.ADMIN / OVERVIEW" />
         <div>
           <h1 className="font-display text-4xl md:text-5xl uppercase text-industrial-text leading-[0.9] tracking-tighter font-bold mb-2">
             System Overview
           </h1>
           <p className="font-mono text-xs text-gray-500 tracking-widest uppercase flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
             Live telemetry and metric aggregation node
           </p>
         </div>
         <div className="flex gap-2 relative z-10">
           <button className="bg-brand-orange text-white font-mono text-xs px-6 py-3 border-2 border-brand-orange hover:bg-black transition-all">
             GENERATE_REPORT
           </button>
         </div>
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Certificates Registered" value="1" delta="+1 This Week" />
        <StatCard label="Register Enquirys" value="0" delta="STABLE" />
        <StatCard label="Pending Enquirys" value="0" delta="STABLE" />
        <StatCard label="Total Customers" value="0" delta="STABLE" />
        <div className="lg:col-span-1">
          <StatCard label="No.of CSC Agency" value="0" delta="STABLE" />
        </div>
      </div>
      
      {/* Wireframe Empty State for future sections */}
      <div className="h-64 border-2 border-dashed border-[#c8c6c5] flex flex-col items-center justify-center bg-white/40">
         <Activity size={32} className="text-gray-300 mb-3" />
         <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">AWAITING_FURTHER_DATA_INPUT // STANDBY</p>
      </div>
    </motion.div>
  );
}
