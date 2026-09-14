const fs = require('fs');
let page = fs.readFileSync('app/(main)/akun/pesanan/[id]/page.tsx', 'utf8');
const startIdx = page.indexOf('<h3 className="font-bold text-gray-900 mb-4">Rincian Pembayaran</h3>');
const endIdx = page.indexOf('{/* O2O QR Modal */}');
if (startIdx !== -1 && endIdx !== -1) {
  const replacement = \<h3 className="font-bold text-gray-900 mb-4">Rincian Pembayaran</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Metode Pembayaran</span>
                  <span className="font-semibold text-gray-900">{order.metodePembayaran || "Transfer Bank"}</span>
                </div>
                {(() => {
                  const subtotal = order.items.reduce((sum: number, item: any) => sum + (item.harga * item.qty), 0);
                  const shipping = order.tipePengiriman === "PICKUP" ? 0 : 25000;
                  const alteration = order.tipePengiriman === "ALTERATION" ? 35000 : 0;
                  const totalAkhir = order.totalHarga;
                  const diskon = (subtotal + shipping + alteration) - totalAkhir;
                  return (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal Produk</span>
                        <span className="font-semibold text-gray-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Biaya Pengiriman</span>
                        <span className={shipping === 0 ? "font-semibold text-green-600" : "font-semibold text-gray-900"}>{shipping === 0 ? "Gratis (O2O)" : "Rp 25.000"}</span>
                      </div>
                      {alteration > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Biaya Alterasi</span>
                          <span className="font-semibold text-gray-900">Rp 35.000</span>
                        </div>
                      )}
                      {diskon > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>Diskon Voucher</span>
                          <span>-Rp {diskon.toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <hr className="border-gray-100 my-3" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 text-base">Total Bayar</span>
                        <span className="font-bold text-primary text-xl">Rp {totalAkhir.toLocaleString('id-ID')}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>

        \;
  page = page.substring(0, startIdx) + replacement + page.substring(endIdx);
  fs.writeFileSync('app/(main)/akun/pesanan/[id]/page.tsx', page);
  console.log('Patched');
} else {
  console.log('Not found');
}
