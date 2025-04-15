# MeuCoach App

Aplicativo móvel do MeuCoach - plataforma para conexão entre treinadores e alunos.

## Índice
1. [Visualização do Projeto em Desenvolvimento](#1-visualização-do-projeto-em-desenvolvimento)
2. [Build do Aplicativo com EAS](#2-build-do-aplicativo-com-eas)
3. [Estrutura do Projeto](#3-estrutura-do-projeto)

---

## 1. Visualização do Projeto em Desenvolvimento

### 1.1. Preparação do Ambiente

1. Navegue até a pasta do aplicativo:
   ```
   cd app
   ```

2. Instale as dependências (caso ainda não tenha feito):
   ```
   npm install
   ```

3. Limpe o cache do Expo (recomendado para evitar problemas):
   ```
   npm run clear-cache
   ```
   Ou alternativamente:
   ```
   npx expo start --clear
   ```

### 1.2. Iniciar o Servidor de Desenvolvimento

1. Inicie o servidor de desenvolvimento:
   ```
   npm start
   ```
   Ou:
   ```
   npx expo start
   ```

2. Após iniciar, você verá um QR code no terminal e várias opções:
   - `a` - Abrir no emulador Android (se instalado)
   - `i` - Abrir no simulador iOS (apenas em macOS)
   - `w` - Abrir no navegador web
   - `r` - Recarregar o app
   - `m` - Abrir o menu no dispositivo

### 1.3. Visualização no Dispositivo Físico

1. **Dispositivos Android:**
   - Instale o aplicativo Expo Go da Play Store
   - Abra o Expo Go
   - Escaneie o QR code mostrado no terminal
   - Ou entre na seção "Projects" e adicione o projeto manualmente com a URL

2. **Dispositivos iOS:**
   - Instale o aplicativo Expo Go da App Store
   - Abra a câmera do iPhone e escaneie o QR code
   - A câmera reconhecerá e oferecerá para abrir no Expo Go

### 1.4. Resolução de Problemas Comuns

1. **Problema de conexão:**
   - Verifique se o dispositivo móvel está na mesma rede Wi-Fi que seu computador
   - Tente usar a opção "Tunnel" em vez de "LAN" (digite `t` no terminal)

2. **Limpeza de cache:**
   Se o app não estiver funcionando corretamente:
   ```
   npm run clear-cache
   ```

3. **Erros de módulos/dependências:**
   ```
   npm run clean
   ```
   Este comando remove node_modules, limpa o cache do npm e reinstala as dependências.

---

## 2. Build do Aplicativo com EAS

### 2.1. Configuração Inicial

1. Instale o EAS CLI globalmente:
   ```
   npm install -g eas-cli
   ```

2. Faça login na sua conta Expo:
   ```
   eas login
   ```
   (Se não tiver uma conta, crie em [expo.dev](https://expo.dev/signup))

3. Verifique que o arquivo `eas.json` esteja configurado corretamente (já está configurado nas alterações recentes).

### 2.2. Configuração para Android

1. Configure as credenciais (keystore) para Android:
   ```
   eas credentials
   ```

2. Siga o assistente interativo:
   - Selecione o projeto
   - Escolha "Android"
   - Selecione "Let EAS handle this for me" (para deixar o EAS gerenciar a keystore)
   - Ou "I want to upload my own keystore" (se já tiver uma keystore)

3. Se você escolher que o EAS gerencie as credenciais, ele criará automaticamente uma keystore para você.

### 2.3. Executando a Build

1. Para uma build de preview (APK interno para testes):
   ```
   cd app
   eas build -p android --profile preview
   ```

2. Para uma build de produção (AAB para Google Play):
   ```
   eas build -p android --profile production
   ```

3. Durante o processo, o EAS pode pedir algumas confirmações:
   - Confirmar perfil de build
   - Aceitar criação de keystores
   - Confirmar configurações

4. Acompanhe o progresso no terminal. A build será processada nos servidores do Expo.

5. Ao finalizar, você receberá um link para baixar o arquivo APK/AAB.

### 2.4. Configuração para iOS (caso necessário)

1. Configure as credenciais para iOS:
   ```
   eas credentials
   ```

2. Siga o assistente:
   - Selecione o projeto
   - Escolha "iOS"
   - Selecione se deseja que o EAS gerencie os certificados ou se você fornecerá os seus

3. Execute a build para iOS:
   ```
   eas build -p ios --profile preview
   ```
   (Requer conta Apple Developer)

### 2.5. Verificando Status das Builds

1. Verifique o status de todas as suas builds:
   ```
   eas build:list
   ```

2. Para ver detalhes de uma build específica:
   ```
   eas build:view
   ```

---

## 3. Estrutura do Projeto

### 3.1. Estrutura de Pastas

- `app/` - Componentes da interface e telas do aplicativo
  - `(auth)/` - Telas de autenticação (login, registro)
  - `(tabs)/` - Interface principal com guias de navegação
  - `_layout.tsx` - Layout principal da aplicação
  - `index.tsx` - Página inicial do aplicativo

- `assets/` - Imagens, fontes e outros recursos estáticos

- `components/` - Componentes reutilizáveis
  - `auth/` - Componentes relacionados à autenticação

- `lib/` - Bibliotecas e configurações
  - `supabase.ts` - Configuração e cliente do Supabase

### 3.2. Configuração

- `.env` - Variáveis de ambiente (não versionado no Git)
- `app.json` - Configuração do Expo
- `babel.config.js` - Configuração do Babel
- `eas.json` - Configuração do EAS Build
- `tailwind.config.js` - Configuração do Tailwind CSS

### 3.3. Arquivos Importantes

- `package.json` - Dependências e scripts do projeto
- `.gitignore` - Arquivos ignorados pelo Git

---

## Notas Importantes

1. **Arquivo .env**: Não está incluído no Git por segurança. Certifique-se de ter um arquivo `.env` na pasta `app/` com as seguintes variáveis:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://xydiwguzqvmkkpxpjyuo.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZGl3Z3V6cXZta2tweHBqeXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODM5MzgsImV4cCI6MjA2MDE1OTkzOH0._nbhNxfDCBc2tuCIkVxvftIGmaHYdmrayFTenWMT2SE
   ```

2. **Plano Expo**: A build via EAS pode requerer um plano pago do Expo se você exceder o limite de builds gratuitas.

3. **Tempo de build**: A primeira build pode levar até 30 minutos para ser concluída.

4. **Keystore de produção**: Guarde a keystore com segurança. Se perdê-la, você não conseguirá atualizar o app na Google Play.

5. **Verificação de dependências**: Execute `npm outdated` periodicamente para verificar se há dependências desatualizadas. 