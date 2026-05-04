function EquipmentRow({ name, type, accuracy }: any) {
  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-industrial-low transition-colors">
      <div className="flex flex-col">
        <span className="text-sm font-bold">{name}</span>
        <span className="text-[11px] font-mono text-gray-400">{type}</span>
      </div>
      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5">{accuracy}</span>
    </div>
  );
}

export default EquipmentRow;
