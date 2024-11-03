// Função para carregar produtos com baixa quantidade
async function loadLowStockProducts() {
  try {
      const response = await fetch('http://localhost:3000/produtos-baixa-quantidade');
      if (!response.ok) throw new Error('Erro ao carregar produtos com baixa quantidade');

      const produtos = await response.json();
      const lowStockList = document.getElementById('lowStockList');
      lowStockList.innerHTML = '';

      produtos.forEach(produto => {
          const listItem = document.createElement('li');
          listItem.textContent = produto.codigo;
          lowStockList.appendChild(listItem);
      });
  } catch (error) {
      console.error('Erro ao carregar produtos com baixa quantidade:', error);
  }
}

// Função para carregar vendas diárias separadas por tipo
async function loadDailySalesByType() {
  try {
      const response = await fetch('http://localhost:3000/vendas-diarias-separadas');
      if (!response.ok) throw new Error('Erro ao carregar vendas diárias');

      const data = await response.json();
      
      // Verificar se os valores são números, senão atribuir 0
      const delivery = parseFloat(data.delivery) || 0;
      const lojaFisica = parseFloat(data.lojaFisica) || 0;

      document.getElementById('dailySales').textContent = `R$ ${delivery.toFixed(2)}`;
      document.getElementById('storeSales').textContent = `R$ ${lojaFisica.toFixed(2)}`;
  } catch (error) {
      console.error('Erro ao carregar vendas diárias separadas:', error);
  }
}

// Carregar dados ao abrir a página
document.addEventListener('DOMContentLoaded', () => {
  loadLowStockProducts();
  loadDailySalesByType();
});