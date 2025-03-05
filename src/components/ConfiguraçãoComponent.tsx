import React, { useState, useEffect, FormEvent } from "react";
import api from "../services/api";
import { UserPropsConfig } from "../types/types";
import Alert from "../components/alerts/alertDesktop"; // Certifique-se de importar o componente de alerta

interface ConfiguracaoComponentProps {
  usuario: UserPropsConfig;
  onUpdateUser: (updatedUser: UserPropsConfig) => void;
}

const ConfiguracaoComponent: React.FC<ConfiguracaoComponentProps> = ({ usuario, onUpdateUser }) => {
  const [user, setUser] = useState<UserPropsConfig>(usuario);
  const [newUser, setNewUser] = useState(usuario.user || "");
  const [newEmail, setNewEmail] = useState(usuario.email || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "error" | "sucesso" | "alerta" | "info", text: string } | null>(null); // Alerta estado

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedFile(null);
      return;
    }
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setAlert({ type: "error", text: "As senhas não conferem." });
      return;
    }

    try {
      const dataToUpdate = {
        user: newUser,
        email: newEmail,
        password: newPassword ? newPassword : undefined,
      };

      const response = await api.put(`/employee/${user.id}`, dataToUpdate, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);

        await api.put(`/employee/${user.id}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      if (response.status === 200) {
        setUser(response.data);
        onUpdateUser(response.data);
        setAlert({ type: "sucesso", text: "Perfil atualizado com sucesso!" });
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      setAlert({ type: "error", text: "Não foi possível atualizar o perfil." });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-full bg-gray-100 p-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Configurações de Perfil</h2>

        <div className="flex flex-col items-center">
          <div className="relative w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-md">
            {preview ? (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            ) : user.imgUrl ? (
              <img src={user.imgUrl} alt={user.user} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl text-gray-500">👤</span>
            )}
          </div>
          <h3 className="text-xl font-semibold mt-3 text-gray-900">{user.user}</h3>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>

        <div className="mt-6 bg-gray-50 p-6 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Editar dados pessoais</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700">Foto de perfil</label>
              <div className="mt-2">
                <label
                  htmlFor="imgFile"
                  className="cursor-pointer inline-block bg-blue-800 hover:bg-blue-900 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200"
                >
                  Alterar Imagem
                </label>
                <input id="imgFile" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700">Usuário</label>
              <input
                type="text"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring focus:ring-blue-300 outline-none"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring focus:ring-blue-300 outline-none"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Senha</label>
              <input
                type="password"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring focus:ring-blue-300 outline-none"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Se quiser manter a senha antiga, deixe em branco."
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700">Confirmar senha</label>
              <input
                type="password"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring focus:ring-blue-300 outline-none"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-green-700 font-bold text-white py-3 rounded-lg shadow-md hover:from-green-600 hover:to-green-800 transition-all duration-300"
            >
              Salvar Alterações
            </button>
          </form>
        </div>
      </div>

      {/* Exibe o alerta se houver algum */}
      {alert && (
        <Alert 
          type={alert.type}
          text={alert.text}
          onClose={() => setAlert(null)} 
        />
      )}
    </div>
  );
};

export default ConfiguracaoComponent;
