const fs = require('fs');
let page = fs.readFileSync('app/(main)/checkout/page.tsx', 'utf8');

const target =               {alterationCost > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Alterasi Jahit</span>
                  <span className="font-medium text-gray-900">{formatRupiah(alterationCost)}</span>
                </div>
              )}
            </div>;

const replacement =               {alterationCost > 0 && (
                <div className="flex justify-between">
                  <span>Biaya Alterasi Jahit</span>
                  <span className="font-medium text-gray-900">{formatRupiah(alterationCost)}</span>
                </div>
              )}
              {selectedVoucher && discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Voucher</span>
                  <span>-{formatRupiah(discount)}</span>
                </div>
              )}
            </div>;

page = page.replace(target, replacement);
fs.writeFileSync('app/(main)/checkout/page.tsx', page);
console.log('Discount UI patched');
