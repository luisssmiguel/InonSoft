// Variável global para o gráfico
let salesChart;

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

// Função para carregar produtos com baixa quantidade no estoque
async function loadLowStockProducts() {
    try {
        // Tenta carregar da API real primeiro
        const response = await fetch('http://localhost:3000/produtos-baixa-quantidade');
        
        if (response.ok) {
            const produtos = await response.json();
            renderizarProdutosBaixoEstoque(produtos);
        } else {
            // Se falhar, usa dados de demonstração
            usarDadosDemonstracaoEstoque();
        }
    } catch (error) {
        console.error('Erro ao carregar produtos com baixa quantidade:', error);
        // Fallback para dados de demonstração
        usarDadosDemonstracaoEstoque();
    }
}

// Função para renderizar os produtos com baixo estoque na lista
function renderizarProdutosBaixoEstoque(produtos) {
    const lowStockList = document.getElementById('lowStockList');
    lowStockList.innerHTML = '';

    produtos.forEach(produto => {
        const listItem = document.createElement('li');
        listItem.textContent = produto.codigo || produto.name;
        lowStockList.appendChild(listItem);
    });
}

// Dados de demonstração para produtos com baixo estoque
function usarDadosDemonstracaoEstoque() {
    const produtos = [
        { name: 'Camiseta Branca P', quantity: 3, minQuantity: 5 },
        { name: 'Tênis Nike Air 39', quantity: 2, minQuantity: 5 },
        { name: 'Notebook Lenovo', quantity: 1, minQuantity: 3 },
        { name: 'iPhone 13 Pro Max', quantity: 2, minQuantity: 4 }
    ];
    renderizarProdutosBaixoEstoque(produtos);
}

// Função para carregar vendas diárias separadas por tipo
async function loadDailySalesByType(mes, ano) {
    try {
        // Tenta carregar dados da API real
        const response = await fetch(`http://localhost:3000/vendas-diarias-separadas?mes=${mes}&ano=${ano}`);
        
        if (response.ok) {
            const data = await response.json();
            atualizarVendasNaInterface(data.delivery || 0, data.lojaFisica || 0);
        } else {
            // Se falhar, usa dados de demonstração
            usarDadosDemonstracaoVendas(mes, ano);
        }
    } catch (error) {
        console.error('Erro ao carregar vendas diárias separadas:', error);
        // Fallback para dados de demonstração
        usarDadosDemonstracaoVendas(mes, ano);
    }
}

// Atualiza os valores de vendas na interface
function atualizarVendasNaInterface(delivery, lojaFisica) {
    document.getElementById('deliverySales').textContent = `R$ ${parseFloat(delivery).toFixed(2)}`;
    document.getElementById('storeSales').textContent = `R$ ${parseFloat(lojaFisica).toFixed(2)}`;
}

// Dados de demonstração para vendas diárias
function usarDadosDemonstracaoVendas(mes, ano) {
    // Gera valores baseados no mês e ano para ter alguma variação
    const baseDelivery = 1200 + (mes * 100);
    const baseStore = 2500 + (mes * 150);
    
    // Adiciona aleatoriedade para ser mais realista
    const delivery = baseDelivery * (0.8 + Math.random() * 0.4);
    const lojaFisica = baseStore * (0.8 + Math.random() * 0.4);
    
    atualizarVendasNaInterface(delivery, lojaFisica);
}

// Função para carregar gráfico de vendas mensais
async function loadMonthlySalesTrend(mes, ano) {
    try {
        // Tenta carregar da API real primeiro
        const response = await fetch(`http://localhost:3000/vendas-mensais?mes=${mes}&ano=${ano}`);
        
        if (response.ok) {
            const data = await response.json();
            renderizarGraficoVendas(data);
        } else {
            // Se falhar, usa dados de demonstração
            usarDadosDemonstracaoGrafico(mes, ano);
        }
    } catch (error) {
        console.error('Erro ao carregar dados do gráfico:', error);
        // Fallback para dados de demonstração
        usarDadosDemonstracaoGrafico(mes, ano);
    }
}

// Função para renderizar o gráfico de vendas
function renderizarGraficoVendas(data) {
    const days = data.map(item => item.dia);
    const totalSales = data.map(item => parseFloat(item.total_vendas || item.amount) || 0);

    const ctx = document.getElementById('salesChart').getContext('2d');
    if (salesChart) salesChart.destroy();

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: 'Vendas Diárias',
                data: totalSales,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Dias do Mês'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Total de Vendas (R$)'
                    }
                }
            },
            plugins: {
                legend: { display: true },
                title: { display: true, text: 'Tendência de Vendas ao Longo do Mês' }
            }
        }
    });
}

// Dados de demonstração para o gráfico de vendas
function usarDadosDemonstracaoGrafico(mes, ano) {
    const daysInMonth = new Date(ano, mes, 0).getDate();
    const data = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(ano, mes - 1, day);
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const baseAmount = isWeekend ? 1200 : 800;
        const randomFactor = Math.random() * 0.5 + 0.75;
        
        data.push({
            dia: day,
            total_vendas: parseFloat((baseAmount * randomFactor).toFixed(2))
        });
    }
    
    renderizarGraficoVendas(data);
}

// Inicializa o select de anos com os últimos 5 anos
function inicializarSelectAnos() {
    const yearSelect = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();
    
    // Adiciona os últimos 5 anos
    for (let year = currentYear; year >= currentYear - 4; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Evento ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa componentes
    inicializarSelectAnos();
    
    // Carrega dados do usuário
    carregarInformacoesUsuario();
    
    // Configura valores iniciais para filtros
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    
    // Seleciona mês e ano atual
    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;
    
    // Carrega dados iniciais
    loadLowStockProducts();
    loadMonthlySalesTrend(currentMonth, currentYear);
    loadDailySalesByType(currentMonth, currentYear);
    
    // Evento ao clicar em "Filtrar"
    document.getElementById('filterButton').addEventListener('click', () => {
        const mes = parseInt(monthSelect.value);
        const ano = parseInt(yearSelect.value);
        loadMonthlySalesTrend(mes, ano);
        loadDailySalesByType(mes, ano);
    });
});

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
    document.body.classList.toggle('sidebar-open');
}
