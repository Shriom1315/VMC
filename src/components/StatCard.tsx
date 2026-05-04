export default function StatCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="bg-white hairline-border p-6 flex flex-col gap-2 hover:bg-industrial-low transition-colors group">
      <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">{label}</div>
      <div className="text-4xl font-black text-black group-hover:text-brand-orange transition-colors tracking-tighter">{value}</div>
      <div className={`text-xs font-mono ${delta.includes('+') ? 'text-green-500' : delta.includes('-') ? 'text-red-500' : 'text-gray-400'}`}>
        {delta}
      </div>
    </div>
  );
}
