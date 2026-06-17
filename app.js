/* ============================================================
   Fleurynho — Assistente Virtual Humanizada do Grupo Fleury
   Motor de DIÁLOGO por fluxos (100% offline / demo completo).
   Em produção: trocar a camada de fluxos por orquestração com a
   API Claude + integrações (agendamento, laudos, convênios).
   ============================================================ */

const $ = (s) => document.querySelector(s);
const messagesEl = $('#messages');
const quickEl = $('#quickReplies');
const inputEl = $('#input');
const norm = (t) => (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const protocolo = () => '#FL' + Math.floor(100000 + Math.random() * 900000);

let started = false;
let state = { flow: null, step: null };
let ctx = {};
const HOME = ['Agendar exame', 'Resultado de exames', 'Preparo de exame', 'Convênios', 'Unidades', '❓ Preciso de ajuda', '🧑‍💼 Falar com atendente'];

/* ===================== BASE DE PREPAROS ===================== */
const preparos = {
  sangue: 'Exame de sangue 🩸\n• Jejum de 8h a 12h (água pode, à vontade).\n• Evite álcool 72h antes e atividade física intensa no dia.\n• Continue seus medicamentos de uso contínuo, salvo orientação médica.',
  glicemia: 'Glicemia em jejum 🧪\n• Jejum obrigatório de 8h (no máximo 12h).\n• Pode beber água.\n• Não fume antes da coleta.\n• Leve a lista dos seus medicamentos.',
  abdome: 'Ultrassom de abdome total 🔍\n• Jejum de 6h a 8h.\n• Na véspera, evite alimentos gordurosos, refrigerantes e feijão.\n• Compareça com a bexiga cheia (beba 4 copos de água 1h antes e não urine).',
  urina: 'Urina tipo I (EAS) 💧\n• Higienize bem a região íntima.\n• Colete a 1ª urina da manhã, desprezando o primeiro jato.\n• Use o frasco estéril fornecido pela unidade.',
  colono: 'Colonoscopia 🩺\n• Preparo intestinal específico (laxante) conforme prescrição.\n• Dieta leve/líquida 24h a 48h antes.\n• Jejum no dia do exame.\n• É necessário acompanhante, pois há sedação.',
};

/* ===================== FLUXOS DE DIÁLOGO ===================== */
const flows = {
  /* ---------- AGENDAMENTO ---------- */
  agendar: {
    start: 'exame',
    steps: {
      exame: {
        msg: 'Perfeito, vou te ajudar a agendar seu exame! 🗓️\nQual exame você precisa fazer?',
        quick: ['Exame de sangue', 'Ultrassom', 'Raio-X', 'Ressonância', 'Outro exame'],
        on: (t) => { ctx.exame = t; return 'pedido'; },
      },
      pedido: {
        msg: () => `Ótimo, *${ctx.exame}*! 📋\nVocê já está com o pedido médico em mãos?`,
        quick: ['Sim, tenho o pedido', 'Não tenho ainda'],
        on: (t) => (norm(t).includes('nao') ? 'sempedido' : 'unidade'),
      },
      sempedido: {
        msg: 'Sem o pedido médico não conseguimos realizar a maioria dos exames. 😊\nVocê pode pedir ao seu médico ou agendar uma teleconsulta conosco. Como prefere seguir?',
        quick: ['Já vou providenciar (seguir)', 'Falar com atendente'],
        on: () => 'unidade',
      },
      unidade: {
        msg: 'Show! Em qual unidade você prefere ser atendido(a)? 📍',
        quick: ['Av. Paulista - SP', 'Ibirapuera - SP', 'Barra - RJ', 'Outra unidade'],
        on: (t) => { ctx.unidade = t; return 'data'; },
      },
      data: {
        msg: () => `A unidade *${ctx.unidade}* tem estes horários disponíveis: 📅`,
        quick: ['Amanhã, 08:00', 'Amanhã, 10:30', 'Quarta, 14:00', 'Outra data'],
        on: (t) => { ctx.horario = t; return 'pagamento'; },
      },
      pagamento: {
        msg: 'Como será o pagamento do exame? 💳',
        quick: ['Pelo convênio', 'Particular'],
        on: (t) => { ctx.pagamento = t; return 'confirma'; },
      },
      confirma: {
        msg: () => `Vamos confirmar seu agendamento: ✅\n\n🔬 Exame: ${ctx.exame}\n📍 Unidade: ${ctx.unidade}\n🕐 Quando: ${ctx.horario}\n💳 Pagamento: ${ctx.pagamento}\n\nPosso confirmar?`,
        quick: ['Confirmar agendamento', 'Cancelar'],
        on: (t) => (norm(t).includes('confirmar') ? 'fim' : 'fimcancel'),
      },
      fim: {
        msg: () => `Agendamento confirmado! 🎉\nSeu protocolo é *${protocolo()}*.\nVocê receberá a confirmação e as orientações de preparo por SMS e e-mail. 📲\n\nPosso ajudar em mais alguma coisa?`,
        quick: ['Ver preparo do exame', 'Encerrar'],
        on: (t) => (norm(t).includes('preparo') ? 'flow:preparo' : 'end'),
      },
      fimcancel: {
        msg: 'Sem problemas, agendamento cancelado. 😊 Se mudar de ideia, é só me chamar! Posso ajudar em algo mais?',
        quick: HOME,
        on: () => 'end',
      },
    },
  },

  /* ---------- RESULTADOS ---------- */
  resultado: {
    start: 'cpf',
    steps: {
      cpf: {
        msg: 'Claro! Para acessar seus resultados com segurança, me informe o seu CPF (apenas números). 🔒',
        quick: [],
        on: (t) => { ctx.cpf = t; return 'qual'; },
      },
      qual: {
        msg: 'Obrigada! Localizei seus exames recentes. 📄\nQual deles você quer consultar?',
        quick: ['Hemograma · 12/06', 'Colesterol · 12/06', 'Ultrassom · 05/06'],
        on: (t) => { ctx.exame = t; return 'status'; },
      },
      status: {
        msg: () => `O resultado de *${ctx.exame}* já está PRONTO! ✅\nComo você prefere recebê-lo?`,
        quick: ['Ver no app/portal', 'Receber por e-mail', 'Falar com atendente'],
        on: (t) => { ctx.via = t; return 'entrega'; },
      },
      entrega: {
        msg: () => norm(ctx.via).includes('mail')
          ? 'Pronto! Enviei o laudo em PDF para o e-mail cadastrado. 📧\nO arquivo é protegido por senha (seus 4 primeiros dígitos do CPF). Precisa de algo mais?'
          : 'Você pode ver o laudo completo agora mesmo no portal seguro: 🔗 meu.fleury.com.br (login com CPF e senha). Precisa de algo mais?',
        quick: ['Sim, outra coisa', 'Encerrar'],
        on: (t) => (norm(t).includes('sim') ? 'flow:menu' : 'end'),
      },
    },
  },

  /* ---------- PREPARO ---------- */
  preparo: {
    start: 'exame',
    steps: {
      exame: {
        msg: 'Claro! O preparo correto garante um resultado confiável. 🧪\nPara qual exame você quer as orientações?',
        quick: ['Exame de sangue', 'Glicemia em jejum', 'Ultrassom de abdome', 'Urina (EAS)', 'Colonoscopia'],
        on: (t) => {
          const n = norm(t);
          ctx.prep = n.includes('glicemia') ? 'glicemia'
            : n.includes('abdome') ? 'abdome'
            : n.includes('urina') ? 'urina'
            : n.includes('colono') ? 'colono'
            : 'sangue';
          return 'instrucoes';
        },
      },
      instrucoes: {
        msg: () => `${preparos[ctx.prep]}\n\nQuer ver o preparo de outro exame ou agendar?`,
        quick: ['Outro exame', 'Agendar exame', 'Encerrar'],
        on: (t) => {
          const n = norm(t);
          if (n.includes('outro')) return 'exame';
          if (n.includes('agendar')) return 'flow:agendar';
          return 'end';
        },
      },
    },
  },

  /* ---------- CONVÊNIOS ---------- */
  convenio: {
    start: 'plano',
    steps: {
      plano: {
        msg: 'Trabalhamos com os principais convênios do país! 💳\nQual é o seu plano?',
        quick: ['Bradesco Saúde', 'SulAmérica', 'Amil', 'Unimed', 'Sou particular'],
        on: (t) => { ctx.plano = t; return norm(t).includes('particular') ? 'particular' : 'cobertura'; },
      },
      cobertura: {
        msg: () => `Boa notícia! O convênio *${ctx.plano}* tem cobertura para a maioria dos nossos exames. ✅\nVocê só vai precisar do pedido médico e da carteirinha do plano. Quer agendar agora?`,
        quick: ['Agendar exame', 'Falar com atendente', 'Encerrar'],
        on: (t) => (norm(t).includes('agendar') ? 'flow:agendar' : 'end'),
      },
      particular: {
        msg: 'Sem problemas! No atendimento particular você tem agilidade e ainda pode solicitar o reembolso ao seu convênio depois. 💙\nQuer ver valores ou agendar?',
        quick: ['Agendar exame', 'Falar com atendente', 'Encerrar'],
        on: (t) => (norm(t).includes('agendar') ? 'flow:agendar' : 'end'),
      },
    },
  },

  /* ---------- UNIDADES ---------- */
  unidades: {
    start: 'local',
    steps: {
      local: {
        msg: 'Vou te ajudar a encontrar a unidade mais próxima! 📍\nMe informe sua cidade, bairro ou CEP.',
        quick: ['São Paulo', 'Rio de Janeiro', 'Campinas'],
        on: (t) => { ctx.local = t; return 'lista'; },
      },
      lista: {
        msg: () => `Encontrei estas unidades perto de *${ctx.local}*: 🏥\n\n• Unidade Centro — Seg a Sex 6h-18h, Sáb 7h-13h\n• Unidade Shopping — Seg a Sáb 7h-19h\n• Unidade Hospital — 24 horas (urgências)\n\nQuer agendar em uma delas?`,
        quick: ['Agendar exame', 'Encerrar'],
        on: (t) => (norm(t).includes('agendar') ? 'flow:agendar' : 'end'),
      },
    },
  },

  /* ---------- AJUDA / SUPORTE ---------- */
  ajuda: {
    start: 'a',
    steps: {
      a: {
        msg: 'Estou aqui para te ajudar, sem pressa. 💙\nComo você prefere seguir?',
        quick: ['📘 Ver tutorial de uso', '🧑‍💼 Falar com atendente', '📞 Central de Atendimento'],
        on: (t) => {
          const n = norm(t);
          if (n.includes('tutorial')) return 'flow:tutorial';
          if (n.includes('central')) return 'flow:central';
          return 'end'; // "falar com atendente" é tratado globalmente
        },
      },
    },
  },

  /* ---------- TUTORIAL (guia prático passo a passo) ---------- */
  tutorial: {
    start: 'p1',
    steps: {
      p1: {
        msg: 'Vou te mostrar como funciono — é bem simples! 😊 (passo 1 de 4)\n\n1️⃣ Me diga o que você precisa. Você pode *escrever* ou apenas *tocar nos botões* que aparecem.',
        quick: ['Próximo ▶'],
        on: () => 'p2',
      },
      p2: {
        msg: '2️⃣ Eu te guio passo a passo, fazendo uma pergunta de cada vez e oferecendo opções prontas para você só tocar. (passo 2 de 4)',
        quick: ['Próximo ▶'],
        on: () => 'p3',
      },
      p3: {
        msg: '3️⃣ Comigo você pode: agendar exames, ver resultados, conferir o preparo, checar convênios e encontrar unidades — tudo por aqui. (passo 3 de 4)',
        quick: ['Próximo ▶'],
        on: () => 'p4',
      },
      p4: {
        msg: '4️⃣ E o mais importante: a *qualquer momento* você pode falar com um atendente humano. Você nunca fica sozinho(a). 💙 (passo 4 de 4)\n\nFicou claro como usar?',
        quick: ['Sim, entendi! 😊', 'Ainda não entendi', '🧑‍💼 Falar com atendente'],
        on: (t) => (norm(t).includes('nao') ? 'flow:central' : 'flow:menu'),
      },
    },
  },

  /* ---------- CENTRAL DE ATENDIMENTO (pessoas reais) ---------- */
  central: {
    start: 'c',
    steps: {
      c: {
        msg: 'Sem problemas! Vou te conectar com a nossa *Central de Atendimento*, com pessoas reais prontas para te ajudar com calma. 💙\n\n📞 0800 704 0822 (ligação gratuita)\n💬 WhatsApp: (11) 3179-0822\n🕐 Seg a Sex, 6h às 22h · Sáb 7h às 16h\n\nSe preferir, posso transferir você para um atendente agora mesmo.',
        quick: ['🧑‍💼 Falar com atendente agora', 'Voltar ao início'],
        on: (t) => (norm(t).includes('inicio') || norm(t).includes('voltar') ? 'flow:menu' : 'end'),
      },
    },
  },

  /* ---------- MENU (rota interna) ---------- */
  menu: {
    start: 'm',
    steps: {
      m: { msg: 'Claro! Com o que mais posso te ajudar? 😊', quick: HOME, on: () => 'end' },
    },
  },
};

/* ===================== INTENÇÕES (entrada) ===================== */
const gatilhos = [
  { flow: 'agendar', p: ['agendar', 'agendamento', 'marcar', 'marcacao', 'horario', 'agenda'] },
  { flow: 'resultado', p: ['resultado', 'laudo', 'exame pronto', 'ficou pronto', 'meus exames'] },
  { flow: 'preparo', p: ['preparo', 'jejum', 'preparar', 'como me preparo', 'antes do exame'] },
  { flow: 'convenio', p: ['convenio', 'plano', 'particular', 'cobertura', 'reembolso', 'carteirinha'] },
  { flow: 'unidades', p: ['unidade', 'endereco', 'perto', 'localizacao', 'onde fica', 'horario de funcionamento'] },
  { flow: 'tutorial', p: ['tutorial', 'como funciona', 'como usar', 'como uso', 'me ensina', 'passo a passo'] },
  { flow: 'central', p: ['central de atendimento', 'telefone', '0800', 'ligar'] },
  { flow: 'ajuda', p: ['ajuda', 'preciso de ajuda', 'socorro', 'dificuldade', 'nao entendi', 'nao sei usar', 'estou perdido', 'estou perdida', 'me ajuda'] },
];
const saudacoes = ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'opa', 'eai'];
const agradece = ['obrigado', 'obrigada', 'valeu', 'agradeco', 'perfeito', 'otimo'];
const despede = ['tchau', 'ate logo', 'falou', 'adeus', 'encerrar'];
const sensiveis = ['reclamacao', 'processar', 'grave', 'cancer', 'urgente', 'emergencia', 'morte', 'errado', 'pessimo', 'horrivel'];

