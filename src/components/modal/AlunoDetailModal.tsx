import { Aluno } from "../../types";
import { CloseIcon, EditIcon, DeleteIcon } from "../../shared/Icons";

export const AlunoDetailModal: React.FC<{ aluno: Aluno; onClose: () => void; onEdit: () => void; onDelete: () => void; }> = ({ aluno, onClose, onEdit, onDelete }) => {
    const DetailRow: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
        <div>
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-sm font-semibold text-slate-800">{value || 'Não informado'}</p>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-5 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center">
                        <img src={aluno.imgUrl || `https://placehold.co/80x80/E2E8F0/475569?text=${aluno.nomeAluno.charAt(0)}`} alt={`Foto de ${aluno.nomeAluno}`} className="w-12 h-12 rounded-full object-cover mr-4"/>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{aluno.nomeAluno}</h2>
                            <p className="text-sm text-slate-500">{aluno.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors"><CloseIcon /></button>
                </header>
                <main className="p-6 overflow-y-auto space-y-6">
                    {/* Sections... */}
                    <section><h3 className="text-base font-bold text-indigo-600 mb-3">Dados Pessoais</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-4"><DetailRow label="Nascimento" value={new Date(aluno.nascimento).toLocaleDateString()} /><DetailRow label="Idade" value={`${aluno.idade} anos`} /><DetailRow label="CPF" value={aluno.cpf} /><DetailRow label="RG" value={aluno.rg} /><DetailRow label="Cidade" value={aluno.cidade} /><DetailRow label="CEP" value={aluno.cep} /></div></section>
                    <section><h3 className="text-base font-bold text-indigo-600 mb-3">Contato e Responsável</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-4"><DetailRow label="Telefone" value={aluno.telefone} /><DetailRow label="Responsável" value={aluno.nomeResponsavel} /></div></section>
                    <section><h3 className="text-base font-bold text-indigo-600 mb-3">Matrícula</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-4"><DetailRow label="Modalidades" value={aluno.modalidades.join(', ')} /><DetailRow label="Turno" value={aluno.turno} /><DetailRow label="Escola Anterior" value={aluno.escola} /></div></section>
                    <section><h3 className="text-base font-bold text-indigo-600 mb-3">Saúde</h3><div className="grid grid-cols-1"><DetailRow label="Problema de Saúde?" value={aluno.temProblemaSaude ? `Sim` : 'Não'} />{aluno.temProblemaSaude && <DetailRow label="Detalhes" value={aluno.problemaSaudeDetalhes} />}</div></section>
                </main>
                 <footer className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-2xl">
                    <div>
                        {aluno.rgImageUrl && <a href={aluno.rgImageUrl} target="_blank" rel="noopener noreferrer" className="px-4 py-2 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition">Ver RG</a>}
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"><EditIcon className="w-4 h-4" /> Editar</button>
                        <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"><DeleteIcon className="w-4 h-4" /> Excluir</button>
                    </div>
                </footer>
            </div>
        </div>
    );
};