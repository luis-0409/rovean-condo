import { Router } from 'express';
import { validarConvite, listarConvites } from '../controllers/convites.controller';
const router = Router();
router.post('/validar', validarConvite);
router.get('/', listarConvites);
export default router;
