import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import {Controller} from 'react-hook-form';

import { ProfileSchema, ProfileFormData } from '../utils/ProfileSchema';
import { profileService } from '../services/profileService';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './loading/LoadingSpinner';
import { ProfileAvatar } from '../components/profile/ProfileAvatar';
import { FormField } from '../components/inputs/FormField';
import { PasswordInput } from '../components/inputs/PasswordInput';
import { StatCard } from '../components/cards/StatCard';
import { BriefcaseIcon, CheckCircleIcon, UserIcon } from '@heroicons/react/24/solid';


const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Meses são de 0 a 11
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ConfiguracaoComponent = () => {
  const { usuario, updateUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: usuario ? {
      user: usuario.user,
      email: usuario.email,
      birthDate: usuario.birthDate ? new Date(usuario.birthDate) : undefined,
    } : {},
  });

  if (!usuario) {
    return <LoadingSpinner />;
  }

  const onSubmit = async (data: ProfileFormData) => {
    const promise = profileService.update({
      userId: usuario.id, data, imageFile: selectedFile, token: usuario.token,
    });
    toast.promise(promise, {
      loading: 'Salvando alterações...',
      success: (updatedUser) => {
        updateUser(updatedUser);
        return 'Perfil atualizado com sucesso!';
      },
      error: (err) => err.message,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Configurações da Conta</h1>
        <p className="text-slate-500 mt-1">Gerencie suas informações de perfil, segurança e veja suas estatísticas.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: FORMULÁRIO DE EDIÇÃO */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit(onSubmit)}>
            <fieldset disabled={isSubmitting} className="space-y-8">
              {/* Seção de Perfil */}
              <section>
                <h3 className="text-xl font-semibold text-slate-900 mb-6">Informações Pessoais</h3>
                <div className="space-y-6">
                  <ProfileAvatar initialImageUrl={usuario.imgUrl} onFileSelect={setSelectedFile} />
                  <FormField<ProfileFormData> type="text" name="user" label="Nome de Usuário" register={register} error={errors.user}/>
                  <FormField<ProfileFormData> type="email" name="email" label="Endereço de E-mail" register={register} error={errors.email}/>
                  <div>
                  <label htmlFor="birthDate" className="block text-sm font-semibold text-slate-700 mb-1">
                    Data de Nascimento
                  </label>
                  <Controller
                    name="birthDate"
                    control={control}
                    render={({ field }) => (
                      <input
                        id="birthDate"
                        type="date"
                        className={`w-full border p-3 rounded-lg bg-slate-50 border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none transition ${errors.birthDate ? 'border-red-500' : ''}`}
                        // 'field.value' é o objeto Date do estado do form. Nós o formatamos para o input.
                        value={formatDateForInput(field.value as Date | undefined)}
                        // Quando o input muda, convertemos a string de volta para Date para o estado do form.
                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                      />
                    )}
                  />
                  {errors.birthDate && <p className="text-red-600 text-xs mt-1">{errors.birthDate.message}</p>}
                </div>
                </div>
              </section>

              {/* Seção de Segurança */}
              <section>
                <h3 className="text-xl font-semibold text-slate-900 border-t border-slate-200 pt-8 mb-6">Segurança</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <PasswordInput<ProfileFormData> name="password" label="Nova Senha" register={register} error={errors.password}/>
                  <PasswordInput<ProfileFormData> name="confirmPassword" label="Confirmar Senha" register={register} error={errors.confirmPassword}/>
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-indigo-600 font-semibold text-white text-sm rounded-lg shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center">
                  {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </fieldset>
          </form>
        </div>

        {/* COLUNA DIREITA: INFORMAÇÕES E ESTATÍSTICAS */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Cargo</h3>
            <div className="flex items-center gap-3 bg-indigo-50 text-indigo-800 p-3 rounded-lg">
              <UserIcon className="h-6 w-6" />
              <span className="font-bold capitalize">{usuario.tipo}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Seu cargo define suas permissões no sistema e não pode ser alterado aqui.</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 space-y-4">
             <h3 className="text-lg font-semibold text-slate-900 mb-4">Estatísticas</h3>
             <StatCard icon={BriefcaseIcon} label="Total de Pedidos" value={usuario.orders?.length || 0} color="bg-sky-500" />
             <StatCard icon={CheckCircleIcon} label="Pedidos Entregues" value={usuario.ordersEntregues?.length || 0} color="bg-green-500" />
          </div>
        </aside>
        
      </div>
    </div>
  );
};