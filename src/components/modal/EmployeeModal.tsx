import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmployeeSchema, EmployeeFormData } from '../../utils/EmployeeSchema';
import { FormField } from '../inputs/FormField';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { UserProps } from '../../types/types'; // Importe seu tipo Employee/UserProps

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EmployeeFormData, employeeId?: string) => Promise<void>;
  employeeToEdit?: UserProps | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSave, employeeToEdit }) => {
  const isEditMode = !!employeeToEdit;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EmployeeFormData>({
    resolver: zodResolver(EmployeeSchema),
  });

  // Efeito para popular o formulário quando entramos no modo de edição
  useEffect(() => {
    if (isEditMode && employeeToEdit) {
      reset({
        id: employeeToEdit.id,
        user: employeeToEdit.user,
        tipo: employeeToEdit.tipo
      });
    } else {
      reset({
        user: '',
        tipo: ''
      });
    }
  }, [isOpen, employeeToEdit, reset, isEditMode]);


  const handleFormSubmit = async (data: EmployeeFormData) => {
    // Remove as senhas se estiverem em branco para não enviar à API
    
    await onSave(data, employeeToEdit?.id);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        {/* Cabeçalho */}
        <header className="flex-shrink-0 p-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {isEditMode ? 'Editar Servidor' : 'Adicionar Novo Servidor'}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>

        {/* Corpo do Formulário com Rolagem */}
        <main className="flex-grow p-6 overflow-y-auto">
          <fieldset disabled={isSubmitting} className="space-y-5">
            <FormField<EmployeeFormData> name="user" label="Nome de Usuário" type="text" register={register} error={errors.user} />
            <FormField<EmployeeFormData> name="tipo" label="Cargo" type="text" register={register} error={errors.tipo} />
            
            
          </fieldset>
        </main>

        {/* Rodapé */}
        <footer className="flex-shrink-0 p-5 bg-slate-50 border-t border-slate-200 flex justify-end items-center gap-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2 rounded-lg border bg-white text-slate-800 font-semibold hover:bg-slate-100">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 flex items-center">
             {isSubmitting && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" viewBox="0 0 24 24">...</svg>}
             {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </footer>
      </form>
    </div>
  );
};