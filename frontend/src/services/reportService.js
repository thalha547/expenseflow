import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export const generatePDFReport = (expenses, month, year) => {
    const doc = new jsPDF();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Header
    doc.setFontSize(20);
    doc.setTextColor(14, 165, 233); // Primary color
    doc.text('ExpenseFlow - Monthly Report', 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Period: ${monthNames[month - 1]} ${year}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    // Table
    const tableColumn = ["Date", "Category", "Payment Mode", "Notes", "Amount (INR)"];
    const tableRows = [];

    let total = 0;
    expenses.forEach(expense => {
        const rowData = [
            new Date(expense.expense_date).toLocaleDateString(),
            expense.category_name,
            expense.payment_mode,
            expense.notes || '-',
            parseFloat(expense.amount).toFixed(2)
        ];
        tableRows.push(rowData);
        total += parseFloat(expense.amount);
    });

    doc.autoTable({
        startY: 45,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [14, 165, 233] },
        foot: [['', '', '', 'TOTAL', total.toFixed(2)]],
        footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' }
    });

    // Summary
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('Summary Insights:', 14, finalY);
    doc.setFontSize(11);
    doc.text(`- You had ${expenses.length} transactions this month.`, 14, finalY + 8);
    doc.text(`- Your average spending per transaction was INR ${(total / (expenses.length || 1)).toFixed(2)}.`, 14, finalY + 14);

    doc.save(`ExpenseFlow_Report_${monthNames[month - 1]}_${year}.pdf`);
};
