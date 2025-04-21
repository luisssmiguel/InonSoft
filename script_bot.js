// Simulação de dados e estados
let connectionStatus = { connected: false, qrCode: null };
let selectedContactId = null;
let contacts = [
    { id: '1', name: 'João Silva', phone: '+5511999999999', lastMessage: 'Olá, preciso de ajuda', timestamp: new Date(Date.now() - 1000 * 60 * 5), unreadCount: 2, avatar: '👤' },
    { id: '2', name: 'Maria Souza', phone: '+5511988888888', lastMessage: 'Quando vocês abrem?', timestamp: new Date(Date.now() - 1000 * 60 * 30), unreadCount: 0, avatar: '👩' },
    { id: '3', name: 'Carlos Pereira', phone: '+5511977777777', lastMessage: 'Obrigado pelo atendimento', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), unreadCount: 0, avatar: '👨' }
];
let conversations = new Map();

// Elementos DOM
const contactsList = document.getElementById('contactsList');
const chatSection = document.getElementById('chatSection');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendMessage');
const connectButton = document.getElementById('connectWhatsApp');
const qrModal = document.getElementById('qrModal');
const closeModal = document.getElementById('closeModal');
const backButton = document.getElementById('backButton');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');

// Funções auxiliares
function formatTime(date) {
    return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function updateConnectionStatus(status) {
    connectionStatus = status;
    statusDot.classList.toggle('online', status.connected);
    statusText.textContent = status.connected ? 'Online' : 'Offline';
    messageInput.disabled = !status.connected || !selectedContactId;
    sendButton.disabled = !status.connected || !selectedContactId;
}

function renderContacts() {
    contactsList.innerHTML = '';
    contacts.forEach(contact => {
        const contactElement = document.createElement('div');
        contactElement.className = `contact-item ${contact.id === selectedContactId ? 'selected' : ''}`;
        contactElement.innerHTML = `
            <div class="contact-avatar">${contact.avatar}</div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="last-message">${contact.lastMessage || ''}</div>
            </div>
        `;
        contactElement.onclick = () => selectContact(contact.id);
        contactsList.appendChild(contactElement);
    });
}

function selectContact(contactId) {
    selectedContactId = contactId;
    const contact = contacts.find(c => c.id === contactId);
    
    document.querySelector('.chat-contact-info .contact-name').textContent = contact.name;
    renderMessages(contactId);
    renderContacts();
    messageInput.disabled = !connectionStatus.connected;
    sendButton.disabled = !connectionStatus.connected;
    
    if (window.innerWidth <= 768) {
        chatSection.classList.add('active');
    }
}

function renderMessages(contactId) {
    if (!conversations.has(contactId)) {
        conversations.set(contactId, []);
    }
    
    const messages = conversations.get(contactId);
    chatMessages.innerHTML = '';
    
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;
        messageElement.innerHTML = `
            <div class="message-content">
                ${message.content}
                <div class="message-time">${formatTime(message.timestamp)}</div>
            </div>
        `;
        chatMessages.appendChild(messageElement);
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage(content) {
    if (!selectedContactId || !content.trim()) return;
    
    const userMessage = {
        id: Date.now().toString(),
        content: content.trim(),
        timestamp: new Date(),
        sender: 'user'
    };
    
    if (!conversations.has(selectedContactId)) {
        conversations.set(selectedContactId, []);
    }
    conversations.get(selectedContactId).push(userMessage);
    
    renderMessages(selectedContactId);
    messageInput.value = '';
    
    const contactIndex = contacts.findIndex(c => c.id === selectedContactId);
    if (contactIndex >= 0) {
        contacts[contactIndex] = {
            ...contacts[contactIndex],
            lastMessage: content.trim(),
            timestamp: new Date()
        };
        renderContacts();
    }
    
    try {
        const response = await fetch('https://webhook.botpress.cloud/eea12d7d-fbe7-4faa-9745-4c19e0ed86fa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: content, userId: selectedContactId })
        });
        
        const data = await response.json();
        const botResponse = data.response || 'Desculpe, não consegui processar sua solicitação.';
        
        const botMessage = {
            id: Date.now().toString(),
            content: botResponse,
            timestamp: new Date(),
            sender: 'bot'
        };
        
        conversations.get(selectedContactId).push(botMessage);
        renderMessages(selectedContactId);
        
        contacts[contactIndex] = {
            ...contacts[contactIndex],
            lastMessage: botResponse,
            timestamp: new Date()
        };
        renderContacts();
    } catch (error) {
        console.error('Erro ao obter resposta do bot:', error);
    }
}

// Função para iniciar o bot e buscar o QR Code REAL
async function startBot() {
    try {
        const startResponse = await fetch('http://localhost:3000/start-bot');
        const startData = await startResponse.json();
        console.log(startData.message);

        const qrResponse = await fetch('http://localhost:3000/qr-code');
        if (!qrResponse.ok) throw new Error('QR Code ainda não gerado.');

        const qrData = await qrResponse.json();
        const qrCodeBase64 = qrData.qrCode;

        const qrContainer = document.getElementById('qrContainer');
        qrContainer.innerHTML = '';
        const img = document.createElement('img');
        img.src = `data:image/png;base64,${qrCodeBase64}`;
        img.alt = 'QR Code para conectar ao WhatsApp';
        qrContainer.appendChild(img);

        document.getElementById('qrModal').style.display = 'block';
    } catch (error) {
        console.error('Erro ao iniciar o bot ou buscar o QR Code:', error);
        alert('Erro ao conectar ao WhatsApp. Verifique se o servidor está online.');
    }
}

// Eventos de botões
connectButton.addEventListener('click', startBot);

closeModal.addEventListener('click', () => {
    document.getElementById('qrModal').style.display = 'none';
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(messageInput.value);
    }
});

sendButton.addEventListener('click', () => {
    sendMessage(messageInput.value);
});

backButton.addEventListener('click', () => {
    chatSection.classList.remove('active');
    selectedContactId = null;
    renderContacts();
});

// Inicialização
renderContacts();
updateConnectionStatus({ connected: false });