interface BenefitInputProps {
  label: string;
  name: string;
  value: string | null | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BenefitInput: React.FC<BenefitInputProps> = ({ label, name, value, onChange }) => {
  // Verifica se o benefício está ativo (qualquer valor que não seja "Não")
  const isActive = value != null && value !== 'Não';

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === 'sim' ? '' : 'Não'; // Se for 'sim', prepara para digitar o ano. Se 'não', define como "Não".
    // Simula um evento de input para ser compatível com a função handleInputChange principal
    onChange({
      target: { name, value: newValue },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600">{label}</label>
      <div className="mt-1 flex items-center gap-4">
        {/* Opções Sim/Não */}
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id={`${name}-sim`}
            name={`${name}-radio`}
            value="sim"
            checked={isActive}
            onChange={handleRadioChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
          <label htmlFor={`${name}-sim`} className="text-sm text-slate-800">Sim</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id={`${name}-nao`}
            name={`${name}-radio`}
            value="nao"
            checked={!isActive}
            onChange={handleRadioChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
          />
          <label htmlFor={`${name}-nao`} className="text-sm text-slate-800">Não</label>
        </div>

        {/* Campo de Ano (aparece apenas se "Sim" estiver marcado) */}
        {isActive && (
          <input
            type="text"
            name={name}
            value={value} // O valor aqui será o ano
            onChange={onChange}
            placeholder="Ano(s). Ex: 2023, 2024"
            className="flex-grow w-full border-slate-300 rounded-md shadow-sm text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        )}
      </div>
    </div>
  );
};