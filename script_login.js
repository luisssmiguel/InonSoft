// Função para exibir mensagens de sucesso ou erro
function displayMessage(message, isSuccess) {
  const messageBox = document.getElementById('message');
  if (messageBox) {
    messageBox.textContent = message;
    if (isSuccess) {
      messageBox.classList.add('success');
      messageBox.classList.remove('error');
    } else {
      messageBox.classList.add('error');
      messageBox.classList.remove('success');
    }

    // Ocultar a mensagem após 5 segundos
    setTimeout(() => {
      messageBox.textContent = '';
      messageBox.classList.remove('success', 'error');
    }, 5000);
  }
}

// Função para registrar um novo usuário
async function registerUser() {
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  // Log dos dados para depuração
  console.log('Tentando registrar usuário:', { username, email, password });

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),  // Enviando as informações do formulário
    });

    const result = await response.text();
    if (response.ok) {
      displayMessage(result, true);  // Exibe mensagem de sucesso
      // Alternar para o modo de login após registro bem-sucedido
      const container = document.querySelector(".container");
      if (container) {
        container.classList.remove("sign-up-mode");
      }
    } else {
      displayMessage('Erro: ' + result, false);  // Exibe mensagem de erro
    }
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    displayMessage('Erro ao cadastrar usuário. Por favor, tente novamente.', false);
  }
}

// Função para fazer login do usuário
async function loginUser() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  // Log dos dados para depuração
  console.log('Tentando fazer login com:', { username, password });

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),  // Enviando as credenciais de login
    });

    const result = await response.text();
    if (response.ok) {
      displayMessage(result, true);  // Exibe mensagem de sucesso no login
      // Redirecionar para a página inicial após login bem-sucedido
      setTimeout(() => {
        window.location.href = "tela_inicial.html";  // Redireciona para a página correta
      }, 1000);  // Tempo para exibir a mensagem antes do redirecionamento
    } else {
      displayMessage('Erro: ' + result, false);  // Exibe mensagem de erro no login
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    displayMessage('Erro ao fazer login. Por favor, tente novamente.', false);
  }
}

// Alterna entre os formulários de login e cadastro
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

if (sign_up_btn && sign_in_btn && container) {
  sign_up_btn.addEventListener('click', () => {
    container.classList.add("sign-up-mode");
  });

  sign_in_btn.addEventListener('click', () => {
    container.classList.remove("sign-up-mode");
  });
}
