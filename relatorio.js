// Função para carregar produtos com baixo estoque da API
async function loadLowStockTable() {
    const response = await fetch('http://localhost:3000/api/low-stock');
    const lowStockProducts = await response.json();
    const tableBody = document.getElementById("lowStockTableBody");

    lowStockProducts.forEach(product => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.nome}</td>
            <td>${product.quantidade}</td>
            <td><button class="restock-btn">Reabastecer</button></td>
        `;
        tableBody.appendChild(row);
    });
}

// Função para carregar movimentações de estoque da API
async function loadStockMovementTable() {
    const response = await fetch('http://localhost:3000/api/stock-movements');
    const stockMovements = await response.json();
    const tableBody = document.getElementById("stockMovementTableBody");

    stockMovements.forEach(movement => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${movement.data}</td>
            <td>${movement.produto}</td>
            <td>${movement.quantidade}</td>
            <td>${movement.tipo}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Carregar os dados ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    loadLowStockTable();
    loadStockMovementTable();
});