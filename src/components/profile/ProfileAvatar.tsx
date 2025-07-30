// src/components/profile/ProfileAvatar.tsx

import React, { useState, useEffect } from 'react';
import { PhotoIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface ProfileAvatarProps {
  initialImageUrl?: string;
  onFileSelect: (file: File | null) => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ initialImageUrl, onFileSelect }) => {
  // Estado para o arquivo selecionado
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Estado para a URL de preview (pode ser a inicial ou a do arquivo novo)
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);

  // EFEITO 1: Sincronizar com a imagem inicial que vem das props.
  // Se o usuário salvar e a URL inicial mudar, o avatar será atualizado.
  useEffect(() => {
    // Só atualiza se não houver um arquivo selecionado localmente.
    if (!selectedFile) {
      setPreviewUrl(initialImageUrl || null);
    }
  }, [initialImageUrl, selectedFile]);

  // EFEITO 2: Gerenciamento de memória para o Object URL.
  // Este é um passo profissional importante para evitar memory leaks.
  useEffect(() => {
    if (!selectedFile) {
      return;
    }
    // Cria uma URL temporária para o arquivo selecionado
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Função de limpeza: revoga a URL quando o componente é desmontado
    // ou quando o arquivo selecionado muda, liberando a memória.
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    onFileSelect(null);
    // Limpa o valor do input de arquivo para permitir que o mesmo arquivo seja selecionado novamente.
    const fileInput = document.getElementById('avatar-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="flex items-center gap-5 w-full">
      {/* Imagem do Avatar */}
      <div className="relative flex-shrink-0 w-20 h-20">
        <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-sm">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <PhotoIcon className="w-10 h-10 text-slate-400" />
          )}
        </div>
      </div>

      {/* Controles e Feedback */}
      <div className="flex-grow">
        {selectedFile ? (
          // View quando um arquivo está selecionado
          <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg">
            <span className="text-sm text-slate-700 truncate pr-2">{selectedFile.name}</span>
            <button
              type="button"
              onClick={handleRemoveFile}
              title="Remover imagem"
              className="flex-shrink-0 text-slate-500 hover:text-red-600 transition-colors"
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        ) : (
          // View padrão para upload
          <div>
            <label
              htmlFor="avatar-file-input"
              className="cursor-pointer px-4 py-2 bg-white border border-slate-300 text-sm font-semibold text-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              Alterar foto
            </label>
            <p className="text-xs text-slate-500 mt-2">PNG, JPG, GIF até 5MB.</p>
          </div>
        )}
        <input
          id="avatar-file-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};