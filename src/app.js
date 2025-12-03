// src/app.js
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Ping simple
app.get('/', (req, res) => {
  res.json({ message: 'API ExamenRegu funcionando (Etapa 1)' });
});

// Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejo de errores genérico
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ message: 'Error interno del servidor' });
});

export default app;
