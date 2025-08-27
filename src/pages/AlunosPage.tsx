import { useState, useEffect, useMemo } from 'react';
import { AlunoCard } from '../components/cards/AlunoCards';
import { FilterBar } from '../components//filters/FilterBar'
import { Aluno } from '../types';
import { UserIcon } from '../shared/Icons';
import { FilterModal } from '../components/modal/FilterModal';
import { AlunoDetailModal } from '../components/modal/AlunoDetailModal';
import { EditAlunoModal } from '../components/modal/EditAlunoModal';
import { DeleteConfirmationModal } from '../components/modal/DeleteConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { API_BASE_URL } from '../config/api';

export const AlunosPage = () => {
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModalidade, setSelectedModalidade] = useState('');
    const [selectedTurno, setSelectedTurno] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [tempFilters, setTempFilters] = useState({ modalidade: '', turno: '' });
    const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
    const [alunoToEdit, setAlunoToEdit] = useState<Aluno | null>(null);
    const [alunoToDelete, setAlunoToDelete] = useState<Aluno | null>(null);

    useEffect(() => {
        const fetchAlunos = async () => { 
            setIsLoading(true); setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/alunos`);
                if (!response.ok) throw new Error(`Erro: ${response.status}`);
                const data: Aluno[] = await response.json();
                setAlunos(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlunos();
    }, []);
    
    const filteredAlunos = useMemo(() => alunos.filter(aluno => aluno.nomeAluno.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedModalidade ? aluno.modalidades.includes(selectedModalidade) : true) && (selectedTurno ? aluno.turno === selectedTurno : true)), [alunos, searchTerm, selectedModalidade, selectedTurno]);
    const modalidadesUnicas = useMemo(() => [...new Set(alunos.flatMap(a => a.modalidades))], [alunos]);
    const turnosUnicos = useMemo(() => [...new Set(alunos.map(a => a.turno).filter(Boolean))] as string[], [alunos]);

    // Handlers para os modais
    const handleOpenFilterModal = () => { setTempFilters({ modalidade: selectedModalidade, turno: selectedTurno }); setIsFilterModalOpen(true); };
    const handleApplyFilters = () => { setSelectedModalidade(tempFilters.modalidade); setSelectedTurno(tempFilters.turno); setIsFilterModalOpen(false); };
    const handleClearFilters = () => { setTempFilters({ modalidade: '', turno: '' }); setSelectedModalidade(''); setSelectedTurno(''); setIsFilterModalOpen(false); };
    
    const handleOpenEditModal = () => { if (selectedAluno) { setAlunoToEdit(selectedAluno); setSelectedAluno(null); } };
    const handleOpenDeleteModal = () => { if (selectedAluno) { setAlunoToDelete(selectedAluno); setSelectedAluno(null); } };
    
    const handleFileUpload = async (file: File, type: 'profile' | 'documento') => {
        const formData = new FormData();
        formData.append('file', file);
        // Adapte o endpoint conforme sua API de upload
        const endpoint = `${API_BASE_URL}/uploads/${type}`; 
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                throw new Error(`Falha no upload do ${type}`);
            }
            const result = await response.json();
            return result.imgUrl; // Assumindo que a API retorna { fileUrl: '...' }
        } catch (uploadError) {
            console.error(`Erro no upload:`, uploadError);
            throw uploadError; // Propaga o erro
        }
    };

    const handleSaveAluno = async (updatedAlunoData: Aluno, files: { profileImage?: File, documento?: File }) => {
        try {
            const finalData = { ...updatedAlunoData };

            if (files.profileImage) {
                const profileImageUrl = await handleFileUpload(files.profileImage, 'profile');
                finalData.imgUrl = profileImageUrl;
            }
            if (files.documento) {
                const documentoUrl = await handleFileUpload(files.documento, 'documento');
                finalData.rgImageUrl = documentoUrl;
            }

            const response = await fetch(`${API_BASE_URL}/alunos/${finalData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalData),
            });

            if (!response.ok) {
                throw new Error('Falha ao atualizar o aluno.');
            }

            const savedAluno = await response.json();
            setAlunos(alunos.map(a => a.id === savedAluno.id ? savedAluno : a));
            setAlunoToEdit(null);
        } catch (error) {
            console.error("Erro ao salvar o aluno:", error);
        }
    };

    const handleConfirmDelete = async () => {
        if (alunoToDelete) {
            try {
                const response = await fetch(`${API_BASE_URL}/alunos/${alunoToDelete.id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Falha ao excluir o aluno.');
                }
                
                setAlunos(alunos.filter(a => a.id !== alunoToDelete.id));
                setAlunoToDelete(null);
            } catch (error) {
                console.error("Erro ao excluir o aluno:", error);
            }
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-full"><LoadingSpinner/></div>;
    if (error) return <div className="flex justify-center items-center h-full text-red-600"><p>{error}</p></div>;

    return (
        <div>
            <FilterBar searchTerm={searchTerm} onSearchChange={setSearchTerm} onOpenModal={handleOpenFilterModal} />
            <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} filters={tempFilters} setFilters={setTempFilters} onApply={handleApplyFilters} onClear={handleClearFilters} modalidades={modalidadesUnicas} turnos={turnosUnicos} />
            
            {selectedAluno && <AlunoDetailModal aluno={selectedAluno} onClose={() => setSelectedAluno(null)} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} />}
            {alunoToEdit && <EditAlunoModal aluno={alunoToEdit} onClose={() => setAlunoToEdit(null)} onSave={handleSaveAluno} />}
            {alunoToDelete && <DeleteConfirmationModal onConfirm={handleConfirmDelete} onCancel={() => setAlunoToDelete(null)} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAlunos.length > 0 ? (
                    filteredAlunos.map((aluno) => <AlunoCard key={aluno.id} aluno={aluno} onClick={() => setSelectedAluno(aluno)} />)
                ) : (
                    <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-sm"><UserIcon /><h3 className="mt-4 text-lg font-semibold text-slate-800">Nenhum aluno encontrado</h3><p className="text-slate-500 mt-1">Tente ajustar os filtros ou o termo de busca.</p></div>
                )}
            </div>
        </div>
    );
};
