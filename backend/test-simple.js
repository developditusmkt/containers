console.log('Teste: Node.js está funcionando!');
console.log('Versão do Node.js:', process.version);
console.log('Diretório atual:', process.cwd());

// Teste de import
try {
  import('express').then(express => {
    console.log('Express carregado com sucesso!');
    process.exit(0);
  }).catch(err => {
    console.error('Erro ao carregar Express:', err.message);
    process.exit(1);
  });
} catch (err) {
  console.error('Erro no teste:', err.message);
  process.exit(1);
}
