import { Category } from '../types';

export const categories: Category[] = [
  {
    id: '1',
    name: 'Estrutura e Conforto',
    items: [
      { id: '1', name: 'Isolamento térmico', price: 2500, category: 'Estrutura e Conforto' },
      { id: '2', name: 'Ar-condicionado Split', price: 3200, category: 'Estrutura e Conforto' },
      { id: '3', name: 'Janela panorâmica', price: 1200, category: 'Estrutura e Conforto' },
      { id: '4', name: 'Porta de vidro de correr', price: 1800, category: 'Estrutura e Conforto' },
    ],
  },
  {
    id: '2',
    name: 'Banheiro / SPA',
    items: [
      { id: '5', name: 'Banheiro completo com box', price: 4000, category: 'Banheiro / SPA' },
      { id: '6', name: 'Banheira de hidromassagem', price: 8500, category: 'Banheiro / SPA' },
      { id: '7', name: 'Chuveirão externo', price: 700, category: 'Banheiro / SPA' },
      { id: '8', name: 'Espelho com LED', price: 450, category: 'Banheiro / SPA' },
    ],
  },
  {
    id: '3',
    name: 'Cozinha / Copa',
    items: [
      { id: '9', name: 'Pia com gabinete', price: 1100, category: 'Cozinha / Copa' },
      { id: '10', name: 'Cooktop 2 bocas', price: 750, category: 'Cozinha / Copa' },
      { id: '11', name: 'Frigobar', price: 950, category: 'Cozinha / Copa' },
      { id: '12', name: 'Armários planejados', price: 2500, category: 'Cozinha / Copa' },
    ],
  },
  {
    id: '4',
    name: 'Área Externa e Lazer',
    items: [
      { id: '13', name: 'Deck de madeira', price: 3000, category: 'Área Externa e Lazer' },
      { id: '14', name: 'Área gourmet com churrasqueira', price: 5000, category: 'Área Externa e Lazer' },
      { id: '15', name: 'Ofurô externo', price: 7900, category: 'Área Externa e Lazer' },
      { id: '16', name: 'Jardim vertical', price: 600, category: 'Área Externa e Lazer' },
    ],
  },
  {
    id: '5',
    name: 'Tecnologia e Conectividade',
    items: [
      { id: '17', name: 'Smart TV', price: 1300, category: 'Tecnologia e Conectividade' },
      { id: '18', name: 'Internet Wi-Fi', price: 600, category: 'Tecnologia e Conectividade' },
      { id: '19', name: 'Som ambiente embutido', price: 900, category: 'Tecnologia e Conectividade' },
      { id: '20', name: 'Painel solar', price: 9000, category: 'Tecnologia e Conectividade' },
    ],
  },
];