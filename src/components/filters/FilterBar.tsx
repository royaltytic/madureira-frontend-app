import { SearchIcon, FilterIcon } from "../../shared/Icons";

interface FilterBarProps {
    searchTerm: string; 
    onSearchChange: (value: string) => void;
    onOpenModal: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ searchTerm, onSearchChange, onOpenModal }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                    <input type="text" placeholder="Pesquisar por nome do aluno..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"/>
                </div>
                <button onClick={onOpenModal} className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition">
                    <FilterIcon />
                    Filtros
                </button>
            </div>
        </div>
    );
};