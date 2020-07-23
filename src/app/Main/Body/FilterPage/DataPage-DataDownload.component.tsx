
export function objectToCsv(data: never[]):void {
    const csvRows = [];

    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));
    
    data.forEach(row => {
        const values = headers.map(header => {
            const escaped = (`${row[header]}`).replace(/"/g, '\\"')
            return `"${escaped}"`;
        })
        csvRows.push(values.join(','));
    }) 
    const scvData = csvRows.join('\n');
    

    const blob = new Blob([scvData], { type: 'text/csv'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'download.csv');
    document.body.append(a);
    a.click();
    a.remove();
}