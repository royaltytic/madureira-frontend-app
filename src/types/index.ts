export interface Aluno {
  id: number;
  nomeAluno: string;
  nascimento: string;
  idade: number;
  cpf: string;
  rg: string;
  cidade: string;
  cep: string;
  telefone: string;
  email: string;
  escola?: string;
  modalidades: string[];
  turno?: 'Manha' | 'Tarde' | 'Noite';
  temProblemaSaude: boolean;
  problemaSaudeDetalhes?: string;
  nomeResponsavel: string;
  rgImageUrl?: string;
  imgUrl?: string;
  genero: string ;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  password: string;
  imgUrl?: string;
  role: 'Adm' | 'Usuario' | 'Dev';
}

export interface Professor extends User {
  turmas?: string[];
}