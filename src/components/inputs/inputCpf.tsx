import React from "react";

interface CPFInputProps {
  value: string; // Valor do CPF
  onChange: (value: string) => void; // Função para atualizar o valor do CPF
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // Função para tratar eventos de teclado
}

export const CPFInput: React.FC<CPFInputProps> = ({ value, onChange, onKeyDown }) => {
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    // Remove qualquer caractere que não seja número
    inputValue = inputValue.replace(/\D/g, "");

    // Aplica a máscara de CPF (XXX.XXX.XXX-XX)
    if (inputValue.length > 3 && inputValue.length <= 6) {
      inputValue = inputValue.replace(/(\d{3})(\d+)/, "$1.$2");
    } else if (inputValue.length > 6 && inputValue.length <= 9) {
      inputValue = inputValue.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
    } else if (inputValue.length > 9) {
      inputValue = inputValue.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, "$1.$2.$3-$4");
    }

    onChange(inputValue); // Atualiza o valor do CPF no componente pai
  };

  return (
    <input
      className="w-[200px] h-[35px] bg-white font-bold text-base shadow-2xl rounded-lg border text-black pl-4"
      type="text"
      placeholder="Digite um CPF"
      value={value} // Recebe o valor do CPF como prop
      onChange={handleCpfChange} // Chama a função de atualização ao mudar o valor
      onKeyDown={onKeyDown} // Permite ações ao pressionar teclas
      maxLength={14} // Limita o número máximo de caracteres para um CPF
    />
  );
};
