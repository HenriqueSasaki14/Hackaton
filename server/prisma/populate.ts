import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function upsertActivity(trailId: string, data: {
  title: string
  type: 'FILL_BLANK' | 'FIND_ERROR' | 'MULTIPLE_CHOICE'
  xp_reward: number
  payload: object
}) {
  const exists = await prisma.activity.findFirst({
    where: { trail_id: trailId, title: data.title },
  })
  if (exists) return false

  const agg = await prisma.activity.aggregate({
    where: { trail_id: trailId },
    _max: { order: true },
  })

  await prisma.activity.create({
    data: { ...data, trail_id: trailId, order: (agg._max.order ?? 0) + 1 },
  })
  return true
}

async function populate(slug: string, activities: Parameters<typeof upsertActivity>[1][]) {
  const trail = await prisma.trail.findUnique({ where: { slug } })
  if (!trail) { console.warn(`Trilha não encontrada: ${slug}`); return }

  let added = 0
  for (const act of activities) {
    const created = await upsertActivity(trail.id, act)
    if (created) added++
  }
  const total = await prisma.activity.count({ where: { trail_id: trail.id } })
  console.log(`  "${trail.title}": +${added} novas (total: ${total})`)
}

async function main() {
  console.log('🌱 Populando atividades extras...\n')

  // ──────────────────────────────────────────────────────────────────────────
  // TRILHA 1 — Fundamentos do JavaScript
  // ──────────────────────────────────────────────────────────────────────────
  await populate('fundamentos-javascript', [
    {
      title: 'Declarando constantes',
      type: 'FILL_BLANK',
      xp_reward: 10,
      payload: {
        question: 'Qual palavra-chave declara um valor que não pode ser reatribuído?',
        code_snippet: '_____ PI = 3.14159',
        options: [
          { text: 'const',   isCorrect: true  },
          { text: 'let',     isCorrect: false },
          { text: 'var',     isCorrect: false },
          { text: 'static',  isCorrect: false },
        ],
        explanation: "'const' cria um vínculo constante. Tentar reatribuí-la lança TypeError em tempo de execução.",
      },
    },
    {
      title: 'Comparação estrita vs solta',
      type: 'MULTIPLE_CHOICE',
      xp_reward: 10,
      payload: {
        question: 'Qual é o resultado de: 0 == false?',
        options: [
          { text: 'true  — == faz coerção de tipos',                              isCorrect: true  },
          { text: 'false — 0 e false são tipos diferentes',                       isCorrect: false },
          { text: 'undefined — não é possível comparar número com booleano',      isCorrect: false },
          { text: 'TypeError — tipos incompatíveis',                              isCorrect: false },
        ],
        explanation: "0 == false é true porque == converte false para 0. Use === para evitar surpresas: 0 === false é false.",
      },
    },
    {
      title: 'Erro na variável',
      type: 'FIND_ERROR',
      xp_reward: 10,
      payload: {
        question: 'Qual linha causa um erro ao tentar reatribuir uma constante?',
        code_snippet: 'const nome = "Maria"\nlet idade = 30\nnome = "Ana"\nidade = 31',
        options: [
          { text: 'const nome = "Maria"', isCorrect: false },
          { text: 'let idade = 30',       isCorrect: false },
          { text: 'nome = "Ana"',         isCorrect: true  },
          { text: 'idade = 31',           isCorrect: false },
        ],
        explanation: "Reatribuir uma const gera TypeError: Assignment to constant variable. 'let' pode ser reatribuído normalmente.",
      },
    },
    {
      title: 'Operador ternário',
      type: 'FILL_BLANK',
      xp_reward: 10,
      payload: {
        question: 'Complete com o operador que funciona como um if/else em linha:',
        code_snippet: 'const status = idade >= 18 _____ "adulto" : "menor"',
        options: [
          { text: '?',    isCorrect: true  },
          { text: ':',    isCorrect: false },
          { text: '&&',   isCorrect: false },
          { text: '||',   isCorrect: false },
        ],
        explanation: "O ternário segue o padrão condição ? valorSeVerdadeiro : valorSeFalso. O '?' separa a condição do valor verdadeiro.",
      },
    },
    {
      title: 'Escopo de variável',
      type: 'MULTIPLE_CHOICE',
      xp_reward: 10,
      payload: {
        question: 'O que acontece ao acessar uma variável let fora do bloco onde foi declarada?',
        options: [
          { text: 'ReferenceError — let tem escopo de bloco',           isCorrect: true  },
          { text: 'undefined — a variável existe mas sem valor',         isCorrect: false },
          { text: 'null — valor padrão fora do escopo',                  isCorrect: false },
          { text: 'Funciona normalmente — escopo é a função inteira',    isCorrect: false },
        ],
        explanation: "let e const têm escopo de bloco ({}). var tem escopo de função. Acessar let fora do bloco lança ReferenceError.",
      },
    },
  ])

  // ──────────────────────────────────────────────────────────────────────────
  // TRILHA 2 — Arrays e Objetos
  // ──────────────────────────────────────────────────────────────────────────
  await populate('arrays-e-objetos', [
    {
      title: 'Array.map()',
      type: 'FILL_BLANK',
      xp_reward: 10,
      payload: {
        question: 'Qual método transforma cada elemento retornando um NOVO array?',
        code_snippet: 'const dobros = numeros._____(n => n * 2)',
        options: [
          { text: 'map',     isCorrect: true  },
          { text: 'filter',  isCorrect: false },
          { text: 'forEach', isCorrect: false },
          { text: 'find',    isCorrect: false },
        ],
        explanation: "map() retorna um novo array com o mesmo número de elementos, cada um transformado pela função. forEach() faz o loop mas retorna undefined.",
      },
    },
    {
      title: 'Array.filter()',
      type: 'MULTIPLE_CHOICE',
      xp_reward: 10,
      payload: {
        question: 'O que Array.filter() retorna?',
        options: [
          { text: 'Um novo array com os elementos que passaram no teste', isCorrect: true  },
          { text: 'O primeiro elemento que passou no teste',              isCorrect: false },
          { text: 'true ou false',                                        isCorrect: false },
          { text: 'O índice do primeiro elemento que passou',             isCorrect: false },
        ],
        explanation: "filter() retorna um novo array (possivelmente vazio) com todos os elementos onde a callback retornou true. Use find() se quiser só o primeiro.",
      },
    },
    {
      title: 'Spread incorreto',
      type: 'FIND_ERROR',
      xp_reward: 10,
      payload: {
        question: 'Qual linha tem erro na sintaxe de spread?',
        code_snippet: 'const a = { x: 1, y: 2 }\nconst b = { ...a, z: 3 }\nconst c = { a..., w: 4 }',
        options: [
          { text: 'const b = { ...a, z: 3 }', isCorrect: false },
          { text: 'const c = { a..., w: 4 }', isCorrect: true  },
          { text: 'const a = { x: 1, y: 2 }', isCorrect: false },
        ],
        explanation: "A sintaxe correta é { ...variavel }. O operador ... vem ANTES do nome: { ...a }. Escrever { a... } é inválido.",
      },
    },
    {
      title: 'Destructuring de objeto',
      type: 'FILL_BLANK',
      xp_reward: 10,
      payload: {
        question: 'Complete para extrair nome e cidade do objeto com destructuring:',
        code_snippet: 'const usuario = { nome: "Bia", cidade: "SP", age: 25 }\nconst { _____ } = usuario',
        options: [
          { text: 'nome, cidade',              isCorrect: true  },
          { text: '[nome, cidade]',             isCorrect: false },
          { text: 'usuario.nome, usuario.cidade', isCorrect: false },
          { text: '"nome", "cidade"',           isCorrect: false },
        ],
        explanation: "Destructuring de objeto usa chaves {}: const { nome, cidade } = usuario. Equivale a const nome = usuario.nome; const cidade = usuario.cidade.",
      },
    },
    {
      title: 'reduce()',
      type: 'MULTIPLE_CHOICE',
      xp_reward: 10,
      payload: {
        question: 'Qual é o resultado de [1, 2, 3, 4].reduce((acc, n) => acc + n, 0)?',
        options: [
          { text: '10', isCorrect: true  },
          { text: '[1, 2, 3, 4]', isCorrect: false },
          { text: '4',  isCorrect: false },
          { text: '0',  isCorrect: false },
        ],
        explanation: "reduce() acumula: 0+1=1, 1+2=3, 3+3=6, 6+4=10. O segundo argumento de reduce (0) é o valor inicial do acumulador.",
      },
    },
  ])

  // ──────────────────────────────────────────────────────────────────────────
  // TRILHA 3 — React Basics
  // ──────────────────────────────────────────────────────────────────────────
  await populate('react-basics', [
    {
      title: 'Atualizando estado',
      type: 'FILL_BLANK',
      xp_reward: 15,
      payload: {
        question: 'Complete com o nome correto da função que atualiza o estado:',
        code_snippet: 'const [count, _____] = useState(0)',
        options: [
          { text: 'setCount',    isCorrect: true  },
          { text: 'getCount',    isCorrect: false },
          { text: 'updateCount', isCorrect: false },
          { text: 'setState',    isCorrect: false },
        ],
        explanation: "Convenção: a função de atualização leva o prefixo 'set'. useState retorna [valorAtual, funcaoAtualizadora]. setState é de class components, não hooks.",
      },
    },
    {
      title: 'Passando props',
      type: 'MULTIPLE_CHOICE',
      xp_reward: 15,
      payload: {
        question: 'Como um componente filho recebe dados do componente pai?',
        options: [
          { text: 'Por props — passadas como atributos JSX',  isCorrect: true  },
          { text: 'Por variáveis globais',                    isCorrect: false },
          { text: 'Por localStorage',                        isCorrect: false },
          { text: 'Por querySelector no DOM',                isCorrect: false },
        ],
        explanation: "Props fluem de pai para filho: <Filho nome='Ana' />. O filho acessa via props.nome ou desestruturando: function Filho({ nome }).",
      },
    },
    {
      title: 'useEffect sem dependências',
      type: 'FIND_ERROR',
      xp_reward: 15,
      payload: {
        question: 'Qual é o problema neste useEffect?',
        code_snippet: 'useEffect(() => {\n  fetch(`/api/usuario/${userId}`)\n    .then(r => r.json())\n    .then(setUsuario)\n})',
        options: [
          { text: 'fetch não pode ser usado dentro de useEffect',     isCorrect: false },
          { text: 'Falta o array de dependências [userId]',           isCorrect: true  },
          { text: 'useEffect não aceita função assíncrona implícita', isCorrect: false },
        ],
        explanation: "Sem array de dependências, useEffect roda após CADA render — loop infinito se setar estado. Com [userId] roda só quando userId mudar.",
      },
    },
    {
      title: 'Evento onClick em JSX',
      type: 'FILL_BLANK',
      xp_reward: 15,
      payload: {
        question: 'Complete com o atributo JSX correto para capturar clique:',
        code_snippet: '<button _____={() => enviar()}>\n  Enviar\n</button>',
        options: [
          { text: 'onClick',          isCorrect: true  },
          { text: 'onclick',          isCorrect: false },
          { text: 'on-click',         isCorrect: false },
          { text: 'addEventListener', isCorrect: false },
        ],
        explanation: "Em JSX os eventos são sempre camelCase: onClick, onChange, onSubmit. No HTML puro seria onclick — mas React usa a convenção camelCase.",
      },
    },
    {
      title: 'Prop key em listas',
      type: 'MULTIPLE_CHOICE',
      xp_reward: 15,
      payload: {
        question: 'Por que a prop key é obrigatória em listas renderizadas com .map()?',
        options: [
          { text: 'Ajuda o React a identificar quais itens mudaram, foram adicionados ou removidos', isCorrect: true  },
          { text: 'É necessária para aplicar CSS em cada item',                                      isCorrect: false },
          { text: 'É exigida pelo JavaScript para arrays',                                           isCorrect: false },
          { text: 'Permite acessar o elemento via getElementById',                                   isCorrect: false },
        ],
        explanation: "key é usada na reconciliação do Virtual DOM. Sem key React recria todos os nós. Com key estável ele reutiliza os que não mudaram, melhorando performance.",
      },
    },
  ])

  console.log('\n🎉 Populate concluído com sucesso!')
}

main()
  .catch(e => { console.error('❌ Erro:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
