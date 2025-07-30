import React from 'react';
import { UserCircleIcon, MapPinIcon, UserGroupIcon, DevicePhoneMobileIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/solid';
import { PessoaProps } from '../../types/types';
import { formatCpf } from '../../utils/ExportToPDFUsuarios';

export const UserCard = React.memo(({ user, onSelectUser }: { user: PessoaProps, onSelectUser: (user: PessoaProps) => void }) => {
    return (
      <div
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1"
        onClick={() => onSelectUser(user)}
      >
        <div>
          <div className="flex items-center gap-4 mb-3">
            <UserCircleIcon className="h-12 w-12 text-slate-300 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="font-bold text-base text-slate-800 truncate" title={user.name}>{user.name}</p>
              <p className="text-sm text-slate-500 truncate" title={user.apelido}>{user.apelido || "Sem apelido"}</p>
              <p className="text-xs text-slate-400">{formatCpf(user.cpf)}</p>
            </div>
          </div>
          <div className="space-y-1.5 text-sm text-slate-600 border-t border-slate-100 pt-3">
            <p className="flex items-center gap-2"><MapPinIcon className="h-4 w-4 text-slate-400" /> <span className="truncate">{user.neighborhood || "Sem localidade"}</span></p>
            <p className="flex items-center gap-2"><UserGroupIcon className="h-4 w-4 text-slate-400" /> <span className="truncate">{Array.isArray(user.classe) ? user.classe.join(', ') : 'Sem classe'}</span></p>
            <p className="flex items-center gap-2"><DevicePhoneMobileIcon className="h-4 w-4 text-slate-400" /> <span>{user.phone || "Sem telefone"}</span></p>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <p className="text-xs text-indigo-600 font-semibold flex items-center justify-center gap-1">
            <ClipboardDocumentListIcon className="h-4 w-4" />
            {user.orders.length} {user.orders.length === 1 ? 'Pedido Registrado' : 'Pedidos Registrados'}
          </p>
        </div>
      </div>
    );
  });