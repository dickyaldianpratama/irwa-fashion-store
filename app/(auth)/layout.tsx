import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 group mb-2">
          <div className="relative w-12 h-12 overflow-hidden bg-white rounded-lg shadow-sm border border-gray-100">
            <Image 
              src="/images/irwa-logo.png" 
              alt="Irwa Fashion House Logo" 
              fill 
              className="object-contain scale-[2.2] group-hover:scale-[2.3] transition-transform"
              sizes="48px"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tight text-primary leading-none">IRWA</span>
            <span className="text-sm font-light text-gray-500 leading-none">FASHION <span className="text-[10px]">HOUSE</span></span>
          </div>
        </Link>
      </div>
      
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
        <div className="bg-white py-8 px-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:rounded-2xl sm:px-10 border border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );
}
