// import { useState, useEffect, useCallback } from 'react';
// import { toast } from 'react-hot-toast';
// import { lixeiraService } from '../services/lixeiraServices';
// import { ConfirmationModal } from './modal/ConfimationModal';
// import { ArrowPathIcon, TrashIcon } from '@heroicons/react/24/solid';
// import { format } from 'date-fns';
// import { LixeiraData, DeletedItem } from '../services/lixeiraServices';
// // import { useAuth } from '../context/AuthContext';

// type LixeiraSectionProps = {
//   title: string;
//   items: DeletedItem[];
//   nameKey: string; // chave para o nome do item (ex: 'name' ou 'servico')
//   modelName: string; // nome do modelo para ações de restauração
//   onRestore: (model: string, item: DeletedItem) => void;
//   onDelete: (model: string, item: DeletedItem) => void;
// };

// // Componente para renderizar uma seção da lixeira (ex: Usuários, Pedidos)
// const LixeiraSection = ({ title, items, nameKey, modelName, onRestore, onDelete }: LixeiraSectionProps) => {
//   if (items.length === 0) return null;

//   return (
//     <section>
//       <h3 className="text-xl font-bold text-slate-700 mb-4 border-b pb-2">{title}</h3>
//       <ul className="space-y-3">
//         {items.map(item => (
//           <li key={item.id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center">
//             <div>
//               <p className="font-semibold text-slate-800">{item[nameKey]}</p>
//               <p className="text-xs text-slate-500">
//                 Excluído em {format(new Date(item.deletedAt), 'dd/MM/yyyy')} por <strong>{item.deletedBy?.user || 'Desconhecido'}</strong>
//               </p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={() => onRestore(modelName, item)} title="Restaurar" className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-100 rounded-full">
//                 <ArrowPathIcon className="h-5 w-5"/>
//               </button>
//               <button onClick={() => onDelete(modelName, item)} title="Excluir Permanentemente" className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-full">
//                 <TrashIcon className="h-5 w-5"/>
//               </button>
//             </div>
//           </li>
//         ))}
//       </ul>
//     </section>
//   );
// };


// export const Lixeira = () => {
//   const [data, setData] = useState<LixeiraData | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [itemToConfirm, setItemToConfirm] = useState<{ action: 'restore' | 'delete', model: string, item: DeletedItem } | null>(null);

// //   const {usuario} = useAuth();

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       const trashedItems = await lixeiraService.getTrashedItems();
//       setData(trashedItems);
//     } catch (_error) {
//       toast.error("Falha ao carregar itens da lixeira." + _error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleAction = async () => {
//     if (!itemToConfirm) return;
//     const { action, model, item } = itemToConfirm;
    
//     const promise = action === 'restore'
//       ? lixeiraService.restoreItem(model, item.id)
//       : lixeiraService.deletePermanently(model, item.id);
      
//     toast.promise(promise, {
//       loading: `${action === 'restore' ? 'Restaurando' : 'Excluindo'}...`,
//       success: () => {
//         setItemToConfirm(null);
//         fetchData(); // Atualiza a lista
//         return `Item ${action === 'restore' ? 'restaurado' : 'excluído'} com sucesso!`;
//       },
//       error: `Falha ao ${action === 'restore' ? 'restaurar' : 'excluir'} o item.`,
//     });
//   };

//   if (isLoading) {
//     return <div>Carregando lixeira...</div>;
//   }
  
//   const hasItems = data && (data.users.length > 0 || data.orders.length > 0 || data.servicos.length > 0);

//   return (
//     <div className="w-full max-w-4xl mx-auto p-4">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold text-slate-900">Lixeira</h1>
//         <p className="text-slate-500 mt-1">Itens excluídos podem ser restaurados ou removidos permanentemente.</p>
//       </header>
      
//       {hasItems ? (
//         <div className="space-y-8">
//           <LixeiraSection title="Usuários" items={data.users} nameKey="name" modelName="user" onRestore={(model, item) => setItemToConfirm({ action: 'restore', model, item })} onDelete={(model, item) => setItemToConfirm({ action: 'delete', model, item })} />
//           <LixeiraSection title="Pedidos" items={data.orders} nameKey="servico" modelName="orders" onRestore={(model, item) => setItemToConfirm({ action: 'restore', model, item })} onDelete={(model, item) => setItemToConfirm({ action: 'delete', model, item })} />
//           <LixeiraSection title="Serviços" items={data.servicos} nameKey="servico" modelName="servicos" onRestore={(model, item) => setItemToConfirm({ action: 'restore', model, item })} onDelete={(model, item) => setItemToConfirm({ action: 'delete', model, item })} />
//         </div>
//       ) : (
//         <p className="text-center text-slate-500 py-10">A lixeira está vazia.</p>
//       )}

//       <ConfirmationModal
//         isOpen={!!itemToConfirm}
//         onClose={() => setItemToConfirm(null)}
//         onConfirm={handleAction}
//         title={`Confirmar ${itemToConfirm?.action === 'restore' ? 'Restauração' : 'Exclusão Permanente'}`}
//       >
//         Você tem certeza? A ação de <strong>{itemToConfirm?.action === 'delete' && 'excluir permanentemente'}</strong> o item "<strong>{itemToConfirm?.item?.name || itemToConfirm?.item?.servico}</strong>" não poderá ser desfeita.
//       </ConfirmationModal>
//     </div>
//   );
// };