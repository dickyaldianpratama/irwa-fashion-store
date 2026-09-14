const fs = require("fs");
let page = fs.readFileSync("app/(main)/checkout/page.tsx", "utf8");

// 1. Add state variables for vouchers
page = page.replace(
  "const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);",
  "const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);\n  const [vouchers, setVouchers] = useState<any[]>([]);\n  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);\n  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);"
);

// 2. Fetch vouchers on mount
page = page.replace(
  "setIsMounted(true);\n  }, []);",
  "setIsMounted(true);\n    fetch(\"/api/akun/voucher\").then(r => r.json()).then(d => { if(d.success) setVouchers(d.data); });\n  }, []);"
);

// 3. Update total calculation
page = page.replace(
  "const total = subtotal + shippingCost + alterationCost;",
  "let discount = 0;\n  if (selectedVoucher) {\n    if (selectedVoucher.tipe === \"shipping\" && shippingCost > 0) discount = Math.min(shippingCost, selectedVoucher.nilai);\n    else if (selectedVoucher.tipe === \"discount\") discount = selectedVoucher.nilai;\n  }\n  const total = Math.max(0, subtotal + shippingCost + alterationCost - discount);"
);

// 4. Update the checkout API call
page = page.replace(
  "tipePengiriman: deliveryMode,",
  "tipePengiriman: deliveryMode,\n            voucherId: selectedVoucher?.id,"
);

// 5. Inject Voucher UI right before Kalkulasi
const voucherUI = `
            {/* Voucher Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 text-sm">Voucher & Kupon</span>
              </div>
              <button
                onClick={() => setIsVoucherModalOpen(true)}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-primary/50 transition-colors bg-white text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <span className="font-bold">%</span>
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 text-sm">{selectedVoucher ? selectedVoucher.judul : "Gunakan Voucher / Kupon"}</h5>
                    <p className="text-xs text-gray-500">{selectedVoucher ? "Voucher berhasil dipakai" : "Makin hemat pakai promo"}</p>
                  </div>
                </div>
                <div className="text-gray-400">
                  {selectedVoucher ? <span onClick={(e) => { e.stopPropagation(); setSelectedVoucher(null); }} className="text-red-500 text-xs font-bold px-2">HAPUS</span> : "Pilih >"}
                </div>
              </button>
            </div>
            
            <hr className="border-gray-100 mb-4" />
`;
page = page.replace("{/* Kalkulasi */}", voucherUI + "\n            {/* Kalkulasi */}");

// 6. Update Kalkulasi UI to show discount
const calcDiscount = `
              {selectedVoucher && discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Voucher</span>
                  <span>-{formatRupiah(discount)}</span>
                </div>
              )}
`;
page = page.replace(
  "</div>\n\n            <hr className=\"border-gray-100 mb-4\" />\n            \n            <div className=\"flex justify-between items-end mb-8\">",
  calcDiscount + "            </div>\n\n            <hr className=\"border-gray-100 mb-4\" />\n            \n            <div className=\"flex justify-between items-end mb-8\">"
);

// 7. Inject Voucher Modal UI right before {isAddressModalOpen &&
const voucherModalUI = `
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-bold text-lg text-gray-900">Pilih Voucher</h3>
              <button onClick={() => setIsVoucherModalOpen(false)} className="text-gray-400 hover:text-gray-900">
                X
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3 bg-gray-50 flex-1">
              {vouchers.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">Tidak ada voucher yang tersedia.<br/><a href="/akun/poin" className="text-primary font-bold">Tukar poinmu sekarang!</a></p>
              ) : (
                vouchers.map(v => (
                  <button 
                    key={v.id}
                    onClick={() => { setSelectedVoucher(v); setIsVoucherModalOpen(false); toast.success("Voucher dipasang!"); }}
                    className="w-full text-left bg-white border border-gray-200 p-4 rounded-xl flex gap-4 items-center hover:border-primary/50 transition-colors"
                  >
                     <div className="w-12 h-12 bg-primary/10 text-primary font-bold rounded-lg flex items-center justify-center text-lg">%</div>
                     <div>
                       <p className="font-bold text-gray-900 text-sm">{v.judul}</p>
                       <p className="text-xs text-gray-500 mt-1">Berlaku s.d {new Date(v.expiredAt).toLocaleDateString("id-ID")}</p>
                     </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
`;
page = page.replace("{/* Modal Ubah / Tambah Alamat */}", voucherModalUI + "\n      {/* Modal Ubah / Tambah Alamat */}");

fs.writeFileSync("app/(main)/checkout/page.tsx", page);
console.log("Checkout page patched successfully!");

