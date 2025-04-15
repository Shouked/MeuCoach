# MeuCoach - Aplicativo Mobile de Treinos Personalizados

Este é um aplicativo mobile desenvolvido com React Native e Expo, com backend em Express e Supabase, para gerenciamento de treinos personalizados entre treinadores e alunos.

## Estrutura do Projeto

O projeto está organizado em duas partes principais:

- `/backend` - Servidor Express com Supabase para autenticação e armazenamento
- `/app` - Frontend React Native com Expo Router

## Configuração e Execução

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase (conta gratuita para desenvolvimento)
- Expo Go (app no smartphone para testes) ou emulador

### Configurando o Backend

1. Entre na pasta do backend:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Renomeie o arquivo `.env.example` para `.env`
   - Preencha com suas configurações do Supabase e outras variáveis

4. Inicie o servidor:

```bash
npm run dev
```

O servidor estará rodando na porta 3000 (ou na porta definida no .env).

### Configurando o Frontend (App Mobile)

1. Entre na pasta do app:

```bash
cd app
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o projeto Expo:

```bash
npm start
```

4. Siga as instruções no terminal para:
   - Abrir no emulador iOS/Android
   - Escanear o QR code com o app Expo Go no seu smartphone
   - Abrir no navegador (funcionalidades limitadas)

## Gerando um APK para Android

Para gerar um APK para testes:

1. Configure o eas.json conforme suas necessidades

2. Construa o APK:

```bash
eas build -p android --profile preview
```

3. Aguarde a construção e siga o link para download quando estiver pronto

## Configurando e Utilizando Push Notifications

1. As push notifications estão configuradas usando `expo-notifications`

2. Para testar localmente:
   - Execute `expo notifications`
   - Utilize o dashboard para enviar notificações de teste

3. Para implementação em produção:
   - Configure sua conta no Google Firebase (Android) e Apple Developer (iOS)
   - Adicione as credenciais ao projeto Expo através do dashboard ou EAS

## Publicando nas Lojas

### Google Play Store

1. Gere uma build de produção:

```bash
eas build -p android --profile production
```

2. Crie uma conta de desenvolvedor na Google Play Console

3. Configure sua ficha do aplicativo, screenshots, descrições

4. Faça upload da build gerada

### Apple App Store

1. Gere uma build de produção:

```bash
eas build -p ios --profile production
```

2. Crie uma conta Apple Developer

3. Configure o aplicativo no App Store Connect

4. Faça upload da build via TestFlight

5. Submeta para aprovação

## Recursos e Funcionalidades

- 🔐 Autenticação completa com Supabase
- 📅 Dashboard para alunos e treinadores
- 💪 Sistema de treinos personalizados
- 📈 Acompanhamento de progresso
- 📱 Notificações para lembretes
- 📷 Upload de imagens
- 📄 Geração de PDF de treinos
- 💳 Integração com pagamentos
- 💬 Chat em tempo real
- 📊 Estatísticas e métricas

## Suporte

Para dúvidas ou suporte, entre em contato via:

- Email: suporte@meucoach.com
- Documentação completa: [docs.meucoach.com](https://exemplo.com)
