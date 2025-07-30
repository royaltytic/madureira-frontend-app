import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PessoaProps } from "../types/types";

export const formatCpf = (cpf: string) => cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

export const exportToPDFUsuarios = async (filteredUsers: PessoaProps[] ) => {

    if (filteredUsers.length === 0) {
      alert("Nenhum usuário para exportar.");
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 30; // Define uma margem padrão

    // --- NOVO CABEÇALHO PROFISSIONAL ---

    // 2. Adiciona o bloco de título à direita do logo
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(45, 55, 72); // Cor: slate-700
    doc.text("Relatório de Usuários", margin + 60, 45);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Cor: slate-500
    doc.text("Lista de registros conforme filtros aplicados.", margin + 60, 60);

    // 3. Adiciona o bloco de metadados na direita da página
    const generationDate = new Date().toLocaleString("pt-BR", {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("DATA DE EMISSÃO:", pageWidth - margin, 35, { align: 'right' });
    doc.text("TOTAL DE REGISTROS:", pageWidth - margin, 50, { align: 'right' });

    doc.setFont("helvetica", "normal");
    doc.text(generationDate, pageWidth - margin, 42, { align: 'right' });
    doc.text(`${filteredUsers.length}`, pageWidth - margin, 57, { align: 'right' });


    // 4. Desenha uma linha separadora
    doc.setDrawColor(226, 232, 240); // Cor: slate-200
    doc.setLineWidth(1);
    doc.line(margin, 80, pageWidth - margin, 80);

    // --- FIM DO NOVO CABEÇALHO ---


    // Definição da tabela (mesma lógica de antes)
    const tableColumn = ["Nome", "Apelido", "CPF", "Telefone", "Localidade", "Classe(s)"];
    const tableRows: string[][] = filteredUsers.map((user) => [
      user.name || "Sem nome",
      user.apelido || "Sem apelido",
      formatCpf(user.cpf),
      user.phone || "Sem telefone",
      user.neighborhood || "Sem localidade",
      Array.isArray(user.classe) ? user.classe.join(", ") : "Sem classe"
    ]);

    // Geração da tabela com o autoTable
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 95, // AJUSTE: A tabela começa mais para baixo para dar espaço ao cabeçalho
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59], // Cor: slate-800
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        cellPadding: 4,
        fontSize: 8,
      },
      didDrawPage: (data) => {
        // Rodapé com número da página
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${data.pageNumber} de ${pageCount}`, data.settings.margin.left, pageHeight - 15);
      }
    });

    doc.save("relatorio_usuarios.pdf");
  };