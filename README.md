# Bairro Cuidado — Zeladoria colaborativa para pessoas idosas
Global Solution CitizenTech. App mobile (React Native/Expo) + plataforma web (React/Vite), integrados pelo Supabase.

## Como rodar
1. Crie um projeto no Supabase e rode `supabase.sql` no SQL Editor.
2. **Web:** `cd web && cp .env.example .env` (preencha URL e chave) → `npm install` → `npm run dev`. Publique na Vercel com as mesmas variáveis.
3. **App:** `npx create-expo-app app-expo`, depois `cd app-expo && npx expo install @supabase/supabase-js react-native-url-polyfill`. Copie `app/App.js` e `app/supabase.js` para dentro dele (preenchendo URL e chave) → `npx expo start`.

## Integração
Os dois usam a tabela `reports`. O idoso relata no app e o relato aparece na web em tempo real; quem cuida do bairro muda a situação na web e o app mostra o novo status.

## Papel de cada plataforma
- **App:** quem sofre o problema (idoso): relatar em poucos passos e acompanhar.
- **Web:** quem ajuda a resolver (subprefeitura, associação) e o familiar que acompanha.

## Motion e acessibilidade
Ver o documento da entrega. Resumo: entrada suave das telas/cards, confirmação de envio, aviso de status; tudo desligado com "reduzir movimento". Fontes grandes, contraste alto, áreas de toque 60px+, rótulos para leitor de tela, HTML semântico, foco visível, status com ícone + texto.
