# 🚀 Como Executar o Backend

## Instalação e Execução Rápida

### 1. Instalar dependências
```bash
cd backend
npm install
```

### 2. Configurar ambiente (Opcional)
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar com sua chave do Asaas (opcional para teste)
# ASAAS_API_KEY=sua_chave_aqui
```

### 3. Executar o backend
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Ou produção
npm start
```

### 4. Verificar se funcionou
```bash
# Health check
curl http://localhost:3001/health

# Deve retornar algo como:
# {"uptime":1.234,"message":"Backend funcionando",...}
```

## ✅ Teste Completo

### 1. Backend rodando
```bash
cd backend
npm run dev
```
*Deixe este terminal rodando*

### 2. Frontend rodando (outro terminal)
```bash
cd ..
npm run dev
```

### 3. Testar no navegador
1. Abra http://localhost:5173
2. Vá em Admin > Orçamentos
3. Edite um orçamento e defina valor final aprovado
4. Clique em "Gerar Link de Pagamento"
5. Deve aparecer notificação moderna ✨

## 🔧 Modes de Funcionamento

### Modo 1: Com Backend (Recomendado)
- ✅ Backend rodando
- ✅ Integração real se tiver chave Asaas
- ✅ Fallback para demo se não tiver chave
- ✅ Notificação moderna funciona

### Modo 2: Só Frontend (Demo)
- ❌ Backend não rodando
- ✅ Modo demo automático
- ✅ Página de pagamento local
- ✅ Notificação moderna funciona

## 🎯 Resultado

Independente do modo, o usuário sempre terá:
- ✅ Link de pagamento gerado
- ✅ Notificação moderna e elegante
- ✅ Link copiado automaticamente
- ✅ Página de pagamento profissional
- ✅ Experiência consistente

---

**O sistema está pronto para uso em qualquer configuração!** 🎉
