export default function KategoriListLoading() {
  return (
    <div className="bg-gray-50 min-h-screen pb-16 animate-pulse select-none">
      <div className="bg-white border-b border-gray-100 pt-8 pb-6 shadow-sm">
        <div className="container-app">
          <div className="h-8 w-48 bg-gray-200 rounded-lg mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-md"></div>
        </div>
      </div>
      <div className="container-app py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-3 border border-gray-100 space-y-3">
              <div className="w-full aspect-square bg-gray-200 rounded-xl"></div>
              <div className="h-4 w-2/3 bg-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
