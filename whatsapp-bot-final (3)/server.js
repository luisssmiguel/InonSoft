const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const venom = require('venom-bot');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const { exec } = require('child_process');

// Configuração do servidor Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Pasta para servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Variáveis para armazenar o QR code e sessões
let qrCode = null;
let venomClient = null;
let isConnecting = false;
let connectedNumbers = [];
let browserInstance = null;

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para obter o QR code atual
app.get('/qrcode', (req, res) => {
  if (qrCode) {
    res.json({ qrCode });
  } else {
    res.status(404).json({ error: 'QR Code ainda não disponível' });
  }
});

// Rota para obter os números conectados
app.get('/connected-numbers', (req, res) => {
  res.json({ numbers: connectedNumbers });
});

// Rota para verificar o status da conexão
app.get('/connection-status', (req, res) => {
  const isConnected = venomClient !== null;
  res.json({ 
    isConnected, 
    phoneInfo: isConnected && connectedNumbers.length > 0 ? {
      phoneNumber: connectedNumbers[0].phoneNumber,
      name: connectedNumbers[0].name
    } : null
  });
});

// Configuração do Socket.IO para comunicação em tempo real
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');
  
  // Envia a lista de números conectados para o cliente que acabou de conectar
  socket.emit('connectedNumbers', connectedNumbers);
  
  // Envia o status atual da conexão
  const isConnected = venomClient !== null;
  if (isConnected && connectedNumbers.length > 0) {
    socket.emit('status', { 
      status: 'connected',
      phoneInfo: {
        phoneNumber: connectedNumbers[0].phoneNumber,
        name: connectedNumbers[0].name
      }
    });
    console.log('Enviando status connected para novo cliente');
  } else if (isConnecting) {
    socket.emit('status', { status: 'connecting' });
    if (qrCode) {
      socket.emit('qrCode', qrCode);
    }
  }
  
  // Evento para iniciar a conexão com o WhatsApp
  socket.on('startConnection', () => {
    console.log('Recebido evento startConnection');
    if (!isConnecting && !venomClient) {
      isConnecting = true;
      qrCode = null;
      io.emit('status', { status: 'connecting' });
      startVenomBot();
    } else if (venomClient) {
      socket.emit('status', { 
        status: 'connected',
        phoneInfo: connectedNumbers.length > 0 ? {
          phoneNumber: connectedNumbers[0].phoneNumber,
          name: connectedNumbers[0].name
        } : { phoneNumber: 'desconhecido', name: 'Usuário' }
      });
      console.log('Cliente já conectado, enviando status connected');
    } else if (isConnecting) {
      socket.emit('status', { status: 'connecting' });
      if (qrCode) {
        socket.emit('qrCode', qrCode);
      }
    }
  });
  
  // Evento para verificar o status atual
  socket.on('checkStatus', () => {
    console.log('Recebido evento checkStatus');
    if (venomClient) {
      socket.emit('status', { 
        status: 'connected',
        phoneInfo: connectedNumbers.length > 0 ? {
          phoneNumber: connectedNumbers[0].phoneNumber,
          name: connectedNumbers[0].name
        } : { phoneNumber: 'desconhecido', name: 'Usuário' }
      });
      console.log('Enviando status connected em resposta a checkStatus');
    } else if (isConnecting) {
      socket.emit('status', { status: 'connecting' });
    } else {
      socket.emit('status', { status: 'disconnected' });
    }
  });
  
  // Evento para desconectar do WhatsApp
  socket.on('disconnect_whatsapp', async (data) => {
    try {
      console.log('Recebido evento disconnect_whatsapp');
      const phoneNumber = data?.phoneNumber || (connectedNumbers.length > 0 ? connectedNumbers[0].phoneNumber : 'desconhecido');
      
      console.log(`Tentando desconectar o número ${phoneNumber}...`);
      
      if (venomClient) {
        // Primeiro, tenta fazer logout do WhatsApp
        try {
          console.log('Executando logout do WhatsApp...');
          await venomClient.logout();
          console.log('Logout realizado com sucesso');
        } catch (logoutError) {
          console.error('Erro ao fazer logout:', logoutError);
          // Continua mesmo com erro no logout
        }
        
        // Em seguida, tenta fechar o cliente explicitamente
        try {
          console.log('Fechando o cliente Venom...');
          if (typeof venomClient.close === 'function') {
            await venomClient.close();
            console.log('Cliente Venom fechado com sucesso');
          } else {
            console.log('Método close não disponível, tentando alternativas...');
          }
        } catch (closeError) {
          console.error('Erro ao fechar o cliente:', closeError);
          // Continua mesmo com erro no close
        }
        
        // Força o encerramento de qualquer processo do Chromium/Puppeteer
        try {
          console.log('Forçando encerramento de processos do navegador...');
          if (process.platform === 'win32') {
            exec('taskkill /F /IM chrome.exe /T', () => {});
          } else {
            exec('pkill -f chromium || pkill -f chrome', () => {});
          }
        } catch (killError) {
          console.error('Erro ao matar processos do navegador:', killError);
        }
        
        // Limpa os tokens da sessão
        cleanSessionTokens();
        
        // Reseta as variáveis
        venomClient = null;
        qrCode = null;
        isConnecting = false;
        browserInstance = null;
        
        // Remove o número da lista de conectados
        connectedNumbers = [];
        
        // Notifica todos os clientes sobre a desconexão
        io.emit('status', { status: 'disconnected' });
        io.emit('connectedNumbers', connectedNumbers);
        
        console.log(`Número ${phoneNumber} desconectado com sucesso e tokens limpos`);
        
        // Responde especificamente ao cliente que solicitou a desconexão
        socket.emit('disconnect_response', { success: true, message: 'Desconectado com sucesso' });
      } else {
        console.log('Nenhum cliente conectado para desconectar');
        socket.emit('status', { status: 'not_connected', error: 'Nenhum cliente conectado para desconectar' });
        socket.emit('disconnect_response', { success: false, message: 'Nenhum cliente conectado' });
      }
    } catch (error) {
      console.error('Erro ao desconectar:', error);
      socket.emit('status', { status: 'error', error: 'Erro ao desconectar: ' + error.message });
      socket.emit('disconnect_response', { success: false, message: 'Erro ao desconectar: ' + error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Função para limpar os tokens da sessão
function cleanSessionTokens() {
  try {
    const sessionsDir = path.join(__dirname, 'sessions');
    const tokensDir = path.join(__dirname, 'tokens');
    
    // Limpa a pasta de sessões
    if (fs.existsSync(sessionsDir)) {
      console.log('Limpando pasta de sessões...');
      rimraf.sync(`${sessionsDir}/*`);
    }
    
    // Limpa a pasta de tokens
    if (fs.existsSync(tokensDir)) {
      console.log('Limpando pasta de tokens...');
      rimraf.sync(`${tokensDir}/*`);
    }
    
    console.log('Tokens e sessões limpos com sucesso');
  } catch (error) {
    console.error('Erro ao limpar tokens e sessões:', error);
  }
}

// Função para iniciar o Venom Bot
function startVenomBot() {
  console.log('Iniciando Venom Bot...');
  
  // Cria a pasta sessions se não existir
  const sessionsDir = path.join(__dirname, 'sessions');
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir);
  }

  venom
    .create(
      'sessionName', // Nome da sessão
      (base64Qr, asciiQR, attempts, urlCode) => {
        // Callback para quando o QR code for gerado
        console.log('QR Code gerado. Escaneie com seu WhatsApp:');
        console.log(asciiQR); // Exibe o QR code no terminal em ASCII
        
        // Armazena o QR code em base64 para enviar ao frontend
        qrCode = base64Qr;
        
        // Envia o QR code para todos os clientes conectados via Socket.IO
        io.emit('qrCode', base64Qr);
        io.emit('status', { status: 'qr_generated' });
      },
      (statusSession, session) => {
        // Callback para status da sessão
        console.log('Status da sessão:', statusSession);
        
        // Se a sessão for conectada, notifica o frontend
        if (statusSession === 'isLogged') {
          isConnecting = false;
          
          // Obtém informações do número conectado
          if (venomClient) {
            venomClient.getHostDevice()
              .then((hostInfo) => {
                const phoneNumber = hostInfo.wid.user;
                const name = hostInfo.pushname || 'Usuário';
                
                // Limpa a lista de números conectados e adiciona o atual
                connectedNumbers = [{
                  phoneNumber,
                  name,
                  connectedAt: new Date().toISOString()
                }];
                
                // Notifica todos os clientes sobre a nova conexão
                io.emit('connectedNumbers', connectedNumbers);
                
                // Envia o status de conectado para todos os clientes
                io.emit('status', { 
                  status: 'connected',
                  phoneInfo: {
                    phoneNumber,
                    name
                  }
                });
                
                console.log(`Conexão estabelecida com ${name} (${phoneNumber}). Enviando status connected para todos os clientes.`);
              })
              .catch(err => {
                console.error('Erro ao obter informações do dispositivo:', err);
              });
          }
        } else if (statusSession === 'notLogged') {
          isConnecting = false;
          qrCode = null;
          io.emit('status', { status: 'disconnected' });
        }
      },
      {
        folderSession: sessionsDir, // Pasta onde a sessão será salva
        headless: true, // Define o navegador invisível (modo headless) para ambientes sem interface gráfica
        useChrome: false, // Não forçar o uso do Chrome
        debug: true, // Ativar debug para ver mais detalhes
        logQR: true,
        disableWelcome: true,
        autoClose: 60000,
        createPathFileToken: true,
        puppeteerOptions: {
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
          ]
        }
      }
    )
    .then((client) => {
      console.log('Venom Bot iniciado com sucesso!');
      venomClient = client;
      
      // Armazena a instância do navegador para poder fechá-la depois
      if (client && client.page && client.page.browser) {
        browserInstance = client.page.browser();
      }
      
      startBot(client);
    })
    .catch((error) => {
      console.error('Erro ao iniciar o Venom Bot:', error);
      isConnecting = false;
      io.emit('status', { status: 'error', error: 'Erro ao iniciar o Venom Bot: ' + error.message });
    });
}

// Função principal que lida com as mensagens
function startBot(client) {
  console.log("Bot iniciado com sucesso!");

  // Função para atendimento padrão
  async function atendimentoPadrao(client, msg, nome) {
    await delay(3000);
    client.sendText(
      msg.from,
      `Olá, ${nome}! Sou o assistente virtual da *Açaiteria Zaponi Intense*. Como posso ajudar você hoje? Digite uma das opções abaixo:\n\n` +
        `1 - Ver nosso cardápio\n` +
        `2 - Promoções do dia\n` +
        `3 - Horário de funcionamento\n` +
        `4 - Localização e contato\n` +
        `5 - Outras dúvidas`
    );
  }

  client.onMessage(async (msg) => {
    // Verifica se message.body está definido
    if (!msg.body) {
      console.log("Mensagem recebida não contém body:", msg);
      return;
    }

    console.log("Mensagem recebida:", msg.body);

    if (msg.from.endsWith('@c.us')) {
      const contact = await client.getContact(msg.from);
      const nome = contact.pushname?.split(" ")[0] || "Cliente";

      // Verifica se a mensagem corresponde a uma das opções pré-definidas
      if (/^(menu|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola)$/i.test(msg.body)) {
        await atendimentoPadrao(client, msg, nome);
      } else if (msg.body === '1') {
        await delay(3000);
        client.sendText(
          msg.from,
          `*Açaiteria Zaponi Intense - Cardápio*\n\n` +
          `*Açaí*\n Tamanhos:\n` +
          ` - 300ml: R$ 10,00\n` +
          ` - 500ml: R$ 15,00\n` +
          ` - 700ml: R$ 20,00\n` +
          ` - 1L: R$ 25,00\n\n` +
          `*Combos de Açaí:*\n` +
          ` - Açaí Fit: Banana, granola, mel - R$ 18,00\n` +
          ` - Açaí Tropical: Morango, kiwi, leite condensado - R$ 22,00\n` +
          ` - Açaí Especial: Leite em pó, paçoca, chocolate branco - R$ 25,00\n\n` +
          `*Complementos (cada):*\n` +
          ` - Frutas: Morango, banana, manga - R$ 3,00\n` +
          ` - Caldas: Leite condensado, chocolate, doce de leite - R$ 2,00\n` +
          ` - Grãos e Nuts: Granola, amendoim, castanha de caju - R$ 2,50\n\n` +
          `*Sorvetes*\n Bolas de Sorvete (cada):\n` +
          ` - Sabores Clássicos: Chocolate, Morango, Baunilha, Limão, Flocos - R$ 6,00\n` +
          ` - Sabores Especiais: Cookies & Cream, Menta com Chocolate, Doce de Leite - R$ 7,50\n\n` +
          `Sorvete no Pote:\n` +
          ` - 300ml: R$ 12,00\n` +
          ` - 500ml: R$ 18,00\n\n` +
          `*Milkshakes*\n Sabores: Chocolate, Morango, Ovomaltine, Baunilha, Nutella\n` +
          ` - Tamanho P (300ml): R$ 12,00\n` +
          ` - Tamanho M (500ml): R$ 15,00\n` +
          ` - Tamanho G (700ml): R$ 18,00\n\n` +
          `*Bebidas*\n` +
          ` - Sucos Naturais: R$ 8,00\n` +
          ` - Água de Coco: R$ 6,00\n` +
          ` - Refrigerantes: R$ 5,00\n` +
          ` - Chás Gelados: R$ 7,00`
        );
      } else if (msg.body === '2') {
        await delay(3000);
        client.sendText(
          msg.from,
          `🌟 *Promoções do Dia* 🌟\n\n` +
          `🍧 *Açaí em dobro* - Na compra de um açaí, o segundo sai pela metade do preço!\n` +
          `🍦 *Sorvete de 2 Litros* - De R$30,00 por R$25,00 (sabores limitados)\n\n` +
          `Essas ofertas são válidas apenas hoje! Aproveite!`
        );
      } else if (msg.body === '3') {
        await delay(3000);
        client.sendText(
          msg.from,
          `Nosso horário de funcionamento é:\n\n` +
          `🕒 Segunda a Sexta: 10:00 - 22:00\n` +
          `🕒 Sábado e Domingo: 12:00 - 23:00\n\n` +
          `Estamos ansiosos para atendê-lo!`
        );
      } else if (msg.body === '4') {
        await delay(3000);
        client.sendText(
          msg.from,
          `Você pode nos encontrar na seguinte localização:\n\n` +
          `📍 *Endereço:* R. Sandro Antônio Mendes, 175, Parque Vitoria Regia\n` +
          `📞 *Telefone:* (11) 1234-5678\n\n` +
          `Estamos sempre prontos para atendê-lo!`
        );
      } else if (msg.body === '5') {
        await delay(3000);
        client.sendText(
          msg.from,
          `Se você tiver outras dúvidas ou precisar de mais informações, fique à vontade para perguntar aqui ou ligar para nosso atendimento pelo número (11) 1234-5678.`
        );
      } else {
        // Caso a mensagem não corresponda a nenhuma opção, enviar para a API de IA
        try {
          const response = await fetch('https://bots.easy-peasy.ai/bot/d68ba378-65f0-48ef-8d7b-e80563b35345/api', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': '4ab87c4c-d729-46b2-963a-beaa40653b3d',
            },
            body: JSON.stringify({
              message: msg.body,
              history: [],
              stream: false,
            }),
          });

          const data = await response.json();
          const replyText = data.bot?.text || 'Desculpe, não consegui processar a resposta.';

          await client.sendText(msg.from, replyText);
        } catch (error) {
          console.error('Erro ao obter resposta do bot:', error);
          await client.sendText(msg.from, 'Desculpe, houve um erro ao processar sua mensagem.');
        }
      }
    }
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Inicia o servidor na porta 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  // Não inicia o Venom Bot automaticamente, aguarda comando do frontend
  console.log('Aguardando comando para iniciar o Venom Bot...');
});

// Tratamento para encerramento limpo do servidor
process.on('SIGINT', async () => {
  console.log('Encerrando servidor...');
  
  // Tenta desconectar o cliente Venom se estiver ativo
  if (venomClient) {
    try {
      console.log('Desconectando cliente Venom...');
      await venomClient.logout();
      
      if (typeof venomClient.close === 'function') {
        await venomClient.close();
      }
      
      // Força o encerramento de qualquer processo do Chromium/Puppeteer
      if (process.platform === 'win32') {
        exec('taskkill /F /IM chrome.exe /T', () => {});
      } else {
        exec('pkill -f chromium || pkill -f chrome', () => {});
      }
    } catch (error) {
      console.error('Erro ao desconectar cliente Venom:', error);
    }
  }
  
  // Encerra o servidor HTTP
  server.close(() => {
    console.log('Servidor HTTP encerrado');
    process.exit(0);
  });
});
