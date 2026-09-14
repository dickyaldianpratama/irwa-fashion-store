const fs = require('fs');

// Fix 1: app/(main)/akun/pesanan/[id]/page.tsx
const pagePath = 'app/(main)/akun/pesanan/[id]/page.tsx';
let p1 = fs.readFileSync(pagePath, 'utf8');
p1 = p1.replace(/reduce\(\(sum, item\)/g, 'reduce((sum: number, item: any)');
fs.writeFileSync(pagePath, p1);
console.log('Fixed page.tsx');
