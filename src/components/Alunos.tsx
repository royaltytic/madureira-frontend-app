import { useState, useEffect } from 'react';

// Interface para definir a estrutura de um aluno (pode ser ajustada conforme o retorno da API)
interface Aluno {
    id: number;
    nomeAluno: string;
    nascimento: string;
    idade: number;
    cpf: string;
    rg: string;
    cidade: string;
    cep: string;
    telefone: string;
    email: string;
    escola?: string;
    modalidades: string[];
    turno?: string;
    temProblemaSaude: boolean;
    problemaSaudeDetalhes?: string;
    nomeResponsavel: string;
    rgImageUrl?: string;
  }

// Componente para visualizar a lista de alunos
export const Alunos = () => {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedCardId, setExpandedCardId] = useState<number | null>(null); // Estado para o card expandido
  
    // Função para alternar a expansão do card
    const handleCardClick = (id: number) => {
      setExpandedCardId(prevId => (prevId === id ? null : id));
    };
  
    useEffect(() => {
      const fetchAlunos = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await fetch('http://localhost:3333/users');
          if (!response.ok) {
            throw new Error(`Erro ao buscar dados: ${response.status}`);
          }
          const data: Aluno[] = await response.json();
          setAlunos(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchAlunos();
    }, []);
  
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-screen bg-slate-100">
          <div className="text-center">
              <svg className="animate-spin mx-auto h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="mt-2 text-slate-600">Carregando alunos...</p>
          </div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="flex justify-center items-center h-screen bg-red-50">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-bold text-red-600">Erro ao carregar dados</h2>
              <p className="text-slate-600 mt-2">{error}</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="bg-slate-100 min-h-screen p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8 text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Alunos Cadastrados</h1>
            <p className="text-slate-500 mt-2">Lista de todos os alunos inscritos na escolinha.</p>
          </header>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {alunos.length > 0 ? (
              alunos.map((aluno) => {
                const isExpanded = expandedCardId === aluno.id;
                return (
                  <div 
                    key={aluno.id} 
                    onClick={() => handleCardClick(aluno.id)}
                    className="bg-white rounded-2xl shadow-lg p-6 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >
                    {/* Informações Básicas Visíveis */}
                    <h2 className="text-lg font-bold text-slate-900 truncate">{aluno.nomeAluno}</h2>
                    <p className="text-sm text-slate-500">{aluno.email}</p>
                    
                    {/* Conteúdo Expansível */}
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-screen mt-4 pt-4 border-t' : 'max-h-0'}`}>
                      <div className="space-y-2 text-sm">
                        <p><strong className="font-medium text-slate-800">Telefone:</strong> {aluno.telefone}</p>
                        <p><strong className="font-medium text-slate-800">Cidade:</strong> {aluno.cidade}</p>
                        <p><strong className="font-medium text-slate-800">CPF:</strong> {aluno.cpf}</p>
                        <p><strong className="font-medium text-slate-800">RG:</strong> {aluno.rg}</p>
                        <p><strong className="font-medium text-slate-800">Nascimento:</strong> {new Date(aluno.nascimento).toLocaleDateString()}</p>
                        <p><strong className="font-medium text-slate-800">Idade:</strong> {aluno.idade}</p>
                        <p><strong className="font-medium text-slate-800">Modalidades:</strong> {aluno.modalidades.join(', ')}</p>
                        <p><strong className="font-medium text-slate-800">Turno:</strong> {aluno.turno}</p>
                        <p><strong className="font-medium text-slate-800">Responsável:</strong> {aluno.nomeResponsavel}</p>
                        <p><strong className="font-medium text-slate-800">Problema de Saúde:</strong> {aluno.temProblemaSaude ? `Sim (${aluno.problemaSaudeDetalhes || 'N/A'})` : 'Não'}</p>
                        {aluno.rgImageUrl && 
                          <a href={aluno.rgImageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-medium block mt-2">
                            Ver Arquivo do RG
                          </a>
                        }
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16"><p className="text-slate-500">Nenhum aluno cadastrado ainda.</p></div>
            )}
          </div>
        </div>
      </div>
    );
  };


