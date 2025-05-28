# Sistema de Chatbot WhatsApp com Venom-Bot

Este projeto implementa um sistema de chatbot para WhatsApp utilizando o Venom-Bot, com exibição do QR code no terminal e no frontend.

## Estrutura do Projeto

- `server.js`: Backend principal que utiliza o Venom-Bot para conexão com WhatsApp
- `server-demo.js`: Versão de demonstração que simula o QR code e a conexão
- `public/`: Pasta com arquivos do frontend
  - `index.html`: Estrutura da página
  - `style.css`: Estilos da interface
  - `script.js`: Lógica de comunicação com o backend

## Versão de Demonstração

Para testar a interface e o fluxo do sistema sem precisar de um ambiente gráfico completo, use a versão de demonstração:

```bash
cd whatsapp-bot
node server-demo.js
```

Acesse `http://localhost:3000` no navegador para ver a interface. Um QR code de demonstração será exibido e após 15 segundos o sistema simulará uma conexão bem-sucedida.

## Instalação em Ambiente de Produção

Para executar o sistema completo com o Venom-Bot real, siga estas instruções:

### Requisitos

- Node.js 14+ instalado
- Ambiente com interface gráfica (necessário para o Chromium/Puppeteer)
- Acesso à internet
- WhatsApp instalado no celular

### Passo a Passo

1. Clone o repositório ou copie os arquivos para sua máquina:

```bash
git clone <url-do-repositorio> whatsapp-bot
cd whatsapp-bot
```

2. Instale as dependências:

```bash
npm install
```

3. Execute o servidor principal:

```bash
node server.js
```

4. Acesse o frontend em `http://localhost:3000`

5. Escaneie o QR code exibido usando o WhatsApp do seu celular:
   - Abra o WhatsApp
   - Toque em Menu (três pontos) > WhatsApp Web
   - Aponte a câmera para o QR code exibido na tela

### Solução de Problemas Comuns

#### Erro ao iniciar o navegador Chromium

Se você encontrar erros relacionados ao Chromium/Puppeteer:

1. Instale as dependências do Chromium:

```bash
sudo apt-get update
sudo apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
```

2. Certifique-se de estar em um ambiente com interface gráfica (desktop Linux, Windows ou macOS)

3. Se estiver usando WSL no Windows, instale um servidor X e configure a variável DISPLAY

#### QR Code não aparece ou não atualiza

1. Verifique se o servidor está rodando corretamente
2. Limpe o cache do navegador
3. Verifique se o Socket.IO está funcionando (veja os logs do console)
4. Tente reiniciar o servidor

#### Erro de conexão com WhatsApp

1. Certifique-se de que seu celular tem conexão com a internet
2. Verifique se você está usando a versão mais recente do WhatsApp
3. Tente desconectar todas as sessões do WhatsApp Web existentes

## Personalização do Chatbot

O comportamento do chatbot está definido na função `startBot()` no arquivo `server.js`. Você pode modificar as respostas e adicionar novas funcionalidades editando esta função.

## Considerações de Segurança

- Não compartilhe o QR code gerado, pois ele dá acesso à sua conta do WhatsApp
- Mantenha suas credenciais e tokens seguros
- Considere implementar autenticação no frontend em ambiente de produção

## Licença

Este projeto é fornecido como está, sem garantias. Use por sua conta e risco.
