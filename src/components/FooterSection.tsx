import { ReactNode } from "react";

export default function FooterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-white text-xs font-semibold uppercase tracking-wider">{title}</span>
      <div className="flex flex-col gap-2 text-gray-400">{children}</div>
    </div>
  );
}
