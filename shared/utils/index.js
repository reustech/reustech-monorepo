// Formateo de fechas
export function formatDate(date) {
    return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Formateo de moneda
export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// Generar ID único
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Validar email
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Calcular profit percentage
export function calculateProfitPercentage(entry, exit) {
    return ((exit - entry) / entry) * 100;
}

// Delay helper
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}