import { Link, useLocation } from "react-router-dom";

export default function NavLink({ label, to }: { label: string; to: string }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      className={`h-full flex items-center px-3 transition-all duration-200 border-b-2 hover:bg-orange-50 ${
        active
          ? "text-brand-orange border-brand-orange font-bold"
          : "text-gray-500 border-transparent hover:text-black"
      }`}
    >
      {label}
    </Link>
  );
}
