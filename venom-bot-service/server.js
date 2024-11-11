// server.js
const express = require('express');
const venom = require('venom-bot');
const cors = require('cors');

const app = express();
app.use(cors());

let qrCodeImage = null; // Armazenará o QR Code em base64
let botClient = null; // Armazena a instância do bot

// Inicializa o Venom-Bot
function initializeBot() {
  venom
    .create({
      session: 'venom-bot-session',
      folderSession: './sessions',
      catchQR: (base64Qr) => {
        qrCodeImage = base64Qr; // Atualiza o QR Code em base64
        console.log('QR code atualizado');
      },
    })
    .then((client) => {
      botClient = client; // Guarda o cliente do bot para uso posterior
      console.log('Bot de WhatsApp iniciado com sucesso!');
      setupBotListeners(client); // Configura os listeners do bot
    })
    .catch((error) => {
      console.log('Erro ao iniciar o bot:', error);
    });
}

// Configura os listeners do bot
function setupBotListeners(client) {
  client.onMessage((msg) => {
    if (msg.body === 'Oi') {
      client.sendText(msg.from, 'Olá! Como posso ajudar?');
    }
    // Adicione outras lógicas de resposta aqui, conforme necessário
  });
}

// Rota para obter o QR Code em base64
app.get('/qr-code', (req, res) => {
  if (qrCodeImage) {
    res.json({ qrCode: qrCodeImage });
  } else {
    res.status(500).json({ message: 'QR code não disponível no momento.' });
  }
});

// Rota para inicializar o bot manualmente (caso queira reiniciar)
app.get('/start-bot', (req, res) => {
  initializeBot();
  res.json({ message: 'Bot iniciado!' });
});

// Inicia o servidor na porta 3001
app.listen(3001, () => {
  console.log('Microserviço do Venom-Bot rodando na porta 3001');
  initializeBot(); // Inicia o bot assim que o servidor é iniciado
});