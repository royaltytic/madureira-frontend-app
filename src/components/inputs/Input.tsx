import { twMerge } from "tailwind-merge";
import { InputType } from "../../enum/input-type";
import InputMask from "react-input-mask";
import { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import arquivo from "../cadastro/assets/archive.png";
import { useState } from "react";
import { PopUpImage } from "../popup/PopUpImage";

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

  const getMask = (type: string) => {
    switch (type) {
      case InputType.CPF:
        return "999.999.999-99";
      case InputType.Phone:
        return "(99) 99999-9999";
      default:
        return null;
    }
  };

  const mask = getMask(type);

  const localOptions = [
    "Açudinho",
    "Cachoeira do Catolé",
    "Cachoeira do cumbe",
    "Cachoeira do Salobro",
    "Cachoeira do Sebo/Barragem",
    "Cachoeira dos Alves",
    "Gameleira",
    "Lagoa do Sapo",
    "Lagoa dos Cavalos",
    "Lameiro",
    "Manteiga",
    "Mocós",
    "Monjolo",
    "Pau Santo",
    "Pitombeira",
    "Poças de Baixo",
    "Poças de cima",
    "Quatis",
    "Queimados",
    "Quatro contas",
    "Serrote",
    "Sítio Campestre",
    "Sítio Folha Larga",
    "Sítio Novo",
    "Tanque Verde",
    "Taquaris",
    "Terra Nova",
    "Varzea da Passira"
  ];

  // Mostra o ícone de arquivo somente se o nome for um dos permitidos
  const showFileIcon = ["rg", "caf", "car", "rgp"].includes(String(name).toLowerCase());

  const openPopUp = () => {
    setIsPopUpVisible(true);
  };

  const closePopUp = () => {
    setIsPopUpVisible(false);
  };

  const handleImageUpload = (file: File) => {
    setUploadedFileName(file.name);
    if (onFileUpload) onFileUpload(file);
    closePopUp();
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="px-2 text-lg text-black font-bold flex justify-between">
        {label}
        {showFileIcon && (
          <img
            src={arquivo}
            alt="Arquivo"
            className="ml-2 w-8 h-8 cursor-pointer"
            onClick={openPopUp}
          />
        )}
      </label>
      {type === InputType.Local ? (
        <select
          className={twMerge(
            "border-b lg:border-2 shadow-2xl border-black lg:rounded-lg px-4 py-2 w-full bg-transparent focus:outline-none lg:focus:border-2 focus:border-black appearance-none relative custom-select-black",
            error[name] ? "border-red-500" : ""
          )}
          {...register(name)}
        >
          <option value="">Selecione o Local</option>
          {localOptions.map((local) => (
            <option key={local} value={local}>
              {local}
            </option>
          ))}
        </select>
      ) : type === InputType.Radio && options ? (
        <div className="flex gap-4">
          {options.map((option) => (
            <label key={option} className="flex items-center ml-2">
              <input
                type="radio"
                value={option}
                className="mr-1 mb-0.5"
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
            "border-b lg:border-2 shadow-2xl border-black lg:rounded-lg px-4 py-2 w-full focus:outline-none lg:focus:border-2",
            error[name] ? "border-red-500" : "focus:border-black"
          )}
          {...register(name)}
        />
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          list={list}
          className={twMerge(
            "border-b lg:border-2 shadow-2xl border-black lg:rounded-lg px-4 py-2 w-full focus:outline-none lg:focus:border-2",
            error[name] ? "border-red-500" : "focus:border-black"
          )}
          {...register(name)}
        />
      )}
      {uploadedFileName && (
        <span className="text-sm text-green-500 font-bold ml-4">
          Arquivo enviado: {uploadedFileName}
        </span>
      )}
      {error[name] && (
        <span className="text-sm text-red-500 font-bold ml-4">
          {(error[name]?.message as string) || ""}
        </span>
      )}
      {isPopUpVisible && (
        <PopUpImage closePopup={closePopUp} handleImageUpload={handleImageUpload} />
      )}
    </div>
  );
};
