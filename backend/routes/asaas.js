/**
 * Rotas para integração com API do Asaas
 * Expõe endpoints seguros para o frontend
 */

import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import winston from 'winston';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { ASAAS_CONFIG, validateAsaasConfig } from '../config/asaas.js';
import * as asaasService from '../services/asaasService.js';

const router = express.Router();
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/routes.log' })
  ]
});

/**
 * Middleware para validar configuração do Asaas
 */
const requireAsaasConfig = (req, res, next) => {
  if (!validateAsaasConfig()) {
    return res.status(503).json({
      success: false,
      error: {
        message: 'Integração com Asaas não configurada',
        code: 'ASAAS_NOT_CONFIGURED',
        details: 'Configure a variável ASAAS_API_KEY no arquivo .env'
      }
    });
  }
  next();
};

/**
 * Middleware para validação de dados
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Dados inválidos',
        code: 'VALIDATION_ERROR',
        details: errors.array()
      }
    });
  }
  next();
};

/**
 * GET /api/asaas/test
 * Testa a conectividade com a API do Asaas
 */
router.get('/test', requireAsaasConfig, asyncHandler(async (req, res) => {
  const result = await asaasService.testConnection();
  
  res.json({
    success: result.success,
    data: result,
    timestamp: new Date().toISOString()
  });
}));

/**
 * POST /api/asaas/customers
 * Cria ou atualiza um cliente
 */
router.post('/customers', [
  requireAsaasConfig,
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').notEmpty().withMessage('Telefone é obrigatório'),
  body('postalCode').optional().isLength({ min: 8, max: 9 }).withMessage('CEP inválido'),
  body('city').optional().notEmpty().withMessage('Cidade é obrigatória se fornecida'),
  body('state').optional().isLength({ min: 2, max: 2 }).withMessage('Estado deve ter 2 caracteres'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const customerData = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone.replace(/\D/g, ''), // Remove caracteres não numéricos
    mobilePhone: req.body.phone.replace(/\D/g, ''),
    postalCode: req.body.postalCode?.replace(/\D/g, ''),
    address: req.body.address,
    city: req.body.city,
    state: req.body.state,
    observations: req.body.observations || `Cliente criado via Sistema Alencar - ${new Date().toISOString()}`
  };

  const customer = await asaasService.findOrCreateCustomer(customerData);

  logger.info('Cliente processado via API', {
    customerId: customer.id,
    email: customer.email,
    action: 'create_or_update'
  });

  res.status(200).json({
    success: true,
    data: customer,
    timestamp: new Date().toISOString()
  });
}));

/**
 * POST /api/asaas/payments
 * Cria um pagamento
 */
router.post('/payments', [
  requireAsaasConfig,
  body('customer').notEmpty().withMessage('ID do cliente é obrigatório'),
  body('value').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que 0'),
  body('dueDate').isISO8601().withMessage('Data de vencimento inválida'),
  body('billingType').isIn(['BOLETO', 'CREDIT_CARD', 'PIX', 'UNDEFINED']).withMessage('Tipo de cobrança inválido'),
  body('description').optional().isLength({ max: 500 }).withMessage('Descrição muito longa'),
  body('externalReference').optional().isLength({ max: 50 }).withMessage('Referência externa muito longa'),
  body('installmentCount').optional().isInt({ min: 1, max: 12 }).withMessage('Número de parcelas inválido'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const paymentData = {
    customer: req.body.customer,
    billingType: req.body.billingType,
    value: parseFloat(req.body.value),
    dueDate: req.body.dueDate,
    description: req.body.description,
    externalReference: req.body.externalReference,
    installmentCount: req.body.installmentCount,
    installmentValue: req.body.installmentCount ? 
      parseFloat(req.body.value) / parseInt(req.body.installmentCount) : undefined
  };

  // Adicionar configurações padrão de desconto, juros e multa
  if (req.body.includeDefaultSettings !== false) {
    paymentData.discount = {
      value: Math.round(paymentData.value * (ASAAS_CONFIG.defaultSettings.discountPercentage / 100) * 100) / 100,
      dueDateLimitDays: ASAAS_CONFIG.defaultSettings.discountDueDateLimitDays
    };
    
    paymentData.interest = {
      value: ASAAS_CONFIG.defaultSettings.interestPercentage
    };
    
    paymentData.fine = {
      value: ASAAS_CONFIG.defaultSettings.finePercentage
    };
  }

  const payment = await asaasService.createPayment(paymentData);

  logger.info('Pagamento criado via API', {
    paymentId: payment.id,
    customer: payment.customer,
    value: payment.value,
    billingType: payment.billingType
  });

  res.status(201).json({
    success: true,
    data: payment,
    timestamp: new Date().toISOString()
  });
}));

