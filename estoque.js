// Função para carregar dados do estoque e atualizar a tabela
async function loadEstoque() {
  console.log("Carregando dados do estoque...");

  try {
    const response = await fetch('http://localhost:3000/estoque');
    if (!response.ok) throw new Error("Erro ao carregar estoque");
    const data = await response.json();

    const tableBody = document.getElementById('estoque-tabela-body');
    tableBody.innerHTML = ''; // Limpa a tabela

    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.codigo}</td>
        <td>${item.quantidade}</td>
        <td>${item.valorUnitario}</td>
        <td>
          <button onclick="editEstoque(${item.id})" class="edit-button"><i class="fas fa-edit"></i></button>
          <button onclick="removeEstoque(${item.id})" class="remove-button"><i class="fas fa-trash"></i></button>
        </td>
      `;
      tableBody.appendChild(row);
    });

    console.log("Dados do estoque carregados com sucesso!");
  } catch (error) {
    console.error("Erro ao carregar dados do estoque:", error);
  }
}

// Função para adicionar um produto ao estoque
async function addEstoque() {
  console.log("Tentando adicionar produto...");

  const codigo = prompt("Digite o código do produto:");
  const quantidade = parseInt(prompt("Digite a quantidade:"), 10);
  const valorUnitario = parseFloat(prompt("Digite o valor unitário:"));

  if (!codigo || isNaN(quantidade) || isNaN(valorUnitario)) {
    alert("Todos os campos devem ser preenchidos corretamente.");
    console.error("Erro: Dados inválidos ao adicionar produto");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/estoque', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ codigo, quantidade, valorUnitario })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message);
    }

    alert("Produto adicionado com sucesso!");
    console.log("Produto adicionado com sucesso no backend");
    loadEstoque(); // Atualiza a tabela
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    alert("Erro ao adicionar produto: " + error.message);
  }
}
  
// Função para editar um produto no estoque
async function editEstoque(id) {
  const quantidade = prompt("Digite a nova quantidade:");
  const valorUnitario = prompt("Digite o novo valor unitário:");
  
  await fetch(`http://localhost:3000/estoque/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantidade, valorUnitario })
  });
  
  loadEstoque(); // Atualiza a tabela
}
  
// Função para remover um produto do estoque
async function removeEstoque(id) {
  await fetch(`http://localhost:3000/estoque/${id}`, {
    method: 'DELETE'
  });
  
  loadEstoque(); // Atualiza a tabela
}
  
// Carregar estoque ao carregar a página
document.addEventListener('DOMContentLoaded', loadEstoque);
  
// Função para abrir o modal
function openModal() {
  document.getElementById('modalAddProduct').style.display = 'flex';
}

// Função para fechar o modal
function closeModal() {
  document.getElementById('modalAddProduct').style.display = 'none';
}

// Função para adicionar o produto (executada ao clicar no botão do modal)
async function confirmAddProduct() {
  const codigo = document.getElementById("productCode").value;
  const quantidade = parseInt(document.getElementById("productQuantity").value, 10);
  const valorUnitario = parseFloat(document.getElementById("productPrice").value);

  if (!codigo || isNaN(quantidade) || isNaN(valorUnitario)) {
    alert("Todos os campos devem ser preenchidos corretamente.");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/estoque', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ codigo, quantidade, valorUnitario })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message);
    }

    alert("Produto adicionado com sucesso!");
    loadEstoque(); // Atualiza a tabela
    closeModal(); // Fecha o modal após adicionar o produto
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    alert("Erro ao adicionar produto: " + error.message);
  }
}

// Substitui o addEstoque() pelo openModal() para abrir o modal ao clicar no botão
document.querySelector('.add-button').onclick = openModal;

// Função para pesquisar produtos na tabela
function searchEstoque(term) {
  const filter = term.toLowerCase();
  const tableBody = document.getElementById('estoque-tabela-body');
  const rows = tableBody.getElementsByTagName('tr');

  // Loop por todas as linhas da tabela e oculta as que não correspondem ao termo
  for (const row of rows) {
    const codigo = row.cells[0].textContent.toLowerCase();
    const quantidade = row.cells[1].textContent.toLowerCase();
    const valorUnitario = row.cells[2].textContent.toLowerCase();

    // Verifica se alguma célula da linha contém o termo pesquisado
    if (
      codigo.includes(filter) ||
      quantidade.includes(filter) ||
      valorUnitario.includes(filter)
    ) {
      row.style.display = ''; // Mostra a linha se houver correspondência
    } else {
      row.style.display = 'none'; // Oculta a linha se não houver correspondência
    }
  }
}

// Função para carregar informações do usuário logado
async function carregarInformacoesUsuario() {
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
    console.error('Erro ao carregar informações do usuário:', error);
    alert('Erro ao carregar informações do usuário. Tente novamente.');
  }
}

// Carrega as informações do usuário ao carregar a página
document.addEventListener('DOMContentLoaded', carregarInformacoesUsuario);

// Script para o toggle da sidebar
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
    document.body.classList.toggle('sidebar-open');
}

// Função para abrir o modal de edição
function openEditModal(produto) {
    // Preencha os campos se necessário
    document.getElementById('modalEditProduct').style.display = 'flex';
}

// Função para fechar o modal de edição
function closeEditModal() {
    document.getElementById('modalEditProduct').style.display = 'none';
}

// Função para editar um produto no estoque (abre o modal de edição)
function editEstoque(codigo, quantidade, valorUnitario) {
    document.getElementById('editProductCode').value = codigo;
    document.getElementById('editProductQuantity').value = quantidade;
    document.getElementById('editProductPrice').value = valorUnitario;
    document.getElementById('modalEditProduct').style.display = 'flex';
}

// Função para confirmar a edição do produto
async function confirmEditProduct() {
    const codigo = document.getElementById('editProductCode').value;
    const quantidade = parseInt(document.getElementById('editProductQuantity').value, 10);
    const valorUnitario = parseFloat(document.getElementById('editProductPrice').value);

    if (!codigo || isNaN(quantidade) || isNaN(valorUnitario)) {
        alert("Todos os campos devem ser preenchidos corretamente.");
        return;
    }

    try {
        // Atualiza o produto no backend usando o código como identificador
        const response = await fetch(`http://localhost:3000/estoque/${codigo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quantidade, valorUnitario })
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message);
        }

        alert("Produto atualizado com sucesso!");
        closeEditModal();
        loadEstoque(); // Atualiza a tabela na tela
    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        alert("Erro ao atualizar produto: " + error.message);
    }
}