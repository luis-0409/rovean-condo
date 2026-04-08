import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth';
import moradoresRoutes from './routes/moradores';
import encomendasRoutes from './routes/encomendas';
import reservasRoutes from './routes/reservas';
import ocorrenciasRoutes from './routes/ocorrencias';
import acessosRoutes from './routes/acessos';
import dashboardRoutes from './routes/dashboard';
import webhooksRoutes from './routes/webhooks';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/moradores', moradoresRoutes);
app.use('/api/v1/encomendas', encomendasRoutes);
app.use('/api/v1/reservas', reservasRoutes);
app.use('/api/v1/ocorrencias', ocorrenciasRoutes);
app.use('/api/v1/acessos', acessosRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/webhooks', webhooksRoutes);

app.use(errorHandler);

app.listen(PORT, () => console.log(`Rovean Condo API running on port ${PORT}`));

export default app;
