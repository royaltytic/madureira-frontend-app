import { useState, ReactNode } from "react";

type PedidoItemProps = {
  name: string;
  onSelect: (selected: boolean) => void;
  children?: ReactNode; // Permitir filhos (como a textarea)
};

export const PedidoItem = ({ name, onSelect, children }: PedidoItemProps) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onSelect(newCheckedState);
  };

  return (
    <div className="bg-white h-auto flex flex-col px-4 py-2">
      <div className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckboxChange}
          className={`w-6 h-6 rounded-full border-2 border-gray-300 
          appearance-none cursor-pointer 
          checked:bg-gradient-to-r from-[#0E9647] to-[#165C38] checked:border-[#165C38]`}
        />
        <p className="text-color-black font-bold">{name}</p>
      </div>
      {isChecked && children}
    </div>
  );
};