import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { API_BASE_URL } from "../config/api";

export const ProfilePage = () => {

    const { user, updateUser } = useAuth();

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        password: ''
    })

    useEffect(() => {
        if (user) {
            setFormData({
                nome: user.nome || '',
                email: user.email || '',
                password: ''
            })
        }
    }, [user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const response: Response = await fetch(`${API_BASE_URL}/users/${user?.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })

        if (!response.ok) {
            toast.error('Erro ao atualizar perfil');
            return;
        } 

        updateUser(await response.json());

    }

        return (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="nome" className="text-sm font-medium text-slate-600">Nome</label>
                    <input
                        type="text"
                        id="nome"
                        name="nome" // O 'name' é crucial para o handleChange funcionar!
                        value={formData.nome}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="text-sm font-medium text-slate-600">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="text-sm font-medium text-slate-600">Nova Senha</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Deixe em branco para não alterar"
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg"
                    />
                </div>
                <div className="pt-4">
                    <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                        Salvar Alterações
                    </button>
                </div>
            </form>
        );
    }