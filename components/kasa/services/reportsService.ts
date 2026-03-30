import { Transaction } from '../types';

export const exportToCSV = (transactions: Transaction[]) => {
    const headers = ['Tarih', 'Açıklama', 'Kategori', 'Tutar', 'Tip', 'Para Birimi', 'Etiketler'];
    const rows = transactions.map(t => [
        t.date,
        t.description,
        t.category_name || '',
        t.amount,
        t.type,
        t.currency || 'TRY',
        (t.tags || []).join(', ')
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `butcedostu_rapor_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
