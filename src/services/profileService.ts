// src/services/profileService.ts
import api from './api';
import { ProfileFormData } from '../utils/ProfileSchema';
import { isAxiosError } from 'axios';

interface UpdateProfileArgs {
  userId: string;
  data: ProfileFormData;
  imageFile?: File | null;
  token: string;
}

export const profileService = {
  update: async ({ userId, data, imageFile, token }: UpdateProfileArgs) => {
    try {
    // 1. Atualiza os dados do usuário (user, email, password)
    const dataToUpdate = {
      user: data.user,
      email: data.email,
      // Só envia a senha se ela foi preenchida
      ...(data.password && { password: data.password }),
    };

    await api.put(`/employee/${userId}`, dataToUpdate, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 2. Se houver um arquivo de imagem, faz o upload
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      await api.put(`/employee/${userId}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Recarrega os dados completos do usuário para garantir consistência
    const updatedUserResponse = await api.get(`/employee/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return updatedUserResponse.data;
  } 
  catch (error) {
    if (isAxiosError(error) && error.response) {
      // Tenta extrair uma mensagem de erro específica do backend
      throw new Error(error.response.data.message || 'Um erro inesperado ocorreu no servidor.');
    }
    // Lança um erro genérico se não for um erro da API
    throw new Error('Não foi possível conectar ao servidor. Verifique sua rede.');
  }
    },
};