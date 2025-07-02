import jsPDF from "jspdf";
import "jspdf-autotable";

// Export data to PDF
export const exportToPdf = (title, headers, data, fileName) => {
    const doc = new jsPDF();
    doc.text(title, 14, 15);
    doc.autoTable({
        head: [headers.map(h => h.label)],
        body: data.map(row => headers.map(header => row[header.key])),
        startY: 20,
    });
    doc.save(`${fileName}.pdf`);
};

// Export data to CSV
export const exportToCsv = (headers, data, fileName) => {
    const headerRow = headers.map(h => h.label).join(',');
    const bodyRows = data.map(row => 
        headers.map(header => {
            let cell = row[header.key] ? String(row[header.key]) : '';
            // Escape commas and quotes
            if (cell.includes(',') || cell.includes('"')) {
                cell = `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        }).join(',')
    ).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${headerRow}\n${bodyRows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};