let produtosSelecionados = [];

// Carregar produtos ao abrir a página
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:3000/produtos');
    const produtos = await response.json();
    const productList = document.getElementById('product-list');

    produtos.forEach(produto => {
        const produtoDiv = document.createElement('div');
        produtoDiv.classList.add('produto-item');
        produtoDiv.innerHTML = `
          <input type="checkbox" onchange="selecionarProduto(${produto.id}, '${produto.nome}', ${Number(produto.preco)})">
          <span>${produto.nome} - R$${Number(produto.preco).toFixed(2)}</span>
        `;
        productList.appendChild(produtoDiv);
      });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
});

// Selecionar produtos
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

// Calcular o valor total com desconto
function calculateTotal() {
  const discount = parseFloat(document.getElementById('discount').value) || 0;
  const totalSemDesconto = produtosSelecionados.reduce((total, produto) => total + produto.preco, 0);
  const totalComDesconto = totalSemDesconto - (totalSemDesconto * (discount / 100));
  document.getElementById('total-amount').textContent = `R$ ${totalComDesconto.toFixed(2)}`;
}

// Finalizar compra e enviar ao servidor
async function finalizarCompra() {
  const pagamento = document.getElementById('payment-method').value;
  const desconto = parseFloat(document.getElementById('discount').value) || 0;
  const total = parseFloat(document.getElementById('total-amount').textContent.replace("R$", "").trim());

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
        desconto
      })
    });

    if (response.ok) {
      alert("Compra finalizada com sucesso!");

      // Limpar seleção dos produtos, mas manter a lista de produtos disponível
      produtosSelecionados = []; // Limpa os produtos selecionados
      document.querySelectorAll('.produto-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false; // Desmarca todos os checkboxes
      });

      // Resetar o valor total, método de pagamento e desconto
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
