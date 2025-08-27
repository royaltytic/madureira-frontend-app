import React, { useState } from 'react';
import { Aluno } from '../../types';
import { UploadIcon } from '../../shared/Icons';

export const EditAlunoModal: React.FC<{ aluno: Aluno; onClose: () => void; onSave: (aluno: Aluno, files: { profileImage?: File, documento?: File }) => void; }> = ({ aluno, onClose, onSave }) => {
    const [formData, setFormData] = useState(aluno);
    const [profileImageFile, setProfileImageFile] = useState<File | undefined>();
    const [documentoFile, setDocumentoFile] = useState<File | undefined>();
    const [isUploading, setIsUploading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (e.target.name === 'profileImageFile') {
                setProfileImageFile(file);
            } else if (e.target.name === 'documentoFile') {
                setDocumentoFile(file);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        await onSave(formData, { profileImage: profileImageFile, documento: documentoFile });
        setIsUploading(false);
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <header className="p-5 border-b border-slate-200"><h2 className="text-lg font-bold text-slate-900">Editar Aluno</h2></header>
                    <main className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                        {/* Dados Pessoais */}
                        <section>
                            <h3 className="text-base font-bold text-indigo-600 mb-3">Dados Pessoais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="text-sm font-medium text-slate-600">Nome Completo</label><input type="text" name="nomeAluno" value={formData.nomeAluno} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                                <div><label className="text-sm font-medium text-slate-600">Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                                <div><label className="text-sm font-medium text-slate-600">Telefone</label><input type="tel" name="telefone" value={formData.telefone} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                                <div><label className="text-sm font-medium text-slate-600">Responsável</label><input type="text" name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                                <div><label className="text-sm font-medium text-slate-600">RG</label><input type="text" name="rg" value={formData.rg} onChange={handleChange} className='w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg'/></div>
                                <div><label className="text-sm font-medium text-slate-600">CPF</label><input type="text" name="cpf" value={formData.cpf} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                            </div>
                        </section>

                        {/* endereço */}
                        <section>
                            <h3 className="text-base font-bold text-indigo-600 mb-3">Endereço</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="text-sm font-medium text-slate-600">Cep</label><input type="text" name="cep" value={formData.cep} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                                <div><label className="text-sm font-medium text-slate-600">Cidade</label><input type="text" name="cidade" value={formData.cidade} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                              
                            </div>
                        </section>

                        {/* matricula */}
                        <section>
                            <h3 className="text-base font-bold text-indigo-600 mb-3">Matrícula</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="text-sm font-medium text-slate-600">Modalidades</label><input type="text" name="modalidades" value={formData.modalidades} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                                <div><label className="text-sm font-medium text-slate-600">Turno</label><input type="text" name="turno" value={formData.turno} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                                <div><label className="text-sm font-medium text-slate-600">Escola</label><input type="text" name="escola" value={formData.escola} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                            </div>
                        </section>

                        {/* saude */}
                        <section>
                            <h3 className="text-base font-bold text-indigo-600 mb-3">Saúde</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="text-sm font-medium text-slate-600">Problema de Saúde</label><input type="text" name="temProblemaSaude" value={formData.temProblemaSaude? "Sim" : "Não"} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                                <div><label className="text-sm font-medium text-slate-600">Detalhes</label><input type="text" name="problemaSaudeDetalhes" value={formData.problemaSaudeDetalhes} onChange={handleChange} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"/></div>
                            </div>
                        </section>

                        {/* Documentos e Foto */}
                        <section>
                            <h3 className="text-base font-bold text-indigo-600 mb-3">Documentos e Foto</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-600">Foto de Perfil</label>
                                    <label htmlFor="profileImageFile" className="mt-1 text-center w-full flex flex-col items-center px-4 py-4 bg-white text-blue rounded-lg shadow-sm tracking-wide uppercase border border-blue cursor-pointer hover:bg-indigo-100 hover:text-indigo-700">
                                        <UploadIcon className="w-6 h-6" />
                                        <span className="mt-2 text-xs leading-normal">{profileImageFile ? profileImageFile.name : 'Selecione um arquivo'}</span>
                                        <input id="profileImageFile" type='file' name="profileImageFile" onChange={handleFileChange} className="hidden" accept="image/*" />
                                    </label>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-600">RG</label>
                                    <label htmlFor="documentoFile" className="mt-1 text-center w-full flex flex-col items-center px-4 py-4 bg-white text-blue rounded-lg shadow-sm tracking-wide uppercase border border-blue cursor-pointer hover:bg-indigo-100 hover:text-indigo-700">
                                        <UploadIcon className="w-6 h-6" />
                                        <span className="mt-2 text-xs leading-normal">{documentoFile ? documentoFile.name : 'Selecione um arquivo'}</span>
                                        <input id="documentoFile" type='file' name="documentoFile" onChange={handleFileChange} className="hidden" accept=".pdf,.jpg,.png" />
                                    </label>
                                </div>
                            </div>
                        </section>
                    </main>
                    <footer className="p-4 bg-slate-50 border-t flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border rounded-lg hover:bg-slate-100">Cancelar</button>
                        <button type="submit" disabled={isUploading} className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300">
                            {isUploading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};
