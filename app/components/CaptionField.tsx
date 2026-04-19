import { MODES, MAX_CAPTION, type Mode } from "@/app/lib/constants";

interface CaptionFieldProps {
  mode: Mode;
  caption: string;
  videoUrl: string;
  onModeChange: (mode: Mode) => void;
  onCaptionChange: (value: string) => void;
  onVideoUrlChange: (value: string) => void;
}

export function CaptionField({
  mode,
  caption,
  videoUrl,
  onModeChange,
  onCaptionChange,
  onVideoUrlChange,
}: CaptionFieldProps) {
  return (
    <div>
      {/* Mode selector */}
      <div className="px-1.5 pt-1.5 mb-3">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
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

      {/* Video URL input — only in video mode */}
      {mode === "video" && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2.5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest">
              Video URL
            </label>
          </div>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => onVideoUrlChange(e.target.value)}
            placeholder="https://your-video-url.com"
            className="w-full border border-gray-300 bg-white hover:border-gray-400 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 text-gray-900 placeholder-gray-400 text-sm rounded-xl px-4 py-3 transition-colors"
          />
        </div>
      )}

      {/* Caption label row */}
      <div className="flex items-center justify-between mb-2.5">
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest">
          Caption
          {mode === "ai" && (
            <span className="ml-2 text-[#FF6B35] normal-case font-normal text-xs">
              (AI Generated)
            </span>
          )}
        </label>
        {mode === "manual" && (
          <span
            className={`text-xs tabular-nums transition-colors ${caption.length > MAX_CAPTION * 0.9 ? "text-[#FF6B35]" : "text-gray-500"}`}
          >
            {caption.length} / {MAX_CAPTION}
          </span>
        )}
      </div>

      <textarea
        ref={(textarea) => {
          if (textarea && mode !== "ai") {
            textarea.style.height = "auto";
            textarea.style.height = `${textarea.scrollHeight}px`;
          }
        }}
        value={mode === "ai" ? "" : caption}
        onChange={(e) => {
          const newValue = e.target.value.slice(0, MAX_CAPTION);
          onCaptionChange(newValue);
          e.target.style.height = "auto";
          e.target.style.height = `${e.target.scrollHeight}px`;
        }}
        placeholder={
          mode === "ai"
            ? "Just upload and we'll generate a caption for you!"
            : "Write something memorable..."
        }
        rows={3}
        disabled={mode === "ai"}
        className={`w-full border text-sm rounded-xl px-4 py-3 resize-y transition-colors leading-relaxed max-h-[1000px] ${
          mode === "ai"
            ? "bg-gray-100 border-gray-200 text-gray-400 placeholder-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 hover:border-gray-400 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 text-gray-900 placeholder-gray-400"
        }`}
      />
    </div>
  );
}
