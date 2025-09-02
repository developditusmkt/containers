-- Tabela para armazenar templates de contratos
CREATE TABLE contract_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('compra-vista', 'compra-parcelada', 'locacao', 'aditamento-locacao')),
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para melhor performance
CREATE INDEX idx_contract_templates_type ON contract_templates(type);
CREATE INDEX idx_contract_templates_active ON contract_templates(is_active);
CREATE INDEX idx_contract_templates_created_at ON contract_templates(created_at);

-- Trigger para atualizar automatically o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contract_templates_updated_at 
    BEFORE UPDATE ON contract_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) para proteger os dados
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT para usuários autenticados
CREATE POLICY "Users can view contract templates" ON contract_templates
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir INSERT/UPDATE/DELETE apenas para admins (se você tiver um sistema de roles)
CREATE POLICY "Admins can manage contract templates" ON contract_templates
    FOR ALL USING (auth.role() = 'authenticated');

-- Inserir alguns templates de exemplo
INSERT INTO contract_templates (name, type, content, is_active) VALUES
(
    'Contrato de Compra à Vista - Padrão',
    'compra-vista',
    '<h1>CONTRATO DE COMPRA E VENDA DE CONTAINER</h1>
    
    <p><strong>Vendedor:</strong> {{EMPRESA_NOME}}<br>
    <strong>CNPJ:</strong> {{EMPRESA_CNPJ}}<br>
    <strong>Endereço:</strong> {{EMPRESA_ENDERECO}}</p>
    
    <p><strong>Comprador:</strong> {{CLIENTE_NOME}}, {{CLIENTE_NACIONALIDADE}}, {{CLIENTE_ESTADO_CIVIL}}, {{CLIENTE_PROFISSAO}}, portador(a) do RG nº {{CLIENTE_RG}} e CPF nº {{CLIENTE_CPF}}, residente e domiciliado(a) na {{CLIENTE_ENDERECO_COMPLETO}};<br>
    <strong>Telefone:</strong> {{CLIENTE_TELEFONE}}<br>
    <strong>E-mail:</strong> {{CLIENTE_EMAIL}}</p>
    
    <h2>OBJETO DO CONTRATO</h2>
    <p>O presente contrato tem por objeto a venda do container modelo {{CONTAINER_TIPO}} de {{CONTAINER_TAMANHO}}, pelo valor total de {{VALOR_TOTAL}}, sendo o valor aprovado de {{VALOR_APROVADO}}, a ser pago à vista.</p>
    
    <h2>ENTREGA</h2>
    <p>A entrega será realizada no endereço: {{ENDERECO_ENTREGA}}, no prazo de {{DIAS_UTEIS}} dias úteis a partir da data de {{DATA_ENTREGA}}.</p>
    
    <p>Data do contrato: {{DATA_CONTRATO}}</p>
    
    <p>_________________________<br>
    Assinatura do Vendedor</p>
    
    <p>_________________________<br>
    Assinatura do Comprador</p>',
    true
),
(
    'Contrato de Locação - Padrão',
    'locacao',
    '<h1>CONTRATO DE LOCAÇÃO DE CONTAINER</h1>
    
    <p><strong>Locador:</strong> {{EMPRESA_NOME}}<br>
    <strong>CNPJ:</strong> {{EMPRESA_CNPJ}}<br>
    <strong>Endereço:</strong> {{EMPRESA_ENDERECO}}</p>
    
    <p><strong>Locatário:</strong> {{CLIENTE_NOME}}, {{CLIENTE_NACIONALIDADE}}, {{CLIENTE_ESTADO_CIVIL}}, {{CLIENTE_PROFISSAO}}, portador(a) do RG nº {{CLIENTE_RG}} e CPF nº {{CLIENTE_CPF}}, residente e domiciliado(a) na {{CLIENTE_ENDERECO_COMPLETO}};<br>
    <strong>Telefone:</strong> {{CLIENTE_TELEFONE}}<br>
    <strong>E-mail:</strong> {{CLIENTE_EMAIL}}</p>
    
    <h2>OBJETO DO CONTRATO</h2>
    <p>O presente contrato tem por objeto a locação do container modelo {{CONTAINER_TIPO}} de {{CONTAINER_TAMANHO}}.</p>
    
    <h2>VALOR E FORMA DE PAGAMENTO</h2>
    <p>O valor mensal da locação é de {{VALOR_TOTAL}}, sendo o valor aprovado de {{VALOR_APROVADO}}, a ser pago até o dia 10 de cada mês.</p>
    
    <h2>PRAZO</h2>
    <p>O prazo de locação é de 12 (doze) meses, iniciando-se em {{DATA_CONTRATO}}.</p>
    
    <h2>ENTREGA</h2>
    <p>A entrega será realizada no endereço: {{ENDERECO_ENTREGA}}, no prazo de {{DIAS_UTEIS}} dias úteis a partir da data de {{DATA_ENTREGA}}.</p>
    
    <p>Data do contrato: {{DATA_CONTRATO}}</p>
    
    <p>_________________________<br>
    Assinatura do Locador</p>
    
    <p>_________________________<br>
    Assinatura do Locatário</p>',
    true
),
(
    'Contrato de Compra Parcelada - Padrão',
    'compra-parcelada',
    '<h1>CONTRATO DE COMPRA E VENDA DE CONTAINER A PRAZO</h1>
    
    <p><strong>Vendedor:</strong> {{EMPRESA_NOME}}<br>
    <strong>CNPJ:</strong> {{EMPRESA_CNPJ}}<br>
    <strong>Endereço:</strong> {{EMPRESA_ENDERECO}}</p>
    
    <p><strong>Comprador:</strong> {{CLIENTE_NOME}}, {{CLIENTE_NACIONALIDADE}}, {{CLIENTE_ESTADO_CIVIL}}, {{CLIENTE_PROFISSAO}}, portador(a) do RG nº {{CLIENTE_RG}} e CPF nº {{CLIENTE_CPF}}, residente e domiciliado(a) na {{CLIENTE_ENDERECO_COMPLETO}};<br>
    <strong>Telefone:</strong> {{CLIENTE_TELEFONE}}<br>
    <strong>E-mail:</strong> {{CLIENTE_EMAIL}}</p>
    
    <h2>OBJETO DO CONTRATO</h2>
    <p>O presente contrato tem por objeto a venda do container modelo {{CONTAINER_TIPO}} de {{CONTAINER_TAMANHO}}, pelo valor total de {{VALOR_TOTAL}}, sendo o valor aprovado de {{VALOR_APROVADO}}.</p>
    
    <h2>FORMA DE PAGAMENTO</h2>
    <p>O pagamento será realizado da seguinte forma:</p>
    <ul>
        <li>Entrada: {{VALOR_ENTRADA}}</li>
        <li>Saldo: {{NUMERO_PARCELAS}} parcelas de {{VALOR_PARCELA}} cada</li>
    </ul>
    
    <h2>ENTREGA</h2>
    <p>A entrega será realizada no endereço: {{ENDERECO_ENTREGA}}, no prazo de {{DIAS_UTEIS}} dias úteis a partir da data de {{DATA_ENTREGA}}.</p>
    
    <p>Data do contrato: {{DATA_CONTRATO}}</p>
    
    <p>_________________________<br>
    Assinatura do Vendedor</p>
    
    <p>_________________________<br>
    Assinatura do Comprador</p>',
    true
),
(
    'Aditamento de Locação - Padrão',
    'aditamento-locacao',
    '<h1>ADITAMENTO AO CONTRATO DE LOCAÇÃO DE CONTAINER</h1>
    
    <p><strong>Locador:</strong> {{EMPRESA_NOME}}<br>
    <strong>CNPJ:</strong> {{EMPRESA_CNPJ}}<br>
    <strong>Endereço:</strong> {{EMPRESA_ENDERECO}}</p>
    
    <p><strong>Locatário:</strong> {{CLIENTE_NOME}}, {{CLIENTE_NACIONALIDADE}}, {{CLIENTE_ESTADO_CIVIL}}, {{CLIENTE_PROFISSAO}}, portador(a) do RG nº {{CLIENTE_RG}} e CPF nº {{CLIENTE_CPF}}, residente e domiciliado(a) na {{CLIENTE_ENDERECO_COMPLETO}};<br>
    <strong>Telefone:</strong> {{CLIENTE_TELEFONE}}<br>
    <strong>E-mail:</strong> {{CLIENTE_EMAIL}}</p>
    
    <h2>OBJETO DO ADITAMENTO</h2>
    <p>O presente aditamento tem por objeto alterar as condições do contrato de locação do container modelo {{CONTAINER_TIPO}} de {{CONTAINER_TAMANHO}}.</p>
    
    <h2>ALTERAÇÕES</h2>
    <p>Ficam alteradas as seguintes cláusulas:</p>
    <ul>
        <li>Novo valor mensal: {{VALOR_APROVADO}}</li>
        <li>Nova vigência: a partir de {{DATA_CONTRATO}}</li>
    </ul>
    
    <h2>DEMAIS CONDIÇÕES</h2>
    <p>Permanecem inalteradas as demais cláusulas do contrato original. A entrega permanece no endereço: {{ENDERECO_ENTREGA}}.</p>
    
    <p>Data do aditamento: {{DATA_CONTRATO}}</p>
    
    <p>_________________________<br>
    Assinatura do Locador</p>
    
    <p>_________________________<br>
    Assinatura do Locatário</p>',
    true
);
