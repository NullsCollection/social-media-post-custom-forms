"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

const MAX_CAPTION = 1000;

type Mode = "manual" | "ai" | "video";
type SocialPlatform = "facebook" | "instagram" | "twitter" | "linkedin";

const MODES: { id: Mode; label: string }[] = [
  { id: "manual", label: "Manual" },
  { id: "ai", label: "AI Mode" },
  { id: "video", label: "Video" },
];

const PLATFORMS: {
  id: SocialPlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  {
    id: "facebook",
    label: "Facebook",
    color: "#1877F2",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "instagram",
    label: "Instagram",
    color: "#E1306C",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    id: "twitter",
    label: "X / Twitter",
    color: "#000000",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    color: "#0A66C2",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
      </svg>
    ),
  },
];

export default function UploadPage() {
  const [caption, setCaption] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<Mode>("manual");
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    "facebook",
    "instagram",
    "twitter",
    "linkedin",
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePlatform = (id: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

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

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imageFiles.length) return;

    setImageFiles((prev) => {
      const newFiles = [...prev];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      return newFiles;
    });

    setPreviews((prev) => {
      const newPreviews = [...prev];
      const [movedPreview] = newPreviews.splice(fromIndex, 1);
      newPreviews.splice(toIndex, 0, movedPreview);
      return newPreviews;
    });
  };

  const moveImageUp = (index: number) => {
    if (index > 0) moveImage(index, index - 1);
  };

  const moveImageDown = (index: number) => {
    if (index < imageFiles.length - 1) moveImage(index, index + 1);
  };

  const handleSubmit = async () => {
    if (!imageFiles.length || !selectedPlatforms.length) return;
    if (mode === "manual" && !caption.trim()) return;
    setLoading(true);
    setStatus("idle");

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("mode", mode);
    selectedPlatforms.forEach((platform) =>
      formData.append("platforms[]", platform),
    );
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

  const canSubmit =
    imageFiles.length > 0 &&
    selectedPlatforms.length > 0 &&
    !loading &&
    (mode !== "manual" || caption.trim().length > 0);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#FF6B35]/5 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-lg">
        {/* Header */}
        <div className="mb-2">
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
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            One-Click Social Posting
          </h1>
          <p className="text-gray-600 text-sm mt-1.5">
            Upload images and a caption — we&apos;ll handle the rest.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 space-y-5">
            {/* Drop Zone / Previews */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest">
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
                      className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <Image
                        src={src}
                        alt={imageFiles[i]?.name ?? `image-${i}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />

                      {/* Position indicator */}
                      <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-[#FF6B35] text-white text-xs font-bold flex items-center justify-center shadow-lg">
                        {i + 1}
                      </div>

                      {/* Reorder controls */}
                      {imageFiles.length > 1 && (
                        <div className="absolute bottom-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={() => moveImageUp(i)}
                            disabled={i === 0}
                            className="w-6 h-6 rounded-full bg-white/90 hover:bg-[#FF6B35] text-gray-700 hover:text-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            aria-label="Move up"
                            title="Move left"
                          >
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-3 h-3"
                            >
                              <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => moveImageDown(i)}
                            disabled={i === imageFiles.length - 1}
                            className="w-6 h-6 rounded-full bg-white/90 hover:bg-[#FF6B35] text-gray-700 hover:text-white flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            aria-label="Move down"
                            title="Move right"
                          >
                            <svg
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="w-3 h-3"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      )}

                      {/* Remove button */}
                      <button
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 hover:bg-red-500 text-gray-700 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
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
                      ? "border-[#FF6B35] bg-[#FF6B35]/5"
                      : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100",
                  ].join(" ")}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 transition-colors ${dragging ? "bg-[#FF6B35]/20" : "bg-gray-200"}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      className={`w-6 h-6 transition-colors ${dragging ? "text-[#FF6B35]" : "text-gray-500"}`}
                    >
                      <path
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-700 text-sm font-medium">
                    {dragging
                      ? "Drop them here"
                      : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-gray-500 text-xs mt-1.5">
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
                      ? "border-[#FF6B35] bg-[#FF6B35]/5 text-[#FF6B35]"
                      : "border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700",
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
              {/* Mode Selector */}
              <div className="px-1.5 pt-1.5 mb-3">
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={[
                        "flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200",
                        mode === m.id
                          ? "bg-[#1a2035] text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700",
                      ].join(" ")}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest">
                  Caption
                  {mode === "ai" && (
                    <span className="ml-2 text-[#FF6B35] normal-case font-normal text-xs">
                      (AI Generated)
                    </span>
                  )}
                </label>
                {mode !== "ai" && (
                  <span
                    className={`text-xs tabular-nums transition-colors ${caption.length > MAX_CAPTION * 0.9 ? "text-[#FF6B35]" : "text-gray-500"}`}
                  >
                    {caption.length} / {MAX_CAPTION}
                  </span>
                )}
              </div>
              <textarea
                value={mode === "ai" ? "" : caption}
                onChange={(e) =>
                  setCaption(e.target.value.slice(0, MAX_CAPTION))
                }
                placeholder={
                  mode === "ai"
                    ? "Just upload and we'll generate a caption for you!"
                    : "Write something memorable..."
                }
                rows={3}
                disabled={mode === "ai"}
                className={`w-full border text-sm rounded-xl px-4 py-3 resize-none transition-colors leading-relaxed ${
                  mode === "ai"
                    ? "bg-gray-100 border-gray-200 text-gray-400 placeholder-gray-400 cursor-not-allowed"
                    : "bg-white border-gray-300 hover:border-gray-400 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 text-gray-900 placeholder-gray-400"
                }`}
              />
            </div>

            {/* Social Media Pills */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2.5">
                Post to
              </label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((platform) => {
                  const selected = selectedPlatforms.includes(platform.id);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => togglePlatform(platform.id)}
                      style={
                        selected
                          ? {
                              backgroundColor: platform.color,
                              borderColor: platform.color,
                              color: "#fff",
                            }
                          : {}
                      }
                      className={[
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 select-none",
                        selected
                          ? "shadow-sm"
                          : "bg-white border-gray-300 text-gray-500 hover:border-gray-400",
                      ].join(" ")}
                    >
                      {platform.icon}
                      {platform.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-1.5">
                Click icon to disable
              </p>
              {selectedPlatforms.length === 0 && (
                <p className="text-xs text-red-500 mt-1.5">
                  Select at least one platform.
                </p>
              )}
            </div>

            {/* Status Messages */}
            {status === "success" && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl px-4 py-3">
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
                <span>Posted successfully!</span>
              </div>
            )}

            {status === "error" && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
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
              disabled={!canSubmit}
              className={[
                "w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200",
                "flex items-center justify-center gap-2.5",
                !canSubmit
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300"
                  : "bg-[#1a2035] hover:bg-[#232c47] text-white shadow-lg shadow-[#1a2035]/30 hover:shadow-[#1a2035]/40 active:scale-[0.98]",
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

        {/* Footer */}
        <footer className="mt-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            {/* Email */}
            <button
              onClick={() =>
                window.open("mailto:raffy7792@gmail.com", "_blank")
              }
              className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-[#FF6B35] hover:bg-[#FF6B35] text-gray-600 hover:text-white transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
              aria-label="Email"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </button>

            {/* LinkedIn */}
            <button
              onClick={() =>
                window.open(
                  "https://www.linkedin.com/in/raffy-francisco-50607b325/",
                  "_blank",
                )
              }
              className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-[#FF6B35] hover:bg-[#FF6B35] text-gray-600 hover:text-white transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </button>

            {/* Behance */}
            <button
              onClick={() =>
                window.open(
                  "https://www.behance.net/nullzvectcollection",
                  "_blank",
                )
              }
              className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-[#FF6B35] hover:bg-[#FF6B35] text-gray-600 hover:text-white transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
              aria-label="Behance"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51h6.938v-.007zM16.94 16.665c.44.428 1.073.643 1.894.643.59 0 1.1-.148 1.53-.447.424-.29.68-.61.78-.94h2.588c-.403 1.28-1.048 2.2-1.9 2.75-.85.56-1.884.83-3.08.83-.837 0-1.584-.13-2.272-.4-.673-.27-1.24-.65-1.72-1.14-.464-.49-.823-1.08-1.077-1.77-.253-.69-.373-1.45-.373-2.27 0-.803.135-1.54.403-2.23.27-.7.644-1.28 1.12-1.79.495-.51 1.063-.895 1.736-1.194.678-.297 1.407-.452 2.17-.452.915 0 1.69.164 2.38.523.67.34 1.22.82 1.66 1.4.44.586.75 1.26.94 2.02.19.75.25 1.54.21 2.38h-7.69c0 .84.28 1.632.71 2.065l-.08.03zm-10.24.05c.317 0 .62-.03.906-.093.29-.06.548-.165.763-.3.21-.135.39-.328.52-.583.13-.24.19-.57.19-.96 0-.75-.22-1.29-.64-1.62-.43-.32-.99-.48-1.69-.48H3.24v4.05H6.7v-.03zm13.607-5.65c-.352-.385-.94-.592-1.657-.592-.468 0-.855.074-1.166.238-.302.15-.55.35-.74.59-.19.24-.317.48-.392.75-.075.26-.12.5-.135.71h4.762c-.07-.75-.33-1.3-.68-1.69v.01zM6.52 10.45c.574 0 1.05-.134 1.425-.412.374-.27.554-.72.554-1.338 0-.344-.07-.625-.18-.846-.13-.22-.3-.39-.5-.512-.21-.124-.45-.21-.72-.257-.27-.053-.56-.074-.84-.074H3.23v3.44h3.29zm9.098-4.958h5.968v1.454h-5.968V5.48v.01z" />
              </svg>
            </button>

            {/* GitHub */}
            <button
              onClick={() =>
                window.open("https://github.com/NullsCollection", "_blank")
              }
              className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-[#FF6B35] hover:bg-[#FF6B35] text-gray-600 hover:text-white transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" />
              </svg>
            </button>

            {/* WhatsApp */}
            <button
              onClick={() =>
                window.open("http://wa.me/+639600723886", "_blank")
              }
              className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-[#FF6B35] hover:bg-[#FF6B35] text-gray-600 hover:text-white transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md"
              aria-label="WhatsApp"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.17-3.12.82.83-3.04-.2-.32a8.188 8.188 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31-.22.25-.87.86-.87 2.07 0 1.22.89 2.39 1 2.56.14.17 1.76 2.67 4.25 3.73.59.27 1.05.42 1.41.53.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.16-.48-.27-.25-.14-1.47-.74-1.69-.82-.23-.08-.37-.12-.56.12-.16.25-.64.81-.78.97-.15.17-.29.19-.53.07-.26-.13-1.06-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.12-.24-.01-.39.11-.5.11-.11.27-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.11-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43-.14 0-.3-.01-.47-.01z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Connect with me on social media
          </p>
        </footer>
      </div>
    </main>
  );
}
