import { ReactNode } from "react";

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

export default FooterSection;
