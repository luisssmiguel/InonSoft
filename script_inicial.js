// Função para carregar informações do usuário logado
async function carregarInformacoesUsuario() {
    try {
        const token = localStorage.getItem('token'); // Obter o token armazenado no login

        const response = await fetch('http://localhost:3000/usuario-info', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Erro ao carregar informações do usuário');

        const data = await response.json();

        // Atualizar o HTML com o nome e o papel do usuário
        document.getElementById('user-name').textContent = data.nomeCompleto;
        document.getElementById('user-role').textContent = data.papel;
    } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);
    }
}

// Chamar a função ao carregar a página
document.addEventListener('DOMContentLoaded', carregarInformacoesUsuario);