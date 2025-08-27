import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UsersGroupIcon, LogoutIcon, CloseIcon, MenuIcon, SettingsIcon } from '../shared/Icons';

import { DashboardIcon } from '../shared/Icons';

export const DashboardLayout: React.FC<{ children: React.ReactNode; pageTitle: string; activePage: string; setActivePage: (page: string) => void; breadcrumb?: { label: string; onClick: () => void } }> = ({ children, pageTitle, activePage, setActivePage, breadcrumb }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => { logout(); navigate('/login'); };

    const NavLink: React.FC<{ pageName: string; icon: React.ReactNode; }> = ({ pageName, icon }) => {
        const isActive = activePage === pageName.toLowerCase();
        return (
            <a href="#" onClick={(e) => { e.preventDefault(); setActivePage(pageName.toLowerCase()); setIsSidebarOpen(false); }}
                className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${isActive ? 'text-white bg-indigo-600 shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}>
                {icon}
                {pageName}
            </a>
        );
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
            {isSidebarOpen && (<div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>)}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
                    <h1 className="text-xl font-bold text-indigo-600">Escolinha App</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-500 hover:text-slate-800"><CloseIcon /></button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <NavLink pageName="Dashboard" icon={<DashboardIcon className="w-5 h-5 mr-3" />} />
                    <NavLink pageName="Alunos" icon={<UsersGroupIcon className="w-5 h-5 mr-3" />} />
                    {/* <NavLink pageName="Professores" icon={<BriefcaseIcon className="w-5 h-5 mr-3" />} /> */}
                </nav>
                <div className="px-4 py-4 border-t border-slate-200">
                    <NavLink pageName="Perfil" icon={<SettingsIcon className="w-5 h-5 mr-3" />} />
                    <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 bg-slate-50 text-slate-600 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-sm">
                        <LogoutIcon className="w-4 h-4 mr-3" />Sair
                    </button>
                </div>
            </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
                    <div className="flex items-center">
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden mr-4 text-slate-600 hover:text-slate-900"><MenuIcon /></button>
                        <div>
                            {breadcrumb && (
                                <button onClick={breadcrumb.onClick} className="text-sm font-semibold text-indigo-600 hover:underline">
                                    {breadcrumb.label}
                                </button>
                            )}
                            <h2 className="text-xl font-bold text-slate-800">{pageTitle}</h2>
                        </div>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
};