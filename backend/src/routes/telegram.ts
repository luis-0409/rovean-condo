import { Router } from 'express';
import { receberUpdate } from '../controllers/telegram.controller';
const router = Router();
router.post('/update', receberUpdate);
export default router;
