// Função para carregar os dados do usuário logado
async function carregarDadosUsuario() {
  try {
    const token = localStorage.getItem('token'); // Obtém o token do usuário logado
    if (!token) {
      alert('Você não está autenticado. Faça login novamente.');
      window.location.href = 'login.html'; // Redireciona para a tela de login
      return;
    }

    const response = await fetch('http://localhost:3000/usuario-info', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 403) {
      alert('Sessão expirada. Faça login novamente.');
      window.location.href = 'login.html';
      return;
    }

    if (!response.ok) throw new Error('Erro ao carregar dados do usuário.');

    const data = await response.json();
    document.getElementById('user-name').textContent = data.username;
    document.getElementById('user-email').textContent = data.email;
  } catch (error) {
    console.error('Erro ao carregar dados do usuário:', error);
    alert('Erro ao carregar informações do usuário. Tente novamente.');
  }
}

// Função para alterar a senha do usuário logado
async function alterarSenha(event) {
  event.preventDefault(); // Evita o comportamento padrão do formulário

  const currentPassword = document.getElementById('current-password').value;
  const newPassword = document.getElementById('new-password').value;

  try {
    const token = localStorage.getItem('token'); // Obtém o token do usuário logado
    if (!token) {
      alert('Você não está autenticado. Faça login novamente.');
      window.location.href = 'login.html'; // Redireciona para a tela de login
      return;
    }

    const response = await fetch('http://localhost:3000/alterar-senha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }

    // Exibe mensagem de sucesso
    const alertSucesso = document.getElementById('alert-success');
    alertSucesso.style.display = 'block';
    setTimeout(() => {
      alertSucesso.style.display = 'none';
    }, 2400);

    // Limpa os campos do formulário
    document.getElementById('password-form').reset();
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    alert('Erro ao alterar senha. Tente novamente.');
  }
}

// Função para inicializar a tela
function inicializarConta() {
  carregarDadosUsuario(); // Carrega os dados do usuário logado

  // Configura o evento de alteração de senha
  const form = document.getElementById('password-form');
  form.addEventListener('submit', alterarSenha);

  // Configura o botão de voltar
  document.getElementById('btn-voltar').addEventListener('click', function () {
    window.location.href = 'tela_inicial.html';
  });
}

// Inicializa a tela ao carregar o DOM
document.addEventListener('DOMContentLoaded', inicializarConta);