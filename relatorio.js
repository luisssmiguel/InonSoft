// Variável global para o gráfico
let salesChart;

// Função para carregar informações do usuário logado
async function carregarInformacoesUsuario() {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Usuário não autenticado');

        const response = await fetch('http://localhost:3000/usuario-info', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Erro ao carregar informações do usuário');

        const data = await response.json();
        document.getElementById('user-name').textContent = data.nomeCompleto;
        document.getElementById('user-role').textContent = data.papel;
    } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);
    }
}

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
async function loadDailySalesByType(mes, ano) {
    try {
        const response = await fetch(`http://localhost:3000/vendas-diarias-separadas?mes=${mes}&ano=${ano}`);
        if (!response.ok) throw new Error('Erro ao carregar vendas diárias');

        const data = await response.json();
        const delivery = parseFloat(data.delivery) || 0;
        const lojaFisica = parseFloat(data.lojaFisica) || 0;

        document.getElementById('dailySales').textContent = `R$ ${delivery.toFixed(2)}`;
        document.getElementById('storeSales').textContent = `R$ ${lojaFisica.toFixed(2)}`;
    } catch (error) {
        console.error('Erro ao carregar vendas diárias separadas:', error);
    }
}

// Função para carregar gráfico de vendas mensais
async function loadMonthlySalesTrend(mes, ano) {
    try {
        const response = await fetch(`http://localhost:3000/vendas-mensais?mes=${mes}&ano=${ano}`);
        const data = await response.json();

        const days = data.map(item => item.dia);
        const totalSales = data.map(item => parseFloat(item.total_vendas) || 0);

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
    } catch (error) {
        console.error('Erro ao carregar dados do gráfico:', error);
    }
}

// Evento ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    carregarInformacoesUsuario();
    loadLowStockProducts();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');

    // Preenche anos no select
    for (let i = currentYear; i >= currentYear - 5; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    // Seleciona mês e ano atual
    monthSelect.value = currentMonth;
    yearSelect.value = currentYear;

    // Carrega dados iniciais
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
