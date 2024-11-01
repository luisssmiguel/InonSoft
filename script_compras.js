let produtosSelecionados = [];

// Função para carregar os produtos e exibir na lista
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:3000/produtos');
    const produtos = await response.json();
    const productList = document.getElementById('product-list');

    produtos.forEach(produto => {
      const produtoDiv = document.createElement('div');
      produtoDiv.classList.add('produto-item');
      produtoDiv.innerHTML = `
        <input type="checkbox" onchange="selecionarProduto(${produto.id}, '${produto.nome}', ${produto.preco})">
        <span>${produto.nome} - R$${Number(produto.preco).toFixed(2)}</span>
      `;
      productList.appendChild(produtoDiv);
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
});

// Função para adicionar ou remover produtos do pedido
function selecionarProduto(id, nome, preco) {
  const produtoExistente = produtosSelecionados.find(p => p.id === id);

  if (produtoExistente) {
    // Remover o produto caso já esteja selecionado
    produtosSelecionados = produtosSelecionados.filter(p => p.id !== id);
  } else {
    // Adicionar o produto se não estiver na lista
    produtosSelecionados.push({ id, nome, preco });
  }

  calculateTotal(); // Atualiza o valor total
}

// Função para calcular o total com desconto
function calculateTotal() {
  const discount = parseFloat(document.getElementById('discount').value) || 0;
  const totalSemDesconto = produtosSelecionados.reduce((total, produto) => total + produto.preco, 0);
  
  // Aplica o desconto (se for uma porcentagem, ou valor fixo)
  const totalComDesconto = totalSemDesconto - (totalSemDesconto * (discount / 100));
  
  document.getElementById('total-amount').textContent = `R$ ${totalComDesconto.toFixed(2)}`;
}

// Finalizar compra e enviar ao servidor
async function finalizarCompra() {
  const pagamento = document.getElementById('payment-method').value;
  const desconto = parseFloat(document.getElementById('discount').value) || 0;
  const total = parseFloat(document.getElementById('total-amount').textContent.replace("R$", "").trim());
  const tipoVenda = document.getElementById('sale-type').value;

  // Log para verificar o valor de tipoVenda antes do envio
  console.log("Tipo de Venda Selecionado:", tipoVenda);

  if (!pagamento) {
    alert("Por favor, informe o método de pagamento.");
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/finalizar-pedido', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        produtos: produtosSelecionados,
        total,
        pagamento,
        desconto,
        tipoVenda  // Confirmação de que tipoVenda está sendo enviado
      })
    });

    if (response.ok) {
      alert("Compra finalizada com sucesso!");
      produtosSelecionados = [];
      document.querySelectorAll('.produto-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
      });
      document.getElementById('total-amount').textContent = "R$ 0.00";
      document.getElementById('payment-method').value = "";
      document.getElementById('discount').value = "";
    } else {
      const message = await response.text();
      throw new Error(message);
    }
  } catch (error) {
    console.error("Erro ao finalizar compra:", error);
    alert("Erro ao finalizar compra: " + error.message);
  }
}