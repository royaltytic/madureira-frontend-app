import { Pessoa } from "../types/types";

export const handleExportCSV = (people: Pessoa[], title: string) => {
    if (people.length === 0) {
        alert("Não há dados para exportar.");
        return;
    }

    // 1. Define o cabeçalho do arquivo
    const headers = ['Nome', 'CPF'];

    // 2. Mapeia os dados para o formato de linha do CSV
    const rows = people.map(person => {
        const nome = person.name || person.user?.name || 'Não informado';
        const cpf = person.cpf || person.user?.cpf || 'Não informado';
        
        // Garante que valores com vírgulas ou aspas sejam tratados corretamente
        const safeNome = `"${nome.replace(/"/g, '""')}"`;
        const safeCpf = `"${cpf.replace(/"/g, '""')}"`;
        
        return [safeNome, safeCpf].join(',');
    });

    // 3. Junta o cabeçalho e as linhas
    const csvContent = [headers.join(','), ...rows].join('\n');

    // 4. Cria um Blob e aciona o download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeTitle = title.replace(/\s+/g, '_').toLowerCase(); // Cria um nome de arquivo seguro
    
    link.setAttribute("href", url);
    link.setAttribute("download", `lista_${safeTitle}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};