import { PLATFORMS, type SocialPlatform } from "@/app/lib/constants";

interface PlatformPickerProps {
  selected: SocialPlatform[];
  onChange: (id: SocialPlatform) => void;
}

export function PlatformPicker({ selected, onChange }: PlatformPickerProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2.5">
        Post to
      </label>
      <div className="flex flex-wrap gap-2">
        {PLATFORMS.map((platform) => {
          const isSelected = selected.includes(platform.id);
          return (
            <button
              key={platform.id}
              onClick={() => onChange(platform.id)}
              style={
                isSelected
                  ? { backgroundColor: platform.color, borderColor: platform.color, color: "#fff" }
                  : {}
              }
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-150 select-none",
                isSelected
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
      <p className="text-xs text-gray-500 mt-1.5">Click icon to disable</p>
      {selected.length === 0 && (
        <p className="text-xs text-red-500 mt-1.5">Select at least one platform.</p>
      )}
    </div>
  );
}
