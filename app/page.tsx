"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

const MAX_CAPTION = 1000;

export default function UploadPage() {
  const [caption, setCaption] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (!valid.length) return;
    setImageFiles((prev) => [...prev, ...valid]);
    setPreviews((prev) => [
      ...prev,
      ...valid.map((f) => URL.createObjectURL(f)),
    ]);
    setStatus("idle");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const removeImage = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    setStatus("idle");
  };

  const handleSubmit = async () => {
    if (!imageFiles.length) return;
    setLoading(true);
    setStatus("idle");

    const formData = new FormData();
    formData.append("caption", caption);
    imageFiles.forEach((file) => formData.append("images", file, file.name));

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setStatus("success");
        setCaption("");
        previews.forEach((url) => URL.revokeObjectURL(url));
        setImageFiles([]);
        setPreviews([]);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0c0c0c] flex items-center justify-center px-4 py-16">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#FF6B35]/6 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-[#FF6B35]/4 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-4 h-4 text-white"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-[#FF6B35] text-sm font-semibold tracking-widest uppercase">
              Upload
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white leading-tight">
            Share to social
          </h1>
          <p className="text-[#666] text-sm mt-1.5">
            Upload images and a caption — we&apos;ll handle the rest.
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-[#222] rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 space-y-5">
            {/* Drop Zone / Previews */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-xs font-semibold text-[#888] uppercase tracking-widest">
                  Images
                  {imageFiles.length > 0 && (
                    <span className="ml-2 text-[#FF6B35]">
                      {imageFiles.length}
                    </span>
                  )}
                </label>
                {imageFiles.length > 0 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-[#FF6B35] hover:text-[#ff7a47] font-medium transition-colors"
                  >
                    + Add more
                  </button>
                )}
              </div>

              {/* Thumbnail grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {previews.map((src, i) => (
                    <div
                      key={src}
                      className="relative group aspect-square rounded-lg overflow-hidden bg-[#0f0f0f]"
                    >
                      <Image
                        src={src}
                        alt={imageFiles[i]?.name ?? `image-${i}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        aria-label="Remove"
                      >
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          className="w-2.5 h-2.5"
                        >
                          <path
                            d="M1 1l10 10M11 1L1 11"
                            strokeLinecap="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Full drop zone (no files yet) */}
              {previews.length === 0 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={[
                    "relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200",
                    "flex flex-col items-center justify-center py-12 px-6 text-center",
                    dragging
                      ? "border-[#FF6B35] bg-[#FF6B35]/8"
                      : "border-[#2a2a2a] bg-[#0f0f0f] hover:border-[#444] hover:bg-[#161616]",
                  ].join(" ")}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${dragging ? "bg-[#FF6B35]/20" : "bg-[#1e1e1e]"}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className={`w-6 h-6 transition-colors ${dragging ? "text-[#FF6B35]" : "text-[#555]"}`}
                    >
                      <path
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-white/70 text-sm font-medium">
                    {dragging
                      ? "Drop them here"
                      : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-[#555] text-xs mt-1.5">
                    PNG, JPG, WEBP — multiple files supported
                  </p>
                </div>
              )}

              {/* Compact drop zone shown below thumbnails */}
              {previews.length > 0 && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={[
                    "cursor-pointer rounded-xl border border-dashed transition-all duration-200",
                    "flex items-center justify-center gap-2 py-2.5 text-xs",
                    dragging
                      ? "border-[#FF6B35] bg-[#FF6B35]/8 text-[#FF6B35]"
                      : "border-[#2a2a2a] text-[#555] hover:border-[#444] hover:text-[#888]",
                  ].join(" ")}
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Drop more images here
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Caption */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-xs font-semibold text-[#888] uppercase tracking-widest">
                  Caption
                </label>
                <span
                  className={`text-xs tabular-nums transition-colors ${caption.length > MAX_CAPTION * 0.9 ? "text-[#FF6B35]" : "text-[#555]"}`}
                >
                  {caption.length} / {MAX_CAPTION}
                </span>
              </div>
              <textarea
                value={caption}
                onChange={(e) =>
                  setCaption(e.target.value.slice(0, MAX_CAPTION))
                }
                placeholder="Write something memorable..."
                rows={3}
                className="w-full bg-[#0f0f0f] border border-[#222] hover:border-[#333] focus:border-[#FF6B35]/50 focus:outline-none text-white placeholder-[#444] text-sm rounded-xl px-4 py-3 resize-none transition-colors leading-relaxed"
              />
            </div>

            {/* Status Messages */}
            {status === "success" && (
              <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl px-4 py-3">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 flex-shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Images uploaded successfully!</span>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 flex-shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Something went wrong. Please try again.</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!imageFiles.length || loading}
              className={[
                "w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200",
                "flex items-center justify-center gap-2.5",
                !imageFiles.length || loading
                  ? "bg-[#1e1e1e] text-[#444] cursor-not-allowed border border-[#222]"
                  : "bg-[#FF6B35] hover:bg-[#ff7a47] text-white shadow-lg shadow-[#FF6B35]/20 hover:shadow-[#FF6B35]/30 active:scale-[0.98]",
              ].join(" ")}
            >
              {loading ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  {imageFiles.length > 1
                    ? `Submit ${imageFiles.length} images`
                    : "Submit post"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
