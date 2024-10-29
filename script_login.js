// Função para exibir mensagens de sucesso ou erro em um pop-up
function displayMessage(message, isSuccess) {
  const messageBox = document.getElementById('message');
  if (messageBox) {
    alert(message); // Pop-up para feedback imediato
    messageBox.textContent = message;
    messageBox.classList.toggle('success', isSuccess);
    messageBox.classList.toggle('error', !isSuccess);

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

  console.log('Tentando registrar usuário:', { username, email, password });

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const result = await response.text();
    displayMessage(result, response.ok);

    if (response.ok) {
      document.querySelector(".container").classList.remove("sign-up-mode");
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

  console.log('Tentando fazer login com:', { username, password });

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const result = await response.text();
    displayMessage(result, response.ok);

    if (response.ok) {
      setTimeout(() => { window.location.href = "tela_inicial.html"; }, 1000);
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    displayMessage('Erro ao fazer login. Por favor, tente novamente.', false);
  }
}

// Alterna entre os formulários de login e cadastro
document.querySelector("#sign-up-btn")?.addEventListener('click', () => {
  document.querySelector(".container").classList.add("sign-up-mode");
});

document.querySelector("#sign-in-btn")?.addEventListener('click', () => {
  document.querySelector(".container").classList.remove("sign-up-mode");
});
