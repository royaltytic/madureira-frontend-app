import { AxiosError } from "axios";
import { useForm, UseFormReturn, Path, UseFormRegister } from "react-hook-form";
import { FormPerson } from "../types/FormPerson";
import { PersonScheme } from "../utils/PersonScheme";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./inputs/Input";
import { InputType } from "../enum/input-type";
import api from "../services/api";
import Alert from "./alerts/alertDesktop";
import { useState, ComponentProps } from "react";
import { useAuth } from "../context/AuthContext";
import { ChevronRight, ArrowLeft, Check, X, UserPlus, Loader2, FileText, User, MapPin, Download } from 'lucide-react'; // Ícones modernos
import jsPDF from 'jspdf'; // Importa a biblioteca jsPDF
import 'jspdf-autotable'; // Para tabelas e layouts mais avançados (opcional, mas útil)


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

const CadastroStep1 = ({ form, onFileUpload, onNext, onCancel, isLoading, onDownloadPDF, selectedClasses }: StepProps & { onNext: () => void; onCancel: () => void; onDownloadPDF: () => void; selectedClasses: string[] }) => {
    const { register, formState: { errors } } = form;
    const shouldShowFinalButtons = selectedClasses.length > 0 && selectedClasses.every(c => ["Outros", "Repartição Pública"].includes(c));

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

            <div className="flex justify-end items-center gap-4 pt-6 border-t border-gray-200">
                <ModernButton type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 focus:ring-gray-500">
                    <X size={20} /> Cancelar
                </ModernButton>

                {shouldShowFinalButtons && (
                    <ModernButton type="button" onClick={onDownloadPDF} className="bg-green-600 hover:bg-green-700 focus:ring-green-500">
                        <Download size={20} /> Baixar PDF
                    </ModernButton>
                )}

                <ModernButton type="button" onClick={onNext} isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500">
                    {shouldShowFinalButtons ? (
                        <><UserPlus size={20} /> Cadastrar</>
                    ) : (
                        <>Avançar <ChevronRight size={20} /></>
                    )}
                </ModernButton>
            </div>
        </div>
    );
};

