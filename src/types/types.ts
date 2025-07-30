export interface OrdersProps {
  servico: string;
  data: string;
  dataEntregue: string | null;
  situacao: string;
  descricao: string;
  id: string;
  userId: string;
  employeeId: string;
  entreguePorId: string;
  imageUrl: string;
}

interface EmployeeInfo {
  id: string;
  user: string; // Nome do funcionário
}

// Pessoa que fazem cadastro 

export interface PessoaProps {

  // dados gerais e comuns a todos os tipos de usuários. os Outros e Repartição Pública contem aenas esses também.

  id: string;

  name: string;

  apelido: string;

  genero: string;

  cpf: string;

  rg: string;

  rgImageUrl?: string;

  phone: string;

  neighborhood: string;

  referencia: string;

  classe: string[];

  associacao: string;

  orders: OrdersProps[];

  // Agricultores e/ou Pescadores

  caf: string;

  cafImageUrl?: string;

  car: string;

  carImageUrl?: string;

  rgp: string;

  rgpImageUrl?: string;

  gta: string;

  adagro: string;

  chapeuPalha: string;

  garantiaSafra: string;

  paa: string;

  pnae: string;

  agua: string;

  // Feirantes

  imposto: string;

  area: string;

  tempo: string;

  carroDeMao: string;

  produtos: string[];

  createdAt: Date;
  updatedAt: Date;
  createdBy?: EmployeeInfo;
  updateBy?: EmployeeInfo;

}

// servidores

export interface UserProps {
  user: string;
  id: string
  imgUrl: string;
  email: string;
  status: string;
  tipo: string;
  birthDate: Date;
  lastLogin?: string | null;
  orders: OrdersProps[];
  ordersEntregues: OrdersProps[];

  token: string;

}



export interface DeliveryProps {
  idDelivery: string;
  name: string;
  tipo?: string;
}

// pessoa para fins rapidos
export interface Pessoa {
  id: string;
  name: string;
  cpf?: string;
}