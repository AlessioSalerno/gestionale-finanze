// modules/dashboard/dashboard.js
let financialChart = null;
let currentPeriod = 'daily';

window.addEventListener('DOMContentLoaded', () => {
    initChart();
    refreshDashboard();
    document.getElementById('transaction-form').addEventListener('submit', handleNewTransaction);
});

function initChart() {
    const ctx = document.getElementById('financialChart').getContext('2d');
    financialChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { 
                    label: 'Guadagni (€)', 
                    data: [], 
                    borderColor: '#2ecc71', 
                    backgroundColor: 'rgba(46, 204, 113, 0.1)', 
                    borderWidth: 3, 
                    tension: 0.3, 
                    fill: true,
                    pointRadius: 5,             
                    pointHoverRadius: 8,        
                    pointBackgroundColor: '#2ecc71',
                    pointHoverBackgroundColor: '#fff', 
                    pointHoverBorderColor: '#2ecc71',
                    pointHoverBorderWidth: 3,
                    pointHitRadius: 15          
                },
                { 
                    label: 'Spese (€)', 
                    data: [], 
                    borderColor: '#e74c3c', 
                    backgroundColor: 'rgba(231, 76, 60, 0.1)', 
                    borderWidth: 3, 
                    tension: 0.3, 
                    fill: true,
                    pointRadius: 5, 
                    pointHoverRadius: 8, 
                    pointBackgroundColor: '#e74c3c',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#e74c3c',
                    pointHoverBorderWidth: 3,
                    pointHitRadius: 15
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',       
                intersect: false     
            },
            plugins: { 
                legend: { labels: { color: '#fff' } },
                tooltip: {
                    backgroundColor: '#1c1c21',
                    titleColor: '#3498db',
                    bodyColor: '#fff',
                    borderColor: '#333',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 5
                }
            },
            scales: {
                x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#fff' } },
                y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, beginAtZero: true, ticks: { color: '#fff' } }
            }
        }
    });
}

function handleNewTransaction(e) {
    e.preventDefault();
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const method = document.getElementById('method').value; // Legge il metodo
    const type = document.getElementById('type').value;

    const transactions = getTransactionsFromStorage();
    // Aggiunto il campo "method" nell'oggetto salvato
    transactions.push({ id: Date.now(), date, description, amount, method, type });
    saveTransactionsToStorage(transactions);

    e.target.reset();
    refreshDashboard();
}

function changePeriod(period) {
    currentPeriod = period;
    refreshDashboard();
}

function refreshDashboard() {
    const transactions = getTransactionsFromStorage();
    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const dataGrouped = {};
    transactions.forEach(t => {
        const dateObj = new Date(t.date);
        let key = '';

        if (currentPeriod === 'daily') key = dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
        else if (currentPeriod === 'weekly') {
            const tempDate = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
            tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
            const weekNo = Math.ceil((((tempDate - new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1))) / 86400000) + 1) / 7);
            key = `Sett ${weekNo}`;
        }
        else if (currentPeriod === 'monthly') key = dateObj.toLocaleDateString('it-IT', { month: 'short', year: 'numeric' });
        else if (currentPeriod === 'yearly') key = dateObj.getFullYear().toString();

        if (!dataGrouped[key]) dataGrouped[key] = { income: 0, expense: 0 };
        if (t.type === 'income') dataGrouped[key].income += parseFloat(t.amount);
        else if (t.type === 'expense') dataGrouped[key].expense += parseFloat(t.amount);
    });

    const labels = Object.keys(dataGrouped);
    financialChart.data.labels = labels;
    financialChart.data.datasets[0].data = labels.map(k => dataGrouped[k].income);
    financialChart.data.datasets[1].data = labels.map(k => dataGrouped[k].expense);
    financialChart.update();
}