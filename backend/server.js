/**
 * Backend para integração com API do Asaas
 * Sistema Alencar Orçamentos
 * 
 * Este servidor Express atua como proxy seguro entre o frontend e a API do Asaas,
 * resolvendo problemas de CORS e fornecendo uma camada adicional de segurança.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import winston from 'winston';
import asaasRoutes from './routes/asaas.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import { validateAsaasConfig } from './config/asaas.js';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting - máximo 100 requests por 15 minutos por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por windowMs
  message: {
    error: 'Muitas requisições deste IP, tente novamente em 15 minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting mais restritivo para endpoints de pagamento
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 requests de pagamento por windowMs
  message: {
    error: 'Limite de criação de links de pagamento excedido, tente novamente em 15 minutos.',
    code: 'PAYMENT_RATE_LIMIT_EXCEEDED'
  }
});

// Middlewares de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configurado para desenvolvimento e produção
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de origens permitidas
    const allowedOrigins = [
      'http://localhost:5173',  // Vite dev server
      'http://localhost:3000',  // React dev server
      'http://127.0.0.1:5173', // Vite dev server (IP)
      'http://127.0.0.1:3000', // React dev server (IP)
      process.env.FRONTEND_URL // URL de produção do frontend
    ].filter(Boolean); // Remove valores undefined

    // Permitir requests sem origin (ex: mobile apps, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS bloqueou origem: ${origin}`);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

app.use(cors(corsOptions));

// Middlewares gerais
app.use(compression()); // Compressão gzip
app.use(limiter); // Rate limiting global
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } })); // Logging de requests
app.use(express.json({ limit: '10mb' })); // Parse JSON com limite de tamanho
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'Backend funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    asaasConfigured: validateAsaasConfig()
  };
  
  res.status(200).json(healthCheck);
});

// Endpoint para validar configuração do Asaas
app.get('/api/asaas/config', (req, res) => {
  const isConfigured = validateAsaasConfig();
  const apiKey = process.env.ASAAS_API_KEY;
  
  res.json({
    configured: isConfigured,
    environment: apiKey?.startsWith('$aact_') ? 'sandbox' : 'production',
    keyLength: apiKey?.length || 0,
    timestamp: new Date().toISOString()
  });
});

// Rotas da API Asaas
app.use('/api/asaas', paymentLimiter, asaasRoutes);

// Rota catch-all para endpoints não encontrados
app.use(notFound);

// Middleware de tratamento de erros
app.use(errorHandler);

// Função para inicializar o servidor
const startServer = async () => {
  try {
    // Verificar configuração do Asaas
    if (!validateAsaasConfig()) {
      logger.warn('⚠️  Chave da API do Asaas não configurada. Configure ASAAS_API_KEY no arquivo .env');
      logger.warn('📝 O servidor continuará funcionando, mas as requisições para Asaas falharão');
    } else {
      logger.info('✅ Configuração do Asaas validada com sucesso');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor rodando na porta ${PORT}`);
      logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔧 Config check: http://localhost:${PORT}/api/asaas/config`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`📚 Documentação da API: http://localhost:${PORT}/api/docs`);
      }
    });

  } catch (error) {
    logger.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de sinais do sistema para graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido, encerrando servidor...');
  process.exit(0);
});

// Tratamento de exceções não capturadas
process.on('uncaughtException', (error) => {
  logger.error('Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Inicializar servidor
startServer();

export default app;
