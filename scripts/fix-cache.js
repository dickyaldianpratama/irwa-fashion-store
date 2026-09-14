const fs = require('fs');

function addForceDynamic(filepath) {
  let p = fs.readFileSync(filepath, 'utf8');
  if (!p.includes("export const dynamic = 'force-dynamic';")) {
    p = "export const dynamic = 'force-dynamic';\n" + p;
    fs.writeFileSync(filepath, p);
    console.log('Added force-dynamic to', filepath);
  }
}

addForceDynamic('app/api/akun/pesanan/route.ts');
addForceDynamic('app/api/akun/pesanan/[id]/route.ts');
addForceDynamic('app/api/checkout/route.ts'); // just in case
