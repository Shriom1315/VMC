export default function InwardRow({
  id, po, client, desc, qty, status, alert = false, active = false,
}: {
  id: string; po: string; client: string; desc: string;
  qty: string; status: string; alert?: boolean; active?: boolean;
}) {
  return (
    <tr className={`hover:bg-gray-50 text-gray-800 transition-colors ${alert ? 'bg-red-50/50' : active ? 'bg-green-50/50' : ''}`}>
      <td className="p-3 border-r border-gray-300 font-mono text-xs font-bold text-blue-600">{id}</td>
      <td className="p-3 border-r border-gray-300 font-mono text-xs text-gray-500">{po}</td>
      <td className="p-3 border-r border-gray-300 font-bold">{client}</td>
      <td className="p-3 border-r border-gray-300 text-gray-600 text-xs">{desc}</td>
      <td className="p-3 border-r border-gray-300 text-right font-mono text-xs font-semibold">{qty}</td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${alert ? 'bg-red-500 animate-pulse' : active ? 'bg-green-500' : status === 'STORED' ? 'bg-blue-500' : 'bg-yellow-500 animate-pulse'}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${alert ? 'text-red-700' : active ? 'text-green-700' : 'text-gray-600'}`}>
            {status}
          </span>
        </div>
      </td>
    </tr>
  );
}
