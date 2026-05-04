function TelemetryRow({ id, nominal, measured, deviation, status, alert = false }: any) {
  return (
    <tr className={`group hover:bg-industrial-low transition-colors ${alert ? "bg-industrial-high/50" : ""}`}>
      <td className="p-4 text-black font-semibold">{id}</td>
      <td className="p-4 text-gray-500">{nominal}</td>
      <td className={`p-4 font-bold ${alert ? "text-brand-orange" : "text-black"}`}>{measured}</td>
      <td className={`p-4 font-bold ${alert ? "text-brand-orange" : "text-black"}`}>{deviation}</td>
      <td className="p-4">
        <span className={`px-2 py-0.5 text-xs font-bold ${alert ? "bg-brand-orange text-white" : "bg-industrial-low text-black"}`}>
          {status}
        </span>
      </td>
    </tr>
  );
}

export default TelemetryRow;
