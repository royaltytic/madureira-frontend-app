import React, { useState } from "react";
import api from "../../services/api";

interface PessoaProps {
  id: string;
  name: string;
  apelido: string;
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

const apiLocalOptions = [
  "Açudinho",
  "Cachoeira do Catolé",
  "Cachoeira do cumbe",
  "Cachoeira do Salobro",
  "Cachoeira do Sebo/Barragem",
  "Cachoeira dos Alves",
  "Gameleira",
  "Lagoa do Sapo",
  "Lagoa dos Cavalos",
  "Lameiro",
  "Manteiga",
  "Mocós",
  "Monjolo",
  "Pau Santo",
  "Pitombeira",
  "Poças de Baixo",
  "Poças de cima",
  "Quatis",
  "Queimados",
  "Quatro contas",
  "Serrote",
  "Sítio Campestre",
  "Sítio Folha Larga",
  "Sítio Novo",
  "Tanque Verde",
  "Taquaris",
  "Terra Nova",
  "Varzea da Passira"
];

export const PopUpEdit: React.FC<PessoaProps & PopUpProps> = ({
  id,
  name,
  apelido,
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
    name,
    apelido,
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl p-8 shadow-xl overflow-y-auto max-h-full">
        <h2 className="text-2xl font-bold mb-6 text-center">Editar Dados Pessoais</h2>
        <form className="flex flex-col gap-6">
          {/* Se o usuário pertencer a "Repartição Pública", mostra campos específicos */}
          {classe.includes("Repartição Pública") ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label htmlFor="name" className="text-lg font-semibold mb-1">Nome</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nome"
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="phone" className="text-lg font-semibold mb-1">Telefone</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Telefone"
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="classe" className="text-lg font-semibold mb-1">Classe</label>
                <input
                  type="text"
                  id="classe"
                  name="classe"
                  value={formData.classe.join(", ")}
                  onChange={handleInputChange}
                  placeholder="Classe"
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="referencia" className="text-lg font-semibold mb-1">Referência</label>
                <input
                  type="text"
                  id="referencia"
                  name="referencia"
                  value={formData.referencia}
                  onChange={handleInputChange}
                  placeholder="Referência"
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="neighborhood" className="text-lg font-semibold mb-1">Localidade</label>
                <select
                  id="neighborhood"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleInputChange}
                  className="border rounded p-2 w-full bg-transparent"
                >
                  {apiLocalOptions.map((option, index) => (
                    <option key={index} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-lg font-semibold mb-1">Nome</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Nome"
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="apelido" className="text-lg font-semibold mb-1">Apelido</label>
                  <input
                    type="text"
                    id="apelido"
                    name="apelido"
                    value={formData.apelido}
                    onChange={handleInputChange}
                    placeholder="Apelido"
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="phone" className="text-lg font-semibold mb-1">Telefone</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Telefone"
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="cpf" className="text-lg font-semibold mb-1">CPF</label>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    placeholder="CPF"
                    className="border rounded p-2 w-full"
                    disabled
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="rg" className="text-lg font-semibold mb-1">RG</label>
                  <input
                    type="text"
                    id="rg"
                    name="rg"
                    value={formData.rg}
                    onChange={handleInputChange}
                    placeholder="RG"
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="classe" className="text-lg font-semibold mb-1">Classe</label>
                  <input
                    type="text"
                    id="classe"
                    name="classe"
                    value={formData.classe.join(", ")}
                    onChange={handleInputChange}
                    placeholder="Classe"
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="referencia" className="text-lg font-semibold mb-1">Referência</label>
                  <input
                    type="text"
                    id="referencia"
                    name="referencia"
                    value={formData.referencia}
                    onChange={handleInputChange}
                    placeholder="Referência"
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="neighborhood" className="text-lg font-semibold mb-1">Localidade</label>
                  <select
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleInputChange}
                    className="border rounded p-2 w-full bg-transparent"
                  >
                    {apiLocalOptions.map((option, index) => (
                      <option key={index} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {(classe.includes("Agricultor") || classe.includes("Pescador")) && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label htmlFor="caf" className="text-lg font-semibold mb-1">CAF</label>
                <input
                  type="text"
                  id="caf"
                  name="caf"
                  value={formData.caf}
                  onChange={handleInputChange}
                  placeholder="CAF"
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="car" className="text-lg font-semibold mb-1">CAR</label>
                <input
                  type="text"
                  id="car"
                  name="car"
                  value={formData.car}
                  onChange={handleInputChange}
                  placeholder="CAR"
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="rgp" className="text-lg font-semibold mb-1">RGP</label>
                <input
                  type="text"
                  id="rgp"
                  name="rgp"
                  value={formData.rgp}
                  onChange={handleInputChange}
                  placeholder="RGP"
                  className="border rounded p-2 w-full"
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="gta" className="text-lg font-semibold mb-1">GTA</label>
                <input
                  type="text"
                  id="gta"
                  name="gta"
                  value={formData.gta}
                  onChange={handleInputChange}
                  placeholder="GTA"
                  className="border rounded p-2 w-full"
                />
              </div>
            </div>
          )}

          {classe.includes("Feirante") && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="imposto" className="text-lg font-semibold mb-1">Imposto</label>
                  <input
                    type="number"
                    id="imposto"
                    name="imposto"
                    value={formData.imposto}
                    onChange={handleInputChange}
                    placeholder="Imposto"
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="area" className="text-lg font-semibold mb-1">Área</label>
                  <input
                    type="text"
                    id="area"
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    placeholder="Área"
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="tempo" className="text-lg font-semibold mb-1">Tempo</label>
                  <input
                    type="text"
                    id="tempo"
                    name="tempo"
                    value={formData.tempo}
                    onChange={handleInputChange}
                    placeholder="Tempo"
                    className="border rounded p-2 w-full"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="carroDeMao" className="text-lg font-semibold mb-1">Carro de Mão</label>
                  <input
                    type="text"
                    id="carroDeMao"
                    name="carroDeMao"
                    value={formData.carroDeMao}
                    onChange={handleInputChange}
                    placeholder="Carro de Mão"
                    className="border rounded p-2 w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="produtos" className="text-lg font-semibold mb-1">Produtos</label>
                  <input
                    type="text"
                    id="produtos"
                    name="produtos"
                    value={formData.produtos}
                    onChange={handleInputChange}
                    placeholder="Produtos"
                    className="border rounded p-2 w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </form>
        <div className="flex justify-end mt-10 gap-4">
          <p
            onClick={onClose}
            className="font-bold text-black text-center cursor-pointer px-4 py-2 rounded border border-gray-300 hover:bg-gray-200 transition-all w-[230px]"
          >
            Cancelar
          </p>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#0E9647] to-[#165C38] font-bold text-white px-4 py-2 rounded hover:opacity-90 transition-all w-[230px]"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
