import React, { useState } from "react";
import api from "../../services/api";
import { XMarkIcon } from '@heroicons/react/24/solid';
import { PessoaProps } from "../../types/types";
import { BenefitInput } from "../../components/inputs/BenefitInput";
import { GerenciadorLocalidades } from "../../components/modal/GerenciadorLalidades";
import Alert from "../../components/alerts/alertDesktop";
import { useAuth } from "../../context/AuthContext";


interface PopUpProps {
  onClose: () => void;
  onUpdate: (updatedData: PessoaProps) => void;
}

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
  orders,
  createdAt,
  updatedAt,
  onClose,
  onUpdate,
}) => {

  const {usuario} = useAuth()

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
    orders,
    usuarioId: usuario?.id || '',
    createdAt: createdAt || new Date(),
    updatedAt: updatedAt || new Date(),
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);




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

    setIsLoading(true);

    try {
      await api.put(`/users/${formData.id}`, formData);
      onUpdate(formData);
      <Alert
        type="sucesso"
        text="Cadastro atualizado com sucesso!"
        onClose={onClose}
      />
    } catch (error) {
      console.error("Erro ao atualizar os dados:", error);
      <Alert
        type="error"
        text="Erro ao atualizar o cadastro. Tente novamente."
        onClose={onClose}
        />
    } finally {
      setIsLoading(false);
      onClose();
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
                <div><label className="block text-sm font-medium text-slate-600">CPF</label><input name="cpf" value={formData.cpf} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/></div>
                <div><label className="block text-sm font-medium text-slate-600">RG</label><input name="rg" value={formData.rg} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" /></div>

              </div>
            </fieldset>

            {/* SEÇÃO: ENDEREÇO */}
            <fieldset className="p-4 border rounded-lg bg-white">
              <legend className="px-2 font-semibold text-slate-700">Endereço</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <GerenciadorLocalidades
                  initialValue={formData.neighborhood}
                  onLocalidadeChange={(novaLocalidade) => 
                    setFormData(prev => ({ ...prev, neighborhood: novaLocalidade }))
                  }
                />
                
                <div>
                    <label className="block text-sm font-medium text-slate-600">Ponto de Referência</label>
                    <input name="referencia" value={formData.referencia} onChange={handleInputChange} className="mt-1 w-full border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
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
          <button 
            onClick={handleSave} 
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center w-48 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </button>
          </div>
      </div>
    </div>
  );

};
