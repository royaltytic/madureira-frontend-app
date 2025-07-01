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
  

  
  }
  

export interface UserProps {

  employee : {
  user: string;
  id: string
  imgUrl: string;
  email: string;
  tipo: string;
  birthDate: Date;
  orders: OrdersProps[];
  ordersEntregues: OrdersProps[];
  },
  token: string;
  
}


export interface UserPropsConfig {

  user: string;
  id: string
  imgUrl: string;
  email: string;
  tipo: string;
  birthDate: Date;
  orders: OrdersProps[];
  ordersEntregues: OrdersProps[];
}
  

export interface DeliveryProps {
  idDelivery: string;
  name: string;
  tipo?: string;
}