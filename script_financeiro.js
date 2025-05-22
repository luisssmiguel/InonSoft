let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function openTransactionModal() {
  document.getElementById('transactionModal').classList.remove('hidden');
  document.getElementById('data').valueAsDate = new Date();
}

function closeTransactionModal() {
  document.getElementById('transactionModal').classList.add('hidden');
}

document.getElementById('transactionForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const tipo = document.getElementById('tipo').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const data = document.getElementById('data').value;
  const categoria = document.getElementById('categoria').value;
  const descricao = document.getElementById('descricao').value;

  const novaTransacao = {
    id: Date.now().toString(),
    tipo,
    valor,
    data,
    categoria,
    descricao
  };

  transactions.push(novaTransacao);
  localStorage.setItem('transactions', JSON.stringify(transactions));

  updateSummary();
  updateTransactionTable();
  initializeCharts();
  closeTransactionModal();
});

function updateSummary() {
  let entradas = transactions.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0);
  let saidas = transactions.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0);
  let saldo = entradas - saidas;

  document.getElementById('totalEntradas').textContent = entradas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('totalSaidas').textContent = saidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  document.getElementById('saldoAtual').textContent = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function updateTransactionTable() {
  const tbody = document.getElementById('transactionTableBody');
  tbody.innerHTML = '';

  transactions.forEach((t) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-2">${t.data}</td>
      <td class="py-2">${t.tipo}</td>
      <td class="py-2">${t.categoria}</td>
      <td class="py-2">${t.descricao}</td>
      <td class="py-2 text-right">${t.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
      <td class="py-2 text-right">
        <button onclick="deleteTransaction('${t.id}')" class="text-red-600 hover:underline">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function deleteTransaction(id) {
  if (confirm('Tem certeza que deseja excluir esta transação?')) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateSummary();
    updateTransactionTable();
    initializeCharts();
  }
}

function initializeCharts() {
  const entradasPorMes = Array(12).fill(0);
  const saidasPorMes = Array(12).fill(0);

  transactions.forEach(t => {
    const mes = new Date(t.data).getMonth();
    if (t.tipo === 'entrada') entradasPorMes[mes] += t.valor;
    else if (t.tipo === 'saida') saidasPorMes[mes] += t.valor;
  });

  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      datasets: [
        { label: 'Entradas', backgroundColor: 'rgba(34,197,94,0.7)', data: entradasPorMes },
        { label: 'Saídas', backgroundColor: 'rgba(239,68,68,0.7)', data: saidasPorMes }
      ]
    },
    options: { responsive: true }
  });

  const categorias = {};
  transactions.forEach(t => {
    categorias[t.categoria] = (categorias[t.categoria] || 0) + t.valor;
  });

  new Chart(document.getElementById('pieChart'), {
    type: 'pie',
    data: {
      labels: Object.keys(categorias),
      datasets: [{
        data: Object.values(categorias),
        backgroundColor: ['#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa']
      }]
    },
    options: { responsive: true }
  });
}

// Inicializar dashboard
updateSummary();
updateTransactionTable();
initializeCharts();

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
    document.body.classList.toggle('sidebar-open');
}
