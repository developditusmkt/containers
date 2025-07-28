/**
 * Netlify Function para Backend do Sistema Alencar
 * Integração com API do Asaas via Netlify Serverless Functions
 */

import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas do backend (ajustar path relativo)
const createAsaasRoutes = () => {
  const router = express.Router();
  
  // Health check
  router.get('/health', (req, res) => {
    res.json({
      success: true,
      message: 'Backend Alencar Orçamentos - Netlify Functions',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });
  
  // Middleware para validar API key
  const validateApiKey = (req, res, next) => {
    if (!process.env.ASAAS_API_KEY) {
      return res.status(503).json({
        success: false,
        error: {
          message: 'API Key do Asaas não configurada',
          code: 'ASAAS_NOT_CONFIGURED'
        }
      });
    }
    next();
  };
  
  // Endpoint para criar payment links
  router.post('/asaas/payment-links', validateApiKey, async (req, res) => {
    try {
      console.log('🎯 Criando payment link via Netlify Function');
      
      const paymentData = req.body;
      
      // Importar dinamicamente o axios para evitar problemas de ES modules
      const axios = (await import('axios')).default;
      
      const response = await axios.post(
        'https://api-sandbox.asaas.com/v3/paymentLinks',
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'access_token': process.env.ASAAS_API_KEY
          }
        }
      );
      
      res.status(201).json({
        success: true,
        data: response.data
      });
      
    } catch (error) {
      console.error('Erro na API Asaas:', error.response?.data || error.message);
      
      res.status(500).json({
        success: false,
        error: error.response?.data || { message: error.message }
      });
    }
  });
  
  return router;
};

// Criar app Express
const app = express();

// CORS configurado
app.use(cors({
  origin: true,
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Usar as rotas
app.use('/', createAsaasRoutes());

// Converter Express app para Netlify Function
export const handler = serverless(app);
