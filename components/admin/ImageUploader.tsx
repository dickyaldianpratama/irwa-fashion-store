"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, Link as LinkIcon, X, Loader2, ImageIcon, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspectRatio?: string; // e.g. "aspect-[4/3]", "aspect-[3/4]"
}

type Mode = "url" | "upload";

export default function ImageUploader({
  value,
  onChange,
  folder = "misc",
  label = "Gambar",
  aspectRatio = "aspect-[4/3]",
}: Props) {
  const [mode, setMode] = useState<Mode>("url");
  const [urlInput, setUrlInput] = useState(value || "");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="space-y-3">
      {label && (
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      )}

      {/* Tab Mode */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-fit">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === "url"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <LinkIcon size={12} /> URL Link
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors ${
            mode === "upload"
              ? "bg-blue-600 text-white"
              : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
          }`}
        >
          <Upload size={12} /> Upload File
        </button>
      </div>

      {/* Mode: URL */}
      {mode === "url" && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlApply()}
              placeholder="https://contoh.com/gambar.jpg"
              className="w-full pl-8 pr-3 py-2.5 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={handleUrlApply}
            className="px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shrink-0"
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
          className={`relative flex flex-col items-center justify-center gap-3 p-6 sm:p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all select-none ${
            dragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : uploading
              ? "border-gray-300 bg-gray-50 dark:bg-gray-800/30 cursor-wait"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
          }`}
        >
          {uploading ? (
            <>
              <Loader2 size={32} className="text-blue-600 animate-spin" />
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mengupload gambar...</p>
            </>
          ) : dragOver ? (
            <>
              <Upload size={32} className="text-blue-600" />
              <p className="text-sm font-bold text-blue-600">Lepaskan untuk upload</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Upload size={22} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Drag & drop atau{" "}
                  <span className="text-blue-600 dark:text-blue-400 underline">pilih file</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, GIF — maks 5MB</p>
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
        <div className="space-y-2">
          <div className={`relative w-full ${aspectRatio} rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm`}>
            <Image
              src={value}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
            {/* Badge sukses */}
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
              <CheckCircle size={10} />
              Terpilih
            </div>
            {/* Tombol hapus */}
            <button
              type="button"
              onClick={handleClear}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors"
              title="Hapus gambar"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Placeholder jika belum ada gambar */}
      {!value && (
        <div className={`relative w-full ${aspectRatio} rounded-xl bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 gap-2`}>
          <ImageIcon size={28} className="opacity-50" />
          <p className="text-xs">Belum ada gambar</p>
        </div>
      )}
    </div>
  );
}