/**
 * POST /api/asaas/payment-links
 * Cria um link de pagamento usando a estrutura validada do CURL
 */
router.post('/payment-links', [
  requireAsaasConfig,
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('value').isFloat({ min: 0.01 }).withMessage('Valor deve ser maior que 0'),
  body('endDate').notEmpty().withMessage('Data de expiração é obrigatória'),
  body('billingType').notEmpty().withMessage('Tipo de cobrança é obrigatório'),
  body('chargeType').notEmpty().withMessage('Tipo de charge é obrigatório'),
  body('maxInstallmentCount').isInt({ min: 1, max: 12 }).withMessage('Número máximo de parcelas deve ser entre 1 e 12'),
  body('dueDateLimitDays').isInt({ min: 1 }).withMessage('Dias limite deve ser maior que 0'),
  body('callback.successUrl').isURL().withMessage('URL de sucesso deve ser válida'),
  body('callback.autoRedirect').isBoolean().withMessage('AutoRedirect deve ser um booleano'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  
  console.log('🎯 REQUEST RECEBIDO:', JSON.stringify(req.body, null, 2));

  // Os dados já vêm na estrutura correta do frontend
  const paymentData = req.body;

  console.log('📋 JSON PARA ASAAS:', JSON.stringify(paymentData, null, 2));
  console.log('🔑 API KEY:', process.env.ASAAS_API_KEY ? 'Configurada' : 'NÃO CONFIGURADA');
  console.log('🌐 URL ASAAS:', process.env.ASAAS_API_URL);

  try {
    // URL exata para criação de payment links
    const asaasUrl = 'https://api-sandbox.asaas.com/v3/paymentLinks';
    console.log('🎯 URL COMPLETA:', asaasUrl);

    // Usar o serviço do Asaas para criar o payment link
    const paymentLink = await asaasService.createDirectPaymentLink(paymentData);
    
    console.log('✅ ASAAS RESPONSE:', JSON.stringify(paymentLink, null, 2));

    // Retornar diretamente a resposta do Asaas (com success wrapper para consistência)
    const responseData = {
      success: true,
      data: paymentLink  // Retorna exatamente o que o Asaas enviou
    };

    console.log('📤 RESPONSE PARA FRONTEND:', JSON.stringify(responseData, null, 2));

    res.status(201).json(responseData);

  } catch (error) {
    console.error('💥 ERRO INTERNO:', error);
    res.status(500).json({ 
      success: false, 
      error: `Erro interno: ${error.message}` 
    });
  }
}));

/**
 * GET /api/asaas/payments/:id
 * Busca informações de um pagamento
 */
router.get('/payments/:id', [
  requireAsaasConfig,
  param('id').notEmpty().withMessage('ID do pagamento é obrigatório'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const payment = await asaasService.getPayment(req.params.id);

  res.json({
    success: true,
    data: payment,
    timestamp: new Date().toISOString()
  });
}));

/**
 * GET /api/asaas/customers/:id/payments
 * Lista pagamentos de um cliente
 */
router.get('/customers/:id/payments', [
  requireAsaasConfig,
  param('id').notEmpty().withMessage('ID do cliente é obrigatório'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limite deve ser entre 1 e 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset deve ser maior ou igual a 0'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const options = {
    limit: req.query.limit ? parseInt(req.query.limit) : 50,
    offset: req.query.offset ? parseInt(req.query.offset) : 0,
    status: req.query.status
  };

  const payments = await asaasService.getCustomerPayments(req.params.id, options);

  res.json({
    success: true,
    data: payments,
    timestamp: new Date().toISOString()
  });
}));

/**
 * DELETE /api/asaas/payments/:id
 * Cancela um pagamento
 */
router.delete('/payments/:id', [
  requireAsaasConfig,
  param('id').notEmpty().withMessage('ID do pagamento é obrigatório'),
  handleValidationErrors
], asyncHandler(async (req, res) => {
  const result = await asaasService.cancelPayment(req.params.id);

  logger.info('Pagamento cancelado via API', {
    paymentId: req.params.id
  });

  res.json({
    success: true,
    data: result,
    message: 'Pagamento cancelado com sucesso',
    timestamp: new Date().toISOString()
  });
}));

export default router;
