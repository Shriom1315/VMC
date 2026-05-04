import { motion, AnimatePresence } from "motion/react";
import { Search } from "lucide-react";
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
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted w-3.5 h-3.5" />
      <input
        className="bg-surface-muted border border-border rounded text-xs pl-8 pr-3 py-1.5 w-40 xl:w-52 text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-all"
        placeholder="Search..."
        type="text"
        value={query}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onFocus={() => query.length > 0 && setShowSuggestions(true)}
      />
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-0 w-full bg-white border border-border rounded shadow-lg z-[60] mt-1 overflow-hidden"
          >
            <ul className="text-xs">
              {suggestions.map((term) => (
                <li
                  key={term}
                  onClick={() => selectSuggestion(term)}
                  className="px-3 py-2 border-b border-border last:border-0 hover:bg-surface-muted cursor-pointer transition-colors text-text-primary"
                >
                  {term}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
