// Função para carregar dados do usuário logado
async function carregarDadosUsuario() {
  try {
    const token = localStorage.getItem('token'); // Obtém o token do usuário logado
    if (!token) {
      alert('Você não está autenticado. Faça login novamente.');
      window.location.href = 'tela_login.html'; // Redireciona para a tela de login
      return;
    }

    const response = await fetch('http://localhost:3000/usuario-info', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Erro ao carregar dados do usuário.');

    const data = await response.json();
    document.getElementById('user-name').textContent = data.username || 'Usuário';
    document.getElementById('user-role').textContent = data.email || 'Sem e-mail';
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    alert('Erro ao carregar informações do usuário. Tente novamente.');
  }
}

// Carrega os dados do usuário ao carregar a página
document.addEventListener('DOMContentLoaded', carregarDadosUsuario);

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
    document.body.classList.toggle('sidebar-open');
}
