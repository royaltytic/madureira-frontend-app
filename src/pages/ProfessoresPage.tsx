import { useState, useEffect } from 'react';
import { ProfessorCard } from '../components/cards/ProfessorCard';
import { AddEditProfessorModal } from '../components/modal/AddEditProfessorModal';
import { DeleteConfirmationModal } from '../components/modal/DeleteConfirmationModal';
import { Professor } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_BASE_URL } from '../config/api';

export const ProfessoresPage = () => {
    const [professores, setProfessores] = useState<Professor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [professorToEdit, setProfessorToEdit] = useState<Professor | null>(null);
    const [professorToDelete, setProfessorToDelete] = useState<Professor | null>(null);

    // Filtros
    const [search, setSearch] = useState('');
    const [especialidade, setEspecialidade] = useState('');

    const fetchProfessores = async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            if (especialidade) queryParams.append('especialidade', especialidade);

            const response = await fetch(`${API_BASE_URL}/users`);
            if (!response.ok) throw new Error(`Erro: ${response.status}`);
            const data: Professor[] = await response.json();
            setProfessores(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfessores();
    }, [search, especialidade]);

    const handleFileUpload = async (file: File, type: 'profile' | 'documento') => {
        const formData = new FormData();
        formData.append('file', file);

        const endpoint = `${API_BASE_URL}/uploads/${type}`;
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error(`Falha no upload do ${type}`);
            const result = await response.json();
            return result.imgUrl;
        } catch (uploadError) {
            console.error(`Erro no upload:`, uploadError);
            throw uploadError;
        }
    };

    const handleSave = async (data: Professor, files: { profileImage?: File, documento?: File }) => {
        try {
            let imgUrl, rgImageUrl;

            if (files.profileImage) {
                imgUrl = await handleFileUpload(files.profileImage, 'profile');
            }
            if (files.documento) {
               rgImageUrl = await handleFileUpload(files.documento, 'documento');
            }

            const finalData = {
                ...data,
                imgUrl,
                rgImageUrl,
            };

            if (professorToEdit) {
                // UPDATE
                const response = await fetch(`${API_BASE_URL}/users/${professorToEdit.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalData),
                });

                if (!response.ok) throw new Error('Falha ao atualizar o professor.');
                const updatedProfessor = await response.json();
                setProfessores(professores.map(p => p.id === updatedProfessor.id ? updatedProfessor : p));
            } else {
                // CREATE
                const response = await fetch(`${API_BASE_URL}i/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(finalData),
                });

                if (!response.ok) throw new Error('Falha ao adicionar o professor.');
                const newProfessor = await response.json();
                setProfessores([...professores, newProfessor]);
            }
        } catch (error) {
            console.error("Erro ao salvar o professor:", error);
        } finally {
            setIsAddEditModalOpen(false);
            setProfessorToEdit(null);
        }
    };

    const handleConfirmDelete = async () => {
        if (professorToDelete) {
            try {
                const response = await fetch(`${API_BASE_URL}/users/${professorToDelete.id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) throw new Error('Falha ao excluir o professor.');
                setProfessores(professores.filter(p => p.id !== professorToDelete.id));
                setProfessorToDelete(null);
            } catch (error) {
                console.error("Erro ao excluir o professor:", error);
            }
        }
    };

    if (isLoading) return <LoadingSpinner/>;

    return (
        <div>
            {/* Filtros */}
            <div className="flex gap-4 mb-6">
                <input 
                    type="text" 
                    placeholder="Buscar por nome..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                    className="px-3 py-2 border rounded-md"
                />
                <select 
                    value={especialidade} 
                    onChange={(e) => setEspecialidade(e.target.value)} 
                    className="px-3 py-2 border rounded-md"
                >
                    <option value="">Todas Especialidades</option>
                    <option value="futebol">Futebol</option>
                    <option value="volei">Vôlei</option>
                    <option value="natacao">Natação</option>
                </select>
                <button 
                    onClick={() => { setProfessorToEdit(null); setIsAddEditModalOpen(true); }} 
                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                    Adicionar Professor
                </button>
            </div>

            {/* Lista */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {professores.map(prof => (
                    <ProfessorCard 
                        key={prof.id} 
                        professor={prof} 
                        onEdit={() => { setProfessorToEdit(prof); setIsAddEditModalOpen(true); }} 
                        onDelete={() => setProfessorToDelete(prof)} 
                    />
                ))}
            </div>

            {/* Modais */}
            {isAddEditModalOpen && (
                <AddEditProfessorModal 
                    professor={professorToEdit} 
                    onClose={() => { setIsAddEditModalOpen(false); setProfessorToEdit(null); }} 
                    onSave={handleSave} 
                />
            )}
            {professorToDelete && (
                <DeleteConfirmationModal 
                    onConfirm={handleConfirmDelete} 
                    onCancel={() => setProfessorToDelete(null)} 
                />
            )}
        </div>
    );
};
