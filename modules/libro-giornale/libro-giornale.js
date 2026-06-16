// modules/libro-giornale/libro-giornale.js
window.addEventListener('DOMContentLoaded', () => {
    renderFullLedger();
});

function renderFullLedger(filteredTransactions = null) {
    const transactions = filteredTransactions || getTransactionsFromStorage();
    const tbody = document.getElementById('ledger-body');
    const totalBalanceSpan = document.getElementById('total-balance');
    
    tbody.innerHTML = '';
    let balance = 0;

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (transactions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#666; font-style:italic; padding:20px;">Nessun movimento trovato.</td></tr>`;
        totalBalanceSpan.innerText = "0.00 €";
        totalBalanceSpan.style.color = "#fff";
        return;
    }

    transactions.forEach(t => {
        const row = document.createElement('tr');
        row.id = `row-${t.id}`;
        row.className = t.type === 'income' ? 'row-income' : 'row-expense';

        const amount = parseFloat(t.amount);
        t.type === 'income' ? balance += amount : balance -= amount;

        const paymentMethod = t.method === 'Carta' ? '💳 Carta' : (t.method === 'Contanti' ? '💵 Contanti' : '—');

        row.innerHTML = `
            <td>${new Date(t.date).toLocaleDateString('it-IT')}</td>
            <td class="desc-cell"><strong>${t.description}</strong></td>
            <td>${t.type === 'income' ? 'Guadagno' : 'Spesa'}</td>
            <td>${paymentMethod}</td>
            <td class="amount-cell">${t.type === 'income' ? '+' : '-'}${amount.toFixed(2)} €</td>
            <td class="no-print actions-cell">
                <button class="edit-btn" onclick="startEdit(${t.id})">✏️ Modifica</button>
                <button class="delete-btn" onclick="deleteItem(${t.id})">✕ Elimina</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    totalBalanceSpan.innerText = `${balance.toFixed(2)} €`;
    totalBalanceSpan.style.color = balance >= 0 ? '#2ecc71' : '#e74c3c';
}

// Funzione che trasforma la riga in modalità "Modifica"
function startEdit(id) {
    const transactions = getTransactionsFromStorage();
    const item = transactions.find(t => t.id === id);
    if (!item) return;

    const row = document.getElementById(`row-${id}`);
    
    // Sostituiamo i campi della riga con degli input precompilati
    row.innerHTML = `
        <td><input type="date" id="edit-date-${id}" value="${item.date}" class="edit-input"></td>
        <td><input type="text" id="edit-desc-${id}" value="${item.description}" class="edit-input font-bold"></td>
        <td>
            <select id="edit-type-${id}" class="edit-input">
                <option value="income" ${item.type === 'income' ? 'selected' : ''}>Guadagno</option>
                <option value="expense" ${item.type === 'expense' ? 'selected' : ''}>Spesa</option>
            </select>
        </td>
        <td>
            <select id="edit-method-${id}" class="edit-input">
                <option value="Contanti" ${item.method === 'Contanti' ? 'selected' : ''}>💵 Contanti</option>
                <option value="Carta" ${item.method === 'Carta' ? 'selected' : ''}>💳 Carta</option>
            </select>
        </td>
        <td><input type="number" id="edit-amount-${id}" value="${item.amount}" step="0.01" class="edit-input"></td>
        <td class="no-print">
            <button class="save-btn" onclick="saveEdit(${id})">💾 Salva</button>
            <button class="cancel-btn" onclick="filterLedger()">🚫 Annulla</button>
        </td>
    `;
}

// Funzione che salva i dati modificati nel database
function saveEdit(id) {
    let transactions = getTransactionsFromStorage();
    const index = transactions.findIndex(t => t.id === id);
    
    if (index !== -1) {
        transactions[index].date = document.getElementById(`edit-date-${id}`).value;
        transactions[index].description = document.getElementById(`edit-desc-${id}`).value;
        transactions[index].type = document.getElementById(`edit-type-${id}`).value;
        transactions[index].method = document.getElementById(`edit-method-${id}`).value;
        transactions[index].amount = document.getElementById(`edit-amount-${id}`).value;

        saveTransactionsToStorage(transactions);
    }

    filterLedger(); // Rinfresca la tabella
}

function filterLedger() {
    const allTransactions = getTransactionsFromStorage();
    const searchTxt = document.getElementById('search-desc').value.toLowerCase();
    const typeFilter = document.getElementById('filter-type').value;

    const filtered = allTransactions.filter(t => {
        const matchesDesc = t.description.toLowerCase().includes(searchTxt);
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        return matchesDesc && matchesType;
    });

    renderFullLedger(filtered);
}

function deleteItem(id) {
    if (confirm("Vuoi eliminare questa transazione?")) {
        let transactions = getTransactionsFromStorage();
        transactions = transactions.filter(t => t.id !== id);
        saveTransactionsToStorage(transactions);
        filterLedger();
    }
}