/* ===================== ROTEADOR ===================== */
function process(texto) {
  const t = norm(texto);

  // 0) já está com um atendente humano (ou na fila) -> trata antes de tudo
  if (state.flow === 'atendenteAtivo') return respostaAtendente(texto);
  if (state.flow === 'fila') return botSay('Só um instante, já estou te conectando com um atendente… 💙', []);

  // confirmação: chatbot ou atendente?
  if (state.flow === 'confirmAtendente') {
    if (t.includes('chatbot') || t.includes('continuar') || t.includes('fleurynho')) {
      state.flow = null;
      return botSay('Combinado! Sigo com você. 🤖 Como posso ajudar?', HOME);
    }
    return conectarAtendente();
  }

  // 1) temas sensíveis -> sugere atendente humano
  if (sensiveis.some((p) => t.includes(p))) {
    state.flow = 'transbordo';
    return botSay('Sinto muito por isso, e quero que você seja muito bem cuidado(a). 💙\nEsse assunto merece a atenção de um(a) atendente humano(a). Quer que eu te transfira agora?', ['Confirmar transferência', 'Continuar com o Fleurynho']);
  }
  if (state.flow === 'transbordo') {
    state.flow = null;
    if (t.includes('confirmar')) return conectarAtendente();
    return botSay('Tudo bem, sigo com você! 😊 Como posso ajudar?', HOME);
  }

  // 2) pedir atendente a qualquer momento -> confirma a escolha
  if (t.includes('atendente') || t.includes('humano')) { state.flow = null; return pedirConfirmacaoAtendente(); }

  // 3) encerrar / despedir
  if (despede.some((p) => t.includes(p)) || t === 'cancelar') {
    state.flow = null;
    return botSay('Foi um prazer falar com você! 😊 O Fleury agradece o contato. Cuide-se bem! 💙', []);
  }

  // 4) dentro de um fluxo? avança
  if (state.flow && flows[state.flow]) return advance(texto);

  // 5) inicia fluxo por intenção
  const g = gatilhos.find((g) => g.p.some((p) => t.includes(p)));
  if (g) return startFlow(g.flow);

  // 6) intenções simples
  if (saudacoes.some((p) => t.includes(p)))
    return botSay('Olá! 😊 Que bom falar com você! Como posso te ajudar hoje?', HOME);
  if (agradece.some((p) => t.includes(p)))
    return botSay('Fico muito feliz em ajudar! 💙 Precisa de mais alguma coisa?', HOME);

  // 7) fallback
  return botSay('Entendi! 🤔 Quero te ajudar da melhor forma. Escolha uma opção ou me conte com mais detalhes:', HOME);
}

