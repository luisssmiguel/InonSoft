// Script para alternar entre as telas de Login e Cadastro
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener('click', () => {
    container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener('click', () => {
    container.classList.remove("sign-up-mode");
});

// Função para fazer login do usuário
async function loginUser() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.text();
    if (response.status === 200) {
      alert(result);
      // Redirecionar para outra página após login bem-sucedido, por exemplo:
      // window.location.href = "pagina_principal.html";
    } else {
      alert('Erro: ' + result);
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    alert('Erro ao fazer login. Por favor, tente novamente.');
  }
}

// Função para registrar um novo usuário
async function registerUser() {
  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const result = await response.text();
    if (response.status === 200) {
      alert(result);
      // Alternar para o modo de login após registro bem-sucedido
      container.classList.remove("sign-up-mode");
    } else {
      alert('Erro: ' + result);
    }
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    alert('Erro ao cadastrar usuário. Por favor, tente novamente.');
  }
}
