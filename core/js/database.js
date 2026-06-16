// core/js/database.js
const STORAGE_KEY = 'gestionale_contabilita_dati';

function getTransactionsFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveTransactionsToStorage(transactions) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}