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
        const userNameElement = document.getElementById('user-name');
        const userRoleElement = document.getElementById('user-role');

        if (userNameElement && userRoleElement) {
            userNameElement.textContent = data.nomeCompleto;
            userRoleElement.textContent = data.papel;
        } else {
            console.error('Elementos HTML para exibir o nome e a função do usuário não foram encontrados.');
        }
    } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);

        // Fallback: usa o nome do usuário do localStorage se a chamada ao servidor falhar
        const username = localStorage.getItem("username");
        if (username) {
            const userNameElement = document.getElementById("user-name");
            const userRoleElement = document.getElementById("user-role");

            if (userNameElement && userRoleElement) {
                userNameElement.textContent = username;
                userRoleElement.textContent = "Usuário"; // papel padrão ou genérico
            }
        }
    }
}