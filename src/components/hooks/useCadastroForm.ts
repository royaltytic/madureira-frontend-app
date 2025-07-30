import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import { FormPerson } from '../../types/FormPerson';
import { PersonScheme } from '../../utils/PersonScheme';
import { cadastroService } from '../../services/CadastroService';

export const useCadastroForm = () => {
  const [step, setStep] = useState(1);
  const [imageFiles, setImageFiles] = useState<{ [key: string]: File }>({});

  const formMethods = useForm<FormPerson>({
    resolver: zodResolver(PersonScheme),
    mode: 'onTouched', // Valida quando o campo perde o foco
  });

  const { handleSubmit, watch, reset, formState: { isSubmitting } } = formMethods;
  const selectedClasses = watch('classe') || [];

  const handleFileUpload = (field: string) => (file: File | null) => {
    setImageFiles(prev => {
      const newFiles = { ...prev };
      if (file) {
        newFiles[field] = file;
      } else {
        delete newFiles[field];
      }
      return newFiles;
    });
  };

  const nextStep = async () => {
    // Valida apenas os campos do passo 1 antes de avançar
    const result = await formMethods.trigger(["name", "apelido", "genero", "cpf", "rg", "phone", "associacao", "neighborhood", "referencia", "classe"]);
    if (!result) return;
    
    if (selectedClasses.length === 0) {
      toast.error("Selecione pelo menos uma classe.");
      return;
    }
    
    // Se a classe não requer o passo 2, submete diretamente
    const skipStep2 = selectedClasses.every(c => ["Outros", "Repartição Pública"].includes(c));
    if (skipStep2) {
      await handleSubmit(onSubmit)();
    } else {
      setStep(2);
    }
  };

  const prevStep = () => setStep(1);

  const onSubmit = async (data: FormPerson) => {
    const promise = cadastroService.submitForm(data, imageFiles);

    toast.promise(promise, {
      loading: 'Cadastrando usuário...',
      success: () => {
        reset();
        setStep(1);
        setImageFiles({});
        return 'Usuário cadastrado com sucesso!';
      },
      error: (err) => err.message || 'Ocorreu um erro.',
    });
  };
  
  return {
    step,
    nextStep,
    prevStep,
    formMethods,
    selectedClasses,
    handleFileUpload,
    onSubmit,
    isSubmitting,
  };
};