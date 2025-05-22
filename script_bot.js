const statusText = document.getElementById('status');
const qrCodeDiv = document.getElementById('qrCode');

async function refreshStatus() {
  try {
    const statusResponse = await fetch('http://167.234.244.155:3000/status');
    const statusData = await statusResponse.json();

    if (statusData.connected) {
      statusText.textContent = 'Conectado';
      statusText.className = 'status-online';
      qrCodeDiv.innerHTML = '<p>Bot já conectado ✅</p>';
    } else {
      statusText.textContent = 'Desconectado';
      statusText.className = 'status-offline';
      await loadQrCode();
    }
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    statusText.textContent = 'Erro ao conectar';
    statusText.className = 'status-offline';
  }
}

async function loadQrCode() {
  try {
    const qrResponse = await fetch('http://167.234.244.155:3000/qr');
    const qrHtml = await qrResponse.text();
    qrCodeDiv.innerHTML = qrHtml;
  } catch (error) {
    console.error('Erro ao carregar QR Code:', error);
    qrCodeDiv.innerHTML = '<p>Erro ao carregar QR Code.</p>';
  }
}

// Atualiza a cada 5 segundos
setInterval(refreshStatus, 5000);

// Primeira atualização automática
refreshStatus();
