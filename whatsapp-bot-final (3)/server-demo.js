const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

// Configuração do servidor Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Pasta para servir arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// QR Code de exemplo em base64 (um QR code genérico para demonstração)
const demoQrCode = 'data:image/png;base64,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';

// Variável para armazenar o QR code
let qrCode = demoQrCode;

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para obter o QR code atual
app.get('/qrcode', (req, res) => {
  res.json({ qrCode });
});

// Configuração do Socket.IO para comunicação em tempo real
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');
  
  // Envia o QR code de demonstração para o cliente que acabou de conectar
  socket.emit('qrCode', qrCode);
  
  // Simula uma conexão após 15 segundos
  setTimeout(() => {
    console.log('Simulando conexão do WhatsApp...');
    socket.emit('status', { status: 'connected' });
  }, 15000);
  
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Inicia o servidor na porta 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de demonstração rodando em http://localhost:${PORT}`);
  console.log('Este é um servidor de demonstração que simula o QR code e a conexão do WhatsApp');
});
