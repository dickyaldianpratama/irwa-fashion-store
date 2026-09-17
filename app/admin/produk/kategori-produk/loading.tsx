import Image from "next/image";

export default function AdminLoading() {
  return (
    <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center bg-transparent">
      <div className="relative flex flex-col items-center justify-center">
        {/* Kontainer Lingkaran */}
        <div className="relative flex items-center justify-center w-20 h-20">
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
          
          {/* Logo */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Image
              src="/images/irwa-logo.png"
              alt="Logo Toko"
              width={160}
              height={160}
              className="w-24 h-24 object-contain mix-blend-multiply dark:mix-blend-plus-lighter"
              priority
            />
          </div>
        </div>

        {/* Loading Text */}
        <div className="mt-6 flex flex-col items-center gap-1.5">
          <span className="font-bold text-primary tracking-widest uppercase text-xs animate-pulse">
            Memuat Data
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