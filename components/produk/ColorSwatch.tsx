"use client";

import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  colors: { name: string; hex: string }[];
  selectedColor: string;
  onSelect: (color: string) => void;
}

export default function ColorSwatch({ colors, selectedColor, onSelect }: ColorSwatchProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900">Warna:</span>
        <span className="text-gray-600">{selectedColor}</span>
      </div>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const isSelected = selectedColor === color.name;
          // Determine if we need a dark border for light colors (like white)
          const isLight = color.hex.toLowerCase() === "#ffffff" || color.hex.toLowerCase() === "#f8f9fa";

          return (
            <button
              key={color.name}
              onClick={() => onSelect(color.name)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all outline-none",
                isSelected ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110",
                isLight ? "border border-gray-200" : ""
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
              aria-label={`Pilih warna ${color.name}`}
            />
          );
        })}
      </div>
    </div>
  );
}
