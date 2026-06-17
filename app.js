/* ============================================================
   Sofia — Assistente Virtual Humanizada do Grupo Fleury
   Motor de intenções (100% offline para o demo) + UI do widget.
   Em produção: trocar `responder()` por chamada à API Claude (RAG).
   ============================================================ */

const $ = (s) => document.querySelector(s);
const messagesEl = $('#messages');
const quickEl = $('#quickReplies');
const inputEl = $('#input');
let started = false;

/* ---------- Intenções / base de conhecimento ---------- */
const intents = [
  { nome: 'saudacao', palavras: ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite', 'opa', 'eai'],
    resposta: () => 'Olá! 😊 Que bom falar com você! Como posso te ajudar hoje?',
    quick: ['Agendar exame', 'Resultado de exames', 'Preparo de exame', 'Convênios'] },

  { nome: 'agendamento', palavras: ['agendar', 'agendamento', 'marcar', 'marcacao', 'horario', 'consulta', 'exame', 'ultrassom', 'sangue'],
    resposta: () => 'Claro, vou te ajudar a agendar! 🗓️\nMe conta:\n• Qual exame você precisa?\n• Tem o pedido médico em mãos?\n• Prefere alguma unidade ou data?\n\nPosso já listar as unidades mais próximas de você.',
    quick: ['Exame de sangue', 'Ultrassom', 'Ver unidades', 'Falar com atendente'] },

  { nome: 'resultado', palavras: ['resultado', 'resultados', 'laudo', 'pronto', 'ficou pronto'],
    resposta: () => 'Posso te ajudar com seus resultados! 📄\nVocê acessa todos os laudos com segurança no portal ou app Fleury, usando CPF e senha.\n\n🔗 meu.fleury.com.br\n\nQuer o link de acesso ou ajuda para recuperar a senha?',
    quick: ['Recuperar senha', 'Receber link', 'Falar com atendente'] },

  { nome: 'preparo', palavras: ['preparo', 'jejum', 'preparar', 'antes do exame', 'comer', 'beber', 'glicemia'],
    resposta: () => 'Ótima pergunta — o preparo certo garante um resultado confiável. 🧪\nMe diz qual exame você vai fazer que eu passo as orientações (jejum, hidratação, medicamentos).\n\nExemplo: exames de sangue costumam pedir de 8h a 12h de jejum, mas varia conforme o exame.',
    quick: ['Exame de sangue', 'Ultrassom abdome', 'Glicemia', 'Falar com atendente'] },

  { nome: 'convenio', palavras: ['convenio', 'convênio', 'plano', 'particular', 'cobertura', 'aceita', 'reembolso'],
    resposta: () => 'Trabalhamos com os principais convênios do país! 💳\nMe informa o nome do seu plano que eu verifico a cobertura para o exame que você precisa. Também atendemos no particular, com opção de reembolso.',
    quick: ['Atendimento particular', 'Ver unidades', 'Falar com atendente'] },

  { nome: 'unidades', palavras: ['unidade', 'unidades', 'endereco', 'endereço', 'perto', 'localizacao', 'onde'],
    resposta: () => 'Temos diversas unidades para te atender! 📍\nMe informa seu bairro, cidade ou CEP que eu listo as mais próximas, com horários de funcionamento.',
    quick: ['São Paulo - SP', 'Rio de Janeiro - RJ', 'Falar com atendente'] },

  { nome: 'agradecimento', palavras: ['obrigado', 'obrigada', 'valeu', 'agradeco', 'perfeito', 'otimo'],
    resposta: () => 'Fico muito feliz em ajudar! 💙 Se precisar de mais alguma coisa, é só chamar. Cuide-se bem! 🌿',
    quick: ['Agendar exame', 'Resultado de exames'] },

  { nome: 'despedida', palavras: ['tchau', 'ate logo', 'falou', 'adeus', 'encerrar'],
    resposta: () => 'Foi um prazer falar com você! 😊 O Fleury agradece o contato. Até breve! 💙', quick: [] },
];

