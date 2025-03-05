import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Defina a interface de acordo com os campos que você tem no Employee
interface Employee {
  id: string;
  user: string;
  email: string;
  tipo: string;
  imgUrl?: string;
  // Adicione outros campos se necessário
}

const EmployeeList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  // Buscar token do localStorage (ou de onde você estiver armazenando)
  const token = localStorage.getItem('token'); 

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:3000/employee', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmployees(response.data);
      } catch (error) {
        console.error('Erro ao listar funcionários:', error);
      }
    };

    fetchEmployees();
  }, [token]);

  // Função que, por exemplo, verifica se o funcionário está "ativo" ou não
  // Aqui usei a ideia de que "funcionario" = Ativado, qualquer outra coisa = Desativado
  const isActive = (employee: Employee) => {
    return employee.tipo === 'funcionario';
  };

  return (
    <div style={styles.container}>
      {employees.map((employee) => (
        <div key={employee.id} style={styles.card}>
          {/* Imagem ou ícone do funcionário */}
          <div style={styles.imageContainer}>
            {employee.imgUrl ? (
              <img
                src={employee.imgUrl}
                alt={employee.user}
                style={styles.image}
              />
            ) : (
              <div style={styles.defaultImage}>
                {/* Ícone genérico se não houver imagem */}
                <span style={{ fontSize: '24px' }}>👤</span>
              </div>
            )}
          </div>

          {/* Nome (user) e email */}
          <h3 style={styles.title}>{employee.user}</h3>
          <p style={styles.email}>{employee.email}</p>

          {/* Badge de status (Ativado / Desativado) */}
          <div
            style={{
              ...styles.statusBadge,
              backgroundColor: isActive(employee) ? '#28a745' : '#dc3545',
            }}
          >
            {isActive(employee) ? 'Ativado' : 'Desativado'}
          </div>
        </div>
      ))}
    </div>
  );
};

// Estilos inline básicos (você pode usar CSS ou Styled Components à vontade)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    justifyContent: 'flex-start',
    padding: '16px',
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#0D1B2A',
    width: '200px',
    minHeight: '260px',
    borderRadius: '8px',
    padding: '16px',
    color: '#FFFFFF',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  imageContainer: {
    marginBottom: '12px',
  },
  image: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  defaultImage: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    backgroundColor: '#ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
  title: {
    margin: '8px 0 4px 0',
    fontSize: '18px',
  },
  email: {
    margin: '4px 0 12px 0',
    fontSize: '14px',
    color: '#bfbfbf',
  },
  statusBadge: {
    color: '#fff',
    padding: '6px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    fontSize: '14px',
    display: 'inline-block',
  },
};

export default EmployeeList;
