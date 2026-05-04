export default function StatCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  const isPositive = delta.startsWith("+");
  const isNegative = delta.startsWith("-");

  return (
    <div className="bg-white rounded-lg border border-border p-5 flex flex-col gap-1 hover:shadow-md transition-shadow">
      <div className="text-xs font-medium text-text-secondary">{label}</div>
      <div className="text-2xl font-semibold text-text-primary mt-1">{value}</div>
      <div className={`text-xs font-medium mt-0.5 ${isPositive ? "text-green-600" : isNegative ? "text-red-500" : "text-text-muted"}`}>
        {delta}
      </div>
    </div>
  );
}