const sensiveis = ['reclamacao', 'reclamação', 'processar', 'grave', 'cancer', 'câncer', 'urgente', 'emergencia', 'emergência', 'morte', 'errado', 'pessimo', 'péssimo'];
const fallback = () => 'Entendi! 🤔 Quero te ajudar da melhor forma — pode me dar um pouco mais de detalhe?\nPosso ajudar com agendamentos, resultados, preparo de exames, convênios e unidades.';

/* ---------- Motor ---------- */
const norm = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

function responder(texto) {
  const t = norm(texto);
  if (sensiveis.some((p) => t.includes(norm(p)))) {
    return { texto: 'Sinto muito por isso, e quero que você seja muito bem cuidado. 💙\nEsse assunto merece atenção especial de um(a) atendente humano(a). Vou te transferir agora mesmo.', quick: ['Confirmar transferência'] };
  }
  let melhor = null, score = 0;
  for (const it of intents) {
    const s = it.palavras.reduce((a, p) => a + (t.includes(norm(p)) ? 1 : 0), 0);
    if (s > score) { score = s; melhor = it; }
  }
  if (melhor && score > 0) return { texto: melhor.resposta(), quick: melhor.quick };
  return { texto: fallback(), quick: ['Agendar exame', 'Resultado de exames', 'Convênios', 'Falar com atendente'] };
}

/* ---------- UI ---------- */
const hora = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function addMsg(texto, who) {
  const wrap = document.createElement('div');
  const isUser = who === 'user';
  wrap.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
  const bubble = document.createElement('div');
  bubble.className = isUser
    ? 'bg-fleury text-white rounded-2xl rounded-tr-md px-4 py-2.5 max-w-[82%] text-sm whitespace-pre-wrap shadow'
    : 'bg-white border border-black/5 rounded-2xl rounded-tl-md px-4 py-2.5 max-w-[88%] text-sm whitespace-pre-wrap shadow-sm';
  bubble.textContent = texto;
  wrap.appendChild(bubble);
  messagesEl.appendChild(wrap);
  messagesEl.scrollTop = messagesEl.scrollHeight;
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

function enviar(texto) {
  texto = (texto || '').trim();
  if (!texto) return;
  addMsg(texto, 'user');
  inputEl.value = '';
  renderQuick([]);

  if (norm(texto).includes('confirmar transferencia')) {
    showTyping();
    setTimeout(() => { hideTyping(); addMsg('Pronto! Você está na fila para atendimento humano. Tempo médio de espera: ~2 min. Obrigada pela paciência. 💙', 'bot'); }, 1000);
    return;
  }

  const { texto: resp, quick } = responder(texto);
  showTyping();
  const delay = Math.min(600 + resp.length * 11, 2000);
  setTimeout(() => { hideTyping(); addMsg(resp, 'bot'); renderQuick(quick); }, delay);
}

function transferHuman() {
  addMsg('Falar com atendente', 'user');
  showTyping();
  setTimeout(() => { hideTyping(); addMsg('Sem problemas! 😊 Vou te encaminhar a um(a) atendente. Antes, me diz rapidamente o motivo do contato para já adiantar à equipe.', 'bot'); renderQuick(['Agendamento', 'Resultado', 'Reclamação', 'Outro assunto']); }, 900);
}

/* ---------- Abrir/fechar widget ---------- */
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
  showTyping();
  setTimeout(() => {
    hideTyping();
    addMsg('Olá! 😊 Eu sou a Sofia, assistente virtual do Fleury.\nPosso ajudar com agendamentos, resultados, preparo de exames, convênios e mais — 24h por dia. Como posso te ajudar?', 'bot');
    renderQuick(['Agendar exame', 'Resultado de exames', 'Preparo de exame', 'Convênios']);
  }, 800);
}

$('#composer').addEventListener('submit', (e) => { e.preventDefault(); enviar(inputEl.value); });
window.openChat = openChat;
window.closeChat = closeChat;
window.transferHuman = transferHuman;

/* ---------- Animações de scroll (reveal + contadores) ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    if (e.target.querySelectorAll) {
      e.target.querySelectorAll('.counter').forEach(animateCounter);
    }
    if (e.target.classList.contains('counter')) animateCounter(e.target);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal, .counter').forEach((el) => io.observe(el));

function animateCounter(el) {
  if (el.dataset.done) return;
  el.dataset.done = '1';
  const target = +el.dataset.target;
  const dur = 1200;
  const start = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
