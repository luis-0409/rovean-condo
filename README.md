# Rovean Condo

Sistema de Gestão de Condomínios — Alphaville Eusébio · Bloco Mediterrâneo

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Estrutura

```
rovean-condo-v2/
├── backend/   Express + Prisma + PostgreSQL
└── frontend/  Next.js 14 + TailwindCSS
```

## Configuração

### Backend

```bash
cd backend
cp .env .env.local   # edite com suas credenciais
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

**Variáveis de ambiente (`backend/.env`):**

```
DATABASE_URL="postgresql://user:password@localhost:5432/rovean_condo"
JWT_SECRET="rovean_jwt_secret_key"
JWT_EXPIRES_IN="7d"
TELEGRAM_BOT_TOKEN=""
WEBHOOK_SECRET="rovean_webhook_secret"
PORT=3333
FRONTEND_URL=http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

**Variáveis de ambiente (`frontend/.env.local`):**

```
NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1
```

## Credenciais de acesso (seed)

| Perfil   | Email                  | Senha        |
|----------|------------------------|--------------|
| ADMIN    | admin@rovean.com       | rovean2024   |
| PORTEIRO | porteiro@rovean.com    | porteiro123  |

## Executando

Terminal 1 — Backend:
```bash
cd backend && npm run dev
```

Terminal 2 — Frontend:
```bash
cd frontend && npm run dev
```

Acesse: http://localhost:3000

## Endpoints da API

| Método | Endpoint                          | Descrição                          | Auth    |
|--------|-----------------------------------|------------------------------------|---------|
| POST   | /api/v1/auth/login                | Login                              | Público |
| GET    | /api/v1/moradores                 | Listar moradores                   | JWT     |
| POST   | /api/v1/moradores                 | Criar morador                      | ADMIN   |
| PUT    | /api/v1/moradores/:id             | Editar morador                     | ADMIN   |
| DELETE | /api/v1/moradores/:id             | Desativar morador                  | ADMIN   |
| GET    | /api/v1/encomendas                | Listar encomendas                  | JWT     |
| POST   | /api/v1/encomendas                | Registrar encomenda                | JWT     |
| PATCH  | /api/v1/encomendas/:id/retirar    | Confirmar retirada                 | JWT     |
| GET    | /api/v1/reservas                  | Listar reservas                    | JWT     |
| GET    | /api/v1/reservas/disponibilidade  | Verificar disponibilidade          | JWT     |
| POST   | /api/v1/reservas                  | Criar reserva                      | JWT     |
| PATCH  | /api/v1/reservas/:id/cancelar     | Cancelar reserva                   | JWT     |
| GET    | /api/v1/ocorrencias               | Listar ocorrências                 | JWT     |
| POST   | /api/v1/ocorrencias               | Criar ocorrência                   | JWT     |
| PATCH  | /api/v1/ocorrencias/:id/status    | Atualizar status                   | JWT     |
| GET    | /api/v1/acessos                   | Listar acessos                     | JWT     |
| POST   | /api/v1/acessos                   | Registrar acesso                   | JWT     |
| PATCH  | /api/v1/acessos/:id/saida         | Registrar saída                    | JWT     |
| GET    | /api/v1/dashboard/resumo          | Resumo do dashboard                | JWT     |
| POST   | /api/v1/webhooks/encomenda-notificar | Notificar via Telegram          | Secret  |
| GET    | /api/v1/webhooks/disponibilidade  | Disponibilidade para bots          | Público |

## Telegram Bot

1. Crie um bot no @BotFather e copie o token
2. Adicione `TELEGRAM_BOT_TOKEN` no `.env` do backend
3. Para cada morador, configure o `telegramId` com o Chat ID do Telegram
4. O bot notifica automaticamente quando uma encomenda chega

## n8n Integration

Use os webhooks para integrar com n8n:

- **Notificar encomenda:** POST `/api/v1/webhooks/encomenda-notificar` com header `x-webhook-secret` e body `{ "encomendaId": 1 }`
- **Verificar disponibilidade:** GET `/api/v1/webhooks/disponibilidade?area=Churrasqueira&data=2024-12-25`
- **Reserva via bot:** POST `/api/v1/webhooks/reserva-bot` com header `x-webhook-secret`
