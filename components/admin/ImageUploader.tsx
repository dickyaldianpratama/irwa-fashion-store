"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { Upload, Link as LinkIcon, X, Loader2, ImageIcon, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspectRatio?: string; // e.g. "aspect-[4/3]", "aspect-[3/4]"
  compact?: boolean;
  previewHeight?: string; // e.g. "h-32", "h-24"
}

type Mode = "url" | "upload";

export default function ImageUploader({
  value,
  onChange,
  folder = "misc",
  label = "Gambar",
  aspectRatio = "aspect-[4/3]",
  compact = false,
  previewHeight,
}: Props) {
  const [mode, setMode] = useState<Mode>("url");
  const [urlInput, setUrlInput] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(value || "");
  }, [value]);

  // ── Upload file ke Supabase ────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal upload");

      onChange(data.url);
      setUrlInput(data.url);
      toast.success("Gambar berhasil diupload!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }, [folder, onChange]);

  // ── Drag & Drop handlers ───────────────────────────────
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleUrlApply = () => {
    onChange(urlInput.trim());
    if (urlInput.trim()) toast.success("URL gambar diterapkan");
  };

  const handleClear = () => {
    onChange("");
    setUrlInput("");
  };

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {label && (
        <label className={`font-medium text-gray-700 dark:text-gray-300 ${compact ? "text-xs block" : "text-sm"}`}>
          {label}
        </label>
      )}

      {/* Tab Mode */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-fit">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 font-semibold transition-colors ${
            compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
          } ${
            mode === "url"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <LinkIcon size={compact ? 11 : 12} /> URL Link
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 font-semibold transition-colors ${
            compact ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
          } ${
            mode === "upload"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Upload size={compact ? 11 : 12} /> Upload File
        </button>
      </div>

      {/* Mode: URL */}
      {mode === "url" && (
        <div className="flex gap-1.5 sm:gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={compact ? 12 : 14} />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlApply()}
              placeholder="https://contoh.com/gambar.jpg"
              className={`w-full border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                compact ? "pl-7 pr-2 py-1.5 text-xs" : "pl-8 pr-3 py-2.5 text-sm"
              }`}
            />
          </div>
          <button
            type="button"
            onClick={handleUrlApply}
            className={`bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shrink-0 ${
              compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2.5 text-sm"
            }`}
          >
            Terapkan
          </button>
        </div>
      )}

      {/* Mode: Upload */}
      {mode === "upload" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all select-none ${
            compact ? "gap-1.5 p-3 text-center" : "gap-3 p-6 sm:p-8"
          } ${
            dragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : uploading
              ? "border-gray-300 bg-gray-50 dark:bg-gray-800/30 cursor-wait"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 size={compact ? 20 : 32} className="text-blue-600 animate-spin" />
              <p className={`${compact ? "text-xs" : "text-sm"} font-medium text-gray-600 dark:text-gray-400`}>Mengupload gambar...</p>
            </>
          ) : dragOver ? (
            <>
              <Upload size={compact ? 20 : 32} className="text-blue-600" />
              <p className={`${compact ? "text-xs" : "text-sm"} font-bold text-blue-600`}>Lepaskan untuk upload</p>
            </>
          ) : (
            <>
              <div className={`${compact ? "w-8 h-8 rounded-lg" : "w-12 h-12 rounded-xl"} bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center`}>
                <Upload size={compact ? 15 : 22} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <p className={`${compact ? "text-xs" : "text-sm"} font-semibold text-gray-700 dark:text-gray-300`}>
                  Drag & drop atau{" "}
                  <span className="text-blue-600 dark:text-blue-400 underline">pilih file</span>
                </p>
                <p className={`${compact ? "text-[10px]" : "text-xs"} text-gray-400 mt-0.5`}>JPG, PNG, WebP, GIF — maks 5MB</p>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Preview Gambar */}
      {value && (
        <div className={compact ? "flex flex-col items-center pt-1" : "space-y-2"}>
          <div className={`relative ${compact ? `${aspectRatio} ${previewHeight || "h-32"} rounded-lg` : `w-full ${aspectRatio} rounded-xl`} overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm`}>
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
            {/* Badge sukses */}
            <div className={`absolute top-1.5 left-1.5 flex items-center gap-1 bg-green-500 text-white font-semibold rounded-full shadow ${
              compact ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2 py-0.5"
            }`}>
              <CheckCircle size={compact ? 9 : 10} />
              Terpilih
            </div>
            {/* Tombol hapus */}
            <button
              type="button"
              onClick={handleClear}
              className={`absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors ${
                compact ? "p-1" : "p-1.5"
              }`}
              title="Hapus gambar"
            >
              <X size={compact ? 11 : 12} />
            </button>
          </div>
        </div>
      )}

      {/* Placeholder jika belum ada gambar (Hanya pada mode non-compact) */}
      {!value && !compact && (
        <div className={`relative w-full ${aspectRatio} rounded-xl bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 gap-2`}>
          <ImageIcon size={28} className="opacity-50" />
          <p className="text-xs">Belum ada gambar</p>
        </div>
      )}
    </div>
  );
}