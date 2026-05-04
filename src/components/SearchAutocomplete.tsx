import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronRight } from "lucide-react";
import { useState, ChangeEvent } from "react";

const METROLOGY_TERMS = [
  "Absolute Tolerance", "Angular Resolution", "AS9100D Certification",
  "CMM Metrology", "Calibration Logs", "Concentricity Validation",
  "Coordinate Measuring Machine", "Dimensional Metrology", "Geometric Dimensioning",
  "ISO 17025 Standard", "ISO Certification", "Linear Error Correction",
  "Micron-Level Verification", "Point Cloud Generation", "Surface Roughness",
  "Surface Scanning", "Topographic Analysis", "Thermal Stabilization",
  "Traceability Chain", "Quotation Generator", "Purchase Order Registry",
  "Material Inward Log", "Client Data Fetch",
];

export default function SearchAutocomplete() {
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
