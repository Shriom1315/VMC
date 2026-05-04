function LabMetric({ icon, label, value, delta, status }: any) {
  return (
    <div className="bg-white hairline-border p-4 flex flex-col gap-2">
      <div className="flex justify-between">
        <div className="text-gray-400">{icon}</div>
        <span className="bg-gray-100 px-1 font-mono text-[8px] flex items-center">{status}</span>
      </div>
      <div className="text-xs font-mono text-gray-500">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tighter">{value}</span>
        <span className="text-xs text-gray-400">{delta}</span>
      </div>
    </div>
  );
}

export default LabMetric;
