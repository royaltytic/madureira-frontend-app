import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { API_BASE_URL } from '../config/api';

// Definição da interface para os dados do formulário
interface FormData {
  nomeAluno: string;
  nascimento: string;
  idade: string;
  cpf: string;
  rg: string;
  rgImageUrl?: string;
  cidade: string;
  cep: string;
  telefone: string;
  email: string;
  escola: string;
  modalidades: string[];
  turno: 'Manha' | 'Tarde' | 'Noite' | '';
  temProblemaSaude: 'SIM' | 'NÃO' | '';
  problemaSaudeDetalhes: string;
  nomeResponsavel: string;
  aceiteTermos: boolean;
}

// Estado inicial do formulário
const initialState: FormData = {
  nomeAluno: '',
  nascimento: '',
  idade: '',
  cpf: '',
  rg: '',
  rgImageUrl: '',
  cidade: '',
  cep: '',
  telefone: '',
  email: '',
  escola: '',
  modalidades: [],
  turno: '',
  temProblemaSaude: '',
  problemaSaudeDetalhes: '',
  nomeResponsavel: '',
  aceiteTermos: false,
};

// Componente para o Modal de Termos e Condições
const TermosModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
      <header className="p-6 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Termos e Condições</h2>
      </header>
      <main className="p-6 overflow-y-auto">
        <ol className="list-decimal list-inside space-y-4 text-slate-600">
          <li>A ESCOLINHA ESPORTIVA se exime de qualquer responsabilidade civil por acidentes pessoais decorrentes da prática esportiva regular, tais como lesões, escoriações, contusões, torções, entre outros, considerando o risco inerente à atividade física (conforme previsto no art. 927, parágrafo único do Código Civil). Em caso de ocorrência, é dever da ESCOLINHA prestar os primeiros socorros e comunicar imediatamente o responsável legal, que deverá comparecer ao local indicado para dar continuidade ao atendimento médico necessário.</li>
          <li>É indispensável que o(a) aluno(a) esteja estudando.</li>
          <li>Informar à coordenação da ESCOLINHA ESPORTIVA quaisquer problemas de saúde que o(a) aluno(a) possua ou venha a apresentar.</li>
          <li>Compete à ESCOLINHA ESPORTIVA o controle da frequência dos treinos, sendo responsabilidade do(a) responsável garantir a presença regular do(a) aluno(a).</li>
          <li>Autorizo a utilização da imagem e vídeos do(a) aluno(a) em materiais institucionais e educativos, destinados à promoção do esporte como ferramenta de inclusão e desenvolvimento social.</li>
          <li>As atividades serão desenvolvidas conforme o plano definido no ato da matrícula. Nestes termos, firmo a presente INSCRIÇÃO e AUTORIZO o(a) menor a frequentar a ESCOLINHA ESPORTIVA, declarando que o(a) mesmo(a) está regularmente matriculado(a) em instituição de ensino, encontra-se em plenas condições de saúde para a prática esportiva e que assumo total responsabilidade por eventuais acidentes que possam ocorrer durante os treinos realizados nas dependências da ESCOLINHA ESPORTIVA DO MADUREIRA ou em quaisquer eventos esportivos dos quais esta instituição participe.</li>
          <li>As doações efetuadas à ESCOLINHA ESPORTIVA são irrestituíveis, não cabendo devolução, independentemente da finalidade a que se destinem.</li>
        </ol>
        <p className="mt-4 text-sm font-semibold text-slate-700">OBS: A inscrição somente terá validade mediante a apresentação desta ficha devidamente preenchida e assinada pelo(a) responsável pelo(a) aluno(a).</p>
      </main>
      <footer className="p-6 border-t border-slate-200 flex justify-end">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          Fechar
        </button>
      </footer>
    </div>
  </div>
);


