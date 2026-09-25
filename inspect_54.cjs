const fs = require('fs');
const path = require('path');

const dir = 'd:/ConnecXus/admin/screenshots';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
files.sort((a, b) => a.localeCompare(b));

console.log('Files list count:', files.length);
files.forEach((f, i) => {
  console.log(`[${i+1}] ${f}`);
});
