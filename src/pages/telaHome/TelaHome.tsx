import { useState } from "react";
import { Button } from "../../components/buttons/ButtonSimple";
import { PopUp } from "../../components/popup/PopUp";
import UltimosPedidos from "../../components/pedidos/UltimosPedidos";
import api from "../../services/api";
import { PopUpEdit } from "./PopUpEdit";
import { PessoaProps } from "../../types/types";
import { OrdersProps } from "../../types/types";
import { UserProps } from "../../types/types";
import Alert from "../../components/alerts/alertDesktop";


interface HomeProps extends PessoaProps {
  voltarParaPesquisa: () => void;
  usuario: UserProps;
}

export const Home: React.FC<HomeProps> = ({
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
  orders,
  rgImageUrl,
  cafImageUrl,
  carImageUrl,
  rgpImageUrl,
  voltarParaPesquisa,
  usuario,
}) => {
  const [userData, setUserData] = useState<PessoaProps>({
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
    orders,
    rgImageUrl,
    cafImageUrl,
    carImageUrl,
    rgpImageUrl,
  });

  const [order, setOrder] = useState<OrdersProps[]>(orders);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isPopUpEditOpen, setIsPopUpEditOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

  // Estado para exibir alerta personalizado
  const [alert, setAlert] = useState<{
    type: "alerta" | "error" | "info" | "sucesso";
    text: string;
  } | null>(null);

  const showAlert = (
    type: "alerta" | "error" | "info" | "sucesso",
    text: string
  ) => {
    setAlert({ type, text });
  };

  const closeAlert = () => {
    setAlert(null);
  };

  const openPopUp = () => {
    setIsPopUpOpen(true);
  };

  const closePopUp = () => {
    setIsPopUpOpen(false);
  };

  const openPopUpEdit = () => {
    setIsPopUpEditOpen(true);
  };

  const closePopUpEdit = () => {
    setIsPopUpEditOpen(false);
  };

  const openImageModal = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setCurrentImageUrl(null);
  };

  const salvarPedido = async (novosPedidos: OrdersProps[]) => {
    try {
      const response = await api.put("/users", {
        usuario,
        id,
        orders: novosPedidos,
      });

      // Atualiza o estado local com os pedidos retornados pela API (incluindo o novo pedido)
      setOrder(response.data.orders);
    } catch (error) {
      console.error("Erro ao salvar pedidos:", error);
      showAlert("error", "Erro ao salvar pedidos. Tente novamente.");
    }
  };


  const updatePedidoSituacao = async (id: string, situacao: string) => {
    try {
      const dataEntregue = situacao === "Finalizado" ? new Date().toISOString() : null;

      const response = await api.put(`/orders/${id}`, { usuario, situacao, dataEntregue });

      if (response.status === 200) {
        setOrder((prevOrder) =>
          prevOrder.map((order) =>
            order.id === id
              ? { ...order, usuario, situacao, dataEntregue }
              : order
          )
        );
      } else {
        showAlert("error", "Falha ao atualizar a situação do pedido.");
      }
    } catch (error) {
      console.error("Erro ao atualizar a situação do pedido:", error);
      showAlert("error", "Erro ao atualizar a situação do pedido. Tente novamente.");
    }
  };

  const atualizarDadosUsuario = (updatedData: Partial<PessoaProps>) => {
    setUserData((prevUserData) => ({
      ...prevUserData,
      ...updatedData,
    }));
  };

  return (
    <section className="flex flex-col bg-white w-full h-full">
      <div className="">
        <div className="flex w-full">
          <div>
            <div className="w-[400px] h-min bg-white text-black border border-white rounded-xl py-1 px-4 shadow-2xl">
              <div className="flex">
                <h2 className="text-2xl font-bold">Dados Pessoais</h2>
                <svg
                  className="w-7 h-7 ml-32 cursor-pointer"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  onClick={openPopUpEdit}
                >
                  <path
                    d="M22 7.99996H8C6.93913 7.99996 5.92172 8.42139 5.17157 9.17154C4.42143 9.92168 4 10.9391 4 12V40C4 41.0608 4.42143 42.0782 5.17157 42.8284C5.92172 43.5785 6.93913 44 8 44H36C37.0609 44 38.0783 43.5785 38.8284 42.8284C39.5786 42.0782 40 41.0608 40 40V26M37 4.99996C37.7956 4.20432 38.8748 3.75732 40 3.75732C41.1252 3.75732 42.2044 4.20432 43 4.99996C43.7956 5.79561 44.2426 6.87475 44.2426 7.99996C44.2426 9.12518 43.7956 10.2043 43 11L24 30L16 32L18 24L37 4.99996Z"
                    stroke="#1E1E1E"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>


                {isPopUpEditOpen && (
                  <PopUpEdit
                    id={userData.id}
                    name={userData.name}
                    apelido={userData.apelido}
                    cpf={userData.cpf}
                    rg={userData.rg}
                    caf={userData.caf}
                    car={userData.car}
                    rgp={userData.rgp}
                    gta={userData.gta}
                    phone={userData.phone}
                    neighborhood={userData.neighborhood}
                    referencia={userData.referencia}
                    adagro={userData.adagro}
                    classe={userData.classe}
                    chapeuPalha={userData.chapeuPalha}
                    garantiaSafra={userData.garantiaSafra}
                    paa={userData.paa}
                    pnae={userData.pnae}
                    agua={userData.agua}
                    imposto={userData.imposto}
                    area={userData.area}
                    tempo={userData.tempo}
                    carroDeMao={userData.carroDeMao}
                    produtos={userData.produtos}
                    onClose={closePopUpEdit}
                    onUpdate={atualizarDadosUsuario}
                  />
                )}
              </div>

              {
                userData.classe.includes("Repartição Pública") ? (
                  <>
                    <p className="my-2 text-base">
                      Nome: <span className="ml-1">{userData.name}</span>
                    </p><p className="my-2 text-base">
                      Classe: <span className="ml-1">{userData.classe}</span>
                    </p>
                    <p className="my-2 text-base">
                      Telefone: <span className="ml-1">{userData.phone}</span>
                    </p>
                    <p className="my-2 text-base">
                      Localidade:{" "}
                      <span className="ml-1">{userData.neighborhood}</span>
                    </p>
                    <p className="my-2 text-base">
                      Referência: <span className="ml-1">{userData.referencia}</span>
                    </p>
                  </>
                ) : (<><p className="my-2 text-base">
                  Nome: <span className="ml-1">{userData.name}</span>
                </p><p className="my-2 text-base">
                    Apelido: <span className="ml-1">{userData.apelido}</span>
                  </p><p className="my-2 text-base">
                    Classe:{" "}
                    <span className="ml-1">
                      {Array.isArray(userData.classe) && userData.classe.length > 0
                        ? userData.classe.join(", ")
                        : userData.classe || "não possui"}
                    </span>
                  </p><p className="my-2 text-base">
                    CPF: <span className="ml-1">{userData.cpf}</span>
                  </p><div className="cursor-pointer" onClick={() => userData.rgImageUrl && openImageModal(userData.rgImageUrl)}>
                    <p className="my-2 text-base flex">
                      RG: <span className="ml-1">{userData.rg}</span>
                    </p>
                  </div><p className="my-2 text-base">
                    Telefone: <span className="ml-1">{userData.phone}</span>
                  </p><p className="my-2 text-base">
                    Localidade:{" "}
                    <span className="ml-1">{userData.neighborhood}</span>
                  </p><p className="my-2 text-base">
                    Referência: <span className="ml-1">{userData.referencia}</span>
                  </p></>)
              }



              {(userData.classe.includes("Agricultor") ||
                userData.classe.includes("Pescador")) && (
                  <>
                    <div className="cursor-pointer" onClick={() => userData.cafImageUrl && openImageModal(userData.cafImageUrl)}>
                      <p className="my-2 text-base flex">
                        CAF: <span className="ml-1">{userData.caf ? userData.caf : "não possui"}</span>

                      </p>
                    </div>
                    <div className="cursor-pointer" onClick={() => userData.carImageUrl && openImageModal(userData.carImageUrl)}
                    ><p className="my-2 text-base flex">
                        CAR: <span className="ml-1">{userData.car ? userData.car : "não possui"}</span>
                      </p>

                    </div>
                    <div className="cursor-pointer" onClick={() => userData.rgpImageUrl && openImageModal(userData.rgpImageUrl)}>
                      <p className="my-2 text-base flex">
                        RGP: <span className="ml-1">{userData.rgp ? userData.rgp : "não possui"}</span>

                      </p>
                    </div>

                    <p className="my-2 text-base">
                      GTA: <span className="ml-1">{userData.gta ? userData.gta : "não possui"}</span>
                    </p>
                  </>
                )}

              {userData.classe.includes("Feirante") && (
                <>
                  <p className="my-2 text-base">
                    Imposto: R$<span className="ml-1">{userData.imposto ? userData.imposto : "não possui"}</span>
                  </p>
                  <p className="my-2 text-base">
                    Area: <span className="ml-1">{userData.area ? userData.area : "não possui"}</span>
                  </p>
                  <p className="my-2 text-base">
                    Tempo de Feirante: <span className="ml-1">{userData.tempo ? userData.tempo + " anos" : "não possui"}</span>
                  </p>
                  <p className="my-2 text-base">
                    Carro de mão: <span className="ml-1">{userData.carroDeMao ? userData.carroDeMao : "não possui"}</span>
                  </p>
                  <p className="my-2 text-base">
                    Produtos:{" "}
                    <span className="ml-1">
                      {userData.produtos && userData.produtos.length > 0
                        ? userData.produtos.join(", ")
                        : "não possui"}
                    </span>
                  </p>
                </>
              )}
            </div>

            {(userData.classe.includes("Agricultor") ||
              userData.classe.includes("Pescador")) && (
                <div className="w-[400px] bg-white text-black border border-gray-200 rounded-xl mt-3 py-4 px-5 shadow-lg">
                  <h2 className="text-2xl font-bold mb-3 text-gray-700">Benefícios</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {userData.garantiaSafra && (
                      <p
                        className="py-2 px-3 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition"
                        title={`${userData.garantiaSafra}`}
                      >
                        Garantia Safra
                      </p>
                    )}

                    {userData.chapeuPalha && (
                      <p
                        className="py-2 px-3 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition"
                        title={`${userData.chapeuPalha}`}
                      >
                        Chapéu de Palha
                      </p>
                    )}

                    {userData.agua && (
                      <p
                        className="py-2 px-3 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition"
                        title="Possui acesso à água"
                      >
                        Água
                      </p>
                    )}

                    {userData.adagro && (
                      <p
                        className="py-2 px-3 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition"
                        title="Possui CAD ADAGRO"
                      >
                        ADAGRO
                      </p>
                    )}

                    {userData.paa && (
                      <p
                        className="py-2 px-3 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition"
                        title={`${userData.paa}`}
                      >
                        PAA
                      </p>
                    )}

                    {userData.pnae && (
                      <p
                        className="py-2 px-3 bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:bg-gray-200 transition"
                        title={`${userData.pnae}`}
                      >
                        PNAE
                      </p>
                    )}

                  </div>
                </div>
              )}

            <div className="mt-3 w-[400px] flex justify-between items-center gap-5">
              <Button
                className="bg-gradient-to-r from-[#E03335] to-[#812F2C] font-bold text-white"
                children="Voltar"
                variant="transparent"
                type="button"
                onClick={voltarParaPesquisa}
              />

              {(userData.classe.includes("Agricultor") ||
                userData.classe.includes("Pescador") || userData.classe.includes("Outros") || userData.classe.includes("Repartição Pública")) && (
                  <Button
                    className="bg-gradient-to-r from-[#0E9647] to-[#165C38] font-bold"
                    children="Novo Pedido"
                    size="large"
                    variant="solid"
                    type="submit"
                    onClick={openPopUp}
                  />
                )}
            </div>
          </div>
          <div className="flex flex-col">

          </div>
          <div className="bg-white text-black w-full ml-8 rounded-2xl pb-4 shadow-2xl">
            {(userData.classe.includes("Agricultor") ||
              userData.classe.includes("Pescador") || userData.classe.includes("Outros") || userData.classe.includes("Repartição Pública")) ? (
              <UltimosPedidos pedidos={order || []} onUpdate={updatePedidoSituacao} />
            ) : (
              <div className="w-full text-center text-red-500 font-bold mt-4">
                Nenhum pedido disponível. Feirantes não têm acesso aos pedidos.
              </div>
            )}
          </div>

          {isPopUpOpen && (
            <PopUp onClose={closePopUp} onAddPedido={salvarPedido} />
          )}

          {isImageModalOpen && currentImageUrl && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded max-w-lg max-h-[80vh] o4verflow-auto">
                <img src={currentImageUrl} alt="Imagem do Documento" className="max-w-full max-h-[60vh] object-contain" />
                <div className="flex w-full justify-between mt-2 gap-4">
                  <button onClick={closeImageModal} className="bg-gradient-to-r from-[#E03335] to-[#812F2C] rounded w-1/2 h-8 text-center flex items-center justify-center font-semibold font-lg text-white">
                    Fechar
                  </button>
                  <a href={currentImageUrl} download className="bg-gradient-to-r from-[#0E9647] to-[#165C38] rounded w-1/2 h-8 text-center flex items-center justify-center font-semibold font-lg text-white">
                    Baixar
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {alert && (
        <Alert type={alert.type} text={alert.text} onClose={closeAlert} />
      )}
    </section>
  );
};