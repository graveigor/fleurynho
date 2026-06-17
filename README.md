# Fleurynho — IA de Atendimento Humanizado · Fleury 🤖💙

Projeto pessoal que criei para **repensar e melhorar o atendimento ao cliente do Grupo Fleury**:
um assistente virtual humanizado, acessível e disponível 24h, que resolve as principais demandas
do paciente e, sempre que necessário, conecta a pessoa a um atendente humano.

A ideia nasceu de uma pergunta simples: *como tornar o atendimento mais rápido e acolhedor ao
mesmo tempo?* O Fleurynho é a minha proposta de resposta — feito em **HTML + JavaScript + Tailwind CSS**,
sem build e sem dependências.

🔗 **Demo:** [fleurynho.vercel.app](https://fleurynho.vercel.app)

---

## 🎯 Por que construí

- **Reduzir filas e tempo de espera** no SAC, com respostas instantâneas.
- **Humanizar a automação:** linguagem empática e uma saída fácil para falar com gente de verdade.
- **Incluir todo mundo:** acessibilidade para pessoas com baixa visão e usuários de Libras.
- **Liberar a equipe** dos contatos repetitivos para focar nos casos que exigem cuidado humano.

---

## ▶️ Como rodar

**Opção 1 — abrir direto:** dê duplo clique em `index.html`.

**Opção 2 — servidor local** (recomendado para o VLibras funcionar):
```bash
python3 -m http.server 4567
# acesse http://localhost:4567
```

Não há instalação nem build: o Tailwind é carregado via CDN.

---

## ✨ O que ele faz

### Site (landing page)
- **Hero animado** com identidade visual Fleury, logo em SVG e contadores de impacto.
- Seções que explicam a solução: **Como usar**, **Cronograma**, **Setores**, **Impacto**, **Orçamento**, **Riscos & Mitigações** e **KPIs**.
- Animações de revelação ao rolar (com *failsafe* caso o JS/CDN falhe).

### Chatbot — o Fleurynho
- **Diálogos guiados por fluxos** (máquina de estados) que simulam o atendimento de ponta a ponta:
  - 🗓️ **Agendamento** completo (exame → pedido → unidade → horário → pagamento → **protocolo**)
  - 📄 **Resultados** (CPF → exame → entrega por app/e-mail)
  - 🧪 **Preparo** detalhado por exame
  - 💳 **Convênios** e 📍 **Unidades**
  - ❓ **Ajuda** e **tutorial** passo a passo
- Digitação simulada, respostas rápidas (quick replies) e reconhecimento de intenção por texto livre.

### Atendimento humano
- Botão **"Atendente"** no menu e dentro do chat, a qualquer momento.
- **Confirmação da escolha** (chatbot ou atendente) antes de transferir.
- Ao confirmar, o chat **vira um atendente humano**: muda cabeçalho, avatar, cor e mostra o **telefone da unidade**. Opção de voltar ao Fleurynho.
- Transbordo automático em **temas sensíveis** (reclamações, urgências).
- Se a pessoa não entender mesmo com o tutorial, é direcionada à **Central de Atendimento** com pessoas reais.

### Acessibilidade
- **VLibras** — tradutor oficial de Libras do Governo Federal (avatar de sinais).
- Widget de acessibilidade: **aumentar/diminuir fonte** e **alto contraste** (preferências salvas).
- Foco visível para teclado e suporte a `prefers-reduced-motion`.
- **Vídeo explicativo** (simulação animada) de como usar o site e o chatbot.

### Privacidade
- **Tela de boas-vindas** com aceite de **Termos de Uso, Política de Privacidade e LGPD**, escolha do canal (chatbot/atendente) e mini tutorial.

---

## 📁 Estrutura

```
fleury/
├── index.html   # landing page + modais (boas-vindas, vídeo) + widget de chat
├── app.js       # motor de diálogo, atendimento humano, acessibilidade e animações
├── README.md
└── .claude/launch.json   # config do preview local
```

- `index.html` — estrutura e estilo (Tailwind via CDN, animações inline, VLibras).
- `app.js` — o cérebro: objeto `flows` (fluxos de conversa), roteador `process()`, transbordo humano, funções de acessibilidade (`a11y*`), boas-vindas (`w*`) e vídeo (`playVideo`).

---

## 🚀 Caminho para produção

O motor de respostas (`flows` / `process()` em `app.js`) é roteirizado por regras e roda **100% offline**.
Para evoluir para produção, a ideia é substituir essa camada por chamadas à **API Claude** com a base de
conhecimento do Fleury (RAG) e integrações reais (agendamento, laudos, convênios), mantendo a mesma
interface, o transbordo humano e as regras de LGPD.

---

*Feito por [Igor Teixeira](https://github.com/graveigor) 💙*
