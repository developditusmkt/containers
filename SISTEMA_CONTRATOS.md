# Sistema de Gerenciamento de Contratos

## Visão Geral

O sistema de gerenciamento de contratos permite criar, editar, visualizar e gerenciar templates de contratos para diferentes tipos de operações (compra à vista, compra parcelada, locação, aditamento de locação).

## Funcionalidades Implementadas

### 1. CRUD Completo de Contratos
- ✅ Criar novos templates de contratos
- ✅ Editar contratos existentes
- ✅ Visualizar contratos com formatação HTML
- ✅ Excluir contratos
- ✅ Ativar/desativar contratos

### 2. Types e Interfaces
- ✅ `ContractType`: Union type para os tipos de contrato
- ✅ `ContractTemplate`: Interface principal dos contratos
- ✅ Exportação de tipos no index.ts

### 3. Serviços e Contexto
- ✅ `ContractService`: Classe para interação com o banco
- ✅ `ContractContext`: Contexto React para gerenciamento de estado
- ✅ Integração com Supabase

### 4. Componentes de Interface
- ✅ `ContractManagement`: Lista e gerenciamento de contratos
- ✅ `ContractForm`: Formulário de criação/edição com editor de texto
- ✅ Integração no AdminDashboard

### 5. Sistema de Variáveis
- ✅ Variáveis predefinidas para personalização de contratos
- ✅ Interface para inserção de variáveis no editor
- ✅ Sistema de templates com placeholders

## Tipos de Contrato Suportados

1. **Compra à Vista** (`compra-vista`)
2. **Compra Parcelada** (`compra-parcelada`)  
3. **Locação** (`locacao`)
4. **Aditamento de Locação** (`aditamento-locacao`)

## Variáveis Disponíveis

O sistema suporta as seguintes variáveis que podem ser inseridas nos contratos:

### Dados do Cliente
- `{{CLIENTE_NOME}}` - Nome completo do cliente
- `{{CLIENTE_NACIONALIDADE}}` - Nacionalidade do cliente
- `{{CLIENTE_ESTADO_CIVIL}}` - Estado civil do cliente
- `{{CLIENTE_PROFISSAO}}` - Profissão do cliente
- `{{CLIENTE_RG}}` - RG do cliente
- `{{CLIENTE_CPF}}` - CPF do cliente
- `{{CLIENTE_ENDERECO}}` - Endereço do cliente
- `{{CLIENTE_ENDERECO_COMPLETO}}` - Endereço completo do cliente
- `{{CLIENTE_TELEFONE}}` - Telefone do cliente
- `{{CLIENTE_EMAIL}}` - Email do cliente

### Dados do Container
- `{{CONTAINER_TIPO}}` - Tipo/modelo do container
- `{{CONTAINER_TAMANHO}}` - Tamanho do container (4m, 6m, 12m)

### Dados Financeiros
- `{{VALOR_TOTAL}}` - Valor total da operação
- `{{VALOR_APROVADO}}` - Valor final aprovado
- `{{VALOR_ENTRADA}}` - Valor da entrada (compra parcelada)
- `{{VALOR_PARCELA}}` - Valor de cada parcela
- `{{NUMERO_PARCELAS}}` - Número de parcelas

### Dados de Data e Local
- `{{DATA_CONTRATO}}` - Data de assinatura do contrato
- `{{DATA_ENTREGA}}` - Data de entrega do container
- `{{DIAS_UTEIS}}` - Prazo em dias úteis para entrega
- `{{ENDERECO_ENTREGA}}` - Endereço de entrega

### Dados da Empresa
- `{{EMPRESA_NOME}}` - Nome da empresa
- `{{EMPRESA_CNPJ}}` - CNPJ da empresa
- `{{EMPRESA_ENDERECO}}` - Endereço da empresa

## Estrutura do Banco de Dados

### Tabela: `contract_templates`

