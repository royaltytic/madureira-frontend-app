// src/components/profile/AuditInfo.tsx
import React from 'react';
// Importar parseISO para uma análise de data mais robusta
import { format, isValid, parseISO } from 'date-fns'; 
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, PencilIcon } from '@heroicons/react/24/outline';

type EmployeeInfo = {
  user: string;
};

type AuditInfoProps = {
  createdAt?: Date | string;
  createdBy?: EmployeeInfo;
  updatedAt?: Date | string;
  updateBy?: EmployeeInfo;
};

const AuditInfoLine: React.FC<{ icon: React.ElementType, date?: Date | string, employee?: EmployeeInfo }> = ({ icon: Icon, date, employee }) => { 

  
    
    // MELHORIA 1: Se não houver data, a linha não é renderizada.
    // Isto evita a mensagem "data inválida" quando a data é simplesmente nula ou indefinida.
    if (!date) return null;
  
    let dateObject: Date | null = null;

    if (typeof date === 'string') {
        // MELHORIA 2: Lógica de limpeza e análise mais robusta.
        // Remove aspas e espaços em branco antes de analisar.
        const cleanIsoString = date.replace(/"/g, '').trim();
        dateObject = parseISO(cleanIsoString);
    } else {
        // Se já for um objeto Date, usa-o diretamente.
        dateObject = date;
    }
    
    // A verificação de validade agora só é acionada se uma data foi realmente fornecida, mas o formato é incorreto.
    if (!isValid(dateObject)) {
        return (
          <div className="flex items-center gap-2 text-red-600">
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>Data em formato inválido</span>
            {employee && <span> por <strong>{employee.user}</strong></span>}
          </div>
        );
    }

    return (
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <div className="flex-grow">
          <time dateTime={format(dateObject, 'yyyy-MM-dd HH:mm')}>
            {format(dateObject, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </time>
          {employee && <span className="mx-1">•</span>}
          {employee && <span>por <strong>{employee.user}</strong></span>}
        </div>
      </div>
    );
};

export const AuditInfo: React.FC<AuditInfoProps> = ({ createdAt, createdBy, updatedAt, updateBy }) => {

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-xs">
      <AuditInfoLine icon={CalendarIcon} date={createdAt} employee={createdBy} />
      <AuditInfoLine icon={PencilIcon} date={updatedAt} employee={updateBy} />
    </div>
  );
};
