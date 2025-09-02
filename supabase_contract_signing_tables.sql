-- Contratos gerados a partir de orçamentos
CREATE TABLE generated_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id),
  template_id UUID REFERENCES contract_templates(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- HTML renderizado com variáveis preenchidas
  variables JSONB, -- Dados das variáveis preenchidas
  status VARCHAR(50) DEFAULT 'pending', -- pending, creator_signed, completed, cancelled
  created_by UUID REFERENCES auth.users(id),
  creator_signed_at TIMESTAMP, -- Quando o criador assinou
  creator_signature_data TEXT, -- Assinatura digital do criador (base64)
  all_signed_at TIMESTAMP, -- Quando todos assinaram
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  signing_link VARCHAR(255) UNIQUE -- Token único para acesso público (só criado após criador assinar)
);

-- Signatários do contrato
CREATE TABLE contract_signatories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES generated_contracts(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  is_creator BOOLEAN DEFAULT FALSE, -- Se é quem gerou o contrato
  order_index INTEGER NOT NULL, -- Ordem de assinatura (criador sempre 0)
  signed_at TIMESTAMP,
  ip_address INET, -- Para auditoria
  user_agent TEXT, -- Para auditoria
  signature_data TEXT, -- Assinatura digital desenhada (base64)
  status VARCHAR(50) DEFAULT 'pending' -- pending, signed, available_to_sign
);

-- Log de auditoria detalhado
CREATE TABLE contract_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES generated_contracts(id),
  signatory_id UUID REFERENCES contract_signatories(id),
  action VARCHAR(100) NOT NULL, -- created, viewed, signed, link_accessed, etc
  ip_address INET,
  user_agent TEXT,
  metadata JSONB, -- Dados extras (geolocation, timestamp preciso, etc)
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_generated_contracts_quote_id ON generated_contracts(quote_id);
CREATE INDEX idx_generated_contracts_created_by ON generated_contracts(created_by);
CREATE INDEX idx_generated_contracts_signing_link ON generated_contracts(signing_link);
CREATE INDEX idx_contract_signatories_contract_id ON contract_signatories(contract_id);
CREATE INDEX idx_contract_audit_log_contract_id ON contract_audit_log(contract_id);
