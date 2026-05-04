import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface ColumnDef {
  key: string;
  label: string;
}

interface Props {
  /** All rows of data (filtered, not paginated) */
  data: Record<string, string | number>[];
  /** Column definitions — key matches data object keys */
  columns: ColumnDef[];
  /** Filename prefix for downloads (no extension) */
  filename?: string;
  /** Controlled visible columns — if omitted, all columns are visible */
  visibleColumns?: string[];
  onVisibilityChange?: (cols: string[]) => void;
}

// ── helpers ──────────────────────────────────────────────────────────────────

function toCSVRow(values: (string | number)[]): string {
  return values
    .map(v => {
      const s = String(v ?? "");
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    })
    .join(",");
}

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {
    // fallback for older browsers
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ExportToolbar({
  data,
  columns,
  filename = "export",
  visibleColumns,
  onVisibilityChange,
}: Props) {
  const [showColMenu, setShowColMenu] = useState(false);
  const [copied, setCopied]           = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Default: all columns visible
  const [localVisible, setLocalVisible] = useState<string[]>(columns.map(c => c.key));
  const visible = visibleColumns ?? localVisible;
  const setVisible = onVisibilityChange ?? setLocalVisible;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowColMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const visibleCols = columns.filter(c => visible.includes(c.key));

  // Build table text (tab-separated for Copy, comma-separated for CSV)
  const buildText = (sep: string) => {
    const header = visibleCols.map(c => c.label).join(sep);
    const rows   = data.map(row => visibleCols.map(c => row[c.key] ?? "").join(sep));
    return [header, ...rows].join("\n");
  };

  const handleCopy = () => {
    copyToClipboard(buildText("\t"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleCSV = () => {
    const header = toCSVRow(visibleCols.map(c => c.label));
    const rows   = data.map(row => toCSVRow(visibleCols.map(c => row[c.key] ?? "")));
    downloadText([header, ...rows].join("\n"), `${filename}.csv`, "text/csv;charset=utf-8;");
  };

  const handleExcel = () => {
    // Simple TSV wrapped in Excel-compatible HTML table
    const header = `<tr>${visibleCols.map(c => `<th>${c.label}</th>`).join("")}</tr>`;
    const rows   = data.map(row =>
      `<tr>${visibleCols.map(c => `<td>${row[c.key] ?? ""}</td>`).join("")}</tr>`
    ).join("");
    const html = `<html><head><meta charset="utf-8"/></head><body><table>${header}${rows}</table></body></html>`;
    downloadText(html, `${filename}.xls`, "application/vnd.ms-excel;charset=utf-8;");
  };

  const handlePDF = () => {
    // Open a minimal print window with just the table
    const header = `<tr style="background:#f3f4f6">${visibleCols.map(c => `<th style="padding:6px 10px;border:1px solid #d1d5db;font-size:11px">${c.label}</th>`).join("")}</tr>`;
    const rows   = data.map(row =>
      `<tr>${visibleCols.map(c => `<td style="padding:5px 10px;border:1px solid #d1d5db;font-size:11px">${row[c.key] ?? ""}</td>`).join("")}</tr>`
    ).join("");
    const html = `<!DOCTYPE html><html><head><title>${filename}</title><style>body{font-family:sans-serif;padding:20px}table{border-collapse:collapse;width:100%}@media print{@page{margin:1cm}}</style></head><body><h3 style="margin-bottom:12px">${filename}</h3><table>${header}${rows}</table></body></html>`;
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => { win.print(); win.close(); }, 400);
    }
  };

  const handlePrint = () => {
    handlePDF(); // same as PDF but triggers print dialog
  };

  const toggleColumn = (key: string) => {
    if (visible.includes(key)) {
      if (visible.length === 1) return; // keep at least one
      setVisible(visible.filter(k => k !== key));
    } else {
      setVisible([...visible, key]);
    }
  };

  const btnCls = "text-xs font-medium px-2.5 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted transition-colors";

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button onClick={handleCopy}  className={btnCls}>{copied ? "Copied!" : "Copy"}</button>
      <button onClick={handleCSV}   className={btnCls}>CSV</button>
      <button onClick={handleExcel} className={btnCls}>Excel</button>
      <button onClick={handlePDF}   className={btnCls}>PDF</button>
      <button onClick={handlePrint} className={btnCls}>Print</button>

      {/* Column visibility dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowColMenu(v => !v)}
          className={`${btnCls} flex items-center gap-1`}
        >
          Column visibility <ChevronDown size={11} className={`transition-transform ${showColMenu ? "rotate-180" : ""}`} />
        </button>
        {showColMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg z-50 min-w-[160px] py-1">
            {columns.map(col => (
              <label key={col.key}
                className="flex items-center gap-2 px-3 py-2 text-xs text-text-primary hover:bg-surface-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={visible.includes(col.key)}
                  onChange={() => toggleColumn(col.key)}
                  className="accent-brand-orange"
                />
                {col.label}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
