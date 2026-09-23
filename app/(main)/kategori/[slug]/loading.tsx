export default function KategoriSlugLoading() {
  return (
    <div className="bg-gray-50 min-h-screen pb-16 animate-pulse select-none">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="container-app">
          <div className="h-4 w-44 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      {/* Hero Title Skeleton */}
      <div className="bg-white border-b border-gray-100 py-8 shadow-xs">
        <div className="container-app">
          <div className="h-3 w-28 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-8 w-56 bg-gray-200 rounded-lg mb-2"></div>
          <div className="h-4 w-72 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="container-app py-8 space-y-4">
        <div className="h-6 w-44 bg-gray-200 rounded-md mb-4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-3 border border-gray-100 space-y-3 shadow-xs">
              <div className="w-full aspect-[4/5] bg-gray-200 rounded-xl"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded-md"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
