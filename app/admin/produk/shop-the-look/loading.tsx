import { Loader2 } from "lucide-react";

export default function AdminLoading() {
  return (
    <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center text-blue-600">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
      <p className="text-gray-500 font-medium animate-pulse">Memuat data...</p>
    </div>
  );
}
