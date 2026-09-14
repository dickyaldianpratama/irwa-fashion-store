const fs = require('fs');
const cardPath = 'components/produk/ProductCard.tsx';
let p = fs.readFileSync(cardPath, 'utf8');
p = p.replace('let badgeText = badge;', 'let badgeText: string = badge;');
fs.writeFileSync(cardPath, p);
console.log('Fixed ProductCard.tsx badgeText type');
