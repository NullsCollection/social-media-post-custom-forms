interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
}

export function SuccessModal({ open, onClose }: SuccessModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">Successfully Posted!</h3>
          <p className="text-sm text-gray-500 mt-1">Your content has been posted.</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#1a2035] hover:bg-[#232c47] text-white text-sm font-semibold transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
