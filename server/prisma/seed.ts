import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── Usuários ──────────────────────────────────────────────────────────────
  const adminHash   = await bcrypt.hash('admin123', 10)
  const userHash    = await bcrypt.hash('user123', 10)
  const premiumHash = await bcrypt.hash('premium123', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@poussin.dev' },
    update: {},
    create: { name: 'Admin', email: 'admin@poussin.dev', password_hash: adminHash, role: 'ADMIN', is_premium: true },
  })

  const userFree = await prisma.user.upsert({
    where: { email: 'user@poussin.dev' },
    update: {},
    create: { name: 'Usuário Free', email: 'user@poussin.dev', password_hash: userHash },
  })

  const userPremium = await prisma.user.upsert({
    where: { email: 'premium@poussin.dev' },
    update: {},
    create: { name: 'Usuário Premium', email: 'premium@poussin.dev', password_hash: premiumHash, is_premium: true },
  })

  console.log('✅ Usuários criados:', admin.email, userFree.email, userPremium.email)

  // ── Trilha 1 — Fundamentos do JavaScript ─────────────────────────────────
  const trail1 = await prisma.trail.upsert({
    where: { slug: 'fundamentos-javascript' },
    update: {},
    create: {
      title: 'Fundamentos do JavaScript',
      description: 'Aprenda os conceitos essenciais do JavaScript do zero.',
      slug: 'fundamentos-javascript',
      difficulty: 'BEGINNER',
      is_premium: false,
      order: 1,
    },
  })

  await prisma.activity.createMany({
    skipDuplicates: true,
    data: [
      {
        trail_id: trail1.id,
        title: 'Declarando variáveis',
        order: 1,
        type: 'FILL_BLANK',
        xp_reward: 10,
        payload: {
          question: 'Complete o código para declarar uma variável mutável:',
          code_snippet: '_____ nome = "João"',
          gaps: ['let'],
          explanation: "Usamos 'let' para declarar variáveis que podem ser reatribuídas.",
        },
      },
      {
        trail_id: trail1.id,
        title: 'Encontre o erro',
        order: 2,
        type: 'FIND_ERROR',
        xp_reward: 10,
        payload: {
          question: 'Qual linha contém o erro de sintaxe?',
          code_snippet: 'const x = 10;\nconsole.log(x\nconst y = 20;',
          options: [
            { text: 'Linha 1: const x = 10;', isCorrect: false },
            { text: 'Linha 2: console.log(x', isCorrect: true },
            { text: 'Linha 3: const y = 20;', isCorrect: false },
          ],
          explanation: "Falta fechar o parêntese: console.log(x) está incompleto.",
        },
      },
      {
        trail_id: trail1.id,
        title: 'Tipos de dados',
        order: 3,
        type: 'MULTIPLE_CHOICE',
        xp_reward: 10,
        payload: {
          question: 'Qual é o tipo do valor: typeof "Olá"?',
          options: [
            { text: 'string', isCorrect: true },
            { text: 'text', isCorrect: false },
            { text: 'char', isCorrect: false },
            { text: 'word', isCorrect: false },
          ],
          allow_multiple: false,
          explanation: "typeof retorna 'string' para qualquer texto entre aspas.",
        },
      },
    ],
  })

  console.log('✅ Trilha 1 criada com 3 atividades')

  // ── Trilha 2 — Arrays e Objetos ───────────────────────────────────────────
  const trail2 = await prisma.trail.upsert({
    where: { slug: 'arrays-e-objetos' },
    update: {},
    create: {
      title: 'Arrays e Objetos',
      description: 'Domine as estruturas de dados mais usadas no JavaScript.',
      slug: 'arrays-e-objetos',
      difficulty: 'BEGINNER',
      is_premium: false,
      order: 2,
      prerequisite_trail_id: trail1.id,
    },
  })

  await prisma.activity.createMany({
    skipDuplicates: true,
    data: [
      {
        trail_id: trail2.id,
        title: 'Criando um array',
        order: 1,
        type: 'FILL_BLANK',
        xp_reward: 10,
        payload: {
          question: 'Complete para criar um array com três frutas:',
          code_snippet: 'const frutas = ___["maçã", "banana", "uva"]',
          gaps: [''],
          explanation: 'Arrays são criados com colchetes []. Não é necessário nenhum símbolo antes deles.',
        },
      },
      {
        trail_id: trail2.id,
        title: 'Erro no objeto',
        order: 2,
        type: 'FIND_ERROR',
        xp_reward: 10,
        payload: {
          question: 'Qual linha tem erro na declaração do objeto?',
          code_snippet: 'const pessoa = {\n  nome: "Ana",\n  idade = 25,\n  cidade: "SP"\n}',
          options: [
            { text: 'nome: "Ana"', isCorrect: false },
            { text: 'idade = 25', isCorrect: true },
            { text: 'cidade: "SP"', isCorrect: false },
          ],
          explanation: 'Propriedades de objetos usam dois-pontos (:), não sinal de igual (=).',
        },
      },
      {
        trail_id: trail2.id,
        title: 'Método de array',
        order: 3,
        type: 'MULTIPLE_CHOICE',
        xp_reward: 10,
        payload: {
          question: 'Qual método remove o último elemento de um array?',
          options: [
            { text: 'array.pop()', isCorrect: true },
            { text: 'array.push()', isCorrect: false },
            { text: 'array.shift()', isCorrect: false },
            { text: 'array.slice()', isCorrect: false },
          ],
          allow_multiple: false,
          explanation: 'pop() remove e retorna o último elemento. push() adiciona.',
        },
      },
    ],
  })

  console.log('✅ Trilha 2 criada com 3 atividades')

  // ── Trilha 3 — React Basics ───────────────────────────────────────────────
  const trail3 = await prisma.trail.upsert({
    where: { slug: 'react-basics' },
    update: {},
    create: {
      title: 'React Basics',
      description: 'Construa interfaces modernas com React.',
      slug: 'react-basics',
      difficulty: 'INTERMEDIATE',
      is_premium: true,
      order: 3,
      prerequisite_trail_id: trail2.id,
    },
  })

  await prisma.activity.createMany({
    skipDuplicates: true,
    data: [
      {
        trail_id: trail3.id,
        title: 'Criando um componente',
        order: 1,
        type: 'FILL_BLANK',
        xp_reward: 15,
        payload: {
          question: 'Complete para criar um componente funcional React:',
          code_snippet: '_____ function Botao() {\n  return <button>Clique</button>\n}',
          gaps: ['export default'],
          explanation: "'export default' exporta o componente para ser usado em outros arquivos.",
        },
      },
      {
        trail_id: trail3.id,
        title: 'Erro no JSX',
        order: 2,
        type: 'FIND_ERROR',
        xp_reward: 15,
        payload: {
          question: 'Qual linha tem erro no JSX?',
          code_snippet: 'function App() {\n  return (\n    <div class="container">\n      <h1>Olá</h1>\n    </div>\n  )\n}',
          options: [
            { text: '<div class="container">', isCorrect: true },
            { text: '<h1>Olá</h1>', isCorrect: false },
            { text: 'return (', isCorrect: false },
          ],
          explanation: 'Em JSX usa-se className no lugar de class, pois class é palavra reservada no JS.',
        },
      },
      {
        trail_id: trail3.id,
        title: 'Hook useState',
        order: 3,
        type: 'MULTIPLE_CHOICE',
        xp_reward: 15,
        payload: {
          question: 'O que o hook useState retorna?',
          options: [
            { text: 'Um array com o valor atual e uma função para atualizá-lo', isCorrect: true },
            { text: 'Apenas o valor atual do estado', isCorrect: false },
            { text: 'Um objeto com get e set', isCorrect: false },
            { text: 'Uma Promise com o novo estado', isCorrect: false },
          ],
          allow_multiple: false,
          explanation: 'useState retorna [valor, setValor]. Desestruturamos para nomear cada um.',
        },
      },
    ],
  })

  console.log('✅ Trilha 3 criada com 3 atividades')

  // ── Badges ────────────────────────────────────────────────────────────────
  await prisma.badge.createMany({
    skipDuplicates: true,
    data: [
      { name: 'Primeira Chama',   icon: '🔥', description: 'Manteve streak por 3 dias',    condition_type: 'STREAK',          condition_value: 3   },
      { name: 'Semana de Fogo',   icon: '⚡', description: 'Manteve streak por 7 dias',    condition_type: 'STREAK',          condition_value: 7   },
      { name: 'Primeiros Passos', icon: '🏅', description: 'Concluiu a primeira trilha',   condition_type: 'TRAIL_COMPLETED', condition_value: 1   },
      { name: '500XP',            icon: '💎', description: 'Acumulou 500 pontos de XP',    condition_type: 'XP',              condition_value: 500 },
    ],
  })

  console.log('✅ Badges criados')
  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
