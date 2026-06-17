# Fleurynho — IA de Atendimento Humanizado · Fleury 🤖💙

Landing page + chatbot para o desafio de **atendimento automatizado e humanizado via IA** do Grupo Fleury.
Feito em **HTML + JavaScript + Tailwind CSS**, sem build e sem dependências — é só abrir no navegador.

🔗 **Demo:** [fleurynho.vercel.app](https://fleurynho.vercel.app)

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

## ✨ Funcionalidades

### Site (landing page)
- **Hero animado** com identidade visual Fleury, logo em SVG e contadores de impacto.
- Seções completas do projeto: **Como usar**, **Cronograma**, **Setores**, **Impacto**, **Orçamento**, **Riscos & Mitigações** e **KPIs**.
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
- Ao confirmar, o chat **vira um atendente humano**: muda cabeçalho, avatar, cor e mostra o **telefone da unidade** (fictício). Opção de voltar ao Fleurynho.
- Transbordo automático em **temas sensíveis** (reclamações, urgências).
- Se a pessoa não entender mesmo com o tutorial, é direcionada à **Central de Atendimento** com pessoas reais.

### Acessibilidade
- **VLibras** — tradutor oficial de Libras do Governo Federal (avatar de sinais).
- Widget de acessibilidade: **aumentar/diminuir fonte** e **alto contraste** (preferências salvas).
- Foco visível para teclado e suporte a `prefers-reduced-motion`.
- **Vídeo explicativo** (simulação animada) de como usar o site e o chatbot.

### Privacidade
- **Tela de boas-vindas** com aceite obrigatório de **Termos de Uso, Política de Privacidade e LGPD**, escolha do canal (chatbot/atendente) e mini tutorial.

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

## 🗣️ Roteiro de apresentação (6 min)
1. **Problema** (1 min): SAC sobrecarregado, filas e contatos repetitivos.
2. **Demo ao vivo** (2 min): abra o chat → agende um exame até o protocolo, peça resultado, e teste **"Falar com atendente"** (o chat vira humano).
3. **Projeto** (2 min): role até Cronograma, Setores, Impacto, Orçamento, Riscos e KPIs.
4. **Adesão & acessibilidade** (1 min): aceite LGPD, tutorial, VLibras, alto contraste e vídeo explicativo.

---

## 🚀 Caminho para produção

O motor de respostas (`flows` / `process()` em `app.js`) é roteirizado por regras e roda **100% offline**.
Em produção, basta substituir essa camada por chamadas à **API Claude** com a base de conhecimento do Fleury
(RAG) e integrações reais (agendamento, laudos, convênios), mantendo a mesma interface, o transbordo humano
e as regras de LGPD.

---

*Protótipo do desafio Grupo Fleury · 2026*
