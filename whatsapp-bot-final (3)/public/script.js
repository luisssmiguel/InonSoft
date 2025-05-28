// Conectar ao servidor Socket.IO
const socket = io();

// Elementos do DOM
const qrcodeElement = document.getElementById('qrcode');
const statusMessage = document.getElementById('status-message');
const connectBtn = document.getElementById('connect-btn');
const disconnectBtn = document.getElementById('disconnect-btn');
const numbersList = document.getElementById('numbers-list');

// Variáveis de estado
let currentPhoneNumber = null;
let isConnected = false;
let isConnecting = false;
let isDisconnecting = false;

// Função para mostrar notificação de conexão realizada
function showConnectionNotification(name, phoneNumber) {
    console.log('Mostrando notificação de conexão realizada');
    
    // Cria o elemento de notificação
    const notification = document.createElement('div');
    notification.className = 'connection-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            </div>
            <div class="notification-text">
                <strong>CONEXÃO REALIZADA!</strong>
                <p>${name} (${phoneNumber})</p>
            </div>
        </div>
    `;
    
    // Adiciona ao corpo do documento
    document.body.appendChild(notification);
    
    // Adiciona classe para animar a entrada
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove após alguns segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

// Função para mostrar alerta de conexão realizada
function showConnectionAlert() {
    console.log('Mostrando alerta de conexão realizada');
    
    // Cria o elemento de alerta
    const alert = document.createElement('div');
    alert.className = 'connection-alert';
    alert.innerHTML = `
        <div class="alert-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
        </div>
        <div class="alert-text">CONEXÃO REALIZADA</div>
    `;
    
    // Adiciona ao container do QR code
    qrcodeElement.appendChild(alert);
    
    // Remove após alguns segundos
    setTimeout(() => {
        if (qrcodeElement.contains(alert)) {
            qrcodeElement.removeChild(alert);
        }
    }, 3000);
}

// Função para atualizar a interface quando conectado
function updateInterfaceConnected(name, phoneNumber) {
    console.log('Atualizando interface para estado conectado');
    
    // Atualiza a mensagem de status
    statusMessage.textContent = `CONEXÃO REALIZADA! WhatsApp conectado com sucesso! (${phoneNumber})`;
    statusMessage.classList.add('connected');
    statusMessage.classList.remove('error');
    
    // Atualiza o conteúdo do QR code
    qrcodeElement.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#128C7E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p style="margin-top: 15px; font-weight: bold; color: #128C7E;">Conectado!</p>
            <p style="color: #128C7E;">${name} (${phoneNumber})</p>
            <div class="connection-success-badge">CONEXÃO REALIZADA</div>
        </div>
    `;
    
    // Mostra a notificação de conexão realizada
    showConnectionNotification(name, phoneNumber);
    
    // Mostra o alerta de conexão realizada
    showConnectionAlert();
    
    // Atualiza o estado
    currentPhoneNumber = phoneNumber;
    isConnected = true;
    isConnecting = false;
    
    // Atualiza os botões
    connectBtn.disabled = true;
    disconnectBtn.disabled = false;
}

// Evento quando o socket se conecta ao servidor
socket.on('connect', () => {
    console.log('Conectado ao servidor Socket.IO');
    statusMessage.textContent = 'Conectado ao servidor. Aguardando ação...';
    
    // Verifica o status atual imediatamente após conectar
    socket.emit('checkStatus');
});

