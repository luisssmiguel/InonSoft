// Função para carregar as informações do usuário ao carregar a página
async function carregarInformacoesUsuario() {
    try {
        const response = await fetch('http://localhost:3000/usuario-info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Usando token JWT para autenticação, se aplicável
            }
        });
        
        if (!response.ok) throw new Error('Erro ao carregar informações do usuário');
        
        const data = await response.json();
        document.getElementById('full-name').textContent = data.nomeCompleto;
        document.getElementById('email').textContent = data.email;
    } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);
    }
}

// Função para alterar a senha do usuário
async function alterarSenha() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('As novas senhas não coincidem.');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/alterar-senha', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Usando token JWT para autenticação
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (!response.ok) throw new Error('Erro ao alterar a senha');
        
        alert('Senha alterada com sucesso!');
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';
    } catch (error) {
        console.error('Erro ao alterar a senha:', error);
        alert('Erro ao alterar a senha. Verifique se a senha atual está correta.');
    }
}

// Função para redirecionar para a tela inicial
function voltarParaTelaInicial() {
    window.location.href = "tela_inicial.html";
}

// Carregar as informações do usuário ao iniciar a página
document.addEventListener('DOMContentLoaded', carregarInformacoesUsuario);
