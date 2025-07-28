/**
 * Middleware para tratamento de erros
 * Padroniza respostas de erro e logging
 */

import winston from 'winston';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log' })
  ]
});

/**
 * Middleware para endpoints não encontrados
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Endpoint não encontrado: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Middleware global de tratamento de erros
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;
  let details = null;

  // Log do erro
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Tratamento específico para diferentes tipos de erro
  
  // Erro de validação do Joi
  if (err.isJoi) {
    statusCode = 400;
    message = 'Dados inválidos';
    details = err.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
  }
  
  // Erro de validação do express-validator
  if (err.type === 'validation') {
    statusCode = 400;
    message = 'Dados inválidos';
    details = err.errors;
  }
  
  // Erro de timeout
  if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
    statusCode = 408;
    message = 'Timeout na requisição - tente novamente';
  }
  
  // Erro de conexão
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    statusCode = 503;
    message = 'Serviço temporariamente indisponível';
  }
  
  // Erro específico do Asaas
  if (err.isAsaasError) {
    statusCode = err.statusCode || 400;
    message = err.message;
    details = err.errors;
  }

  // Em desenvolvimento, incluir stack trace
  const response = {
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      statusCode,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      timestamp: new Date().toISOString()
    }
  };

  res.status(statusCode).json(response);
};

/**
 * Wrapper para capturar erros assíncronos
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Classe para erros customizados do Asaas
 */
export class AsaasError extends Error {
  constructor(message, statusCode = 400, errors = null) {
    super(message);
    this.name = 'AsaasError';
    this.statusCode = statusCode;
    this.errors = errors;
    this.isAsaasError = true;
  }
}

/**
 * Função helper para criar erro padronizado
 */
export const createError = (message, statusCode = 500, code = 'INTERNAL_ERROR') => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};
