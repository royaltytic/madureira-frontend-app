import { useState } from "react";
import { useDropzone } from "react-dropzone";
import cloudimage from "./Upload cloud.png";
import { Button } from "../buttons/ButtonSimple";

interface PopUpImageProps {
  closePopup: () => void;
  handleImageUpload: (file: File) => void;
}

export const PopUpImage = ({ closePopup, handleImageUpload }: PopUpImageProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Estado para a URL da prévia

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file)); // Gera a URL para prévia
      }
    },
  });

  const submitImage = () => {
    if (selectedFile) {
      handleImageUpload(selectedFile);
      closePopup();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-[550px] rounded-xl p-6 flex flex-col items-center justify-center transform transition-transform duration-300 scale-100 opacity-100 mx-4">
        <h1 className="font-bold text-2xl mb-4">Selecione a imagem</h1>

        <div
          {...getRootProps()}
          className="w-full max-w-[438px] h-[300px] outline-dashed outline-[#165C38] outline-3 flex flex-col items-center justify-center text-blue-500 rounded-md cursor-pointer hover:bg-green-50"
        >
          <input {...getInputProps()} />
          {!selectedFile ? (
            <div className="text-center flex flex-col items-center justify-center">
              <div className="text mb-2 flex items-center justify-center">
                <img src={cloudimage} alt="Arraste e solte o arquivo" />
              </div>
              <p className="text-sm mt-2 text-gray-600">
                Arraste e solte sua imagem aqui ou clique para selecionar
              </p>
            </div>
          ) : (
            <div className="text-center flex flex-col items-center">
              <img
                src={previewUrl!} // Exibe a prévia da imagem
                alt="Prévia"
                className="w-40 h-40 object-cover rounded-md mb-2"
              />
              <p className="text-base text-blue-600">{selectedFile.name}</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-10 px-6 w-full">
          <Button
            className="text-base bg-gradient-to-r from-[#E03335] to-[#812F2C]"
            children="Cancelar"
            variant="solid"
            type="button"
            onClick={closePopup}
          />
          <Button
            className="text-base bg-gradient-to-r from-[#0E9647] to-[#165C38]"
            children="Salvar"
            variant="solid"
            type="submit"
            onClick={submitImage}
          />
        </div>
      </div>
    </div>
  );
};