```sql
- id (UUID) - Chave primária
- name (VARCHAR) - Nome do template
- type (VARCHAR) - Tipo do contrato 
- content (TEXT) - Conteúdo HTML do contrato
- is_active (BOOLEAN) - Se o template está ativo
- created_at (TIMESTAMP) - Data de criação
- updated_at (TIMESTAMP) - Data da última atualização
```

## Exemplos de Uso das Variáveis

### Texto de Identificação Completa do Cliente
```
{{CLIENTE_NOME}}, {{CLIENTE_NACIONALIDADE}}, {{CLIENTE_ESTADO_CIVIL}}, {{CLIENTE_PROFISSAO}}, portador(a) do RG nº {{CLIENTE_RG}} e CPF nº {{CLIENTE_CPF}}, residente e domiciliado(a) na {{CLIENTE_ENDERECO_COMPLETO}};
```

**Resultado esperado:**
```
João Silva Santos, brasileiro, casado, engenheiro, portador do RG nº 12.345.678-9 e CPF nº 123.456.789-00, residente e domiciliado na Rua das Flores, 123, Centro, São Paulo/SP, CEP: 01234-567;
```

### Informações de Valor e Prazo
```
Valor aprovado: {{VALOR_APROVADO}}
Prazo de entrega: {{DIAS_UTEIS}} dias úteis
```

## Como Usar

### 1. Acessar o Gerenciamento de Contratos
1. Faça login como administrador
2. Navegue para a aba "Contratos"
3. Visualize a lista de templates existentes

### 2. Criar Novo Contrato
1. Clique em "Novo Contrato"
2. Preencha o nome e selecione o tipo
3. Use o editor de texto para criar o conteúdo
4. Insira variáveis clicando nos botões da lateral
5. Salve o contrato

### 3. Editar Contrato Existente
1. Na lista de contratos, clique no ícone de edição
2. Modifique as informações necessárias
3. Salve as alterações

### 4. Visualizar Contrato
1. Clique no ícone de visualização
2. O contrato será exibido com formatação HTML

### 5. Ativar/Desativar Contrato
1. Clique no botão de status (Ativo/Inativo)
2. O status será alternado automaticamente

## Próximas Implementações

### Funcionalidades Planejadas
- [ ] Editor de texto rico (WYSIWYG) com toolbar
- [ ] Sistema de assinatura eletrônica
- [ ] Geração de PDF dos contratos
- [ ] Envio por email
- [ ] Histórico de versões
- [ ] Aprovação de contratos
- [ ] Templates personalizados por cliente

### Melhorias Técnicas
- [ ] Validação de variáveis no conteúdo
- [ ] Preview em tempo real das variáveis
- [ ] Backup automático de templates
- [ ] Logs de auditoria
- [ ] Permissões por usuário

## Arquivos Criados/Modificados

### Novos Arquivos
- `src/types/contract.ts` - Definições de tipos
- `src/services/contractService.ts` - Serviços de banco de dados
- `src/contexts/ContractContext.tsx` - Contexto React
- `src/components/ContractManagement.tsx` - Componente principal
- `src/components/ContractForm.tsx` - Formulário de contratos
- `supabase_create_contract_templates_table.sql` - Script SQL

### Arquivos Modificados
- `src/types/index.ts` - Export dos novos tipos
- `src/App.tsx` - Inclusão do ContractProvider
- `src/pages/AdminDashboard.tsx` - Nova aba de contratos

## Setup do Banco de Dados

Execute o script SQL fornecido no Supabase:
```bash
supabase_create_contract_templates_table.sql
```

Este script criará:
- Tabela `contract_templates`
- Índices para performance
- Trigger para atualização automática de timestamps
- Políticas RLS para segurança
- Templates de exemplo

## Tecnologias Utilizadas

- **React 18+** com TypeScript
- **Tailwind CSS** para styling
- **Supabase** para banco de dados
- **Lucide React** para ícones
- **Context API** para gerenciamento de estado

O sistema está totalmente funcional e integrado com o resto da aplicação!
