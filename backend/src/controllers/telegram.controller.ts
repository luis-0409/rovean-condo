import { Request, Response } from 'express';
import { processarUpdate } from '../services/telegram-bot.service';

export async function receberUpdate(req: Request, res: Response) {
  const { chatId, texto, callbackData, callbackQueryId } = req.body;
  if (!chatId) return res.status(400).json({ success: false, message: 'chatId obrigatório.' });

  // Responde imediatamente para o n8n não dar timeout
  res.json({ success: true });

  // Processa de forma assíncrona
  processarUpdate(String(chatId), texto, callbackData, callbackQueryId).catch(console.error);
}
