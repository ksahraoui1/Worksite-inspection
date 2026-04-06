"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { compressPhoto } from "@/lib/utils/photo-compress";

interface PhotoCaptureProps {
  onCapture: (blob: Blob) => void;
  preview?: string | null;
}

export function PhotoCapture({ onCapture, preview }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(preview ?? null);
  const [compressing, setCompressing] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressed = await compressPhoto(file);
      const url = URL.createObjectURL(compressed);
      setPreviewUrl(url);
      onCapture(compressed);
    } finally {
      setCompressing(false);
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Photo du constat"
            className="w-full rounded-lg max-h-48 object-cover"
          />
          <button
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-white/90 rounded-lg px-3 py-1.5 text-sm font-medium shadow"
          >
            Reprendre
          </button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => inputRef.current?.click()}
          disabled={compressing}
        >
          {compressing ? "Compression..." : "📷 Prendre une photo"}
        </Button>
      )}
    </div>
  );
}
