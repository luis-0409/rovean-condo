import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as ctrl from '../controllers/acessos.controller';
const router = Router();
router.use(authMiddleware);
router.get('/', ctrl.listar);
router.post('/', ctrl.criar);
router.patch('/:id/saida', ctrl.registrarSaida);
export default router;
