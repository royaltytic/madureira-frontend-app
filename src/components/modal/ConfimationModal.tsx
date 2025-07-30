import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen, onClose, onConfirm, title, children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 z-50 w-full max-w-md" role="dialog">
        <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
        <div className="text-slate-600 mb-6">{children}</div>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};