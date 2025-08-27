import { useState, useEffect } from 'react';
import { DashboardOverview } from './DashBoardOverView';
import { AlunosPage } from './AlunosPage';
import { DashboardLayout } from '../layout/DashBoardLayout';
import { Aluno } from '../types';
import { ModalidadeDetailPage } from './ModalidadeDetailPage';
import { ProfilePage } from './ProfilePage';
// import { ProfessoresPage } from './ProfessoresPage';
import LoadingSpinner from '../components/LoadingSpinner';

import { API_BASE_URL } from '../config/api';

export const MainPage = () => {
    const [activePage, setActivePage] = useState('dashboard');
    const [selectedModalidade, setSelectedModalidade] = useState<string | null>(null);
    const [alunos, setAlunos] = useState<Aluno[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        const fetchAlunos = async () => { 
            setIsLoading(true); setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/alunos`);
                if (!response.ok) throw new Error(`Erro: ${response.status}`);
                const data: Aluno[] = await response.json();
                // Adicionando dados de gênero para teste
                const dataWithGender = data.map((aluno: Aluno, index: number) => ({
                    ...aluno,
                    genero: index % 2 === 0 ? 'Masculino' : 'Feminino'
                }));
                setAlunos(dataWithGender);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlunos();
    }, []);

    let pageTitle = activePage.charAt(0).toUpperCase() + activePage.slice(1);
    let breadcrumb;

    if (selectedModalidade) {
        pageTitle = `Detalhes de ${selectedModalidade}`;
        breadcrumb = { label: 'Dashboard', onClick: () => setSelectedModalidade(null) };
    } 


    const renderContent = () => {
        if (isLoading) return <div className="flex justify-center items-center h-full"><LoadingSpinner/></div>;
        if (error) return <div className="flex justify-center items-center h-full text-red-600"><p>{error}</p></div>;
        
        if (selectedModalidade) {
            return <ModalidadeDetailPage modalidade={selectedModalidade} alunos={alunos} />;
        }

        switch (activePage) {
            case 'dashboard':
                return <DashboardOverview alunos={alunos} onSelectModalidade={setSelectedModalidade} />;
            case 'alunos':
                return <AlunosPage />;
            // case 'professores':
            //     return <ProfessoresPage />;
            case 'modalidades':
                return <ModalidadeDetailPage modalidade={selectedModalidade || ''} alunos={alunos} />;
            case 'perfil':
                return <ProfilePage />;
            default:
                return <DashboardOverview alunos={alunos} onSelectModalidade={setSelectedModalidade} />;
        }
    };

    return (
        <DashboardLayout pageTitle={pageTitle} activePage={activePage} setActivePage={setActivePage} breadcrumb={breadcrumb}>
            {renderContent()}
        </DashboardLayout>
    );
};
