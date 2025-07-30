export const getStatusClass = (situacao: string): string => {
    // Classes base para todas as etiquetas, com cantos arredondados
    const baseClasses = "px-3 py-1 text-xs font-bold rounded-full inline-block";

    if (situacao.startsWith("Lista")) {
        // Azul suave
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }

    switch (situacao) {
        case "Aguardando":
            // Vermelho suave
            return `${baseClasses} bg-red-100 text-red-800`;
        case "Finalizado":
            // Verde suave
            return `${baseClasses} bg-green-100 text-green-800`;
        case "Cancelado":
            // Laranja suave
            return `${baseClasses} bg-orange-100 text-orange-800`;
        default:
            // Cinza suave para outros casos
            return `${baseClasses} bg-gray-100 text-gray-800`;
    }
};

export const getIconColorForStatus = (status: string): string => {
    // Garante que a comparação não é sensível a maiúsculas/minúsculas
    const lowerCaseStatus = status.toLowerCase();
  
    if (lowerCaseStatus.startsWith('lista')) {
      return 'text-blue-500'; // Azul para "Lista"
    }
    if (lowerCaseStatus === 'cancelado') {
      return 'text-orange-500'; // Laranja para "Cancelado"
    }
    if (lowerCaseStatus === 'finalizado') {
      return 'text-green-500'; // Verde para "Finalizado"
    }
  
    // Cor padrão para qualquer outro status (ex: "Aguardando")
    return 'text-slate-500'; 
  };