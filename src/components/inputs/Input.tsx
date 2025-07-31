import { twMerge } from "tailwind-merge";
import { InputType } from "../../enum/input-type";
import InputMask from "react-input-mask";
import { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { useEffect, useState } from "react";
import { ArrowUpTrayIcon, BuildingLibraryIcon, DevicePhoneMobileIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { PopUpImage } from "../popup/PopUpImage";
import api from "../../services/api";

// Enum para os tipos de input (simulando o que viria de "../../enum/input-type")


// Props do componente
interface InputProps<T extends FieldValues> {
  type: InputType;
  placeholder?: string;
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  error: FieldErrors<T>;
  ref?: React.Ref<HTMLInputElement>;
  options?: string[];
  multiple?: boolean;
  list?: string;
  /** Se fornecida, será chamada quando um arquivo for enviado via pop‑up */
  onFileUpload?: (file: File) => void;
}

// Componente principal
export const Input = <T extends FieldValues>({
  type,
  placeholder,
  label,
  register,
  error,
  name,
  options,
  list,
  onFileUpload,
}: InputProps<T>) => {
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [localOptions, setLocalOptions] = useState<string[]>([]);
  const [isLocalPopupVisible, setIsLocalPopupVisible] = useState(false);
  const [newLocalValue, setNewLocalValue] = useState("");

  // Busca as localidades da API ao montar o componente
  useEffect(() => {
    const fetchLocalidades = async () => {
      try {
        
        const response = await api.get("/localidades");
        const locais = response.data.map(
          (item: { id: number; localidade: string }) => item.localidade
        );
        
        setLocalOptions(locais);
      } catch (error) {
        console.error("Erro ao buscar localidades:", error);
      }
    };
    fetchLocalidades();
  }, []);

  // Define a máscara com base no tipo de input
  const getMask = (inputType: string) => {
    switch (inputType) {
      case InputType.CPF:
        return "999.999.999-99";
      case InputType.Phone:
        return "(99) 99999-9999";
      default:
        return "";
    }
  };
  const mask = getMask(type);

  // Verifica se o ícone de upload de arquivo deve ser exibido
  const showFileIcon = ["rg", "caf", "car", "rgp"].includes(
    String(name).toLowerCase()
  );

  // Funções para controlar o pop-up de upload
  const openPopUp = () => setIsPopUpVisible(true);
  const closePopUp = () => setIsPopUpVisible(false);
  const handleImageUpload = (file: File) => {
    setUploadedFileName(file.name);
    if (onFileUpload) onFileUpload(file);
    closePopUp();
  };

  // Função para adicionar uma nova localidade
  const handleAddLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocalValue.trim()) return;
    try {
      // Simulação de chamada de API
      const response = await api.post("/localidades", {
        localidade: newLocalValue,
      });
      const novaLocalidade = response.data.localidade;
      
      setLocalOptions((prev) => [...prev, novaLocalidade]);
      formOnChange({ target: { value: novaLocalidade } });
      setIsLocalPopupVisible(false);
      setNewLocalValue("");
    } catch (error) {
      console.error("Erro ao adicionar localidade:", error);
    }
  };

  // Registra o campo no React Hook Form
  const localRegister = register(name);
  const { onChange: formOnChange, ...restRegister } = localRegister;

  // Controla a exibição do pop-up de "Outros"
  const handleLocalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formOnChange(e);
    if (e.target.value === "Outros") {
      setIsLocalPopupVisible(true);
    }
  };

  // Estilos base para os inputs
  const baseInputStyle = "w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition-all duration-300";
  const errorInputStyle = "border-red-500 focus:ring-red-500 focus:border-red-500";
  const inputWithIconStyle = "pl-4";

  // Ícone para cada tipo de input
  const getInputIcon = (inputType: InputType) => {
    const iconStyle = "absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500";
    switch (inputType) {
      case InputType.CPF:
        return <UserCircleIcon className={iconStyle} width={20} />;
      case InputType.Phone:
        return <DevicePhoneMobileIcon className={iconStyle} width={20} />;
      case InputType.Local:
        return <BuildingLibraryIcon className={iconStyle} width={20} />;
      default:
        return null;
    }
  }

  // Renderização do componente
  return (
    <div className="w-full flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 flex justify-between items-center">
        {label}
        {showFileIcon && (
          <button type="button" onClick={openPopUp} className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200">
            <ArrowUpTrayIcon className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </label>

      <div className="relative">
        {getInputIcon(type)}
        {type === InputType.Local ? (
          <select
            className={twMerge(
              baseInputStyle,
              inputWithIconStyle,
              error[name] ? errorInputStyle : ""
            )}
            {...restRegister}
            onChange={handleLocalChange}
          >
            <option value="">Selecione o Local</option>
            {localOptions.map((local) => (
              <option key={local} value={local}>
                {local}
              </option>
            ))}
            <option value="Outros">Outros...</option>
          </select>
        ) : type === InputType.Radio && options ? (
          <div className="flex items-center gap-4 pt-2">
            {options.map((option) => (
              <label key={option} className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  value={option}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                  {...register(name)}
                />
                {option}
              </label>
            ))}
          </div>
        ) : mask ? (
          <InputMask
            mask={mask}
            placeholder={placeholder}
            type={type}
            className={twMerge(
              baseInputStyle,
              inputWithIconStyle,
              error[name] ? errorInputStyle : ""
            )}
            {...register(name)}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            list={list}
            className={twMerge(
              baseInputStyle,
              getInputIcon(type) ? inputWithIconStyle : "",
              error[name] ? errorInputStyle : ""
            )}
            {...register(name)}
          />
        )}
      </div>

      {uploadedFileName && (
        <span className="text-xs text-green-600 font-medium ml-1">
          Arquivo enviado: {uploadedFileName}
        </span>
      )}
      {error[name] && (
        <span className="text-xs text-red-600 font-medium ml-1">
          {(error[name]?.message as string) || ""}
        </span>
      )}

      {isPopUpVisible && (
        <PopUpImage
          closePopup={closePopUp}
          handleImageUpload={handleImageUpload}
        />
      )}

      {isLocalPopupVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Adicionar nova localidade
            </h3>
            <form onSubmit={handleAddLocal}>
              <input
                type="text"
                placeholder="Digite o nome da localidade"
                value={newLocalValue}
                onChange={(e) => setNewLocalValue(e.target.value)}
                className={twMerge(baseInputStyle, "mb-4")}
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLocalPopupVisible(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Adicione estas animações no seu arquivo CSS global ou no <style> do seu componente principal
/*
@keyframes fade-in-scale {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in-scale {
  animation: fade-in-scale 0.3s ease-out forwards;
}
*/