// Evento quando o socket se desconecta do servidor
socket.on('disconnect', () => {
    console.log('Desconectado do servidor Socket.IO');
    statusMessage.textContent = 'Desconectado do servidor. Tentando reconectar...';
    statusMessage.classList.add('error');
    
    // Limpa o QR code e mostra o spinner
    qrcodeElement.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Reconectando...</p>
        </div>
    `;
});

// Evento para receber o QR code
socket.on('qrCode', (qrCodeData) => {
    console.log('QR Code recebido');
    
    // Remove o spinner
    qrcodeElement.innerHTML = '';
    
    // Cria a imagem do QR code
    const qrImage = document.createElement('img');
    qrImage.src = qrCodeData;
    qrImage.alt = 'QR Code para WhatsApp';
    
    // Adiciona a imagem ao elemento
    qrcodeElement.appendChild(qrImage);
    
    // Atualiza a mensagem de status
    statusMessage.textContent = 'QR Code pronto! Escaneie com seu WhatsApp';
    
    // Atualiza o estado
    isConnecting = true;
    
    // Atualiza os botões
    connectBtn.disabled = true;
    disconnectBtn.disabled = true;
});

// Evento para receber resposta específica de desconexão
socket.on('disconnect_response', (data) => {
    console.log('Resposta de desconexão recebida:', data);
    
    isDisconnecting = false;
    
    if (data.success) {
        // Desconexão bem-sucedida
        statusMessage.textContent = 'Desconectado do WhatsApp com sucesso';
        statusMessage.classList.remove('connected', 'error');
        
        // Atualiza o conteúdo do QR code para o estado inicial
        qrcodeElement.innerHTML = `
            <div class="initial-state">
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxMjhDN0UiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjIgMTYuOTJWMTlhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMmgyLjA4YTIgMiAwIDAgMSAyIDEuNzIgMTIuODQgMTIuODQgMCAwIDAgLjcgMi44MSAyIDIgMCAwIDEtLjQ1IDIuMTFMOC4wOSA5Yy45IDEuOCAyLjM4IDMuMjggNC4xNyA0LjE5bDEuNDItMS40M2EyIDIgMCAwIDEgMi4xLS40NSAxMi44NCAxMi44NCAwIDAgMCAyLjgxLjdBMiAyIDAgMCAxIDIyIDE2LjkyeiI+PC9wYXRoPjwvc3ZnPg==" alt="Telefone" class="phone-icon">
                <p>Clique em "Conectar Número" para iniciar</p>
            </div>
        `;
        
        // Atualiza o estado
        currentPhoneNumber = null;
        isConnected = false;
        
        // Atualiza os botões
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
    } else {
        // Falha na desconexão
        statusMessage.textContent = `Erro ao desconectar: ${data.message}`;
        statusMessage.classList.add('error');
        statusMessage.classList.remove('connected');
        
        // Mantém o estado atual, mas permite novas tentativas
        disconnectBtn.disabled = false;
    }
});

// Evento para receber atualizações de status
socket.on('status', (data) => {
    console.log('Status atualizado:', data);
    
    if (data.status === 'connecting') {
        statusMessage.textContent = 'Iniciando conexão, aguarde o QR Code...';
        statusMessage.classList.remove('connected', 'error');
        
        qrcodeElement.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Gerando QR Code...</p>
            </div>
        `;
        
        isConnecting = true;
        isConnected = false;
        
        connectBtn.disabled = true;
        disconnectBtn.disabled = true;
    }
    else if (data.status === 'qr_generated') {
        statusMessage.textContent = 'QR Code gerado! Escaneie com seu WhatsApp';
        statusMessage.classList.remove('connected', 'error');
    }
    else if (data.status === 'connected') {
        console.log('Recebido status connected com dados:', data.phoneInfo);
        
        // Atualiza a interface para o estado conectado
        updateInterfaceConnected(data.phoneInfo.name, data.phoneInfo.phoneNumber);
    }
    else if (data.status === 'disconnected') {
        statusMessage.textContent = 'Desconectado do WhatsApp';
        statusMessage.classList.remove('connected');
        
        // Atualiza o conteúdo do QR code para o estado inicial
        qrcodeElement.innerHTML = `
            <div class="initial-state">
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxMjhDN0UiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjIgMTYuOTJWMTlhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMmgyLjA4YTIgMiAwIDAgMSAyIDEuNzIgMTIuODQgMTIuODQgMCAwIDAgLjcgMi44MSAyIDIgMCAwIDEtLjQ1IDIuMTFMOC4wOSA5Yy45IDEuOCAyLjM4IDMuMjggNC4xNyA0LjE5bDEuNDItMS40M2EyIDIgMCAwIDEgMi4xLS40NSAxMi44NCAxMi44NCAwIDAgMCAyLjgxLjdBMiAyIDAgMCAxIDIyIDE2LjkyeiI+PC9wYXRoPjwvc3ZnPg==" alt="Telefone" class="phone-icon">
                <p>Clique em "Conectar Número" para iniciar</p>
            </div>
        `;
        
        // Atualiza o estado
        currentPhoneNumber = null;
        isConnected = false;
        isConnecting = false;
        isDisconnecting = false;
        
        // Atualiza os botões
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
    }
    else if (data.status === 'error') {
        statusMessage.textContent = `Erro: ${data.error || 'Ocorreu um erro desconhecido'}`;
        statusMessage.classList.add('error');
        statusMessage.classList.remove('connected');
        
        // Atualiza o estado
        isConnecting = false;
        isDisconnecting = false;
        
        // Atualiza os botões com base no estado atual
        connectBtn.disabled = isConnected;
        disconnectBtn.disabled = !isConnected;
    }
    else if (data.status === 'already_connected') {
        console.log('Recebido status already_connected com dados:', data.phoneInfo);
        
        // Atualiza a interface para o estado conectado
        updateInterfaceConnected(data.phoneInfo.name, data.phoneInfo.phoneNumber);
    }
});

// Evento para receber a lista de números conectados
socket.on('connectedNumbers', (numbers) => {
    console.log('Números conectados recebidos:', numbers);
    updateNumbersList(numbers);
    
    // Se houver números conectados, atualiza o estado
    if (numbers.length > 0 && !isConnected) {
        const number = numbers[0];
        console.log('Atualizando estado para conectado baseado na lista de números');
        
        // Atualiza a interface para o estado conectado
        updateInterfaceConnected(number.name, number.phoneNumber);
    }
});

