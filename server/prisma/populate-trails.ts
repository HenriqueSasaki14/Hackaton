import { PrismaClient, Difficulty } from '@prisma/client'

const prisma = new PrismaClient()

// ── helpers ──────────────────────────────────────────────────────────────────

async function upsertTrail(data: {
  title: string; description: string; slug: string
  difficulty: Difficulty; is_premium: boolean; order: number
  prerequisite_trail_id?: string; thumbnail_url?: string
}) {
  return prisma.trail.upsert({ where: { slug: data.slug }, update: {}, create: data })
}

async function addActivity(trailId: string, data: {
  title: string
  type: 'FILL_BLANK' | 'FIND_ERROR' | 'MULTIPLE_CHOICE'
  xp_reward: number
  payload: object
}) {
  const exists = await prisma.activity.findFirst({ where: { trail_id: trailId, title: data.title } })
  if (exists) return false
  const agg = await prisma.activity.aggregate({ where: { trail_id: trailId }, _max: { order: true } })
  await prisma.activity.create({ data: { ...data, trail_id: trailId, order: (agg._max.order ?? 0) + 1 } })
  return true
}

async function buildTrail(
  trailData: Parameters<typeof upsertTrail>[0],
  activities: Parameters<typeof addActivity>[1][]
) {
  const trail = await upsertTrail(trailData)
  let added = 0
  for (const act of activities) {
    if (await addActivity(trail.id, act)) added++
  }
  const total = await prisma.activity.count({ where: { trail_id: trail.id } })
  console.log(`  ✓ "${trail.title}" — +${added} novas (total: ${total} atividades)`)
  return trail
}

// ── slugs das trilhas base (para referência de pré-requisito) ─────────────────
const SLUG = {
  js1:   'fundamentos-javascript',
  js2:   'arrays-e-objetos',
  react: 'react-basics',
}

async function getTrailId(slug: string): Promise<string | undefined> {
  return (await prisma.trail.findUnique({ where: { slug }, select: { id: true } }))?.id
}

