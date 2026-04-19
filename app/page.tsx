"use client";

import { useState, useCallback } from "react";
import { useImageUpload } from "@/app/hooks/useImageUpload";
import { usePolling } from "@/app/hooks/usePolling";
import { ImageDropZone } from "@/app/components/ImageDropZone";
import { CaptionField } from "@/app/components/CaptionField";
import { PlatformPicker } from "@/app/components/PlatformPicker";
import { CaptionReviewModal } from "@/app/components/CaptionReviewModal";
import { SuccessModal } from "@/app/components/SuccessModal";
import { Toast } from "@/app/components/Toast";
import { FooterLinks } from "@/app/components/FooterLinks";
import type { Mode, SocialPlatform } from "@/app/lib/constants";

export default function UploadPage() {
  const [caption, setCaption] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [mode, setMode] = useState<Mode>("manual");
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    "facebook",
    "instagram",
    "twitter",
    "linkedin",
  ]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const [captionModal, setCaptionModal] = useState<{
    caption: string;
    executionId: string;
  } | null>(null);
  const [successModal, setSuccessModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant?: "success" | "error" } | null>(null);

  const {
    imageFiles,
    previews,
    dragging,
    fileInputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileChange,
    removeImage,
    moveImageUp,
    moveImageDown,
    reset: resetImages,
  } = useImageUpload();

  const showToast = useCallback((message: string, variant: "success" | "error" = "success", duration = 5000) => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), duration);
  }, []);

  const { startPolling, stopPolling } = usePolling({
    onComplete: useCallback(() => {
      setSuccessModal(true);
      setLoading(false);
      setCaption("");
      setVideoUrl("");
      resetImages();
    }, [resetImages]),
    onCaptionReady: useCallback((cap: string, executionId: string) => {
      setCaptionModal({ caption: cap, executionId });
    }, []),
    onError: useCallback((message: string) => {
      showToast(message, "error");
      setLoading(false);
    }, [showToast]),
  });

  const handleApprove = async (executionId: string) => {
    await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ executionId, approval: "approved" }),
    }).catch(() => {});
    setCaptionModal(null);
    await fetch(`/api/caption-status?executionId=${encodeURIComponent(executionId)}`, {
      method: "DELETE",
    }).catch(() => {});
    showToast("Caption approved! Posting now...", "success", 3000);
    startPolling(executionId);
  };

  const handleSubmitEdit = async (executionId: string, editText: string) => {
    await fetch("/api/resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ executionId, approval: editText }),
    }).catch(() => {});
    setCaptionModal(null);
    await fetch(`/api/caption-status?executionId=${encodeURIComponent(executionId)}`, {
      method: "DELETE",
    }).catch(() => {});
    showToast("Edit sent! Regenerating caption...", "success", 3000);
    startPolling(executionId);
  };

  const togglePlatform = (id: SocialPlatform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    stopPolling();
    setCaptionModal(null);

    const id = crypto.randomUUID();
    setLoading(true);
    setSubmitError(false);

    const formData = new FormData();
    formData.append("executionId", id);
    formData.append("caption", caption);
    formData.append("mode", mode);
    formData.append("videoUrl", videoUrl);
    selectedPlatforms.forEach((p) => formData.append("platforms[]", p));
    imageFiles.forEach((file) => formData.append("images", file, file.name));

    try {
      const res = await fetch("/api/submit", { method: "POST", body: formData });
      if (res.ok) {
        startPolling(id);
      } else {
        setSubmitError(true);
        setLoading(false);
      }
    } catch {
      setSubmitError(true);
      setLoading(false);
    }
  };

  const canSubmit =
    !loading &&
    selectedPlatforms.length > 0 &&
    (mode === "video" ? videoUrl.trim() !== "" : imageFiles.length > 0);

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
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2.5}>
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[#FF6B35] text-sm font-semibold tracking-widest uppercase">Upload</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">One-Click Social Posting</h1>
          <p className="text-gray-600 text-sm mt-1.5">Upload images and a caption — we&apos;ll handle the rest.</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 space-y-5">
            <ImageDropZone
              mode={mode}
              previews={previews}
              imageFiles={imageFiles}
              dragging={dragging}
              fileInputRef={fileInputRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onFileChange={handleFileChange}
              onRemove={removeImage}
              onMoveUp={moveImageUp}
              onMoveDown={moveImageDown}
            />

            <CaptionField
              mode={mode}
              caption={caption}
              videoUrl={videoUrl}
              onModeChange={setMode}
              onCaptionChange={setCaption}
              onVideoUrlChange={setVideoUrl}
            />

            <PlatformPicker selected={selectedPlatforms} onChange={togglePlatform} />

            {submitError && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Something went wrong. Please try again.</span>
              </div>
            )}

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
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Posting...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  {mode === "video"
                    ? "Submit video"
                    : imageFiles.length > 1
                    ? `Submit ${imageFiles.length} images`
                    : "Submit post"}
                </>
              )}
            </button>
          </div>
        </div>

        <FooterLinks />
      </div>

      <CaptionReviewModal
        modal={captionModal}
        onApprove={handleApprove}
        onSubmitEdit={handleSubmitEdit}
      />

      <SuccessModal open={successModal} onClose={() => setSuccessModal(false)} />

      {toast && <Toast message={toast.message} variant={toast.variant} />}
    </main>
  );
}
