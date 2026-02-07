const xlsx = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, '../../Website_Product_Details .xlsx');
const workbook = xlsx.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);

// Get unique categories
const cats = [...new Set(data.map(r => r.Category || ''))];
console.log('Categories found:');
cats.forEach(c => console.log(`"${c}"`));
