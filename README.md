# Fleurynho — IA de Atendimento Humanizado · Fleury 🤖💙

Landing page + chatbot funcional para o desafio de **atendimento automatizado e humanizado via IA**
do Grupo Fleury. Feito em **HTML + JavaScript + Tailwind CSS**.

## ▶️ Como rodar
Abra `index.html` no navegador (duplo clique). Não precisa de servidor nem build — o Tailwind
é carregado via CDN.

## ✨ O que o site entrega
- **Landing page animada**: hero com blobs animados, logo Fleury (SVG), contadores de impacto,
  efeitos de revelação no scroll e identidade visual da marca.
- **Chatbot flutuante (botão 💬 no canto)**: a assistente *Fleurynho* responde com tom humanizado sobre
  agendamento, resultados, preparo de exames, convênios e unidades, com:
  - digitação simulada e respostas rápidas (quick replies);
  - **transbordo para atendente humano** em casos sensíveis (reclamações, urgências).
- **Documentação do projeto na própria página**: cronograma (16 semanas), setores envolvidos,
  tempo de implementação (~4 meses), impacto (curto/médio/longo prazo), orçamento (R$ 598 mil) e LGPD.

## 🗣️ Roteiro de apresentação (6 min)
1. **Problema** (1 min): SAC sobrecarregado, filas e contatos repetitivos.
2. **Demo ao vivo** (2 min): abra o chat → agende um exame, peça resultado, mande uma "reclamação" e veja o transbordo humanizado.
3. **Projeto** (2 min): role até as seções Impacto, Cronograma, Setores e Orçamento.
4. **Visão de futuro** (1 min): expansão de canais (WhatsApp/app) + IA Claude com RAG.

## 🚀 Caminho para produção
O motor de respostas está em `app.js` (função `responder`). Em produção, basta substituí-lo por uma
chamada à **API Claude** com histórico da conversa + base de conhecimento Fleury (RAG), mantendo
transbordo humano e regras de LGPD.

## 📁 Arquivos
- `index.html` — landing page + widget de chat (Tailwind via CDN)
- `app.js` — motor de intenções, UI do chat e animações de scroll
