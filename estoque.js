// Função para carregar os dados do estoque e atualizar a tabela
async function loadEstoque() {
    const response = await fetch('http://localhost:3000/estoque');
    const data = await response.json();
  
    const tableBody = document.querySelector('.table-section tbody');
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
  }
  
  // Função para adicionar um produto ao estoque
  async function addEstoque() {
    const codigo = prompt("Digite o código do produto:");
    const quantidade = prompt("Digite a quantidade:");
    const valorUnitario = prompt("Digite o valor unitário:");
  
    await fetch('http://localhost:3000/estoque', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ codigo, quantidade, valorUnitario })
    });
  
    loadEstoque(); // Atualiza a tabela
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
  