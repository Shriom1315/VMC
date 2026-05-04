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

export default CertCard;
