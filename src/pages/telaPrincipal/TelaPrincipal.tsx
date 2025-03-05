import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Home from "./assets/Home.png";
import Pedidos from "./assets/Pedidos.png";
import Cadastro from "./assets/Cadastro.png";
import Sair from "./assets/Sair.png";
import DB from "./assets/Database.png";
import Config from "./assets/Settings.png";
import Funcionarios from "./assets/Pessoas.png";

import HomeComponent from "../../components/HomeComponent";
import { PedidosComponent } from "../../components/PedidosComponent";
import { CadastroComponent } from "../../components/CadastroComponent";
import ConfiguracaoComponent from "../../components/ConfiguraçãoComponent";
import AllUsersTable from "../../components/DataBaseComponent";
import EmployeeList from "../../components/FuncionariosComponent";

export const TelaPrincipal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Inicializa o estado com os dados do usuário recebidos na rota
  const [userData, setUserData] = useState(location.state?.userData);

  const menuItems = [
    { label: "inicio", icon: Home, component: <HomeComponent usuario={userData} /> },
    { label: "pedidos", icon: Pedidos, component: <PedidosComponent usuario={userData} /> },
    { label: "cadastrar", icon: Cadastro, component: <CadastroComponent /> },
    { label: "banco", icon: DB, component: <AllUsersTable /> },
    {
      label: "configuração",
      icon: Config,
      component: (
        <ConfiguracaoComponent
          usuario={userData.employee}
          onUpdateUser={(updatedEmployee) => {
            setUserData({ ...userData, employee: updatedEmployee });
          }}
        />
      ),
    },
  ];

  // Adiciona "Funcionários" ao menu apenas se o usuário for secretário
  if (userData?.employee?.tipo === "secretario") {
    menuItems.push({
      label: "funcionários",
      icon: Funcionarios,
      component: <EmployeeList usuario={userData} />,
    });
  }

  const [ComponenteAtual, setComponenteAtual] = useState<JSX.Element>(
    <HomeComponent usuario={userData} />
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("userData");
    sessionStorage.removeItem("userData");
    navigate("/", { replace: true });
  };

  return (
    <div className="w-screen h-screen flex">
      {/* Sidebar */}
      <div
        className="fixed top-0 left-0 h-screen bg-gradient-to-b from-[#00324C] to-[#191B23] flex flex-col justify-between transition-all ease-in-out duration-300 overflow-hidden"
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
        style={{ width: isSidebarOpen ? "250px" : "70px" }}
      >
        <div>
          {/* Perfil do usuário */}
          <div className="flex flex-col items-center py-10">
            <div
              className="bg-white rounded-full flex items-center justify-center overflow-hidden transition-all ease-in-out duration-300"
              style={{ width: isSidebarOpen ? "150px" : "50px", height: isSidebarOpen ? "150px" : "50px" }}
            >
              <img
                src={userData?.employee?.imgUrl || "./assets/User.png"}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            {isSidebarOpen && (
              <>
                <p className="font-bold text-2xl text-white mt-5">{userData?.employee?.user}</p>
                <div className="border w-[200px] mt-5"></div>
              </>
            )}
          </div>

          {/* Menu de navegação */}
          <div className="flex flex-col mt-6">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center w-full mb-10 cursor-pointer transition-all ease-in-out duration-300 ${
                  ComponenteAtual.type === item.component.type ? "border-l-4 border-white" : ""
                }`}
                onClick={() => {
                  // Evita acesso ao EmployeeList se não for secretário
                  if (item.label === "funcionários" && userData?.employee?.tipo !== "secretario") {
                    return;
                  }
                  setComponenteAtual(item.component);
                }}
              >
                <div className="flex items-center justify-center w-[70px]">
                  <img src={item.icon} alt={item.label} className="w-8 h-8" />
                </div>
                {isSidebarOpen && <p className="font-bold text-2xl text-white">{item.label}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Botão de Logout */}
        <div
          className="flex items-center w-full mb-10 cursor-pointer transition-all ease-in-out duration-300"
          onClick={logout}
        >
          <div className="flex items-center justify-center w-[70px]">
            <img src={Sair} alt="sair" className="w-8 h-8" />
          </div>
          {isSidebarOpen && <p className="font-bold text-2xl text-white">sair</p>}
        </div>
      </div>

      {/* Área principal */}
      <div
        className="flex-1  bg-white transition-all ease-in-out duration-300"
        style={{ marginLeft: isSidebarOpen ? "250px" : "70px" }}
      >
        {ComponenteAtual}
      </div>
    </div>
  );
};