function startFlow(name) {
  ctx = {};
  runStep(name, flows[name].start);
}

function runStep(name, key) {
  state = { flow: name, step: key };
  const step = flows[name].steps[key];
  const msg = typeof step.msg === 'function' ? step.msg() : step.msg;
  botSay(msg, step.quick || []);
}

function advance(texto) {
  const step = flows[state.flow].steps[state.step];
  let next = step.on ? step.on(texto) : 'end';
  if (!next || next === 'end') { state.flow = null; return; }
  if (next.startsWith('flow:')) return startFlow(next.slice(5));
  runStep(state.flow, next);
}

/* ===================== UI ===================== */
function addMsg(texto, who) {
  const wrap = document.createElement('div');
  const isUser = who === 'user';
  wrap.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubble = document.createElement('div');
  bubble.className = isUser
    ? 'bg-fleury text-white rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[82%] text-sm whitespace-pre-wrap shadow'
    : 'bg-white border border-black/5 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[88%] text-sm whitespace-pre-wrap shadow-sm leading-relaxed';
  // negrito simples com *texto*
  bubble.innerHTML = escapeHtml(texto).replace(/\*(.+?)\*/g, '<b>$1</b>');
  wrap.appendChild(bubble);
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function showTyping() {
  const t = document.createElement('div');
  t.id = 'typing';
  t.className = 'flex justify-start';
  t.innerHTML = '<div class="bg-white border border-black/5 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm flex gap-1">' +
    '<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>' +
    '<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:.15s"></span>' +
    '<span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:.3s"></span></div>';
  messagesEl.appendChild(t);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
const hideTyping = () => $('#typing')?.remove();

function renderQuick(ops = []) {
  quickEl.innerHTML = '';
  ops.forEach((op) => {
    const b = document.createElement('button');
    b.textContent = op;
    b.className = 'border border-fleury text-fleury text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-fleury hover:text-white transition';
    b.onclick = () => enviar(op);
    quickEl.appendChild(b);
  });
}

/* fala da Fleurynho com digitação simulada */
function botSay(texto, quick = []) {
  renderQuick([]);
  showTyping();
  const delay = Math.min(550 + texto.length * 9, 1900);
  setTimeout(() => { hideTyping(); addMsg(texto, 'bot'); renderQuick(quick); }, delay);
}

/* usuário envia */
function enviar(texto) {
  texto = (texto || '').trim();
  if (!texto) return;
  addMsg(texto, 'user');
  inputEl.value = '';
  renderQuick([]);
  setTimeout(() => process(texto), 250);
}

/* ===================== ATENDIMENTO HUMANO ===================== */
const ATENDENTES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Marina'];
const UNIDADES_TEL = {
  default: { nome: 'Unidade Av. Paulista - SP', tel: '(11) 4004-7000' },
  'paulista': { nome: 'Unidade Av. Paulista - SP', tel: '(11) 4004-7000' },
  'ibirapuera': { nome: 'Unidade Ibirapuera - SP', tel: '(11) 4004-7100' },
  'barra': { nome: 'Unidade Barra - RJ', tel: '(21) 4004-7200' },
};
function unidadeAtual() {
  const n = norm(ctx.unidade || '');
  for (const k in UNIDADES_TEL) if (k !== 'default' && n.includes(k)) return UNIDADES_TEL[k];
  return UNIDADES_TEL.default;
}

/* pergunta de confirmação: chatbot ou atendente? */
function pedirConfirmacaoAtendente() {
  setChatPersona('bot');
  state.flow = 'confirmAtendente';
  botSay('Você prefere falar com um *atendente humano* ou continuar comigo, o Fleurynho? 😊\nÉ só confirmar abaixo:', ['✅ Sim, falar com atendente', '🤖 Continuar com o chatbot']);
}

/* conecta de fato a um atendente humano (simulado) */
function conectarAtendente() {
  state.flow = 'fila';
  botSay('Perfeito! Estou te transferindo para um de nossos atendentes. 👤\nTempo médio de espera: ~2 minutos. Já já alguém assume por aqui. 💙', []);
  const at = ATENDENTES[Math.floor(Math.random() * ATENDENTES.length)];
  const u = unidadeAtual();
  setTimeout(() => {
    setChatPersona('humano', at);
    state.flow = 'atendenteAtivo';
    botSay(`Oi! Aqui é a *${at}*, do atendimento Fleury 😊\nJá assumi a sua conversa. Em que posso te ajudar?\n\n☎️ Se preferir falar por telefone, ligue para a ${u.nome}: *${u.tel}*.`, ['Sobre meu agendamento', 'Sobre um resultado', 'Voltar ao Fleurynho']);
  }, 2600);
}

/* respostas do atendente humano (simuladas) */
function respostaAtendente(t) {
  if (norm(t).includes('voltar')) {
    setChatPersona('bot');
    state.flow = null;
    return botSay('Sem problemas! Voltando para o assistente Fleurynho. 🤖 Como posso te ajudar?', HOME);
  }
  const respostas = [
    'Certo, deixa eu verificar isso para você. Um momentinho, por favor… 🙂',
    'Entendi! Já estou consultando aqui no sistema para te dar o retorno certinho.',
    'Obrigada por aguardar! Pode me confirmar seu nome completo e data de nascimento, por gentileza?',
    'Perfeito, registrei aqui. Posso te ajudar com mais alguma coisa? 💙',
  ];
  const r = respostas[Math.min(ctx.atIdx || 0, respostas.length - 1)];
  ctx.atIdx = (ctx.atIdx || 0) + 1;
  botSay(r, ['Voltar ao Fleurynho']);
}

/* troca a identidade visual do cabeçalho do chat */
function setChatPersona(tipo, nome) {
  const av = $('#chatAvatar'), nm = $('#chatName'), sb = $('#chatSub'), hd = $('#chatHeader');
  if (!av) return;
  if (tipo === 'humano') {
    av.textContent = '🧑‍💼';
    nm.textContent = nome ? `${nome} · Atendente` : 'Atendente Fleury';
    sb.textContent = 'Atendimento humano · online';
    hd.className = 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 flex items-center gap-3';
  } else {
    av.textContent = '🤖';
    nm.textContent = 'Fleurynho';
    sb.textContent = 'Assistente virtual · online';
    hd.className = 'bg-gradient-to-r from-fleury to-fleury-dark text-white p-4 flex items-center gap-3';
  }
}

/* ===================== WIDGET ===================== */
function openChat() {
  $('#chatWindow').classList.remove('hidden');
  $('#chatWindow').classList.add('flex');
  $('#chatFab').classList.add('hidden');
  if (!started) { started = true; greet(); }
  setTimeout(() => inputEl.focus(), 100);
}
function closeChat() {
  $('#chatWindow').classList.add('hidden');
  $('#chatWindow').classList.remove('flex');
  $('#chatFab').classList.remove('hidden');
}
function greet() {
  setChatPersona('bot');
  showTyping();
  setTimeout(() => {
    hideTyping();
    addMsg('Olá! 😊 Eu sou o *Fleurynho*, assistente virtual do Fleury.\nPosso te ajudar com agendamentos, resultados, preparos, convênios e unidades — 24h por dia.\n\nÉ a primeira vez por aqui? Toque em *"Preciso de ajuda"* para um tutorial rápido, ou *"Falar com atendente"* a qualquer momento. 💙', 'bot');
    renderQuick(HOME);
  }, 800);
}

$('#composer').addEventListener('submit', (e) => { e.preventDefault(); enviar(inputEl.value); });
window.openChat = openChat;
window.closeChat = closeChat;
window.transferHuman = () => {
  started = true;
  openChat();
  state.flow = null;
  addMsg('Quero falar com um atendente', 'user');
  pedirConfirmacaoAtendente();
};

/* ===================== ANIMAÇÕES DE SCROLL ===================== */
const revealAll = () => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
document.documentElement.classList.remove('no-js');
try {
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.querySelectorAll) e.target.querySelectorAll('.counter').forEach(animateCounter);
        if (e.target.classList.contains('counter')) animateCounter(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal, .counter').forEach((el) => io.observe(el));
  } else { revealAll(); document.querySelectorAll('.counter').forEach(animateCounter); }
} catch (err) { revealAll(); }
window.addEventListener('load', () => setTimeout(revealAll, 1200));

function animateCounter(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = +el.dataset.target;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / 1200, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ===================== ACESSIBILIDADE ===================== */
let fontScale = 100; // %
function applyFont() { document.documentElement.style.fontSize = (16 * fontScale / 100) + 'px'; }
function a11yFont(dir) {
  fontScale = Math.max(85, Math.min(150, fontScale + dir * 10));
  applyFont();
  localStorage.setItem('fl_font', fontScale);
}
function a11yContrast() {
  const on = document.body.classList.toggle('contrast');
  localStorage.setItem('fl_contrast', on ? '1' : '0');
}
function a11yReset() {
  fontScale = 100; applyFont();
  document.body.classList.remove('contrast');
  localStorage.removeItem('fl_font'); localStorage.removeItem('fl_contrast');
}
function a11yToggle() {
  const p = $('#a11yPanel');
  const hidden = p.hasAttribute('hidden');
  if (hidden) p.removeAttribute('hidden'); else p.setAttribute('hidden', '');
  $('#a11yFab').setAttribute('aria-expanded', hidden ? 'true' : 'false');
}
// restaura preferências salvas
(function restoreA11y() {
  const f = parseInt(localStorage.getItem('fl_font') || '100', 10);
  if (f && f !== 100) { fontScale = f; applyFont(); }
  if (localStorage.getItem('fl_contrast') === '1') document.body.classList.add('contrast');
})();
window.a11yFont = a11yFont;
window.a11yContrast = a11yContrast;
window.a11yReset = a11yReset;
window.a11yToggle = a11yToggle;

/* ===================== BOAS-VINDAS / TERMOS (LGPD) ===================== */
function wValidate() {
  const ok = $('#wChk1')?.checked && $('#wChk2')?.checked;
  const btn = $('#wContinue');
  if (btn) btn.disabled = !ok;
}
function wAccept() {
  if (!($('#wChk1')?.checked && $('#wChk2')?.checked)) return;
  localStorage.setItem('fl_consent', '1');
  $('#wStep1').setAttribute('hidden', '');
  $('#wStep2').removeAttribute('hidden');
}
function wClose() { $('#welcome')?.classList.add('hidden'); }
function wChooseChat() { wClose(); openChat(); }
function wChooseHuman() { wClose(); window.transferHuman(); }
// exibe o modal no início, se ainda não houve consentimento nesta sessão/navegador
(function initWelcome() {
  const el = $('#welcome');
  if (!el) return;
  if (localStorage.getItem('fl_consent') === '1') return; // já aceitou antes
  el.classList.remove('hidden');
})();
window.wValidate = wValidate;
window.wAccept = wAccept;
window.wChooseChat = wChooseChat;
window.wChooseHuman = wChooseHuman;

/* ===================== VÍDEO EXPLICATIVO (SIMULAÇÃO) ===================== */
let vidTimers = [];
const clearVid = () => { vidTimers.forEach(clearTimeout); vidTimers = []; };

function vidBubble(text, who) {
  const chat = $('#vidChat');
  const w = document.createElement('div');
  w.className = 'flex ' + (who === 'user' ? 'justify-end' : 'justify-start');
  const b = document.createElement('div');
  b.className = who === 'user'
    ? 'bg-fleury text-white rounded-2xl rounded-tr-md px-3 py-2 text-xs max-w-[80%]'
    : 'bg-white text-fleury-ink rounded-2xl rounded-tl-md px-3 py-2 text-xs max-w-[85%]';
  b.textContent = text;
  w.appendChild(b);
  chat.appendChild(w);
  chat.scrollTop = chat.scrollHeight;
}

function playVideo() {
  const modal = $('#videoModal');
  modal.classList.remove('hidden');
  clearVid();
  const chat = $('#vidChat'), cap = $('#vidCaption'), bar = $('#vidBar');
  chat.innerHTML = ''; cap.textContent = '';
  bar.style.transition = 'none'; bar.style.width = '0%';

  // roteiro da "gravação": [tipo, texto]  (cap = legenda; user/bot = balão)
  const seq = [
    ['cap', '👋 Veja como é simples usar o Fleurynho'],
    ['user', 'Quero agendar um exame'],
    ['bot', 'Claro! 🗓️ Qual exame você precisa?'],
    ['user', 'Exame de sangue'],
    ['bot', 'Você está com o pedido médico em mãos?'],
    ['user', 'Sim, tenho'],
    ['bot', 'Perfeito! Em qual unidade?'],
    ['user', 'Av. Paulista - SP'],
    ['cap', '✅ Pronto! Tudo em segundos.'],
    ['bot', 'Agendado! 🎉 Protocolo #FL204815.\nEnviei a confirmação por SMS e e-mail.'],
    ['cap', '💙 E a qualquer momento você fala com um atendente humano.'],
  ];

  let t = 500;
  seq.forEach((s) => {
    vidTimers.push(setTimeout(() => {
      if (s[0] === 'cap') cap.textContent = s[1];
      else vidBubble(s[1], s[0]);
    }, t));
    t += s[0] === 'cap' ? 1900 : (s[0] === 'bot' ? 1700 : 1100);
  });

  const total = t + 400;
  requestAnimationFrame(() => {
    bar.style.transition = 'width ' + total + 'ms linear';
    bar.style.width = '100%';
  });
}
function closeVideo() { $('#videoModal').classList.add('hidden'); clearVid(); }
function videoToChat() { closeVideo(); openChat(); }
window.playVideo = playVideo;
window.closeVideo = closeVideo;
window.videoToChat = videoToChat;
