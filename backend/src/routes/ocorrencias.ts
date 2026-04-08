import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middleware';
import * as ctrl from '../controllers/ocorrencias.controller';
const router = Router();
router.use(authMiddleware);
router.get('/', ctrl.listar);
router.post('/', ctrl.criar);
router.patch('/:id/status', ctrl.atualizarStatus);
export default router;
