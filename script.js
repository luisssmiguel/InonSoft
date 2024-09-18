const ctx = document.getElementById('likesChart').getContext('2d');
const likesChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
            label: 'Likes',
            data: [20, 40, 30, 50, 60],
            backgroundColor: 'rgba(155, 89, 182, 0.2)',
            borderColor: '#6200ea',
            borderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});
