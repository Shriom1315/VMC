import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { ChevronDown, X } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function ComboSelect({
  value,
  onChange,
  options,
  placeholder = "Select or type...",
  className = "",
  disabled = false,
}: Props) {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [focused, setFocused] = useState(-1);

  const inputRef    = useRef<HTMLInputElement>(null);
  const listRef     = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter options by query
  const filtered = query.trim()
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
        setFocused(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Scroll focused item into view
  useEffect(() => {
    if (focused >= 0 && listRef.current) {
      const item = listRef.current.children[focused] as HTMLElement;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [focused]);

  const select = (opt: string) => {
    onChange(opt);
    setOpen(false);
    setQuery("");
    setFocused(-1);
    inputRef.current?.blur();
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open) { setOpen(true); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocused(f => Math.min(f + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocused(f => Math.max(f - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focused >= 0 && filtered[focused]) select(filtered[focused]);
      else if (filtered.length === 1) select(filtered[0]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      setFocused(-1);
    }
  };

  const displayValue = open ? query : value;

  const base = `w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary
    focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange
    transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"} ${className}`;

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder={value || placeholder}
          disabled={disabled}
          className={`${base} pr-14`}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            setFocused(-1);
          }}
          onFocus={() => {
            setOpen(true);
            setQuery("");
          }}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        {/* Clear button — only when a value is selected */}
        {value && !disabled && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-7 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors p-0.5"
            tabIndex={-1}
          >
            <X size={12} />
          </button>
        )}

        {/* Chevron */}
        <button
          type="button"
          onClick={() => { if (!disabled) { setOpen(v => !v); inputRef.current?.focus(); } }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
          tabIndex={-1}
        >
          <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Dropdown list */}
      {open && !disabled && (
        <ul
          ref={listRef}
          className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-52 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-xs text-text-muted italic">No options match "{query}"</li>
          ) : (
            filtered.map((opt, idx) => (
              <li
                key={opt}
                onMouseDown={e => { e.preventDefault(); select(opt); }}
                onMouseEnter={() => setFocused(idx)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between
                  ${idx === focused ? "bg-brand-orange-light text-brand-orange" : "text-text-primary hover:bg-surface-muted"}
                  ${opt === value ? "font-medium" : ""}
                `}
              >
                <span>{opt}</span>
                {opt === value && (
                  <span className="text-brand-orange text-xs">✓</span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
