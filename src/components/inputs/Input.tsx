import { twMerge } from "tailwind-merge";
import { InputType } from "../../enum/input-type";
import InputMask from "react-input-mask";
import { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";
import { useEffect, useState } from "react";
import { ArchiveBoxArrowDownIcon } from '@heroicons/react/24/outline';
import { PopUpImage } from "../popup/PopUpImage";
import api from "../../services/api";

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
  const [localOptions, setLocalOptions] = useState<string[]>([]);
  const [isLocalPopupVisible, setIsLocalPopupVisible] = useState(false);
  const [newLocalValue, setNewLocalValue] = useState("");

  useEffect(() => {
    fetchLocalidades();
  }, []);

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

  const getMask = (inputType: string) => {
    switch (inputType) {
      case InputType.CPF:
        return "999.999.999-99";
      case InputType.Phone:
        return "(99) 99999-9999";
      default:
        return null;
    }
  };
  const mask = getMask(type);

  const showFileIcon = ["rg", "caf", "car", "rgp"].includes(
    String(name).toLowerCase()
  );

  const openPopUp = () => setIsPopUpVisible(true);
  const closePopUp = () => setIsPopUpVisible(false);
  const handleImageUpload = (file: File) => {
    setUploadedFileName(file.name);
    if (onFileUpload) onFileUpload(file);
    closePopUp();
  };

  const handleAddLocal = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita o comportamento padrão do form, que pode causar recarregamento da página

    if (!newLocalValue.trim()) return;
    try {
      const response = await api.post("/localidades", {
        localidade: newLocalValue,
      });

      const novaLocalidade = response.data.localidade;
      setLocalOptions((prev) => [...prev, novaLocalidade]);

      // Atualiza o campo do formulário para manter a seleção
      formOnChange({ target: { value: novaLocalidade } });

      setIsLocalPopupVisible(false);
      setNewLocalValue(""); // Reseta apenas o estado interno do input
    } catch (error) {
      console.error("Erro ao adicionar localidade:", error);
    }
  };

  const localRegister = register(name);
  const { onChange: formOnChange, ...restRegister } = localRegister;

  const handleLocalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    formOnChange(e);
    if (e.target.value === "Outros") {
      setIsLocalPopupVisible(true);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <label className="px-2 text-lg text-black font-bold flex justify-between">
        {label}
        {showFileIcon && (
          <ArchiveBoxArrowDownIcon
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
          {...restRegister}
          onChange={handleLocalChange}
        >
          <option value="">Selecione o Local</option>
          {localOptions.map((local) => (
            <option key={local} value={local}>
              {local}
            </option>
          ))}
          <option value="Outros">Outros</option>
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
        <PopUpImage
          closePopup={closePopUp}
          handleImageUpload={handleImageUpload}
        />
      )}

      {isLocalPopupVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg w-80">
            <h3 className="text-lg font-bold mb-4">
              Adicionar nova localidade
            </h3>
            <input
              type="text"
              placeholder="Digite a nova localidade"
              value={newLocalValue}
              onChange={(e) => setNewLocalValue(e.target.value)}
              className="border p-2 w-full mb-4"
            />
            <div className="flex justify-end gap-2">
            <button
                onClick={() => setIsLocalPopupVisible(false)}
                className=" text-black px-4 py-2 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddLocal}
                className="bg-gradient-to-r from-[#0E9647] to-[#165C38] text-white px-4 py-2 rounded"
              >
                Adicionar
              </button>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
