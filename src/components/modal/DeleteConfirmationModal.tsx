export const DeleteConfirmationModal: React.FC<{ onConfirm: () => void; onCancel: () => void; }> = ({ onConfirm, onCancel }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-slate-900">Confirmar Exclusão</h2>
            <p className="text-sm text-slate-500 mt-2">Você tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.</p>
            <div className="flex justify-center gap-4 mt-6">
                <button onClick={onCancel} className="px-6 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">Cancelar</button>
                <button onClick={onConfirm} className="px-6 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700">Excluir</button>
            </div>
        </div>
    </div>
);