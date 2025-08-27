import { CloseIcon } from "../../shared/Icons";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    filters: { modalidade: string; turno: string; };
    setFilters: React.Dispatch<React.SetStateAction<{ modalidade: string; turno: string; }>>;
    onApply: () => void;
    onClear: () => void;
    modalidades: string[];
    turnos: string[];
}

export const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filters, setFilters, onApply, onClear, modalidades, turnos }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
                <header className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Filtros</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800"><CloseIcon /></button>
                </header>
                <main className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Modalidade</label>
                        <select value={filters.modalidade} onChange={(e) => setFilters(prev => ({ ...prev, modalidade: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
                            <option value="">Todas as Modalidades</option>
                            {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Turno</label>
                        <select value={filters.turno} onChange={(e) => setFilters(prev => ({ ...prev, turno: e.target.value }))} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white">
                            <option value="">Todos os Turnos</option>
                            {turnos.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </main>
                <footer className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
                    <button onClick={onClear} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition">Limpar</button>
                    <button onClick={onApply} className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">Aplicar</button>
                </footer>
            </div>
        </div>
    );
};
