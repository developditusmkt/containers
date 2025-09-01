import { Category } from '../types';

export const categories: Category[] = [
  // Categorias de VENDA
  {
    id: '1',
    name: 'Estrutura e Conforto',
    operationType: 'venda',
    items: [
      { id: '1', name: 'Isolamento térmico', price: 2500, category: 'Estrutura e Conforto', operationType: 'venda' },
      { id: '2', name: 'Ar-condicionado Split', price: 3200, category: 'Estrutura e Conforto', operationType: 'venda' },
      { id: '3', name: 'Janela panorâmica', price: 1200, category: 'Estrutura e Conforto', operationType: 'venda' },
      { id: '4', name: 'Porta de vidro de correr', price: 1800, category: 'Estrutura e Conforto', operationType: 'venda' },
    ],
  },
  {
    id: '2',
    name: 'Banheiro / SPA',
    operationType: 'venda',
    items: [
      { id: '5', name: 'Banheiro completo com box', price: 4000, category: 'Banheiro / SPA', operationType: 'venda' },
      { id: '6', name: 'Banheira de hidromassagem', price: 8500, category: 'Banheiro / SPA', operationType: 'venda' },
      { id: '7', name: 'Chuveirão externo', price: 700, category: 'Banheiro / SPA', operationType: 'venda' },
      { id: '8', name: 'Espelho com LED', price: 450, category: 'Banheiro / SPA', operationType: 'venda' },
    ],
  },
  {
    id: '3',
    name: 'Cozinha / Copa',
    operationType: 'venda',
    items: [
      { id: '9', name: 'Pia com gabinete', price: 1100, category: 'Cozinha / Copa', operationType: 'venda' },
      { id: '10', name: 'Cooktop 2 bocas', price: 750, category: 'Cozinha / Copa', operationType: 'venda' },
      { id: '11', name: 'Frigobar', price: 950, category: 'Cozinha / Copa', operationType: 'venda' },
      { id: '12', name: 'Armários planejados', price: 2500, category: 'Cozinha / Copa', operationType: 'venda' },
    ],
  },
  {
    id: '4',
    name: 'Área Externa e Lazer',
    operationType: 'venda',
    items: [
      { id: '13', name: 'Deck de madeira', price: 3000, category: 'Área Externa e Lazer', operationType: 'venda' },
      { id: '14', name: 'Área gourmet com churrasqueira', price: 5000, category: 'Área Externa e Lazer', operationType: 'venda' },
      { id: '15', name: 'Ofurô externo', price: 7900, category: 'Área Externa e Lazer', operationType: 'venda' },
      { id: '16', name: 'Jardim vertical', price: 600, category: 'Área Externa e Lazer', operationType: 'venda' },
    ],
  },
  {
    id: '5',
    name: 'Tecnologia e Conectividade',
    operationType: 'venda',
    items: [
      { id: '17', name: 'Smart TV', price: 1300, category: 'Tecnologia e Conectividade', operationType: 'venda' },
      { id: '18', name: 'Internet Wi-Fi', price: 600, category: 'Tecnologia e Conectividade', operationType: 'venda' },
      { id: '19', name: 'Som ambiente embutido', price: 900, category: 'Tecnologia e Conectividade', operationType: 'venda' },
      { id: '20', name: 'Painel solar', price: 9000, category: 'Tecnologia e Conectividade', operationType: 'venda' },
    ],
  },

  // Categorias de ALUGUEL
  {
    id: '10',
    name: 'Estrutura Básica - Aluguel',
    operationType: 'aluguel',
    items: [
      { id: '100', name: 'Container básico mobiliado', price: 800, category: 'Estrutura Básica - Aluguel', operationType: 'aluguel' },
      { id: '101', name: 'Container premium mobiliado', price: 1200, category: 'Estrutura Básica - Aluguel', operationType: 'aluguel' },
      { id: '102', name: 'Container executivo', price: 1500, category: 'Estrutura Básica - Aluguel', operationType: 'aluguel' },
    ],
  },
  {
    id: '11',
    name: 'Serviços Inclusos - Aluguel',
    operationType: 'aluguel',
    items: [
      { id: '110', name: 'Limpeza semanal', price: 150, category: 'Serviços Inclusos - Aluguel', operationType: 'aluguel' },
      { id: '111', name: 'Manutenção técnica', price: 200, category: 'Serviços Inclusos - Aluguel', operationType: 'aluguel' },
      { id: '112', name: 'Internet banda larga', price: 80, category: 'Serviços Inclusos - Aluguel', operationType: 'aluguel' },
      { id: '113', name: 'Energia elétrica', price: 120, category: 'Serviços Inclusos - Aluguel', operationType: 'aluguel' },
    ],
  },
  {
    id: '12',
    name: 'Opcionais - Aluguel',
    operationType: 'aluguel',
    items: [
      { id: '120', name: 'Ar condicionado adicional', price: 180, category: 'Opcionais - Aluguel', operationType: 'aluguel' },
      { id: '121', name: 'Frigobar', price: 60, category: 'Opcionais - Aluguel', operationType: 'aluguel' },
      { id: '122', name: 'TV por assinatura', price: 90, category: 'Opcionais - Aluguel', operationType: 'aluguel' },
      { id: '123', name: 'Seguro contra danos', price: 100, category: 'Opcionais - Aluguel', operationType: 'aluguel' },
    ],
  },
];
