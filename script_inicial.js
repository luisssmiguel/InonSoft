// Função para carregar informações do usuário logado
async function carregarInformacoesUsuario() {
    try {
        const token = localStorage.getItem('token'); // Obter o token armazenado no login
        console.log("Token encontrado:", token); // Depuração: Verifique se o token foi encontrado

        if (!token) throw new Error('Usuário não autenticado');

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

        // Fallback: usa o nome do usuário do localStorage se a chamada ao servidor falhar
        const username = localStorage.getItem("username");
        if (username) {
            document.getElementById("user-name").innerText = username;
            document.getElementById("user-role").innerText = "Usuário"; // papel padrão ou genérico
        }
    }
}
// Executa ao carregar a página
document.addEventListener('DOMContentLoaded', carregarInformacoesUsuario);
