// Função para carregar produtos com baixa quantidade
async function loadLowStockProducts() {
    try {
      const response = await fetch('http://localhost:3000/produtos-baixa-quantidade');
      if (!response.ok) throw new Error('Erro ao carregar produtos com baixa quantidade');
  
      const produtos = await response.json();
  
      const lowStockList = document.getElementById('lowStockList');
      lowStockList.innerHTML = ''; // Limpa a lista antes de adicionar os itens
  
      produtos.forEach(produto => {
        const listItem = document.createElement('li');
        listItem.textContent = produto.codigo; // Exibe apenas o código do produto
        lowStockList.appendChild(listItem);
      });
    } catch (error) {
      console.error('Erro ao carregar produtos com baixa quantidade:', error);
    }
  }
  
  // Carregar produtos com baixa quantidade ao abrir a página
  document.addEventListener('DOMContentLoaded', loadLowStockProducts);
  
  // Função para carregar vendas diárias
  async function loadDailySales() {
    try {
      const response = await fetch('http://localhost:3000/vendas-diarias');
      if (!response.ok) throw new Error('Erro ao carregar vendas diárias');
  
      const data = await response.json();
      const total_vendas = parseFloat(data.total_vendas) || 0; // Garantia de que seja um número
  
      document.getElementById('dailySales').textContent = `R$ ${total_vendas.toFixed(2)}`;
    } catch (error) {
      console.error('Erro ao carregar vendas diárias:', error);
    }
  }
  
  // Carregar dados ao abrir a página
  document.addEventListener('DOMContentLoaded', () => {
    loadLowStockProducts();
    loadDailySales();
  });