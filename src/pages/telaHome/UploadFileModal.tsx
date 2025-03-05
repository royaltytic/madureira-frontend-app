import { useState } from "react";
import { useDropzone } from "react-dropzone";
import cloudimage from "./assets/Image.png";

interface UploadFileModalProps {
  onFileSelected: (file: File) => void;
}

export const UploadFileModal: React.FC<UploadFileModalProps> = ({ onFileSelected }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        onFileSelected(file);
      }
    },
  });

  return (
    <div className="bg-white w-full rounded-xl flex flex-col items-center justify-center transform transition-transform duration-300 scale-100 opacity-100">
      <h1 className="font-bold text-2xl mb-4">Selecione um anexo</h1>
      <div
        {...getRootProps()}
        className="w-full max-w-[438px] h-[300px] outline-dashed outline-[#165C38] outline-3 flex flex-col items-center justify-center text-blue-500 rounded-md cursor-pointer hover:bg-green-50"
      >
        <input {...getInputProps()} />
        {!selectedFile ? (
          <div className="text-center flex flex-col items-center justify-center">
            <div className="mb-2 flex items-center justify-center">
              <img src={cloudimage} alt="Arraste e solte o arquivo" />
            </div>
            <p className="text-sm mt-2 p-4 text-gray-600">
              Arraste e solte sua imagem aqui ou clique para selecionar
            </p>
          </div>
        ) : (
          <div className="text-center flex flex-col items-center">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Prévia"
                className="w-40 h-40 object-cover rounded-md mb-2"
              />
            )}
            <p className="text-base text-blue-600">{selectedFile.name}</p>
          </div>
        )}
      </div>
    </div>
  );
};
