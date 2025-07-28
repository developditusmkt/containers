// Arquivo temporário para debugar variáveis de ambiente

console.log('=== DEBUG VARIÁVEIS DE AMBIENTE ===');
console.log('Todas as variáveis import.meta.env:', import.meta.env);
console.log('REACT_APP_ASAAS_API_KEY:', import.meta.env.REACT_APP_ASAAS_API_KEY);
console.log('Tipo:', typeof import.meta.env.REACT_APP_ASAAS_API_KEY);
console.log('Comprimento:', import.meta.env.REACT_APP_ASAAS_API_KEY?.length || 0);

// Testar outras possíveis variações
console.log('VITE_ASAAS_API_KEY:', import.meta.env.VITE_ASAAS_API_KEY);
console.log('ASAAS_API_KEY:', import.meta.env.ASAAS_API_KEY);

export const debugEnv = () => {
  return {
    all: import.meta.env,
    reactApp: import.meta.env.REACT_APP_ASAAS_API_KEY,
    vite: import.meta.env.VITE_ASAAS_API_KEY
  };
};