// =============================================================================
async function main() {
  console.log('🌱 Criando novas trilhas e atividades...\n')

  const idJS1   = await getTrailId(SLUG.js1)
  const idJS2   = await getTrailId(SLUG.js2)
  const idReact = await getTrailId(SLUG.react)

  // ── TRILHA 4: HTML & CSS Fundamentos ───────────────────────────────────────
  const t4 = await buildTrail(
    { title: 'HTML & CSS Fundamentos', slug: 'html-css-fundamentos', order: 4,
      difficulty: 'BEGINNER', is_premium: false,
      description: 'Construa páginas web do zero com HTML semântico e CSS moderno.' },
    [
      { title: 'Tags HTML básicas', type: 'FILL_BLANK', xp_reward: 10, payload: {
        question: 'Complete a tag correta para criar um parágrafo em HTML:',
        code_snippet: '<_____>Este é um parágrafo.</_____ >',
        options: [{ text: 'p', isCorrect: true }, { text: 'div', isCorrect: false }, { text: 'span', isCorrect: false }, { text: 'section', isCorrect: false }],
        explanation: "<p> é a tag semântica para parágrafo. <div> e <span> são contêineres genéricos sem semântica.",
      }},
      { title: 'Estrutura HTML', type: 'MULTIPLE_CHOICE', xp_reward: 10, payload: {
        question: 'Qual tag define o conteúdo visível de uma página HTML?',
        options: [{ text: '<body>', isCorrect: true }, { text: '<head>', isCorrect: false }, { text: '<html>', isCorrect: false }, { text: '<main>', isCorrect: false }],
        explanation: "<body> contém todo o conteúdo visível. <head> contém metadados como title, charset e links de CSS. <html> é a raiz de tudo.",
      }},
      { title: 'Erro em HTML', type: 'FIND_ERROR', xp_reward: 10, payload: {
        question: 'Qual linha tem erro de estrutura HTML?',
        code_snippet: '<ul>\n  <li>Item 1</li>\n  <p>Item 2</p>\n  <li>Item 3</li>\n</ul>',
        options: [
          { text: '<li>Item 1</li>',  isCorrect: false },
          { text: '<p>Item 2</p>',    isCorrect: true  },
          { text: '<li>Item 3</li>',  isCorrect: false },
        ],
        explanation: "Dentro de <ul> ou <ol> só podem existir elementos <li>. Usar <p> dentro de <ul> é inválido semanticamente.",
      }},
      { title: 'Seletor CSS', type: 'FILL_BLANK', xp_reward: 10, payload: {
        question: 'Complete o seletor CSS para estilizar TODOS os elementos <h2>:',
        code_snippet: '_____ {\n  color: navy;\n  font-size: 1.5rem;\n}',
        options: [{ text: 'h2', isCorrect: true }, { text: '.h2', isCorrect: false }, { text: '#h2', isCorrect: false }, { text: '*h2', isCorrect: false }],
        explanation: "Seletores de tag usam o nome do elemento diretamente. '.' seleciona classe, '#' seleciona id. 'h2' sem prefixo seleciona todos os <h2>.",
      }},
      { title: 'Box Model', type: 'MULTIPLE_CHOICE', xp_reward: 10, payload: {
        question: 'No CSS Box Model, qual propriedade define o espaço DENTRO da borda do elemento?',
        options: [{ text: 'padding', isCorrect: true }, { text: 'margin', isCorrect: false }, { text: 'border', isCorrect: false }, { text: 'gap', isCorrect: false }],
        explanation: "padding = espaço interno (entre conteúdo e borda). margin = espaço externo (entre borda e outros elementos). border = a própria borda.",
      }},
      { title: 'Cor de fundo', type: 'FILL_BLANK', xp_reward: 10, payload: {
        question: 'Complete a propriedade CSS para definir cor de fundo:',
        code_snippet: '.card {\n  ___________: #f0f4f8;\n  border-radius: 8px;\n}',
        options: [{ text: 'background-color', isCorrect: true }, { text: 'color', isCorrect: false }, { text: 'fill', isCorrect: false }, { text: 'bg-color', isCorrect: false }],
        explanation: "'background-color' define a cor de fundo. 'color' define a cor do texto. 'fill' é propriedade SVG.",
      }},
      { title: 'Erro em CSS', type: 'FIND_ERROR', xp_reward: 10, payload: {
        question: 'Qual linha contém um erro de sintaxe CSS?',
        code_snippet: '.botao {\n  background-color: blue\n  color: white;\n  padding: 12px 24px;\n}',
        options: [
          { text: 'background-color: blue',  isCorrect: true  },
          { text: 'color: white;',            isCorrect: false },
          { text: 'padding: 12px 24px;',      isCorrect: false },
        ],
        explanation: "Toda declaração CSS precisa terminar com ponto-e-vírgula (;). 'background-color: blue' sem ';' é inválido e pode corromper as regras seguintes.",
      }},
      { title: 'display inline vs block', type: 'MULTIPLE_CHOICE', xp_reward: 10, payload: {
        question: 'Qual é a diferença entre display: block e display: inline?',
        options: [
          { text: 'block ocupa toda a largura disponível; inline ocupa só o espaço do conteúdo', isCorrect: true  },
          { text: 'block é invisível; inline é visível',                                          isCorrect: false },
          { text: 'block permite padding; inline não permite nenhum estilo',                       isCorrect: false },
          { text: 'Não há diferença prática entre eles',                                          isCorrect: false },
        ],
        explanation: "block: ocupa 100% da largura, começa em nova linha (div, p, h1). inline: só o tamanho do conteúdo, fica na mesma linha (span, a, strong).",
      }},
    ]
  )

  // ── TRILHA 5: Lógica de Programação ────────────────────────────────────────
  await buildTrail(
    { title: 'Lógica de Programação', slug: 'logica-programacao', order: 5,
      difficulty: 'BEGINNER', is_premium: false,
      description: 'Desenvolva o raciocínio lógico e aprenda a resolver problemas com algoritmos.' },
    [
      { title: 'O que é um algoritmo', type: 'MULTIPLE_CHOICE', xp_reward: 10, payload: {
        question: 'Qual é a melhor definição de algoritmo?',
        options: [
          { text: 'Uma sequência finita de instruções para resolver um problema', isCorrect: true  },
          { text: 'Um programa de computador em linguagem de máquina',            isCorrect: false },
          { text: 'Um tipo de dado especial usado em linguagens de programação',  isCorrect: false },
          { text: 'Uma fórmula matemática para cálculos complexos',               isCorrect: false },
        ],
        explanation: "Algoritmo é uma receita com passos bem definidos, finitos e ordenados que resolvem um problema. Pode ser escrito em português, fluxograma ou código.",
      }},
      { title: 'Loop com contador', type: 'FILL_BLANK', xp_reward: 10, payload: {
        question: 'Complete o loop que imprime os números de 0 a 4:',
        code_snippet: 'for (let i = 0; i _____ 5; i++) {\n  console.log(i)\n}',
        options: [{ text: '<', isCorrect: true }, { text: '<=', isCorrect: false }, { text: '===', isCorrect: false }, { text: '>', isCorrect: false }],
        explanation: "i < 5 executa enquanto i é 0, 1, 2, 3, 4 — cinco iterações. i <= 5 executaria 6 vezes (0 a 5). Cuidado com off-by-one!",
      }},
      { title: 'Loop infinito', type: 'FIND_ERROR', xp_reward: 10, payload: {
        question: 'Qual linha cria um loop infinito neste código?',
        code_snippet: 'let i = 0\nwhile (i < 10) {\n  console.log(i)\n  i--\n}',
        options: [
          { text: 'while (i < 10)',  isCorrect: false },
          { text: 'console.log(i)', isCorrect: false },
          { text: 'i--',            isCorrect: true  },
        ],
        explanation: "i-- decrementa i: 0, -1, -2, -3... A condição i < 10 nunca se torna falsa. O correto seria i++ para que i eventualmente chegue a 10.",
      }},
      { title: 'Recursão', type: 'MULTIPLE_CHOICE', xp_reward: 10, payload: {
        question: 'O que é obrigatório em uma função recursiva para não causar stack overflow?',
        options: [
          { text: 'Um caso base que para a recursão',               isCorrect: true  },
          { text: 'O uso da palavra-chave return',                  isCorrect: false },
          { text: 'Ser definida com function (não arrow function)', isCorrect: false },
          { text: 'Receber pelo menos dois parâmetros',             isCorrect: false },
        ],
        explanation: "Toda recursão precisa de um caso base (condição de parada). Sem ele, a função chama a si mesma indefinidamente até estourar a call stack.",
      }},
      { title: 'Operador módulo', type: 'FILL_BLANK', xp_reward: 10, payload: {
        question: 'Complete com o operador que retorna o RESTO da divisão:',
        code_snippet: 'const ehPar = (n) => n _____ 2 === 0',
        options: [{ text: '%', isCorrect: true }, { text: '/', isCorrect: false }, { text: '//', isCorrect: false }, { text: '**', isCorrect: false }],
        explanation: "% é o operador módulo (resto da divisão). 10 % 2 = 0 (par). 7 % 2 = 1 (ímpar). // e ** não existem em JavaScript.",
      }},
      { title: 'Complexidade O(n)', type: 'MULTIPLE_CHOICE', xp_reward: 10, payload: {
        question: 'Um algoritmo O(n) significa que:',
        options: [
          { text: 'O tempo cresce proporcionalmente ao tamanho da entrada',    isCorrect: true  },
          { text: 'O algoritmo sempre termina em n milissegundos',             isCorrect: false },
          { text: 'O algoritmo usa n bytes de memória',                        isCorrect: false },
          { text: 'O algoritmo tem n linhas de código',                        isCorrect: false },
        ],
        explanation: "Notação Big-O descreve como o desempenho escala. O(n): se dobrar a entrada, dobra o tempo. O(1): tempo constante. O(n²): cresce quadraticamente.",
      }},
      { title: 'Condição aninhada', type: 'FIND_ERROR', xp_reward: 10, payload: {
        question: 'Qual é o erro lógico nesta função de classificação?',
        code_snippet: 'function classificar(n) {\n  if (n > 0) return "positivo"\n  if (n > 0) return "negativo"\n  return "zero"\n}',
        options: [
          { text: 'if (n > 0) return "positivo"', isCorrect: false },
          { text: 'if (n > 0) return "negativo"', isCorrect: true  },
          { text: 'return "zero"',                isCorrect: false },
        ],
        explanation: "A segunda condição deveria ser 'if (n < 0) return \"negativo\"'. Com n > 0 em ambas, o caso negativo nunca será alcançado.",
      }},
      { title: 'Busca linear', type: 'MULTIPLE_CHOICE', xp_reward: 10, payload: {
        question: 'Qual é a complexidade de tempo de uma busca linear em um array de n elementos?',
        options: [
          { text: 'O(n) — verifica cada elemento no pior caso',   isCorrect: true  },
          { text: 'O(1) — acesso direto por índice',              isCorrect: false },
          { text: 'O(log n) — divide o problema pela metade',     isCorrect: false },
          { text: 'O(n²) — compara todos com todos',              isCorrect: false },
        ],
        explanation: "Busca linear percorre o array do início ao fim: no pior caso o elemento está no final ou não existe — O(n). Busca binária em array ordenado é O(log n).",
      }},
    ]
  )

  // ── TRILHA 6: Git & GitHub ──────────────────────────────────────────────────
  await buildTrail(
    { title: 'Git & GitHub', slug: 'git-github', order: 6,
      difficulty: 'BEGINNER', is_premium: false,
      description: 'Versione seu código com Git e colabore em projetos com GitHub.' },
    [
      { title: 'Inicializando repositório', type: 'FILL_BLANK', xp_reward: 10, payload: {
        question: 'Qual comando inicializa um repositório Git em um diretório?',
        code_snippet: 'git _____',
        options: [{ text: 'init', isCorrect: true }, { text: 'start', isCorrect: false }, { text: 'create', isCorrect: false }, { text: 'new', isCorrect: false }],
        explanation: "'git init' cria um repositório Git vazio no diretório atual, gerando a pasta oculta .git com toda a estrutura de controle de versão.",
      }},
      { title: 'O que é um commit', type: 'MULTIPLE_CHOICE', xp_reward: 10, payload: {
        question: 'O que um git commit faz?',
        options: [
          { text: 'Salva um snapshot do estado atual dos arquivos rastreados', isCorrect: true  },
          { text: 'Envia as alterações para o repositório remoto',             isCorrect: false },
          { text: 'Cria uma nova branch',                                     isCorrect: false },
          { text: 'Baixa as últimas alterações do servidor',                  isCorrect: false },
        ],
        explanation: "commit salva o estado local com uma mensagem descritiva. Para enviar ao remote usa-se 'git push'. Para baixar usa-se 'git pull'.",
      }},
      { title: 'Sequência incorreta', type: 'FIND_ERROR', xp_reward: 10, payload: {
        question: 'Qual linha está na ordem errada para criar e enviar um commit?',
        code_snippet: 'git add .\ngit push origin main\ngit commit -m "feat: add login"',
        options: [
          { text: 'git add .',                      isCorrect: false },
          { text: 'git push origin main',           isCorrect: true  },
          { text: 'git commit -m "feat: add login"', isCorrect: false },
        ],
        explanation: "A ordem correta é: add → commit → push. Você precisa commitar antes de fazer push. A linha git push está antes do commit, o que causaria um erro.",
      }},
      { title: 'Criando branch', type: 'FILL_BLANK', xp_reward: 10, payload: {
        question: 'Complete o comando para criar E mudar para uma nova branch:',
        code_snippet: 'git checkout _____ feature/login',
        options: [{ text: '-b', isCorrect: true }, { text: '-n', isCorrect: false }, { text: '--new', isCorrect: false }, { text: 'create', isCorrect: false }],
        explanation: "'git checkout -b nome' cria e já muda para a nova branch em um só comando. Equivale a 'git branch nome' + 'git checkout nome'. No Git moderno: 'git switch -c nome'.",
      }},
      { title: 'Merge vs Rebase', type: 'MULTIPLE_CHOICE', xp_reward: 10, payload: {
        question: 'O que git merge faz?',
        options: [
          { text: 'Une o histórico de duas branches, criando um commit de merge', isCorrect: true  },
          { text: 'Deleta a branch após integrar as mudanças',                    isCorrect: false },
          { text: 'Reverte o último commit',                                      isCorrect: false },
          { text: 'Baixa as últimas alterações do repositório remoto',            isCorrect: false },
        ],
        explanation: "merge integra duas branches preservando o histórico de ambas. Rebase reescreve o histórico linearizando os commits. Merge é mais seguro para branches compartilhadas.",
      }},
      { title: 'Enviando ao remote', type: 'FILL_BLANK', xp_reward: 10, payload: {
        question: 'Complete o comando para enviar a branch main ao repositório remoto:',
        code_snippet: 'git _____ origin main',
        options: [{ text: 'push', isCorrect: true }, { text: 'send', isCorrect: false }, { text: 'upload', isCorrect: false }, { text: 'sync', isCorrect: false }],
        explanation: "'git push origin main' envia os commits locais da branch main para o remote chamado 'origin'. 'git pull' faz o inverso: baixa e mescla.",
      }},
      { title: 'Pull Request', type: 'MULTIPLE_CHOICE', xp_reward: 10, payload: {
        question: 'O que é um Pull Request (PR) no GitHub?',
        options: [
          { text: 'Uma solicitação para revisar e integrar mudanças de uma branch em outra',  isCorrect: true  },
          { text: 'Um comando Git para baixar alterações do repositório remoto',              isCorrect: false },
          { text: 'Um tipo especial de commit que agrupa várias alterações',                  isCorrect: false },
          { text: 'Uma notificação automática quando alguém faz push',                        isCorrect: false },
        ],
        explanation: "PR é um mecanismo de colaboração: você propõe mudanças, outros revisam o código, discutem e aprovam antes de integrar na branch principal.",
      }},
      { title: 'git status', type: 'FILL_BLANK', xp_reward: 10, payload: {
        question: 'Qual comando mostra o estado atual dos arquivos (modificados, staged, untracked)?',
        code_snippet: 'git _____',
        options: [{ text: 'status', isCorrect: true }, { text: 'log', isCorrect: false }, { text: 'show', isCorrect: false }, { text: 'diff', isCorrect: false }],
        explanation: "'git status' é o comando mais usado: mostra arquivos modificados, o que está na staging area e o que ainda não é rastreado. 'git log' mostra o histórico de commits.",
      }},
    ]
  )

  // ── TRILHA 7: JavaScript ES6+ ───────────────────────────────────────────────
  const t7 = await buildTrail(
    { title: 'JavaScript ES6+ Moderno', slug: 'javascript-es6-plus', order: 7,
      difficulty: 'INTERMEDIATE', is_premium: false,
      prerequisite_trail_id: idJS1,
      description: 'Domine arrow functions, Promises, async/await e os recursos modernos do JavaScript.' },
    [
      { title: 'Arrow function', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Reescreva a função como arrow function de uma linha:',
        code_snippet: '// Tradicional:\nfunction dobrar(n) { return n * 2 }\n\n// Arrow:\nconst dobrar = n _____ n * 2',
        options: [{ text: '=>', isCorrect: true }, { text: '->', isCorrect: false }, { text: '::', isCorrect: false }, { text: '>>', isCorrect: false }],
        explanation: "Arrow functions usam '=>'. Quando o corpo é uma expressão única, as chaves e o return são implícitos: n => n * 2 retorna n * 2 automaticamente.",
      }},
      { title: 'Promise vs callback', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'Qual é a principal vantagem de Promises sobre callbacks aninhados?',
        options: [
          { text: 'Evitam o "callback hell" com encadeamento legível via .then()',   isCorrect: true  },
          { text: 'Promises são mais rápidas que callbacks em todos os casos',       isCorrect: false },
          { text: 'Promises permitem código síncrono, callbacks são sempre assíncronos', isCorrect: false },
          { text: 'Callbacks só funcionam com eventos do DOM',                      isCorrect: false },
        ],
        explanation: "Callbacks aninhados criam pirâmides ilegíveis (callback hell). Promises permitem encadeamento com .then().catch() e foram a base para async/await.",
      }},
      { title: 'Erro em async/await', type: 'FIND_ERROR', xp_reward: 15, payload: {
        question: 'Qual é o erro neste código async/await?',
        code_snippet: 'async function carregarUsuario(id) {\n  const res = await fetch(`/api/users/${id}`)\n  const dados = res.json()\n  return dados\n}',
        options: [
          { text: 'async function carregarUsuario(id)',   isCorrect: false },
          { text: 'const res = await fetch(...)',          isCorrect: false },
          { text: 'const dados = res.json()',              isCorrect: true  },
        ],
        explanation: "res.json() retorna uma Promise. Sem await, 'dados' será a Promise, não os dados. O correto é: const dados = await res.json().",
      }},
      { title: 'Destructuring de array', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete para extrair o primeiro e segundo elemento do array:',
        code_snippet: 'const cores = ["vermelho", "azul", "verde"]\nconst [_____, segunda] = cores',
        options: [{ text: 'primeira', isCorrect: true }, { text: 'cores[0]', isCorrect: false }, { text: '"vermelho"', isCorrect: false }, { text: '0', isCorrect: false }],
        explanation: "Destructuring de array usa [] e extrai por posição. Você define o nome da variável livremente: [primeira, segunda] = ['vermelho', 'azul'] → primeira='vermelho'.",
      }},
      { title: 'Nullish coalescing', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'O que o operador ?? (nullish coalescing) retorna?',
        options: [
          { text: 'O valor da direita apenas se o da esquerda for null ou undefined', isCorrect: true  },
          { text: 'O valor da direita se o da esquerda for qualquer valor falsy',     isCorrect: false },
          { text: 'true se ambos os lados forem definidos',                           isCorrect: false },
          { text: 'O maior dos dois valores',                                         isCorrect: false },
        ],
        explanation: "?? só considera null e undefined, ao contrário de || que usa qualquer falsy. Então: 0 ?? 'padrão' = 0, mas 0 || 'padrão' = 'padrão'.",
      }},
      { title: 'Optional chaining', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete com o operador que evita erro ao acessar propriedade de valor possivelmente null:',
        code_snippet: 'const cidade = usuario_____endereco_____cidade',
        options: [{ text: '?.', isCorrect: true }, { text: '??', isCorrect: false }, { text: '||', isCorrect: false }, { text: '!.', isCorrect: false }],
        explanation: "?. (optional chaining) retorna undefined se o valor antes dele for null/undefined, ao invés de lançar TypeError. usuario?.endereco?.cidade é seguro mesmo se endereco for null.",
      }},
      { title: 'Promise.all', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'O que acontece quando uma das Promises em Promise.all() é rejeitada?',
        options: [
          { text: 'Promise.all() rejeita imediatamente com o erro dessa Promise',       isCorrect: true  },
          { text: 'Promise.all() ignora a rejeição e retorna os demais resultados',     isCorrect: false },
          { text: 'Promise.all() espera todas terminarem mesmo que uma falhe',          isCorrect: false },
          { text: 'Promise.all() retorna undefined para a Promise que falhou',          isCorrect: false },
        ],
        explanation: "Promise.all falha rápido (fail-fast): se qualquer Promise rejeitar, o resultado inteiro rejeita. Use Promise.allSettled() para receber todos os resultados mesmo com falhas.",
      }},
      { title: 'Módulos ES6', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete com a palavra-chave para importar a função calcular do módulo utils:',
        code_snippet: '_____ { calcular } from "./utils.js"',
        options: [{ text: 'import', isCorrect: true }, { text: 'require', isCorrect: false }, { text: 'include', isCorrect: false }, { text: 'using', isCorrect: false }],
        explanation: "'import' é a sintaxe de módulos ES6 (nativa dos navegadores e Node.js moderno). 'require' é a sintaxe CommonJS (Node.js legado).",
      }},
    ]
  )

  // ── TRILHA 8: TypeScript Básico ─────────────────────────────────────────────
  await buildTrail(
    { title: 'TypeScript Básico', slug: 'typescript-basico', order: 8,
      difficulty: 'INTERMEDIATE', is_premium: true,
      prerequisite_trail_id: t7.id,
      description: 'Adicione tipagem estática ao JavaScript e escreva código mais seguro e documentado.' },
    [
      { title: 'Tipando variáveis', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete a declaração TypeScript para uma variável do tipo number:',
        code_snippet: 'const idade: _____ = 25',
        options: [{ text: 'number', isCorrect: true }, { text: 'Number', isCorrect: false }, { text: 'int', isCorrect: false }, { text: 'num', isCorrect: false }],
        explanation: "TypeScript usa tipos em minúsculo: number, string, boolean, array. 'Number' (maiúsculo) é o wrapper object do JavaScript — evite-o em TypeScript.",
      }},
      { title: 'Interface vs Type', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'Qual é a principal diferença entre interface e type no TypeScript?',
        options: [
          { text: 'Interfaces podem ser extendidas com declaration merging; types não', isCorrect: true  },
          { text: 'Types são mais rápidos em compilação que interfaces',               isCorrect: false },
          { text: 'Interfaces só funcionam com classes, types com funções',            isCorrect: false },
          { text: 'Não há diferença — são completamente equivalentes',                isCorrect: false },
        ],
        explanation: "Interfaces permitem declaration merging (declarar a mesma interface duas vezes para estender). Types são mais flexíveis para unions e mapped types. Na prática, use interface para objetos e type para unions/aliases.",
      }},
      { title: 'Erro de tipo', type: 'FIND_ERROR', xp_reward: 15, payload: {
        question: 'Qual linha causará erro de tipo no TypeScript?',
        code_snippet: 'function saudar(nome: string): string {\n  return `Olá, ${nome}!`\n}\nconst resultado = saudar(42)',
        options: [
          { text: 'function saudar(nome: string): string',  isCorrect: false },
          { text: 'return `Olá, ${nome}!`',                 isCorrect: false },
          { text: 'const resultado = saudar(42)',           isCorrect: true  },
        ],
        explanation: "saudar() espera string mas recebe 42 (number). O TypeScript detecta isso em compile-time: 'Argument of type number is not assignable to parameter of type string'.",
      }},
      { title: 'Parâmetro opcional', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete a sintaxe para tornar o parâmetro sufixo opcional:',
        code_snippet: 'function cumprimentar(nome: string, sufixo_____ string): string {\n  return `Olá, ${nome}${sufixo ? " " + sufixo : ""}`\n}',
        options: [{ text: '?:', isCorrect: true }, { text: '=:', isCorrect: false }, { text: '||:', isCorrect: false }, { text: '?=', isCorrect: false }],
        explanation: "?: torna o parâmetro opcional. Com sufixo?: string, é possível chamar cumprimentar('Ana') sem o segundo argumento — sufixo será undefined.",
      }},
      { title: 'any vs unknown', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'Por que unknown é preferível a any no TypeScript?',
        options: [
          { text: 'unknown exige que você verifique o tipo antes de usar; any bypassa o type checker', isCorrect: true  },
          { text: 'unknown é mais rápido em runtime que any',                                         isCorrect: false },
          { text: 'any é depreciado nas versões modernas do TypeScript',                              isCorrect: false },
          { text: 'unknown só pode ser usado com valores primitivos',                                 isCorrect: false },
        ],
        explanation: "any desativa toda verificação de tipos — é uma saída de emergência. unknown é tipado seguro: você precisa fazer type narrowing (if typeof x === 'string') antes de usá-lo.",
      }},
      { title: 'Union Type', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete para aceitar tanto string quanto number no parâmetro:',
        code_snippet: 'function exibir(valor: string _____ number): void {\n  console.log(valor)\n}',
        options: [{ text: '|', isCorrect: true }, { text: '&', isCorrect: false }, { text: 'or', isCorrect: false }, { text: ',', isCorrect: false }],
        explanation: "| cria um Union Type: string | number aceita qualquer um dos dois. & cria Intersection Type (o valor deve satisfazer ambos os tipos simultaneamente).",
      }},
      { title: 'Generic básico', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'O que o T representa em function identidade<T>(valor: T): T { return valor }?',
        options: [
          { text: 'Um parâmetro de tipo que será inferido na hora da chamada', isCorrect: true  },
          { text: 'Somente o tipo string — T é uma convenção para texto',      isCorrect: false },
          { text: 'Um tipo genérico que só aceita objetos',                    isCorrect: false },
          { text: 'A letra T não tem significado especial — poderia ser X',    isCorrect: false },
        ],
        explanation: "T é um type parameter (genérico). Ao chamar identidade(42), TypeScript infere T = number. identidade('oi') infere T = string. Pode usar qualquer letra, mas T é convenção.",
      }},
      { title: 'Readonly', type: 'FIND_ERROR', xp_reward: 15, payload: {
        question: 'Qual linha causará erro com a interface readonly?',
        code_snippet: 'interface Config {\n  readonly apiUrl: string\n  timeout: number\n}\nconst cfg: Config = { apiUrl: "https://api.io", timeout: 3000 }\ncfg.timeout = 5000\ncfg.apiUrl = "https://outro.io"',
        options: [
          { text: 'cfg.timeout = 5000',             isCorrect: false },
          { text: 'cfg.apiUrl = "https://outro.io"', isCorrect: true  },
          { text: 'const cfg: Config = { ... }',    isCorrect: false },
        ],
        explanation: "readonly impede reatribuição após a criação. timeout pode ser alterado (não é readonly). apiUrl é readonly — tentar mudar gera 'Cannot assign to apiUrl because it is a read-only property'.",
      }},
    ]
  )

  // ── TRILHA 9: Node.js Fundamentos ──────────────────────────────────────────
  const t9 = await buildTrail(
    { title: 'Node.js Fundamentos', slug: 'nodejs-fundamentos', order: 9,
      difficulty: 'INTERMEDIATE', is_premium: false,
      prerequisite_trail_id: idJS1,
      description: 'Execute JavaScript no servidor com Node.js e construa scripts e servidores HTTP.' },
    [
      { title: 'require vs import', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'Qual é a sintaxe Node.js legada para importar módulos?',
        options: [
          { text: 'const fs = require("fs")',  isCorrect: true  },
          { text: 'import fs from "fs"',       isCorrect: false },
          { text: 'include("fs")',             isCorrect: false },
          { text: 'using fs = load("fs")',     isCorrect: false },
        ],
        explanation: "require() é o sistema CommonJS — padrão histórico do Node.js. import/export é o ES Modules (ESM), disponível no Node.js com type:module no package.json ou extensão .mjs.",
      }},
      { title: 'Event Loop', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'O que o Event Loop do Node.js permite?',
        options: [
          { text: 'Executar operações I/O não-bloqueantes em uma única thread', isCorrect: true  },
          { text: 'Criar múltiplas threads para paralelismo verdadeiro',        isCorrect: false },
          { text: 'Executar código Python e Ruby junto com JavaScript',        isCorrect: false },
          { text: 'Gerenciar a memória RAM automaticamente sem GC',            isCorrect: false },
        ],
        explanation: "Node.js usa um modelo single-thread com event loop: operações I/O (arquivo, rede) são delegadas ao sistema operacional, e o evento de conclusão volta para o loop — sem bloquear a thread principal.",
      }},
      { title: 'Erro em callback Node', type: 'FIND_ERROR', xp_reward: 15, payload: {
        question: 'Qual é o erro neste código de leitura de arquivo?',
        code_snippet: 'const fs = require("fs")\nfs.readFile("dados.txt", (dados) => {\n  console.log(dados.toString())\n})',
        options: [
          { text: 'const fs = require("fs")',             isCorrect: false },
          { text: 'fs.readFile("dados.txt", (dados) => {', isCorrect: true  },
          { text: 'console.log(dados.toString())',         isCorrect: false },
        ],
        explanation: "Callbacks de Node.js seguem o padrão error-first: o primeiro argumento é sempre o erro. O correto é: (err, dados) => { if (err) throw err; ... }. Sem verificar o erro, falhas silenciosas podem ocorrer.",
      }},
      { title: 'module.exports', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete para exportar a função somar no padrão CommonJS:',
        code_snippet: 'function somar(a, b) { return a + b }\n\n_____.exports = { somar }',
        options: [{ text: 'module', isCorrect: true }, { text: 'export', isCorrect: false }, { text: 'exports', isCorrect: false }, { text: 'this', isCorrect: false }],
        explanation: "module.exports é o objeto exportado por um arquivo CommonJS. 'exports' sozinho é um atalho para module.exports, mas module.exports é mais explícito e confiável ao reatribuir.",
      }},
      { title: 'process.env', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'Para que serve process.env no Node.js?',
        options: [
          { text: 'Acessar variáveis de ambiente do sistema operacional', isCorrect: true  },
          { text: 'Verificar a versão do Node.js instalada',              isCorrect: false },
          { text: 'Listar os pacotes npm instalados',                     isCorrect: false },
          { text: 'Executar comandos do terminal dentro do código',       isCorrect: false },
        ],
        explanation: "process.env contém as variáveis de ambiente. Em produção, dados sensíveis como DATABASE_URL e JWT_SECRET são passados por variáveis de ambiente, nunca hardcoded no código.",
      }},
      { title: 'path.join', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete com o módulo nativo que manipula caminhos de arquivo de forma cross-platform:',
        code_snippet: 'const _____ = require("path")\nconst arquivo = path.join(__dirname, "dados", "usuarios.json")',
        options: [{ text: 'path', isCorrect: true }, { text: 'fs', isCorrect: false }, { text: 'url', isCorrect: false }, { text: 'dir', isCorrect: false }],
        explanation: "O módulo 'path' garante separadores corretos em todos os SOs (/ no Linux/Mac, \\ no Windows). path.join() é preferível a concatenar strings manualmente.",
      }},
      { title: 'npm vs npx', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'Qual é a diferença entre npm install e npx?',
        options: [
          { text: 'npm install baixa pacotes; npx executa pacotes sem instalar permanentemente', isCorrect: true  },
          { text: 'npx é mais seguro que npm para produção',                                    isCorrect: false },
          { text: 'npm é para dependências de desenvolvimento; npx para produção',              isCorrect: false },
          { text: 'São a mesma coisa com nomes diferentes',                                     isCorrect: false },
        ],
        explanation: "npm install adiciona o pacote ao node_modules. npx executa o pacote diretamente (baixa temporariamente se não instalado). Útil para ferramentas como create-react-app.",
      }},
      { title: 'Servidor HTTP', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete para criar e iniciar um servidor HTTP básico no Node.js:',
        code_snippet: 'const http = require("http")\nconst server = http._____((_req, res) => {\n  res.end("Olá Mundo!")\n})\nserver.listen(3000)',
        options: [{ text: 'createServer', isCorrect: true }, { text: 'newServer', isCorrect: false }, { text: 'startServer', isCorrect: false }, { text: 'listen', isCorrect: false }],
        explanation: "http.createServer() cria um servidor. A callback recebe req (request) e res (response). server.listen(porta) inicia a escuta. Express é uma abstração sobre esse módulo nativo.",
      }},
    ]
  )

  // ── TRILHA 10: React Avançado ───────────────────────────────────────────────
  await buildTrail(
    { title: 'React Avançado: Hooks & Performance', slug: 'react-avancado', order: 10,
      difficulty: 'ADVANCED', is_premium: true,
      prerequisite_trail_id: idReact,
      description: 'Domine hooks avançados, Context API, otimizações de performance e padrões profissionais.' },
    [
      { title: 'useCallback', type: 'FILL_BLANK', xp_reward: 20, payload: {
        question: 'Qual hook memoiza uma função para evitar recriação a cada render?',
        code_snippet: 'const handleClick = _____(()=> {\n  fazerAlgo(id)\n}, [id])',
        options: [{ text: 'useCallback', isCorrect: true }, { text: 'useMemo', isCorrect: false }, { text: 'useRef', isCorrect: false }, { text: 'useEffect', isCorrect: false }],
        explanation: "useCallback memoiza a referência da função. Sem ele, a função é recriada a cada render — componentes filhos com React.memo a receberiam como 'nova' prop e rerenderizariam.",
      }},
      { title: 'useMemo vs useCallback', type: 'MULTIPLE_CHOICE', xp_reward: 20, payload: {
        question: 'Qual é a diferença entre useMemo e useCallback?',
        options: [
          { text: 'useMemo memoiza um VALOR calculado; useCallback memoiza uma FUNÇÃO', isCorrect: true  },
          { text: 'useMemo é para dados síncronos; useCallback para assíncronos',       isCorrect: false },
          { text: 'useCallback é mais performático que useMemo em todos os casos',      isCorrect: false },
          { text: 'Ambos fazem a mesma coisa com sintaxes diferentes',                 isCorrect: false },
        ],
        explanation: "useMemo(() => calcularValor(), [deps]) retorna o resultado memoizado. useCallback(() => fn(), [deps]) retorna a função memoizada. useCallback(fn, deps) = useMemo(() => fn, deps).",
      }},
      { title: 'Erro no Context', type: 'FIND_ERROR', xp_reward: 20, payload: {
        question: 'Qual é o erro neste uso de Context API?',
        code_snippet: 'const TemaContext = createContext()\n\nfunction App() {\n  return (\n    <TemaContext value="escuro">\n      <Pagina />\n    </TemaContext>\n  )\n}',
        options: [
          { text: 'const TemaContext = createContext()',          isCorrect: false },
          { text: '<TemaContext value="escuro">',                 isCorrect: true  },
          { text: '<Pagina />',                                   isCorrect: false },
        ],
        explanation: "O Provider deve ser usado explicitamente: <TemaContext.Provider value='escuro'>. Usar o Context diretamente como elemento JSX é incorreto.",
      }},
      { title: 'React.memo', type: 'MULTIPLE_CHOICE', xp_reward: 20, payload: {
        question: 'Quando React.memo evita a rerenderização de um componente?',
        options: [
          { text: 'Quando as props são shallowly iguais às do render anterior',    isCorrect: true  },
          { text: 'Sempre — memo torna o componente completamente estático',       isCorrect: false },
          { text: 'Quando o estado interno do componente não muda',               isCorrect: false },
          { text: 'Quando o componente não usa hooks',                            isCorrect: false },
        ],
        explanation: "React.memo faz comparação superficial (shallow) das props. Se todas as props forem referencialmente iguais, o componente não rerenderiza. Props como objetos e arrays precisam de useCallback/useMemo para não quebrarem a memoização.",
      }},
      { title: 'useReducer', type: 'FILL_BLANK', xp_reward: 20, payload: {
        question: 'Complete com o hook adequado para gerenciar estado complexo com ações:',
        code_snippet: 'const [estado, dispatch] = _____(reducer, { count: 0 })',
        options: [{ text: 'useReducer', isCorrect: true }, { text: 'useState', isCorrect: false }, { text: 'useContext', isCorrect: false }, { text: 'useStore', isCorrect: false }],
        explanation: "useReducer é ideal quando o próximo estado depende do atual de forma complexa. Similar ao Redux: dispatch({ type: 'INCREMENT' }) chama o reducer que retorna o novo estado.",
      }},
      { title: 'Custom Hook', type: 'MULTIPLE_CHOICE', xp_reward: 20, payload: {
        question: 'Qual convenção um custom hook DEVE seguir?',
        options: [
          { text: 'Começar com "use" — ex: useLocalStorage, useFetch',   isCorrect: true  },
          { text: 'Ser um componente funcional sem JSX',                  isCorrect: false },
          { text: 'Retornar sempre um array com dois elementos',          isCorrect: false },
          { text: 'Ser definido dentro do componente que o usa',          isCorrect: false },
        ],
        explanation: "Custom hooks DEVEM começar com 'use'. Isso permite que o React detecte e valide as regras dos hooks (não chamar condicionalmente, não chamar fora de componentes/hooks).",
      }},
      { title: 'Lazy loading', type: 'FILL_BLANK', xp_reward: 20, payload: {
        question: 'Complete com a função que carrega um componente React de forma lazy (sob demanda):',
        code_snippet: 'const Dashboard = _____(()=> import("./pages/Dashboard"))',
        options: [{ text: 'React.lazy', isCorrect: true }, { text: 'React.defer', isCorrect: false }, { text: 'React.import', isCorrect: false }, { text: 'React.async', isCorrect: false }],
        explanation: "React.lazy() + Suspense permite code-splitting: o bundle do Dashboard só é baixado quando o usuário navegar até ele, reduzindo o tamanho do bundle inicial.",
      }},
      { title: 'Batching de estado', type: 'MULTIPLE_CHOICE', xp_reward: 20, payload: {
        question: 'No React 18, o que acontece ao chamar setA() e setB() em sequência dentro de um event handler?',
        options: [
          { text: 'Ambas são agrupadas em um único re-render (automatic batching)',      isCorrect: true  },
          { text: 'Causam dois re-renders separados — um para cada setState',           isCorrect: false },
          { text: 'Apenas a última atualização é aplicada',                            isCorrect: false },
          { text: 'O React lança um erro por múltiplos setStates simultâneos',         isCorrect: false },
        ],
        explanation: "React 18 introduziu automatic batching: múltiplos setState em qualquer contexto (events, promises, timeouts) são agrupados em um único re-render, melhorando performance.",
      }},
    ]
  )

  // ── TRILHA 11: CSS Avançado — Flexbox & Grid ────────────────────────────────
  await buildTrail(
    { title: 'CSS Avançado: Flexbox & Grid', slug: 'css-flexbox-grid', order: 11,
      difficulty: 'INTERMEDIATE', is_premium: false,
      prerequisite_trail_id: t4.id,
      description: 'Crie layouts modernos e responsivos com CSS Flexbox e CSS Grid.' },
    [
      { title: 'display: flex', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete para ativar o Flexbox no contêiner pai:',
        code_snippet: '.container {\n  _______: flex;\n}',
        options: [{ text: 'display', isCorrect: true }, { text: 'layout', isCorrect: false }, { text: 'flex', isCorrect: false }, { text: 'mode', isCorrect: false }],
        explanation: "'display: flex' transforma um elemento em flex container. Todos os filhos diretos se tornam flex items e passam a seguir as regras do Flexbox.",
      }},
      { title: 'justify-content vs align-items', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'Em um flex container com flex-direction: row (padrão), qual eixo justify-content controla?',
        options: [
          { text: 'O eixo principal (horizontal) — distribui itens da esquerda para a direita', isCorrect: true  },
          { text: 'O eixo cruzado (vertical) — distribui itens de cima para baixo',             isCorrect: false },
          { text: 'Ambos os eixos simultaneamente',                                              isCorrect: false },
          { text: 'Apenas o espaço entre os itens, não no início e fim',                        isCorrect: false },
        ],
        explanation: "justify-content controla o eixo principal (row → horizontal). align-items controla o eixo cruzado (row → vertical). Com flex-direction: column, os eixos se invertem.",
      }},
      { title: 'Erro em Flexbox', type: 'FIND_ERROR', xp_reward: 15, payload: {
        question: 'Qual propriedade está no lugar errado para centralizar itens verticalmente?',
        code_snippet: '.card {\n  display: flex;\n  justify-content: center;\n  justify-items: center;\n}',
        options: [
          { text: 'display: flex',           isCorrect: false },
          { text: 'justify-content: center', isCorrect: false },
          { text: 'justify-items: center',   isCorrect: true  },
        ],
        explanation: "'justify-items' é uma propriedade de CSS Grid, não Flexbox. Para centralizar verticalmente no Flexbox use 'align-items: center'. 'justify-items' é ignorado em contexto flex.",
      }},
      { title: 'grid-template-columns', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete para criar 3 colunas iguais em um Grid:',
        code_snippet: '.grid {\n  display: grid;\n  grid-template-columns: _____(1fr, 3);\n}',
        options: [{ text: 'repeat', isCorrect: true }, { text: 'times', isCorrect: false }, { text: 'cols', isCorrect: false }, { text: 'span', isCorrect: false }],
        explanation: "repeat(3, 1fr) cria 3 colunas que dividem o espaço igualmente. '1fr' significa 1 fração do espaço disponível. Equivale a '1fr 1fr 1fr'.",
      }},
      { title: 'grid-column span', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'O que faz grid-column: span 2 em um grid item?',
        options: [
          { text: 'Faz o item ocupar 2 colunas de largura',          isCorrect: true  },
          { text: 'Move o item para a segunda coluna do grid',        isCorrect: false },
          { text: 'Cria 2 novas colunas no grid container',          isCorrect: false },
          { text: 'Define o espaçamento entre o item e a coluna',    isCorrect: false },
        ],
        explanation: "span define quantas trilhas o item ocupa. grid-column: span 2 significa 'ocupe 2 colunas'. grid-row: span 3 ocuparia 3 linhas. Para posicionar em coluna específica: grid-column: 2 / 4.",
      }},
      { title: 'flex-wrap', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete para permitir que os itens flex quebrem para a próxima linha quando não couberem:',
        code_snippet: '.galeria {\n  display: flex;\n  flex-_____: wrap;\n  gap: 16px;\n}',
        options: [{ text: 'wrap', isCorrect: true }, { text: 'flow', isCorrect: false }, { text: 'break', isCorrect: false }, { text: 'overflow', isCorrect: false }],
        explanation: "flex-wrap: wrap permite que itens quebrem para a linha seguinte. O padrão é nowrap — todos ficam em uma linha e podem overflow. wrap-reverse quebra na direção oposta.",
      }},
      { title: 'gap no Grid', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'Qual a diferença entre gap e margin para espaçamento em Grid/Flexbox?',
        options: [
          { text: 'gap não adiciona espaço nas bordas externas do container; margin sim', isCorrect: true  },
          { text: 'gap só funciona em Grid; margin funciona em ambos',                    isCorrect: false },
          { text: 'gap é mais lento em performance que margin',                           isCorrect: false },
          { text: 'Não há diferença — são intercambiáveis',                              isCorrect: false },
        ],
        explanation: "gap cria espaço ENTRE os itens, não nas bordas. margin nas bordas externas adicionaria espaço indesejado. Isso torna gap muito mais conveniente para grids e flex containers.",
      }},
      { title: 'minmax()', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete para criar colunas responsivas que nunca ficam menores que 200px:',
        code_snippet: '.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, _____(200px, 1fr));\n}',
        options: [{ text: 'minmax', isCorrect: true }, { text: 'clamp', isCorrect: false }, { text: 'between', isCorrect: false }, { text: 'range', isCorrect: false }],
        explanation: "minmax(200px, 1fr) define um intervalo: mínimo 200px, máximo 1fr. Com auto-fill, cria automaticamente quantas colunas couberem — layout responsivo sem media queries!",
      }},
    ]
  )

  // ── TRILHA 12: APIs REST com Express ────────────────────────────────────────
  await buildTrail(
    { title: 'APIs REST com Express', slug: 'apis-rest-express', order: 12,
      difficulty: 'ADVANCED', is_premium: true,
      prerequisite_trail_id: t9.id,
      description: 'Construa APIs RESTful profissionais com Express.js, middlewares e autenticação JWT.' },
    [
      { title: 'Rota GET', type: 'FILL_BLANK', xp_reward: 20, payload: {
        question: 'Complete para criar uma rota GET que retorna todos os usuários:',
        code_snippet: 'app.___("/api/usuarios", async (req, res) => {\n  const usuarios = await db.findAll()\n  res.json(usuarios)\n})',
        options: [{ text: 'get', isCorrect: true }, { text: 'fetch', isCorrect: false }, { text: 'read', isCorrect: false }, { text: 'route', isCorrect: false }],
        explanation: "Express expõe métodos HTTP: app.get(), app.post(), app.put(), app.delete(), app.patch(). O método deve corresponder ao verbo HTTP da requisição.",
      }},
      { title: 'Métodos HTTP', type: 'MULTIPLE_CHOICE', xp_reward: 20, payload: {
        question: 'Qual método HTTP deve ser usado para ATUALIZAR parcialmente um recurso existente?',
        options: [
          { text: 'PATCH', isCorrect: true  },
          { text: 'PUT',   isCorrect: false },
          { text: 'POST',  isCorrect: false },
          { text: 'UPDATE', isCorrect: false },
        ],
        explanation: "PATCH = atualização parcial (só os campos enviados). PUT = substituição completa do recurso. POST = criação. UPDATE não é um verbo HTTP.",
      }},
      { title: 'Middleware sem next()', type: 'FIND_ERROR', xp_reward: 20, payload: {
        question: 'Por que este middleware quebra a cadeia de requisições?',
        code_snippet: 'app.use((req, res, next) => {\n  console.log(`${req.method} ${req.path}`)\n  // falta chamar next()\n})\n\napp.get("/", (req, res) => res.send("OK"))',
        options: [
          { text: 'console.log(`${req.method} ${req.path}`)', isCorrect: false },
          { text: 'A ausência de next() no middleware',        isCorrect: true  },
          { text: 'app.get("/", ...) após app.use()',          isCorrect: false },
        ],
        explanation: "Middlewares Express devem chamar next() para passar o controle ao próximo middleware/rota. Sem next(), a requisição fica travada — o cliente nunca recebe resposta.",
      }},
      { title: 'req.params', type: 'FILL_BLANK', xp_reward: 20, payload: {
        question: 'Complete para acessar o parâmetro :id da URL /produtos/42:',
        code_snippet: 'app.get("/produtos/:id", (req, res) => {\n  const id = req._____.id\n  res.json({ id })\n})',
        options: [{ text: 'params', isCorrect: true }, { text: 'body', isCorrect: false }, { text: 'query', isCorrect: false }, { text: 'url', isCorrect: false }],
        explanation: "req.params contém parâmetros de rota (:id). req.body contém o corpo da requisição (POST/PUT). req.query contém query strings (?page=1). req.headers contém cabeçalhos.",
      }},
      { title: 'Status codes', type: 'MULTIPLE_CHOICE', xp_reward: 20, payload: {
        question: 'Qual status HTTP deve ser retornado ao criar um recurso com sucesso?',
        options: [
          { text: '201 Created',         isCorrect: true  },
          { text: '200 OK',              isCorrect: false },
          { text: '204 No Content',      isCorrect: false },
          { text: '202 Accepted',        isCorrect: false },
        ],
        explanation: "201 = recurso criado com sucesso (POST). 200 = sucesso genérico (GET, PUT). 204 = sucesso sem corpo de resposta (DELETE). Usar o código correto melhora a comunicação da API.",
      }},
      { title: 'Middleware de auth', type: 'FILL_BLANK', xp_reward: 20, payload: {
        question: 'Complete para extrair o token do cabeçalho Authorization (formato: Bearer <token>):',
        code_snippet: 'const authHeader = req.headers._____\nconst token = authHeader?.split(" ")[1]',
        options: [{ text: 'authorization', isCorrect: true }, { text: 'auth', isCorrect: false }, { text: 'token', isCorrect: false }, { text: 'bearer', isCorrect: false }],
        explanation: "Headers HTTP são case-insensitive mas em Express são acessados em lowercase: req.headers.authorization. O padrão Bearer token separa tipo e valor com espaço.",
      }},
      { title: 'CORS', type: 'MULTIPLE_CHOICE', xp_reward: 20, payload: {
        question: 'Por que uma API Express precisa configurar CORS?',
        options: [
          { text: 'Navegadores bloqueiam requisições cross-origin por segurança — CORS habilita origens específicas', isCorrect: true  },
          { text: 'CORS é necessário para compressão de dados na rede',                                               isCorrect: false },
          { text: 'CORS autentica os usuários da API automaticamente',                                                isCorrect: false },
          { text: 'Sem CORS, a API não consegue se conectar ao banco de dados',                                      isCorrect: false },
        ],
        explanation: "Same-Origin Policy bloqueia fetch() para domínios diferentes. O middleware CORS adiciona headers (Access-Control-Allow-Origin) que instruem o navegador a permitir a requisição.",
      }},
      { title: 'Tratamento de erros', type: 'FIND_ERROR', xp_reward: 20, payload: {
        question: 'O que está faltando neste error handler Express?',
        code_snippet: 'app.use((err, req, res) => {\n  console.error(err.message)\n  res.status(500).json({ error: err.message })\n})',
        options: [
          { text: 'console.error(err.message)',               isCorrect: false },
          { text: 'res.status(500).json({ error: ... })',     isCorrect: false },
          { text: 'O parâmetro next faltando na assinatura', isCorrect: true  },
        ],
        explanation: "Error handlers Express DEVEM ter 4 parâmetros: (err, req, res, next). Sem o 4º parâmetro, o Express não reconhece a função como error handler e não a invoca para erros.",
      }},
    ]
  )

  // ── TRILHA 13: SQL e Banco de Dados ────────────────────────────────────────
  await buildTrail(
    { title: 'SQL e Banco de Dados', slug: 'sql-banco-de-dados', order: 13,
      difficulty: 'INTERMEDIATE', is_premium: false,
      description: 'Aprenda SQL para consultar, inserir e relacionar dados em bancos relacionais.' },
    [
      { title: 'SELECT básico', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete a query para buscar todos os registros da tabela usuarios:',
        code_snippet: '_____ * FROM usuarios',
        options: [{ text: 'SELECT', isCorrect: true }, { text: 'GET', isCorrect: false }, { text: 'FETCH', isCorrect: false }, { text: 'FIND', isCorrect: false }],
        explanation: "SELECT é o comando SQL para consultar dados. O * seleciona todas as colunas. Para colunas específicas: SELECT nome, email FROM usuarios.",
      }},
      { title: 'PRIMARY KEY', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'O que define uma PRIMARY KEY em SQL?',
        options: [
          { text: 'Um identificador único e não-nulo para cada linha da tabela', isCorrect: true  },
          { text: 'A primeira coluna definida na tabela',                        isCorrect: false },
          { text: 'A coluna com o maior valor em cada linha',                    isCorrect: false },
          { text: 'Uma chave que referencia outra tabela',                      isCorrect: false },
        ],
        explanation: "PRIMARY KEY garante unicidade e NOT NULL automaticamente. Cada tabela deve ter uma. FOREIGN KEY referencia a PK de outra tabela para criar relacionamentos.",
      }},
      { title: 'Erro em SQL', type: 'FIND_ERROR', xp_reward: 15, payload: {
        question: 'Qual é o erro nesta query SQL?',
        code_snippet: 'SELECT nome, email\nFROM usuarios\nWHERE ativo = true\nORDER nome ASC',
        options: [
          { text: 'SELECT nome, email',    isCorrect: false },
          { text: 'WHERE ativo = true',    isCorrect: false },
          { text: 'ORDER nome ASC',        isCorrect: true  },
        ],
        explanation: "A sintaxe correta é 'ORDER BY nome ASC'. A palavra BY é obrigatória. Sem ela, a query retorna erro de sintaxe.",
      }},
      { title: 'INNER JOIN', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete para combinar pedidos com os dados dos clientes (chave: cliente_id):',
        code_snippet: 'SELECT p.id, c.nome\nFROM pedidos p\n_____ JOIN clientes c ON p.cliente_id = c.id',
        options: [{ text: 'INNER', isCorrect: true }, { text: 'MERGE', isCorrect: false }, { text: 'CONNECT', isCorrect: false }, { text: 'LINK', isCorrect: false }],
        explanation: "INNER JOIN retorna apenas linhas onde há correspondência em AMBAS as tabelas. LEFT JOIN inclui todos da esquerda mesmo sem correspondência. RIGHT JOIN, o inverso.",
      }},
      { title: 'WHERE vs HAVING', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'Qual é a diferença entre WHERE e HAVING em SQL?',
        options: [
          { text: 'WHERE filtra linhas ANTES do GROUP BY; HAVING filtra grupos APÓS o GROUP BY', isCorrect: true  },
          { text: 'HAVING é mais rápido que WHERE em tabelas grandes',                           isCorrect: false },
          { text: 'WHERE funciona apenas com strings; HAVING com números',                      isCorrect: false },
          { text: 'São equivalentes — WHERE é o antigo padrão, HAVING o moderno',              isCorrect: false },
        ],
        explanation: "WHERE filtra linhas individuais antes do agrupamento. HAVING filtra grupos depois do GROUP BY e pode usar funções de agregação: HAVING COUNT(*) > 5.",
      }},
      { title: 'INSERT INTO', type: 'FILL_BLANK', xp_reward: 15, payload: {
        question: 'Complete a query para inserir um novo usuário:',
        code_snippet: '_____ INTO usuarios (nome, email)\nVALUES ("Ana", "ana@email.com")',
        options: [{ text: 'INSERT', isCorrect: true }, { text: 'ADD', isCorrect: false }, { text: 'CREATE', isCorrect: false }, { text: 'PUT', isCorrect: false }],
        explanation: "INSERT INTO tabela (colunas) VALUES (valores) adiciona uma nova linha. A ordem dos valores deve corresponder à ordem das colunas declaradas.",
      }},
      { title: 'Índices', type: 'MULTIPLE_CHOICE', xp_reward: 15, payload: {
        question: 'Para que servem índices (INDEX) em banco de dados?',
        options: [
          { text: 'Aceleram buscas mas ocupam espaço extra e tornam writes mais lentos', isCorrect: true  },
          { text: 'Garantem unicidade dos valores como a PRIMARY KEY',                   isCorrect: false },
          { text: 'São obrigatórios em toda coluna usada em JOIN',                      isCorrect: false },
          { text: 'Aceleram tanto leituras quanto escritas',                            isCorrect: false },
        ],
        explanation: "Índices são estruturas de dados (geralmente B-tree) que aceleram SELECTs em colunas indexadas. O trade-off: INSERTs/UPDATEs ficam mais lentos pois o índice precisa ser atualizado.",
      }},
      { title: 'UPDATE com WHERE', type: 'FIND_ERROR', xp_reward: 15, payload: {
        question: 'Qual é o risco crítico nesta query UPDATE?',
        code_snippet: 'UPDATE usuarios\nSET ativo = false\n-- WHERE id = 42',
        options: [
          { text: 'UPDATE usuarios',    isCorrect: false },
          { text: 'SET ativo = false',  isCorrect: false },
          { text: '-- WHERE id = 42 (comentado)', isCorrect: true },
        ],
        explanation: "UPDATE sem WHERE atualiza TODAS as linhas da tabela! O WHERE está comentado (--). Essa é uma das formas mais comuns de perda de dados em produção. Sempre revise UPDATEs e DELETEs.",
      }},
    ]
  )

  // ── Sumário final ──────────────────────────────────────────────────────────
  console.log('\n📊 Resumo final:')
  const totalTrails = await prisma.trail.count()
  const totalActivities = await prisma.activity.count()
  console.log(`   Trilhas:    ${totalTrails}`)
  console.log(`   Atividades: ${totalActivities}`)
  console.log('\n🎉 Populate-trails concluído!')
}

main()
  .catch(e => { console.error('❌ Erro:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
