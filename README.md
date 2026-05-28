# Poussin Learning

Plataforma gamificada de ensino de programação.

## Setup

### Requisitos
- Node.js 18+
- PostgreSQL rodando localmente

### Backend
cd server
cp ../.env.example .env
# edite server/.env com suas credenciais
npm install
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts

### Frontend
cd client
npm install
npm run dev
