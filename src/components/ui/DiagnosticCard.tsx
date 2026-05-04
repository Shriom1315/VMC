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

export default DiagnosticCard;