// Componente principal do formulário
const Cadastro = () => {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [rgArquivo, setRgArquivo] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para o modal

  // Efeito para calcular a idade automaticamente
  useEffect(() => {
    if (formData.nascimento) {
      const birthDate = new Date(formData.nascimento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, idade: age >= 0 ? age.toString() : '' }));
    } else {
      setFormData(prev => ({ ...prev, idade: '' }));
    }
  }, [formData.nascimento]);

  // Manipulador para campos de texto
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manipulador para o input de arquivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRgArquivo(e.target.files[0]);
    } else {
      setRgArquivo(null);
    }
  };

  // Manipulador para checkboxes de modalidades
  const handleModalidadesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      modalidades: checked
        ? [...prev.modalidades, value]
        : prev.modalidades.filter(m => m !== value),
    }));
  };

  // Manipulador para o aceite dos termos
  const handleAceiteTermosChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, aceiteTermos: e.target.checked }));
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'documento') => {
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = `${API_BASE_URL}/uploads/${type}`;
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
        });
        if (!response.ok) throw new Error(`Falha no upload do ${type}`);
        const result = await response.json();
        return result.imgUrl;
    } catch (uploadError) {
        console.error(`Erro no upload:`, uploadError);
        throw uploadError;
    }
};

  // Manipulador para a submissão do formulário
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    let rgUrl = '';

    if(rgArquivo) {
      rgUrl = await handleFileUpload(rgArquivo, 'documento');
    }
   

    const payload = {
      ...formData,
      temProblemaSaude: formData.temProblemaSaude === 'SIM',
      rgImageUrl: rgUrl
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/alunos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro ao criar aluno: ${response.status}`);
      }
      
      setIsSubmitted(true);

    } catch (error) {
      console.error('Erro ao enviar o formulário:', error);
      setError(error instanceof Error ? error.message : 'Falha ao enviar a inscrição. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  const modalidadesOptions = ['Futebol', 'Futsal', 'Queimada', 'Voleibol', 'Basquetebol', 'Handebol', 'Tênis de Mesa'];
  const turnoOptions = ['Manha', 'Tarde', 'Noite'];

  if (isSubmitted) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg max-w-md w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mx-auto mb-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Inscrição Enviada!</h1>
          <p className="text-slate-600">Obrigado por se inscrever. Entraremos em contato em breve.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isModalOpen && <TermosModal onClose={() => setIsModalOpen(false)} />}
      <div className="bg-slate-100 min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-4xl">
          <header className="mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Formulário de Matrícula</h1>
            <p className="text-slate-500 mt-2">Preencha os dados abaixo para iniciar a inscrição.</p>
          </header>

          <form onSubmit={handleSubmit} noValidate>
            {/* Seção de Dados Pessoais */}
            <div className="border-b border-slate-200 pb-8 mb-8">
              <h2 className="text-xl font-semibold text-slate-700 mb-6">Dados do Aluno</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative md:col-span-2">
                  <label htmlFor="nomeAluno" className="block text-sm font-medium text-slate-600 mb-1">Nome Completo</label>
                  <input type="text" id="nomeAluno" name="nomeAluno" value={formData.nomeAluno} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nascimento" className="block text-sm font-medium text-slate-600 mb-1">Nascimento</label>
                    <input type="date" id="nascimento" name="nascimento" value={formData.nascimento} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required />
                  </div>
                  <div>
                    <label htmlFor="idade" className="block text-sm font-medium text-slate-600 mb-1">Idade</label>
                    <input type="text" id="idade" name="idade" value={formData.idade} className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100 cursor-not-allowed" readOnly />
                  </div>
                </div>
                <div>
                  <label htmlFor="cpf" className="block text-sm font-medium text-slate-600 mb-1">CPF</label>
                  <input type="text" id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required />
                </div>
                <div>
                  <label htmlFor="rg" className="block text-sm font-medium text-slate-600 mb-1">RG</label>
                  <input type="text" id="rg" name="rg" value={formData.rg} onChange={handleChange} placeholder="00.000.000-0" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="rgArquivo" className="block text-sm font-medium text-slate-600 mb-1">Arquivo do RG (PDF, PNG, JPG)</label>
                  <input type="file" id="rgArquivo" name="rgArquivo" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition" />
                  {rgArquivo && <p className="text-xs text-slate-500 mt-1">Arquivo selecionado: {rgArquivo.name}</p>}
                </div>
                <div>
                  <label htmlFor="cidade" className="block text-sm font-medium text-slate-600 mb-1">Cidade</label>
                  <input type="text" id="cidade" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                </div>
                <div>
                  <label htmlFor="cep" className="block text-sm font-medium text-slate-600 mb-1">CEP</label>
                  <input type="text" id="cep" name="cep" value={formData.cep} onChange={handleChange} placeholder="00000-000" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                </div>
                <div className="relative">
                  <label htmlFor="telefone" className="block text-sm font-medium text-slate-600 mb-1">Telefone</label>
                  <input type="tel" id="telefone" name="telefone" value={formData.telefone} onChange={handleChange} placeholder="(00) 90000-0000" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                </div>
                <div className="relative">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="escola" className="block text-sm font-medium text-slate-600 mb-1">Escola Anterior (se aplicável)</label>
                  <input type="text" id="escola" name="escola" value={formData.escola} onChange={handleChange} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                </div>
              </div>
            </div>

            {/* Seção de Matrícula */}
            <div className="border-b border-slate-200 pb-8 mb-8">
              <h2 className="text-xl font-semibold text-slate-700 mb-6">Informações da Matrícula</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-3">Modalidades de Interesse</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {modalidadesOptions.map(modalidade => (
                      <div key={modalidade} className="flex items-center">
                        <input type="checkbox" id={modalidade} value={modalidade} checked={formData.modalidades.includes(modalidade)} onChange={handleModalidadesChange} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                        <label htmlFor={modalidade} className="ml-2 text-sm text-slate-700">{modalidade}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-3">Turno</label>
                  <div className="flex flex-wrap gap-4">
                    {turnoOptions.map(turno => (
                      <div key={turno} className="flex items-center">
                        <input type="radio" id={turno} name="turno" value={turno} checked={formData.turno === turno} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                        <label htmlFor={turno} className="ml-2 text-sm text-slate-700">{turno}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Saúde */}
            <div className="border-b border-slate-200 pb-8 mb-8">
              <h2 className="text-xl font-semibold text-slate-700 mb-6">Informações de Saúde</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-3">Possui algum problema de saúde?</label>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center">
                      <input type="radio" id="saudeSim" name="temProblemaSaude" value="SIM" checked={formData.temProblemaSaude === 'SIM'} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                      <label htmlFor="saudeSim" className="ml-2 text-sm text-slate-700">Sim</label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="saudeNao" name="temProblemaSaude" value="NÃO" checked={formData.temProblemaSaude === 'NÃO'} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                      <label htmlFor="saudeNao" className="ml-2 text-sm text-slate-700">Não</label>
                    </div>
                  </div>
                </div>
                {formData.temProblemaSaude === 'SIM' && (
                  <div className="md:col-span-2">
                    <label htmlFor="problemaSaudeDetalhes" className="block text-sm font-medium text-slate-600 mb-1">Se sim, qual?</label>
                    <textarea id="problemaSaudeDetalhes" name="problemaSaudeDetalhes" value={formData.problemaSaudeDetalhes} onChange={handleChange} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"></textarea>
                  </div>
                )}
              </div>
            </div>

            {/* Seção do Responsável e Termos */}
            <div>
              <h2 className="text-xl font-semibold text-slate-700 mb-6">Responsável e Finalização</h2>
              <div className="space-y-6">
                <div>
                  <label htmlFor="nomeResponsavel" className="block text-sm font-medium text-slate-600 mb-1">Nome do Responsável</label>
                  <input type="text" id="nomeResponsavel" name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleChange} className="w-full md:w-1/2 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" required />
                </div>
                <div className="flex items-start">
                  <input id="aceiteTermos" name="aceiteTermos" type="checkbox" checked={formData.aceiteTermos} onChange={handleAceiteTermosChange} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 mt-0.5" required />
                  <div className="ml-3 text-sm">
                    <label htmlFor="aceiteTermos" className="font-medium text-slate-700">Eu li e aceito os{' '}
                      <button type="button" onClick={() => setIsModalOpen(true)} className="text-indigo-600 hover:text-indigo-800 font-semibold underline">
                        termos e condições
                      </button>.
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded-lg">
                <p>{error}</p>
              </div>
            )}

            <div className="mt-10 flex justify-center sm:justify-end">
              <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center" disabled={!formData.aceiteTermos || isLoading}>
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Enviando...
                  </>
                ) : (
                  'Enviar Inscrição'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Cadastro;
