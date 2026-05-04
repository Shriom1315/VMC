import { Link, useLocation } from "react-router-dom";

export default function NavLink({ label, to }: { label: string; to: string }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
        active
          ? "bg-brand-orange-light text-brand-orange"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-muted"
      }`}
    >
      {label}
    </Link>
  );
}