// Função para atualizar a lista de números conectados
function updateNumbersList(numbers) {
    // Limpa a lista atual
    numbersList.innerHTML = '';
    
    if (numbers.length === 0) {
        // Se não houver números conectados, exibe mensagem
        numbersList.innerHTML = '<p class="empty-list">Nenhum número conectado</p>';
        return;
    }
    
    // Adiciona cada número à lista
    numbers.forEach(number => {
        const numberItem = document.createElement('div');
        numberItem.className = 'number-item';
        
        const formattedDate = new Date(number.connectedAt).toLocaleString();
        
        numberItem.innerHTML = `
            <div class="number-info">
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMxMjhDN0UiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjIgMTYuOTJWMTlhMiAyIDAgMCAxLTIuMTggMiAxOS43OSAxOS43OSAwIDAgMS04LjYzLTMuMDcgMTkuNSAxOS41IDAgMCAxLTYtNiAxOS43OSAxOS43OSAwIDAgMS0zLjA3LTguNjdBMiAyIDAgMCAxIDQuMTEgMmgyLjA4YTIgMiAwIDAgMSAyIDEuNzIgMTIuODQgMTIuODQgMCAwIDAgLjcgMi44MSAyIDIgMCAwIDEtLjQ1IDIuMTFMOC4wOSA5Yy45IDEuOCAyLjM4IDMuMjggNC4xNyA0LjE5bDEuNDItMS40M2EyIDIgMCAwIDEgMi4xLS40NSAxMi44NCAxMi44NCAwIDAgMCAyLjgxLjdBMiAyIDAgMCAxIDIyIDE2LjkyeiI+PC9wYXRoPjwvc3ZnPg==" alt="Telefone">
                <div>
                    <strong>${number.name}</strong>
                    <div>${number.phoneNumber}</div>
                    <small>Conectado em: ${formattedDate}</small>
                </div>
            </div>
            <div class="connection-badge">CONEXÃO REALIZADA</div>
        `;
        
        numbersList.appendChild(numberItem);
    });
}

// Evento de clique no botão de conectar
connectBtn.addEventListener('click', () => {
    console.log('Botão Conectar clicado');
    socket.emit('startConnection');
});

// Evento de clique no botão de desconectar
disconnectBtn.addEventListener('click', () => {
    console.log('Botão Desconectar clicado');
    if (!isDisconnecting) {
        // Atualiza o estado para desconectando
        isDisconnecting = true;
        
        // Atualiza a mensagem de status
        statusMessage.textContent = 'Desconectando, aguarde...';
        
        // Desabilita o botão durante o processo
        disconnectBtn.disabled = true;
        disconnectBtn.textContent = "Desconectando...";
        
        // Envia o comando para desconectar
        socket.emit('disconnect_whatsapp', { phoneNumber: currentPhoneNumber });
        
        // Adiciona um timeout de segurança para resetar o estado caso não receba resposta
        setTimeout(() => {
            if (isDisconnecting) {
                isDisconnecting = false;
                statusMessage.textContent = 'Tempo esgotado ao desconectar. Tente novamente.';
                statusMessage.classList.add('error');
                
                // Reabilita o botão
                disconnectBtn.disabled = false;
                disconnectBtn.textContent = "Desconectar";
            }
        }, 15000); // 15 segundos de timeout
    }
});

// Inicialização
window.onload = function() {
    console.log('Página carregada, inicializando...');
    
    // Verifica o status da conexão
    fetch('/connection-status')
        .then(response => response.json())
        .then(data => {
            console.log('Status da conexão recebido:', data);
            
            if (data.isConnected && data.phoneInfo) {
                console.log('Já existe uma conexão ativa');
                
                // Atualiza a interface para o estado conectado
                updateInterfaceConnected(data.phoneInfo.name, data.phoneInfo.phoneNumber);
            }
        })
        .catch(error => {
            console.error('Erro ao verificar status da conexão:', error);
        });
    
    // Busca a lista de números conectados
    fetch('/connected-numbers')
        .then(response => response.json())
        .then(data => {
            console.log('Números conectados recebidos na inicialização:', data.numbers);
            updateNumbersList(data.numbers);
            
            // Se houver números conectados, atualiza o estado
            if (data.numbers.length > 0 && !isConnected) {
                const number = data.numbers[0];
                console.log('Atualizando estado para conectado baseado na lista de números');
                
                // Atualiza a interface para o estado conectado
                updateInterfaceConnected(number.name, number.phoneNumber);
            }
        })
        .catch(error => {
            console.error('Erro ao buscar números conectados:', error);
        });
    
    // Verifica se há um QR code em geração
    fetch('/qrcode')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('QR Code ainda não disponível');
        })
        .then(data => {
            if (data.qrCode) {
                // Se já existe um QR code, exibe-o
                qrcodeElement.innerHTML = '';
                const qrImage = document.createElement('img');
                qrImage.src = data.qrCode;
                qrImage.alt = 'QR Code para WhatsApp';
                qrcodeElement.appendChild(qrImage);
                statusMessage.textContent = 'QR Code pronto! Escaneie com seu WhatsApp';
                
                isConnecting = true;
                connectBtn.disabled = true;
                disconnectBtn.disabled = true;
            }
        })
        .catch(error => {
            console.log('Aguardando geração do QR Code:', error);
        });
};

// Adiciona logs para depuração
console.log('Script carregado e pronto para uso');