const CadastroStep2 = ({ form, onFileUpload, onBack, isLoading, onDownloadPDF }: StepProps & { onBack: () => void; onDownloadPDF: () => void; }) => {
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <ModernButton type="button" onClick={onBack} className="bg-gray-600 hover:bg-gray-700 focus:ring-gray-500 md:col-span-1">
                    <ArrowLeft size={20} /> Voltar
                </ModernButton>
                <ModernButton type="button" onClick={onDownloadPDF} className="bg-green-600 hover:bg-green-700 focus:ring-green-500 md:col-span-1">
                    <Download size={20} /> Baixar PDF
                </ModernButton>
                <ModernButton type="submit" isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 md:col-span-1">
                    <UserPlus size={20} /> Cadastrar
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
    const { handleSubmit, reset, watch, trigger, getValues } = form;
    
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
        
        const shouldSubmitDirectly = selectedClasses.length > 0 && selectedClasses.every(c => ["Outros", "Repartição Pública"].includes(c));

        if (shouldSubmitDirectly) {
            handleSubmit(onSubmit)();
        } else {
            setStep(2);
        }
    };

    const voltar = () => setStep(1);

    const handleDownloadPDF = () => {
        const data = getValues();
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let y = 0;
    
        // --- Cabeçalho do PDF ---
        doc.setFillColor(76, 81, 191); // Cor índigo
        doc.rect(0, 0, pageWidth, 25, 'F');
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text("Ficha de Cadastro", pageWidth / 2, 16, { align: 'center' });
        y = 35;
    
        // --- Função Auxiliar para Seções ---
        const addSection = (title: string, content: { label: string; value?: string | number | readonly string[] | null }[]) => {
            if (y > pageHeight - 40) { // Adiciona nova página se necessário
                doc.addPage();
                y = 20;
            }
            doc.setFontSize(15);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(67, 56, 202); // Cor índigo mais escura para títulos de seção
            doc.text(title, 14, y);
            doc.setDrawColor(209, 213, 219); // Cinza para a linha
            doc.line(14, y + 2, pageWidth - 14, y + 2);
            y += 12;
    
            content.forEach(item => {
                if (item.value && item.value.toString().trim() !== "") {
                    if (y > pageHeight - 20) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.setFontSize(11);
                    doc.setTextColor(31, 41, 55); // Cinza escuro para o texto
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${item.label}:`, 16, y);
                    
                    doc.setFont('helvetica', 'normal');
                    const valueX = 16 + doc.getTextWidth(`${item.label}: `) + 2;
                    const valueLines = doc.splitTextToSize(item.value.toString(), pageWidth - valueX - 16);
                    doc.text(valueLines, valueX, y);
                    y += (valueLines.length * 5) + 3;
                }
            });
            y += 5;
        };
    
        // --- Adicionando Conteúdo ao PDF ---
        addSection("Informações Pessoais", [
            { label: "Nome Completo", value: data.name },
            { label: "Apelido", value: data.apelido },
            { label: "CPF", value: data.cpf },
            { label: "RG", value: data.rg },
            { label: "Gênero", value: data.genero },
        ]);
    
        addSection("Contato e Localização", [
            { label: "Telefone", value: data.phone },
            { label: "Associação", value: data.associacao },
            { label: "Localidade", value: data.neighborhood },
            { label: "Referência", value: data.referencia },
        ]);
    
        addSection("Classe Profissional", [
            { label: "Classes", value: data.classe?.join(', ') },
        ]);
    
        if (data.classe?.includes("Feirante")) {
            addSection("Informações de Feirante", [
                { label: "Imposto", value: data.imposto ? `R$ ${data.imposto}` : 'Não informado' },
                { label: "Área de Venda", value: data.area },
                { label: "Tempo como Feirante", value: data.tempo },
                { label: "Produtos", value: data.produtos },
                { label: "Usa Carrinho de Mão", value: data.carroDeMao },
            ]);
        }
        
        if (data.classe?.some(c => ["Agricultor", "Pescador", "Pecuarista"].includes(c))) {
             addSection("Documentos Adicionais", [
                { label: "RGP", value: data.rgp }, { label: "GTA", value: data.gta },
                { label: "CAF", value: data.caf }, { label: "CAR", value: data.car },
            ]);
            
            addSection("Programas e Benefícios", [
                 { label: "CAD ADAGRO", value: data.adagroOption === "Sim" ? `Sim (${data.adagro || 'N/A'})` : "Não" },
                 { label: "Garantia Safra", value: data.garantiaSafraOption === "Sim" ? `Sim (${data.garantiaSafra || 'N/A'})` : "Não" },
                 { label: "Chapéu de Palha", value: data.chapeuPalhaOption === "Sim" ? `Sim (${data.chapeuPalha || 'N/A'})` : "Não" },
                 { label: "PAA", value: data.paaOption === "Sim" ? `Sim (${data.paa || 'N/A'})` : "Não" },
                 { label: "PNAE", value: data.pnaeOption === "Sim" ? `Sim (${data.pnae || 'N/A'})` : "Não" },
                 { label: "SSA ÁGUA", value: data.aguaOption === "Sim" ? `Sim (${data.agua || 'N/A'})` : "Não" },
            ]);
        }
    
        // --- Área da Assinatura ---
        y = y > pageHeight - 50 ? (doc.addPage(), 40) : y + 20;
        const signatureX = pageWidth / 2;
        doc.setDrawColor(107, 114, 128);
        doc.line(signatureX - 50, y, signatureX + 50, y);
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(data.name || "Assinatura do Usuário", signatureX, y + 7, { align: 'center' });
    
        // --- Rodapé ---
        const pageCount = doc.internal.pages[0];
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(156, 163, 175);
            const today = new Date().toLocaleDateString('pt-BR');
            doc.text(`Documento gerado em ${today}`, 14, pageHeight - 10);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
        }
    
        doc.save(`ficha_cadastro_${data.name?.replace(/\s+/g, '_').toLowerCase() || 'usuario'}.pdf`);
    };

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
                            onDownloadPDF={handleDownloadPDF}
                            selectedClasses={selectedClasses}
                        />
                    )}
                    {step === 2 && (
                        <CadastroStep2
                            form={form}
                            onFileUpload={handleFileUploadForField}
                            onBack={voltar}
                            isLoading={isLoading}
                            onDownloadPDF={handleDownloadPDF}
                        />
                    )}
                </form>
            </div>
            {alertVisible && <Alert type={alertType} text={alertText} onClose={closeAlert} />}
        </div>
    );
};
