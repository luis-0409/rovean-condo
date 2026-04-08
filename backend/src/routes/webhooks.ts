import { Router } from 'express';
import * as ctrl from '../controllers/webhooks.controller';
const router = Router();
router.post('/encomenda-notificar', ctrl.notificarEncomendaWebhook);
router.post('/reserva-bot', ctrl.reservaBot);
router.get('/disponibilidade', ctrl.disponibilidadeWebhook);
router.get('/telegram-identifica', ctrl.telegramIdentifica);
export default router;
