export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

export const parseCurrency = (value: string): number => {
    // Elimina el símbolo de moneda y los separadores de miles
    const cleanValue = value.replace(/[^0-9-]/g, '');
    return Number(cleanValue);
}; 