"use client";

import { useState } from "react";

interface CaptionReviewModalProps {
  modal: { caption: string; executionId: string } | null;
  onApprove: (executionId: string) => void;
  onSubmitEdit: (executionId: string, editText: string) => void;
}

export function CaptionReviewModal({ modal, onApprove, onSubmitEdit }: CaptionReviewModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState("");

  if (!modal) return null;

  const handleApprove = () => {
    onApprove(modal.executionId);
    setEditMode(false);
    setEditText("");
  };

  const handleSubmitEdit = () => {
    if (!editText.trim()) return;
    onSubmitEdit(modal.executionId, editText.trim());
    setEditMode(false);
    setEditText("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900">Review Your Caption</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
          {modal.caption}
        </div>

        {!editMode ? (
          <div className="flex gap-3">
            <button
              onClick={handleApprove}
              className="flex-1 py-2.5 rounded-xl bg-[#1a2035] hover:bg-[#232c47] text-white text-sm font-semibold transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => setEditMode(true)}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:border-gray-400 text-sm font-semibold transition-colors"
            >
              Request Edit
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Describe what to change..."
              rows={4}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 resize-none"
            />
            <button
              onClick={handleSubmitEdit}
              disabled={!editText.trim()}
              className="w-full py-2.5 rounded-xl bg-[#1a2035] hover:bg-[#232c47] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
