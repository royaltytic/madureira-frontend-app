interface PedidoItemProps {
  name: string;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  children?: React.ReactNode;
}

export const PedidoItem: React.FC<PedidoItemProps> = ({ name, isSelected, onSelect, children }) => (
  <div className={`p-4 border rounded-lg transition-all duration-200 ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
    <label className="flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect(e.target.checked)}
        className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <span className={`ml-3 font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{name}</span>
    </label>
    {isSelected && (
      <div className="mt-3 pl-8">
        {children}
      </div>
    )}
  </div>
);
