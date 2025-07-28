/**
 * Netlify Function para Backend do Sistema Alencar
 * Integração com API do Asaas via Netlify Serverless Functions
 */

import { handler as createHandler } from '@netlify/functions';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import winston from 'winston';
import asaasRoutes from '../../backend/routes/asaas.js';
import { errorHandler, notFound } from '../../backend/middleware/errorMiddleware.js';

// Carregar variáveis de ambiente
dotenv.config();

// Logger configurado para Netlify
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

// Criar app Express
const app = express();

// Middlewares básicos
app.use(helmet());
app.use(compression());

// CORS configurado para produção
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://*.netlify.app',
    'https://*.netlify.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'access_token']
}));

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting mais suave para serverless
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // 200 requests por IP
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend Alencar Orçamentos - Netlify Functions',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API do Asaas
app.use('/api/asaas', asaasRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Log de inicialização
logger.info('🚀 Netlify Function initialized', {
  environment: process.env.NODE_ENV || 'development',
  timestamp: new Date().toISOString()
});

// Converter Express app para Netlify Function
import serverless from 'serverless-http';
export const handler = serverless(app);
