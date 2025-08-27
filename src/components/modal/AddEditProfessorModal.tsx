import React, { useState } from 'react';
import { UploadIcon } from '../../shared/Icons';
import { Professor } from '../../types';


export const AddEditProfessorModal: React.FC<{ professor?: Professor | null; onClose: () => void; onSave: (data: Professor, files: { profileImage?: File; documento?: File }) => Promise<void>; }> = ({ professor, onClose, onSave }) => {

    alert('AddEditProfessorModal component loaded with data: ' + JSON.stringify(professor));
    console.trace()

    const [formData, setFormData] = useState({
        id: professor?.id || Number(0),
        nome: professor?.nome || '',
        email: professor?.email || '',
        turmas: professor?.turmas || [],
        password: professor ? '' : '', // Senha vazia ao editar
        role: professor?.role || 'Usuario', // Default to 'Usuario' if no role is provided
    });
    const [profileImageFile, setProfileImageFile] = useState<File | undefined>();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setProfileImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, { profileImage: profileImageFile });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <header className="p-5 border-b"><h2 className="text-lg font-bold">{professor ? 'Editar' : 'Adicionar'} Professor</h2></header>
                    <main className="p-6 space-y-4">
                        <div><label>Nome</label><input type="text" name="nome" value={formData.nome} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg"/></div>
                        <div><label>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg"/></div>
                        <div><label>Turma</label><input type="text" name="turma" value={formData.turmas} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg"/></div>
                        <div>
                            <label>Foto de Perfil</label>
                            <label htmlFor="profileImageFile" className="mt-1 text-center w-full flex flex-col items-center px-4 py-4 bg-white rounded-lg shadow-sm border cursor-pointer hover:bg-indigo-50">
                                <UploadIcon />
                                <span className="mt-2 text-xs">{profileImageFile ? profileImageFile.name : 'Selecione um arquivo'}</span>
                                <input id="profileImageFile" type='file' name="profileImageFile" onChange={handleFileChange} className="hidden" accept="image/*" />
                            </label>
                        </div>
                    </main>
                    <footer className="p-4 bg-slate-50 border-t flex justify-end gap-3"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold bg-white border rounded-lg">Cancelar</button><button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg">Salvar</button></footer>
                </form>
            </div>
        </div>
    );
};
