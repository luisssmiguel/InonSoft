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
        <td>${item.quantidadeEmEstoque}</td>
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
  