import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { XMarkIcon } from '@heroicons/react/24/solid';


interface PessoaProps {
  id: string;
  name: string;
  apelido: string;
  genero: string;
  cpf: string;
  rg: string;
  caf: string;
  car: string;
  rgp: string;
  gta: string;
  phone: string;
  neighborhood: string;
  referencia: string;
  adagro: string;
  classe: string[];
  associacao: string;
  chapeuPalha: string;
  garantiaSafra: string;
  paa: string;
  pnae: string;
  agua: string;
  imposto: string;
  area: string;
  tempo: string;
  carroDeMao: string;
  produtos: string[];
}

interface PopUpProps {
  onClose: () => void;
  onUpdate: (updatedData: PessoaProps) => void;
}

// NOVO COMPONENTE REUTILIZÁVEL PARA BENEFÍCIOS
interface BenefitInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BenefitInput: React.FC<BenefitInputProps> = ({ label, name, value, onChange }) => {
  // Verifica se o benefício está ativo (qualquer valor que não seja "Não")
  const isActive = value !== 'Não';

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === 'sim' ? '' : 'Não'; // Se for 'sim', prepara para digitar o ano. Se 'não', define como "Não".
    // Simula um evento de input para ser compatível com a função handleInputChange principal
    onChange({
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600">{label}</label>
      <div className="mt-1 flex items-center gap-4">
        {/* Opções Sim/Não */}
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id={`${name}-sim`}
            name={`${name}-radio`}
            value="sim"
            checked={isActive}
            onChange={handleRadioChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
          <label htmlFor={`${name}-sim`} className="text-sm text-slate-800">Sim</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id={`${name}-nao`}
            name={`${name}-radio`}
            value="nao"
            checked={!isActive}
            onChange={handleRadioChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
          <label htmlFor={`${name}-nao`} className="text-sm text-slate-800">Não</label>
        </div>

        {/* Campo de Ano (aparece apenas se "Sim" estiver marcado) */}
        {isActive && (
          <input
            type="text"
            name={name}
            value={value} // O valor aqui será o ano
            onChange={onChange}
            placeholder="Ano(s). Ex: 2023, 2024"
            className="flex-grow w-full border-slate-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        )}
      </div>
    </div>
  );
};




export const PopUpEdit: React.FC<PessoaProps & PopUpProps> = ({
  id,
  name,
  apelido,
  genero,
  cpf,
  rg,
  caf,
  car,
  rgp,
  gta,
  phone,
  neighborhood,
  referencia,
  adagro,
  classe,
  associacao,
  chapeuPalha,
  garantiaSafra,
  paa,
  pnae,
  agua,
  imposto,
  area,
  tempo,
  carroDeMao,
  produtos,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState({
    id,
    cpf,
    name,
    apelido,
    genero,
    rg,
    caf,
    car,
    rgp,
    gta,
    phone,
    neighborhood,
    referencia,
    adagro,
    classe: Array.isArray(classe) ? classe : [],
    associacao,
    chapeuPalha,
    garantiaSafra,
    paa,
    pnae,
    agua,
    imposto,
    area,
    tempo,
    carroDeMao,
    produtos,
  });

  const handleClassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      // Clona o array de classes atual
      const newClasses = [...prev.classe];
      if (checked) {
        // Adiciona a nova classe se marcada
        newClasses.push(value);
      } else {
        // Remove a classe se desmarcada
        const index = newClasses.indexOf(value);
        if (index > -1) {
          newClasses.splice(index, 1);
        }
      }
      return { ...prev, classe: newClasses };
    });
  };

  const [apiLocalOptions, setApiLocalOptions] = useState<string[]>([]);

  useEffect(() => {
    fetchLocalidades();
  }, []);

  const fetchLocalidades = async () => {
    try {
      const response = await api.get("/localidades");
      const locais = response.data.map(
        (item: { id: number; localidade: string }) => item.localidade
      );
      setApiLocalOptions(locais);
    } catch (error) {
      console.error("Erro ao buscar localidades:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "classe" ? value.split(",").map((c) => c.trim()) : value, // Transforma de volta para array
    }));
  };


  const handleSave = async () => {
    try {
      await api.put(`/users/${formData.id}`, formData);
      onUpdate(formData);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar os dados:", error);
      alert("Erro ao atualizar os dados. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-50 rounded-xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl">
        {/* CABEÇALHO FIXO */}
        <div className="flex-shrink-0 p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">Editar Cadastro</h2>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-800">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* ÁREA DE CONTEÚDO COM SCROLL */}
        <div className="flex-grow p-5 overflow-y-auto">
          <form className="space-y-6">
            {/* SEÇÃO: DADOS PESSOAIS E DE CONTATO */}
            <fieldset className="p-4 border rounded-lg bg-white">
              <legend className="px-2 font-semibold text-slate-700">Dados Pessoais e Contato</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                <div><label className="block text-sm font-medium text-slate-600">Nome Completo</label><input name="name" value={formData.name} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>
                <div><label className="block text-sm font-medium text-slate-600">Apelido</label><input name="apelido" value={formData.apelido} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>
                <div><label className="block text-sm font-medium text-slate-600">Gênero</label><select name="genero" value={formData.genero} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"><option value="">Selecione</option><option>Masculino</option><option>Feminino</option><option>Outro</option></select></div>
                <div><label className="block text-sm font-medium text-slate-600">Telefone</label><input name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>
                <div><label className="block text-sm font-medium text-slate-600">CPF</label><input name="cpf" value={formData.cpf} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" disabled /></div>
                <div><label className="block text-sm font-medium text-slate-600">RG</label><input name="rg" value={formData.rg} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>

              </div>
            </fieldset>

            {/* SEÇÃO: ENDEREÇO */}
            <fieldset className="p-4 border rounded-lg bg-white">
              <legend className="px-2 font-semibold text-slate-700">Endereço</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div><label className="block text-sm font-medium text-slate-600">Localidade</label><select name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">{apiLocalOptions.map(opt => <option key={opt}>{opt}</option>)}</select></div>
                <div><label className="block text-sm font-medium text-slate-600">Ponto de Referência</label><input name="referencia" value={formData.referencia} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>
              </div>
            </fieldset>

            {/* SEÇÃO: CLASSE DO USUÁRIO (COM CHECKBOXES) */}
            <fieldset className="p-4 border rounded-lg bg-white">
              <legend className="px-2 font-semibold text-slate-700">Classe</legend>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
                {["Agricultor", "Pescador", "Feirante", "Repartição Pública", "Outros"].map(cls => (
                  <div key={cls} className="flex items-center">
                    <input id={`class-${cls}`} type="checkbox" value={cls} checked={formData.classe.includes(cls)} onChange={handleClassChange} className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                    <label htmlFor={`class-${cls}`} className="ml-2 block text-sm text-slate-900">{cls}</label>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* SEÇÃO CONDICIONAL: DOCUMENTOS E BENEFÍCIOS */}
            {(formData.classe.includes("Agricultor") || formData.classe.includes("Pescador")) && (
              <fieldset className="p-4 border rounded-lg bg-white">
                <legend className="px-2 font-semibold text-slate-700">Documentos e Benefícios</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
                  <div><label className="block text-sm font-medium text-slate-600">CAF</label><input name="caf" value={formData.caf} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm" /></div>
                  <div><label className="block text-sm font-medium text-slate-600">CAR</label><input name="car" value={formData.car} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm" /></div>
                  <div><label className="block text-sm font-medium text-slate-600">RGP</label><input name="rgp" value={formData.rgp} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm" /></div>
                  <div><label className="block text-sm font-medium text-slate-600">GTA</label><input name="gta" value={formData.gta} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm" /></div>
                  <BenefitInput
                    label="Garantia Safra"
                    name="garantiaSafra"
                    value={formData.garantiaSafra}
                    onChange={handleInputChange}
                  />
                  <BenefitInput
                    label="Chapéu de Palha"
                    name="chapeuPalha"
                    value={formData.chapeuPalha}
                    onChange={handleInputChange}
                  />
                  <BenefitInput
                    label="PAA"
                    name="paa"
                    value={formData.paa}
                    onChange={handleInputChange}
                  />
                  <BenefitInput
                    label="PNAE"
                    name="pnae"
                    value={formData.pnae}
                    onChange={handleInputChange}
                  />
                  <BenefitInput
                    label="ADAGRO"
                    name="adagro"
                    value={formData.adagro}
                    onChange={handleInputChange}
                  />
                  <BenefitInput
                    label="SSA Água"
                    name="agua"
                    value={formData.agua}
                    onChange={handleInputChange}
                  />

                </div>
              </fieldset>
            )}

          </form>
        </div>

        {/* RODAPÉ FIXO */}
        <div className="flex-shrink-0 p-4 bg-white border-t border-slate-200 flex justify-end items-center gap-4">
          <button onClick={onClose} className="px-6 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 font-semibold hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors">Salvar Alterações</button>
        </div>
      </div>
    </div>
  );

};
