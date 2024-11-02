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

// Função para carregar vendas diárias separadas por tipo de venda (loja física e delivery)
async function loadDailySalesByType() {
  try {
      const response = await fetch('http://localhost:3000/vendas-diarias-separadas');
      if (!response.ok) throw new Error('Erro ao carregar vendas diárias separadas');
      
      const { delivery, lojaFisica } = await response.json();

      // Atualizar o HTML com os valores
      document.getElementById('dailySales').textContent = `R$ ${delivery.toFixed(2)}`;
      document.getElementById('storeSales').textContent = `R$ ${lojaFisica.toFixed(2)}`;
  } catch (error) {
      console.error('Erro ao carregar vendas diárias separadas:', error);
  }
}

// Carregar todos os dados ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
  loadLowStockProducts();
  loadDailySalesByType();
});