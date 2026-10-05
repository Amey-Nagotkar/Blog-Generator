import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import keywordsRouter from './routes/keywords.js';
import outlineRouter from './routes/outline.js';
import draftRouter from './routes/draft.js';
import scoreRouter from './routes/score.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root .env first, fallback to local
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

const app = express();

// Trust proxy for Render / reverse proxy deployments
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Mock mode header middleware: client can override per request with X-Mock-Mode
app.use((req, res, next) => {
  const headerVal = req.headers['x-mock-mode'];
  if (headerVal !== undefined) {
    req.isMockMode = headerVal === 'true' || headerVal === true;
  } else {
    req.isMockMode = process.env.MOCK_MODE === 'true' || !process.env.GEMINI_API_KEY;
  }
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim() &&
    process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here'
  );
  const defaultMockMode = process.env.MOCK_MODE === 'true' || !hasKey;

  res.json({
    status: 'ok',
    defaultMockMode,
    liveAvailable: hasKey,
    model: process.env.GEMINI_MODEL || '',
  });
});

// API Routes
app.use('/api', keywordsRouter);
app.use('/api', outlineRouter);
app.use('/api', draftRouter);
app.use('/api', scoreRouter);

// 404 handler for unknown API routes (must return JSON, never HTML)
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
    },
  });
});

// Serve the built React client if the dist directory exists (single production deployment on Render)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
const clientDistExists = fs.existsSync(clientDistPath);

if (clientDistExists) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized JSON Error Handler
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Client build found: ${clientDistExists} at ${clientDistPath}`);
  console.log(`LLM Model: ${process.env.GEMINI_MODEL || 'Not set'}`);
  console.log(`Default Mock Mode: ${process.env.MOCK_MODE === 'true' || !process.env.GEMINI_API_KEY}`);
});

export default app;
