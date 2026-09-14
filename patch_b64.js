const fs = require('fs');
let page = fs.readFileSync('app/(main)/checkout/page.tsx', 'utf8');

const target = `             <hr className="border-gray-100 mb-4" />

                {isProcessing ? (`;

const replacement = `              <hr className="border-gray-100 mb-4" />

              {/* Kalkulasi */}
              <div className="space-y-3 text-sm text-gray-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span className="font-medium text-gray-900">{formatRupiah(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya Pengiriman</span>
                  <span className={shippingCost === 0 ? "font-bold text-green-600" : "font-medium text-gray-900"}>
                    {shippingCost === 0 ? "GRATIS" : formatRupiah(shippingCost)}
                  </span>
                </div>
                {alterationCost > 0 && (
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
              </div>

              <hr className="border-gray-100 mb-4" />
              
              <div className="flex justify-between items-end mb-8">
                <span className="font-bold text-gray-900">Total Pembayaran</span>
                <span className="text-2xl font-bold text-primary">{formatRupiah(total)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className="w-full py-4 bg-primary text-white font-bold rounded-xl flex justify-center items-center gap-2 hover:bg-primary-dark transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
              >
                {isProcessing ? (`;

page = page.replaceA`l(target, replacement);
page = page.replaceAll(target.replaceAll('\r\n', '\n'), replacement);
fs.writeFileSync('app/(main)/checkout/page.tsx', page);
