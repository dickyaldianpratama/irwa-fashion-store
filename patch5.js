const fs = require('fs');
let page = fs.readFileSync('app/(main)/checkout/page.tsx', 'utf8');

const target = '<p className="text-center text-gray-500 py-8 text-sm">Tidak ada voucher yang tersedia.<br/><a href="/akun/poin" className="text-primary font-bold">Tukar poinmu sekarang!</a></p>';

const replacement = '<div className="text-center py-8">' +
                  '<p className="text-gray-500 text-sm mb-4">Tidak ada voucher yang tersedia.</p>' +
                  '<Link href="/akun/poin" className="inline-block px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md">' +
                    'Tukar Poinmu Sekarang!' +
                  '</Link>' +
                '</div>';

page = page.replace(target, replacement);
fs.writeFileSync('app/(main)/checkout/page.tsx', page);
console.log('Button patched!');
