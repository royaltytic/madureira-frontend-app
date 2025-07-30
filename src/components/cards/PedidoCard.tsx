import React, { useState } from 'react';
import { OrdersProps, PessoaProps } from '../../types/types';
import { EmployeeProps } from '../pedidos/ListaPedidos';
import { getStatusClass } from '../../utils/GetStatus'; // Supondo que você tenha uma função utilitária para obter classes de status
import {
    PhoneIcon,
    MapPinIcon,
    CalendarDaysIcon,
    CheckBadgeIcon,
    PencilSquareIcon,
    TrashIcon,
    ChatBubbleBottomCenterTextIcon,
    ClipboardDocumentListIcon,
    XCircleIcon
} from '@heroicons/react/24/solid';


interface PedidoCardProps {
    pedido: OrdersProps;
    user: PessoaProps | undefined;
    employeeMap: { [key: string]: EmployeeProps };
    toggleOrderSelection: (orderId: string) => void;
    selectedOrderIds: string[];
    handleEditPedido: (pedido: OrdersProps) => void;
    deleteOrder: (id: string) => Promise<void>;
    openImagePopup: (pedido: OrdersProps) => void;
    isSelectionMode: boolean;
    onCardClick: (user: PessoaProps) => void;
}



export const PedidoCard: React.FC<PedidoCardProps> = React.memo(({ pedido, user, employeeMap, toggleOrderSelection, selectedOrderIds, handleEditPedido, deleteOrder, openImagePopup, isSelectionMode, onCardClick }) => {
    const [openMenu, setOpenMenu] = useState(false);
    const formatDate = (dateString: string | null): string => dateString ? new Date(dateString).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "---";

    const isSelected = selectedOrderIds.includes(pedido.id);

    const handleInteractiveClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };


    // Função para escolher o ícone e o texto do tooltip
    const getStatusDetails = (status: string) => {
        const lowerCaseStatus = status.toLowerCase();

        if (lowerCaseStatus.startsWith('lista')) {
            return {
                Icon: ClipboardDocumentListIcon,
                titlePrefix: 'Adicionado à lista por:',
                color: 'text-blue-500'
            };
        }
        if (lowerCaseStatus === 'cancelado') {
            return {
                Icon: XCircleIcon,
                titlePrefix: 'Cancelado por:',
                color: 'text-orange-500'
            };
        }
        if (lowerCaseStatus === 'finalizado') {
            return {
                Icon: CheckBadgeIcon,
                titlePrefix: 'Finalizado por:',
                color: 'text-green-500'
            };
        }

        // Padrão (pode ser um status "Aguardando", por exemplo)
        return {
            Icon: CheckBadgeIcon, // Ícone padrão
            titlePrefix: 'Última alteração por:',
            color: 'text-slate-500'
        };
    };

    const { Icon, titlePrefix, color } = getStatusDetails(pedido.situacao);

    return (
        // Adicionado um padding superior (pt-4) para garantir que o checkbox centralizado não seja cortado
        <div className="group relative bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col pt-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-indigo-200"
            onClick={() => user && onCardClick(user)}>

            {/* --- CONTÊINER DO CHECKBOX COM LÓGICA DE POSICIONAMENTO --- */}
            <div className={`
            absolute z-10
            transition-all duration-300 ease-in-out
            left-2  /* A posição horizontal é sempre a mesma */
  
            /* A posição VERTICAL e a OPACIDADE agora dependem do MODO DE SELEÇÃO */
            ${isSelectionMode
                    ? '-top-2 opacity-100'
                    : 'top-2 opacity-0 group-hover:opacity-100'
                }
  
            /* O efeito de "cápsula" (fundo, sombra, escala) ainda depende da SELEÇÃO INDIVIDUAL */
            ${isSelected ? '  scale-110' : ''}
        `}
                onClick={handleInteractiveClick}>
                <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-indigo-600 cursor-pointer rounded focus:ring-indigo-500 border-slate-300"
                    checked={isSelected}
                    onChange={() => toggleOrderSelection(pedido.id)}
                />
            </div>

            <div className="p-3 pt-0 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="pr-5">
                        <p className="font-semibold text-xs text-slate-800 cursor-pointer" onClick={() => openImagePopup(pedido)}>{user ? `${user.name}, ${user.apelido}` : "..."}</p>
                        {/* <p className="text-xs text-slate-500">{user?.cpf}</p> */}
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-1">
                        <div className={getStatusClass(pedido.situacao)}>{pedido.situacao}</div>
                        <div className="relative">
                            {/* 1. Botão dos três pontos */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Impede o clique de chegar no card
                                    setOpenMenu(!openMenu);
                                }}
                                className="p-1 rounded-full hover:bg-slate-200 focus:outline-none"
                            >
                                <span className="text-lg font-bold leading-none">&#8942;</span>
                            </button>

                            {openMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-50 p-1">
                                    {/* Botão Editar */}
                                    <button
                                        onClick={(e) => {
                                            handleInteractiveClick(e);
                                            handleEditPedido(pedido)
                                            setOpenMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-md flex items-center gap-2"
                                    >
                                        <PencilSquareIcon className="h-4 w-4" />
                                        Editar Pedido
                                    </button>

                                    <div className="border-t my-1 border-slate-200"></div> {/* Divisor visual */}

                                    {/* Botão Deletar */}
                                    <button
                                        onClick={(e) => {
                                            handleInteractiveClick(e);
                                            deleteOrder(pedido.id)
                                            setOpenMenu(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-800 rounded-md flex items-center gap-2"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                        Deletar Pedido
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600 flex-grow">
                    {/* Localização */}

                    <p className="flex items-center gap-1.5">

                        <MapPinIcon className="h-4 w-4 text-slate-400" />

                        {user?.neighborhood || "Sem localidade"}{user?.referencia ? `, ${user.referencia}` : ''}

                    </p>

                    {/* Telefone */}

                    {user?.phone && (

                        <p className="flex items-center gap-1.5">

                            <PhoneIcon className="h-4 w-4 text-slate-400" />

                            {user.phone}

                        </p>

                    )}

                    {/* Descrição do Pedido (com ícone corrigido) */}

                    {pedido?.descricao ? (

                        // Se tiver descrição, mostra o texto normal

                        <p className="flex items-center gap-1.5">

                            <ChatBubbleBottomCenterTextIcon className="h-4 w-4 text-slate-400" />

                            {pedido.descricao}

                        </p>

                    ) : (

                        // Se NÃO tiver, mostra a mensagem padrão com estilo diferente (itálico e mais claro)

                        <p className="flex items-center gap-1.5 text-slate-400 italic">

                            <ChatBubbleBottomCenterTextIcon className="h-4 w-4" />

                            Sem descrição

                        </p>

                    )}
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <div className="flex items-center gap-1.5" title={`Solicitado por: ${pedido.employeeId ? employeeMap[pedido.employeeId]?.user || 'N/A' : 'N/A'}`}>
                        <CalendarDaysIcon className="h-4 w-4" />
                        <span>{formatDate(pedido.data)}</span>
                    </div>

                    {/* SEÇÃO COM ÍCONE E COR DINÂMICOS */}
                    <div
                        className="flex items-center gap-1.5"
                        title={`${titlePrefix} ${pedido.entreguePorId ? employeeMap[pedido.entreguePorId]?.user || 'N/A' : 'N/A'}`}
                    >
                        <Icon className={`h-4 w-4 ${color}`} />
                        <span>{formatDate(pedido.dataEntregue)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});