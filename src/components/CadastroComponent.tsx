import { AxiosError } from "axios";
import { useForm, UseFormReturn, Path, UseFormRegister } from "react-hook-form";
import { FormPerson } from "../types/FormPerson";
import { PersonScheme } from "../utils/PersonScheme";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./inputs/Input"; // Assumindo que seu Input foi adaptado
import { InputType } from "../enum/input-type";
import api from "../services/api";
import Alert from "./alerts/alertDesktop"; // Assumindo que seu Alert foi adaptado
import { useState, ComponentProps } from "react";
import { useAuth } from "../context/AuthContext";
import { ChevronRight, ArrowLeft, Check, X, UserPlus, Loader2, FileText, User, MapPin } from 'lucide-react'; // Ícones modernos

// --- Componentes de UI Reutilizáveis e Aprimorados ---

// Indicador de Passos (Stepper)
const Stepper = ({ currentStep }: { currentStep: number }) => {
    const steps = ["Informações", "Detalhes"];
    return (
        <div className="flex items-center justify-center w-full mb-12">
            {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = currentStep > stepNumber;
                const isActive = currentStep === stepNumber;
                return (
                    <div key={step} className="flex items-center">
                        <div className="flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                                    isCompleted ? 'bg-indigo-600 text-white' : isActive ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-600' : 'bg-gray-200 text-gray-500'
                                }`}
                            >
                                {isCompleted ? <Check size={24} /> : stepNumber}
                            </div>
                            <p className={`mt-2 text-sm font-semibold ${isActive || isCompleted ? 'text-indigo-600' : 'text-gray-500'}`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-auto border-t-2 transition-all duration-300 mx-4 ${isCompleted ? 'border-indigo-600' : 'border-gray-200'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};


// Wrapper para seções do formulário
const FormSection = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-100 transition-all duration-300 ease-in-out">
    <div className="flex items-center gap-4 border-b border-gray-200 pb-4 mb-8">
        {icon}
        <h2 className="text-xl font-bold text-gray-800">
          {title}
        </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
      {children}
    </div>
  </div>
);

// Botão moderno com estado de loading
const ModernButton = ({ children, className, isLoading, ...props }: ComponentProps<'button'> & { isLoading?: boolean }) => (
  <button
    disabled={isLoading}
    className={`w-full flex items-center justify-center gap-3 text-lg font-semibold text-white py-3 px-6 rounded-lg shadow-md transition-all transform hover:scale-105 focus:outline-none focus:ring-4 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 ${className}`}
    {...props}
  >
    {isLoading && <Loader2 className="animate-spin" size={24} />}
    {children}
  </button>
);

// Checkbox customizado
const CustomCheckbox = ({ label, register, name, value }: { label: string; register: UseFormRegister<FormPerson>; name: Path<FormPerson>; value: string }) => (
    <label className="flex items-center gap-3 cursor-pointer text-gray-700 hover:text-indigo-600 transition-colors group">
        <input type="checkbox" value={value} {...register(name)} className="peer hidden" />
        <span className="w-6 h-6 border-2 border-gray-300 rounded-md flex items-center justify-center transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600 group-hover:border-indigo-400">
            <Check className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </span>
        {label}
    </label>
);


// --- Componentes dos Passos do Formulário ---

interface StepProps {
    form: UseFormReturn<FormPerson>;
    onFileUpload: (field: string) => (file: File) => void;
    isLoading: boolean;
}

const CadastroStep1 = ({ form, onFileUpload, onNext, onCancel, isLoading }: StepProps & { onNext: () => void; onCancel: () => void; }) => {
    const { register, formState: { errors } } = form;

    return (
        <div className="space-y-8">
            <FormSection title="Informações Pessoais" icon={<User className="text-indigo-500" size={28}/>}>
                <Input type={InputType.Text} placeholder="Nome completo do usuário" label="Nome Completo" error={errors} register={register} name="name"  />
                <Input type={InputType.Text} placeholder="Como é conhecido" label="Apelido" error={errors} register={register} name="apelido" />
                <Input type={InputType.CPF} label="CPF" error={errors} register={register} name="cpf" placeholder="000.000.000-00" />
                <Input type={InputType.Text} placeholder="Número do RG" label="RG" error={errors} register={register} name="rg" onFileUpload={onFileUpload("rg")} />
                 <div className="flex flex-col">
                  <label htmlFor="genero" className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                  <select id="genero" {...register("genero")} className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition">
                    <option value="">Selecione...</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                  </select>
                  {errors.genero && <p className="text-red-500 text-xs mt-1">{errors.genero.message}</p>}
                </div>
            </FormSection>

            <FormSection title="Contato e Localização" icon={<MapPin className="text-indigo-500" size={28}/>}>
                <Input type={InputType.Phone} label="Telefone / WhatsApp" error={errors} register={register} name="phone" placeholder="(00) 00000-0000" />
                <Input type={InputType.Text} label="Associação" error={errors} register={register} name="associacao" placeholder="Nome da associação" />
                <Input type={InputType.Local} label="Localidade" error={errors} register={register} name="neighborhood" />
                <Input type={InputType.Text} placeholder="Ponto de referência" label="Referência" error={errors} register={register} name="referencia" />
            </FormSection>
            
            <FormSection title="Classe Profissional" icon={<FileText className="text-indigo-500" size={28}/>}>
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6">
                    <CustomCheckbox label="Agricultor/a" register={register} name="classe" value="Agricultor" />
                    <CustomCheckbox label="Pescador/a" register={register} name="classe" value="Pescador" />
                    <CustomCheckbox label="Feirante" register={register} name="classe" value="Feirante" />
                    <CustomCheckbox label="Pecuarista" register={register} name="classe" value="Pecuarista" />
                    <CustomCheckbox label="Repartição Pública" register={register} name="classe" value="Repartição Pública" />
                    <CustomCheckbox label="Outros" register={register} name="classe" value="Outros" />
                </div>
                 {errors.classe && <p className="text-red-500 text-sm mt-4 lg:col-span-3">{errors.classe.message}</p>}
            </FormSection>

            <div className="flex justify-end items-center gap-6 pt-4">
                <ModernButton type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 focus:ring-gray-500">
                    <X size={20} /> Cancelar
                </ModernButton>
                <ModernButton type="button" onClick={onNext} isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500">
                    Avançar <ChevronRight size={20} />
                </ModernButton>
            </div>
        </div>
    );
};

const CadastroStep2 = ({ form, onFileUpload, onBack, isLoading }: StepProps & { onBack: () => void; }) => {
    const { register, formState: { errors }, watch } = form;
    const selectedClasses = watch("classe") || [];
    
    const renderConditionalInput = (optionName: Path<FormPerson>, inputName: Path<FormPerson>, placeholder: string) => {
        const optionValue = watch(optionName);
        if (optionValue === "Sim") {
            return (
                <div className="mt-2">
                    <Input type={InputType.Text} label="" error={errors} register={register} name={inputName} placeholder={placeholder} />
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {selectedClasses.includes("Feirante") && (
                <FormSection title="Informações de Feirante" icon={<FileText className="text-indigo-500" size={28}/>}>
                    <Input type={InputType.Number} label="Quanto paga de imposto?" error={errors} register={register} name="imposto" placeholder="R$ 0,00" />
                    <Input type={InputType.Text} label="Qual área utiliza para vender?" error={errors} register={register} name="area" />
                    <Input type={InputType.Text} label="Quanto tempo é feirante?" error={errors} register={register} name="tempo" />
                    <div className="lg:col-span-3"><Input type={InputType.Text} label="O que você vende?" error={errors} register={register} name="produtos" placeholder="Ex: Bovinos, Suíno, Frutas" /></div>
                    <div className="lg:col-span-3"><Input type={InputType.Radio} label="Tem carro de mão vendendo?" error={errors} register={register} name="carroDeMao" options={["Sim", "Não"]} /></div>
                </FormSection>
            )}

            {(selectedClasses.includes("Agricultor") || selectedClasses.includes("Pescador") || selectedClasses.includes("Pecuarista")) && (
                <>
                    <FormSection title="Documentos Adicionais" icon={<FileText className="text-indigo-500" size={28}/>}>
                        <Input type={InputType.Text} label="RGP" error={errors} register={register} name="rgp" onFileUpload={onFileUpload("rgp")} />
                        <Input type={InputType.Text} label="GTA" error={errors} register={register} name="gta" />
                        <Input type={InputType.Text} label="CAF" error={errors} register={register} name="caf" onFileUpload={onFileUpload("caf")} />
                        <Input type={InputType.Text} label="CAR" error={errors} register={register} name="car" onFileUpload={onFileUpload("car")} />
                    </FormSection>
                    <FormSection title="Programas e Benefícios" icon={<FileText className="text-indigo-500" size={28}/>}>
                        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                            <div>
                                <Input type={InputType.Radio} label="Possui CAD ADAGRO?" error={errors} register={register} name="adagroOption" options={["Sim", "Não"]} />
                                {renderConditionalInput("adagroOption", "adagro", "Ano")}
                            </div>
                            <div>
                                <Input type={InputType.Radio} label="Garantia Safra?" error={errors} register={register} name="garantiaSafraOption" options={["Sim", "Não"]} />
                                {renderConditionalInput("garantiaSafraOption", "garantiaSafra", "Ano")}
                            </div>
                            <div>
                                <Input type={InputType.Radio} label="Chapéu de Palha?" error={errors} register={register} name="chapeuPalhaOption" options={["Sim", "Não"]} />
                                {renderConditionalInput("chapeuPalhaOption", "chapeuPalha", "Ano")}
                            </div>
                            <div>
                                <Input type={InputType.Radio} label="PAA?" error={errors} register={register} name="paaOption" options={["Sim", "Não"]} />
                                {renderConditionalInput("paaOption", "paa", "Vinculação")}
                            </div>
                            <div>
                                <Input type={InputType.Radio} label="PNAE?" error={errors} register={register} name="pnaeOption" options={["Sim", "Não"]} />
                                {renderConditionalInput("pnaeOption", "pnae", "Vinculação")}
                            </div>
                            <div>
                                <Input type={InputType.Radio} label="SSA ÁGUA?" error={errors} register={register} name="aguaOption" options={["Sim", "Não"]} />
                                {renderConditionalInput("aguaOption", "agua", "Ano")}
                            </div>
                        </div>
                    </FormSection>
                </>
            )}

            <div className="flex justify-end items-center gap-6 pt-4">
                <ModernButton type="button" onClick={onBack} className="bg-gray-600 hover:bg-gray-700 focus:ring-gray-500">
                    <ArrowLeft size={20} /> Voltar
                </ModernButton>
                <ModernButton type="submit" isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500">
                    <UserPlus size={20} /> Cadastrar Usuário
                </ModernButton>
            </div>
        </div>
    );
};


// --- Componente Principal (Container) ---

export const CadastroComponent = () => {
    const form = useForm<FormPerson>({
        resolver: zodResolver(PersonScheme),
        mode: "onBlur"
    });
    const { handleSubmit, reset, watch, trigger } = form;
    
    const { usuario } = useAuth();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertType, setAlertType] = useState<"alerta" | "error" | "info" | "sucesso">("info");
    const [alertText, setAlertText] = useState("");
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [imageFiles, setImageFiles] = useState<{ [key: string]: File }>({});

    const selectedClasses = watch("classe") || [];

    const showAlert = (type: "alerta" | "error" | "info" | "sucesso", text: string) => {
        setAlertType(type);
        setAlertText(text);
        setAlertVisible(true);
    };

    const closeAlert = () => setAlertVisible(false);

    const cancelar = () => {
        reset();
        setStep(1);
        setImageFiles({});
    };

    const handleFileUploadForField = (field: string) => (file: File) => {
        setImageFiles((prev) => ({ ...prev, [field]: file }));
    };

    const nextStep = async () => {
        setIsLoading(true);
        const isValid = await trigger(["name", "apelido", "genero", "cpf", "rg", "phone", "associacao", "neighborhood", "referencia", "classe"]);
        setIsLoading(false);

        if (!isValid) {
            showAlert("alerta", "Por favor, corrija os erros destacados antes de avançar.");
            return;
        }
        if (selectedClasses.length === 0) {
            showAlert("alerta", "Selecione pelo menos uma classe profissional.");
            return;
        }
        
        const shouldSubmitDirectly = selectedClasses.includes("Outros") || selectedClasses.includes("Repartição Pública");

        if (shouldSubmitDirectly) {
            handleSubmit(onSubmit)();
        } else {
            setStep(2);
        }
    };

    const voltar = () => setStep(1);

    const onSubmit = async (data: FormPerson) => {
        setIsLoading(true);
        const { adagroOption, garantiaSafraOption, chapeuPalhaOption, paaOption, pnaeOption, aguaOption, ...rest } = data;
        const payload = {
            ...rest,
            adagro: adagroOption === "Sim" ? adagroOption : null,
            garantiaSafra: garantiaSafraOption === "Sim" ? data.garantiaSafra : null,
            chapeuDePalha: chapeuPalhaOption === "Sim" ? data.chapeuPalha : null,
            paa: paaOption === "Sim" ? data.paa : null,
            pnae: pnaeOption === "Sim" ? data.pnae : null,
            agua: aguaOption === "Sim" ? aguaOption : null,
            usuarioId: usuario?.id || '',
        };

        try {
            const response = await api.post("/users", payload);
            if (response.status === 201) {
                const userId = response.data.id;
                // Upload de arquivos em paralelo para melhor performance
                const uploadPromises = Object.entries(imageFiles).map(([field, file]) => {
                    const formData = new FormData();
                    formData.append("file", file);
                    return api.post(`/upload/user/${userId}?type=${field}`, formData, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                });
                await Promise.all(uploadPromises);

                showAlert("sucesso", "Usuário cadastrado com sucesso!");
                cancelar();
            } else {
                showAlert("error", `Erro ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            const axiosError = error as AxiosError<{ message: string }>;
            const errorMessage = axiosError.response?.data?.message || "Ocorreu um erro desconhecido.";
            showAlert("error", `Erro ao cadastrar: ${errorMessage}`);
            console.error("Erro no cadastro:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen w-full p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Ficha de Cadastro
                    </h1>
                    <p className="mt-2 text-lg text-gray-600">
                        Preencha as informações abaixo para criar um novo registro.
                    </p>
                </div>

                <Stepper currentStep={step} />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {step === 1 && (
                        <CadastroStep1
                            form={form}
                            onFileUpload={handleFileUploadForField}
                            onNext={nextStep}
                            onCancel={cancelar}
                            isLoading={isLoading}
                        />
                    )}
                    {step === 2 && (
                        <CadastroStep2
                            form={form}
                            onFileUpload={handleFileUploadForField}
                            onBack={voltar}
                            isLoading={isLoading}
                        />
                    )}
                </form>
            </div>
            {alertVisible && <Alert type={alertType} text={alertText} onClose={closeAlert} />}
        </div>
    );
};
