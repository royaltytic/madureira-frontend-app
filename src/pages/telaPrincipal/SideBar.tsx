import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ChartBarIcon,
  BriefcaseIcon,
  UsersIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from '@heroicons/react/24/solid';

// --- ESTRUTURA DO MENU ATUALIZADA ---

// 1. Itens de menu visíveis para TODOS os tipos de usuário
const commonMenuItems = [
  { label: 'Dashboard', icon: ChartBarIcon, to: '/app/dashboard' },
  { label: 'Pedidos', icon: BriefcaseIcon, to: '/app/pedidos' },
  { label: 'Usuários', icon: UsersIcon, to: '/app/usuarios' },
  { label: 'Cadastrar', icon: UserPlusIcon, to: '/app/cadastrar' },
];

// 2. Itens de menu visíveis APENAS para o usuário 'secretario' (admin)
const adminOnlyMenuItems = [
  { label: 'Servidores', icon: UserGroupIcon, to: '/app/servidores' },
  { label: 'Configurações', icon: Cog6ToothIcon, to: '/app/configuracoes' },
];


interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { usuario, logout } = useAuth();

  // Guarda de proteção: Se não houver usuário, não renderiza a sidebar.
  if (!usuario) {
    return null;
  }

  // 3. Constrói o menu final combinando os itens com base no tipo de usuário
  const finalMenuItems = usuario.tipo === 'secretario'
    ? [...commonMenuItems, ...adminOnlyMenuItems] // Se for secretário, mostra todos
    : commonMenuItems; // Senão, mostra apenas os comuns

  const activeLinkClass = 'bg-indigo-600 text-white';
  const inactiveLinkClass = 'text-slate-300 hover:bg-slate-700 hover:text-white';

  return (
    <aside className={`fixed top-0 left-0 h-screen bg-slate-800 text-white flex flex-col transition-all duration-300 ease-in-out z-20 ${isOpen ? 'w-64' : 'w-20'}`}>
      
      {/* Botão para Expandir/Recolher */}
      <button onClick={() => setIsOpen(!isOpen)} className="absolute -right-3 top-20 bg-slate-700 text-white p-1.5 rounded-full hover:bg-indigo-600 z-30">
        {isOpen ? <ChevronDoubleLeftIcon className="h-4 w-4" /> : <ChevronDoubleRightIcon className="h-4 w-4" />}
      </button>

      <div className="flex-grow flex flex-col">
        {/* Perfil (agora é um Link) */}
        <Link to="/app/perfil" className="flex items-center gap-4 p-4 border-b border-slate-700 h-20 hover:bg-slate-700/50">
          <img
            src={usuario.imgUrl || `https://ui-avatars.com/api/?name=${usuario.user}&background=random`}
            alt="Avatar"
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          <div className={`overflow-hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            <p className="font-semibold whitespace-nowrap">{usuario.user}</p>
            <p className="text-xs text-slate-400 whitespace-nowrap capitalize">{usuario.tipo}</p>
          </div>
        </Link>

        {/* Menu */}
        <nav className="flex-grow p-2 space-y-2 mt-4">
          {finalMenuItems.map(item => (
            <NavLink
              key={item.label}
              to={item.to}
              end
              className={({ isActive }) => `flex items-center p-3 rounded-lg transition-colors group ${isActive ? activeLinkClass : inactiveLinkClass}`}
            >
              <item.icon className="h-6 w-6 flex-shrink-0" />
              <span className={`font-medium overflow-hidden whitespace-nowrap transition-opacity ${isOpen ? 'opacity-100 ml-4' : 'opacity-0'}`}>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Rodapé da Sidebar */}
      <div className="p-2 border-t border-slate-700">
        <button onClick={logout} className="flex items-center p-3 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white w-full group">
          <ArrowLeftOnRectangleIcon className="h-6 w-6 flex-shrink-0" />
          <span className={`ml-4 font-medium overflow-hidden whitespace-nowrap transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}>Sair</span>
        </button>
      </div>
    </aside>
  );
};
