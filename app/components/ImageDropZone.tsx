import Image from "next/image";
import type { RefObject } from "react";
import type { Mode } from "@/app/lib/constants";

interface ImageDropZoneProps {
  mode: Mode;
  previews: string[];
  imageFiles: File[];
  dragging: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export function ImageDropZone({
  mode,
  previews,
  imageFiles,
  dragging,
  fileInputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: ImageDropZoneProps) {
  const disabled = mode === "video";

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest">
          Images
          {imageFiles.length > 0 && (
            <span className="ml-2 text-[#FF6B35]">{imageFiles.length}</span>
          )}
        </label>
        {imageFiles.length > 0 && !disabled && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-[#FF6B35] hover:text-[#ff7a47] font-medium transition-colors"
          >
            + Add more
          </button>
        )}
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {previews.map((src, i) => (
            <div
              key={src}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <Image
                src={src}
                alt={imageFiles[i]?.name ?? `image-${i}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-[#FF6B35] text-white text-xs font-bold flex items-center justify-center shadow-lg">
                {i + 1}
              </div>
              {imageFiles.length > 1 && (
                <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => onMoveUp(i)}
                    disabled={i === 0}
                    className="w-6 h-6 rounded-full bg-white/90 hover:bg-[#FF6B35] text-gray-700 hover:text-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Move left"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onMoveDown(i)}
                    disabled={i === imageFiles.length - 1}
                    className="w-6 h-6 rounded-full bg-white/90 hover:bg-[#FF6B35] text-gray-700 hover:text-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    aria-label="Move right"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
              <button
                onClick={() => onRemove(i)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 hover:bg-red-500 text-gray-700 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                aria-label="Remove"
              >
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} className="w-2.5 h-2.5">
                  <path d="M1 1l10 10M11 1L1 11" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {previews.length === 0 && (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDrop={(e) => { if (!disabled) onDrop(e); else e.preventDefault(); }}
          onDragOver={(e) => { if (!disabled) onDragOver(e); else e.preventDefault(); }}
          onDragLeave={onDragLeave}
          className={[
            "relative rounded-xl border-2 border-dashed transition-all duration-200",
            "flex flex-col items-center justify-center py-12 px-6 text-center",
            disabled
              ? "cursor-not-allowed border-gray-200 bg-gray-50 opacity-50"
              : dragging
              ? "cursor-pointer border-[#FF6B35] bg-[#FF6B35]/5"
              : "cursor-pointer border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100",
          ].join(" ")}
        >
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${dragging ? "bg-[#FF6B35]/20" : "bg-gray-200"}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className={`w-6 h-6 transition-colors ${dragging ? "text-[#FF6B35]" : "text-gray-500"}`}>
              <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-gray-700 text-sm font-medium">
            {dragging ? "Drop them here" : "Drag & drop or click to upload"}
          </p>
          <p className="text-gray-500 text-xs mt-1.5">PNG, JPG, WEBP — multiple files supported</p>
        </div>
      )}

      {previews.length > 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          className={[
            "cursor-pointer rounded-xl border border-dashed transition-all duration-200",
            "flex items-center justify-center gap-2 py-2.5 text-xs",
            dragging
              ? "border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]"
              : "border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700",
          ].join(" ")}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Drop more images here
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
}
