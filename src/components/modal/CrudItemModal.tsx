import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { XMarkIcon } from '@heroicons/react/24/solid';

// Esquema de validação simples: o nome é obrigatório
const itemSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
});
type ItemFormData = z.infer<typeof itemSchema>;

interface CrudItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string }) => void;
  itemToEdit?: { id: string; name: string } | null;
  entityName: string; // Ex: "Serviço", "Localidade"
}

export const CrudItemModal: React.FC<CrudItemModalProps> = ({ isOpen, onClose, onSave, itemToEdit, entityName }) => {
  const isEditMode = !!itemToEdit;
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: itemToEdit?.name || '' });
    }
  }, [isOpen, itemToEdit, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit(onSave)} className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <header className="p-5 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">
            {isEditMode ? `Editar ${entityName}` : `Adicionar Novo ${entityName}`}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-200">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </header>
        <main className="p-6">
          <fieldset disabled={isSubmitting}>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">Nome</label>
            <input id="name" {...register('name')} className={`w-full border p-3 rounded-lg ... ${errors.name ? 'border-red-500' : ''}`} />
            {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
          </fieldset>
        </main>
        <footer className="p-5 bg-slate-50 border-t flex justify-end gap-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2 rounded-lg border bg-white font-semibold hover:bg-slate-100">Cancelar</button>
          <button type="submit" disabled={isSubmitting} className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:bg-indigo-400">
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </button>
        </footer>
      </form>
    </div>
  );
};