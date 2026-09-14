import Image from "next/image";

export default function GlobalLoading() {
  return (
    <div className="w-full min-h-[75vh] relative flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-950 overflow-hidden">
      
      {/* Skeleton Background */}
      <div className="absolute inset-0 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8 opacity-30 pointer-events-none">
        <div className="w-full h-40 sm:h-56 lg:h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6 animate-pulse mt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-full aspect-[3/4] bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
              <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
              <div className="w-1/2 h-3 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Preloader Utama */}
      <div className="relative flex flex-col items-center justify-center">
        
        {/* Kontainer Lingkaran (Ukurannya DIPERKECIL sesuai permintaan) */}
        <div className="relative flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24">
          
          {/* Ring 1 - Searah Jarum Jam */}
          <svg 
            className="absolute inset-0 w-full h-full animate-[spin_3s_linear_infinite] text-primary" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="6" strokeDasharray="140 140" strokeLinecap="round" />
          </svg>
          
          {/* Ring 2 - Berlawanan Arah */}
          <svg 
            className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] animate-[spin_2.5s_linear_infinite_reverse] text-primary-dark" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="6" strokeDasharray="100 150" strokeLinecap="round" />
          </svg>
          
          {/* Logo Murni Tanpa Background (Ukurannya DIPERBESAR melampaui batas lingkaran) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Image
              src="/images/irwa-logo.png"
              alt="Logo Toko"
              width={160}
              height={160}
              className="w-32 h-32 lg:w-36 lg:h-36 object-contain mix-blend-multiply dark:mix-blend-plus-lighter"
              priority
            />
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-8 flex flex-col items-center gap-1.5 px-4 py-2 bg-transparent">
          <span className="font-bold text-primary tracking-widest uppercase text-xs lg:text-sm animate-pulse">
            Memuat
          </span>
          <div className="flex gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
          </div>
        </div>

      </div>
    </div>
  );
}
