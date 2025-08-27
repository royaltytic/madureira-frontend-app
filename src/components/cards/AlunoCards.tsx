import { Aluno } from "../../types";
import { PhoneIcon, ShieldIcon, ClockIcon } from "../../shared/Icons";

export const AlunoCard: React.FC<{ aluno: Aluno; onClick: () => void }> = ({ aluno, onClick }) => {
    
    // Função para gerar cores consistentes para os badges
    const getBadgeColor = (modalidade: string) => {
        let hash = 0;
        for (let i = 0; i < modalidade.length; i++) {
            hash = modalidade.charCodeAt(i) + ((hash << 5) - hash);
        }
        // Cores mais suaves e modernas
        const bgColor = `hsl(${hash % 360}, 100%, 97%)`; // Fundo mais claro
        const textColor = `hsl(${hash % 360}, 70%, 50%)`; // Texto com mais saturação
        const borderColor = `hsl(${hash % 360}, 90%, 90%)`; // Borda sutil
        return { backgroundColor: bgColor, color: textColor, borderColor };
    };

    // Fallback para imagem caso a URL falhe
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const initial = aluno.nomeAluno.charAt(0).toUpperCase();
        e.currentTarget.src = `https://placehold.co/80x80/EBF4FF/4F46E5?text=${initial}`;
    };

    return (
        <div 
            onClick={onClick} 
            className="
                group
                relative
                bg-white 
                rounded-2xl 
                shadow-sm 
                p-4 sm:p-6 
                flex flex-col 
                border
                border-slate-200
                hover:shadow-lg 
                hover:border-indigo-400
                hover:-translate-y-1
                transition-all 
                duration-300 
                cursor-pointer
            "
        >
            {/* Seção do Header com Avatar e Nome */}
            <header className="flex items-center pb-4 sm:pb-5 border-b border-slate-100">
                <img 
                    src={aluno.imgUrl || `https://placehold.co/80x80/EBF4FF/4F46E5?text=${aluno.nomeAluno.charAt(0).toUpperCase()}`} 
                    alt={`Foto de ${aluno.nomeAluno}`} 
                    className="
                        w-14 h-14 sm:w-16 sm:h-16 
                        rounded-full 
                        object-cover 
                        mr-4 sm:mr-5
                        border-2 
                        border-slate-100 
                        group-hover:border-indigo-200 
                        transition-colors
                        flex-shrink-0
                    "
                    onError={handleImageError}
                />
                <div className="overflow-hidden">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                        {aluno.nomeAluno}
                    </h2>
                    <p className="text-sm text-slate-500">{aluno.idade} anos</p>
                </div>
            </header>

            {/* Seção de Detalhes (Telefone, Responsável, Turno) */}
            <section className="space-y-4 text-sm my-5 sm:my-6">
                <div className="flex items-center text-slate-700">
                    <PhoneIcon className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0" />
                    <span className="font-medium truncate">{aluno.telefone}</span>
                </div>
                <div className="flex items-center text-slate-700">
                    <ShieldIcon className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0" />
                    <span className="font-medium truncate">{aluno.nomeResponsavel}</span>
                </div>
                <div className="flex items-center text-slate-700">
                    <ClockIcon className="w-5 h-5 mr-3 text-slate-400 flex-shrink-0" />
                    <span className="font-medium truncate">{aluno.turno || 'Não informado'}</span>
                </div>
            </section>

            {/* Seção de Modalidades (Rodapé) */}
            <footer className="mt-auto pt-4 sm:pt-5 border-t border-slate-100">
                <h3 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                    Modalidades
                </h3>
                <div className="flex flex-wrap gap-2">
                    {aluno.modalidades.length > 0 ? (
                        aluno.modalidades.map(m => {
                            const { backgroundColor, color, borderColor } = getBadgeColor(m);
                            return (
                                <span 
                                    key={m} 
                                    style={{ backgroundColor, color, borderColor }} 
                                    className="px-3 py-1 rounded-full text-xs font-bold border"
                                >
                                    {m}
                                </span>
                            );
                        })
                    ) : (
                        <p className="text-xs text-slate-400 italic">Nenhuma modalidade cadastrada</p>
                    )}
                </div>
            </footer>
        </div>
    );
};
