import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

const FILTER_CONFIG = {
  function_type: {
    label: "Function",
    options: ["Haldi", "Mehndi", "Sangeet", "Shadi", "Reception"],
  },
  theme: {
    label: "Theme",
    options: ["Traditional", "Modern", "Mix"],
  },
  space: {
    label: "Space",
    options: ["Restaurant", "Bar", "Stage", "Hall", "Lounge"],
  },
};

export default function Sidebar({ filters, setFilters, referenceImage, setReferenceImage }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(",")[1];
      setReferenceImage({ data: base64, preview: e.target.result, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const toggleFilter = (category, value) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category] === value ? null : value,
    }));
  };

  return (
    <div
      className="glass-panel rounded-2xl h-full flex flex-col p-5 overflow-y-auto glass-scroll"
      data-testid="studio-sidebar"
    >
      {/* Upload Design Reference */}
      <div className="mb-6">
        <h3
          className="text-white/80 text-xs uppercase tracking-widest mb-3"
          style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
        >
          Design Reference
        </h3>

        {referenceImage ? (
          <div className="relative rounded-xl overflow-hidden border border-white/20">
            <img
              src={referenceImage.preview}
              alt="Reference"
              className="w-full h-32 object-cover"
            />
            <button
              onClick={() => setReferenceImage(null)}
              className="absolute top-2 right-2 glass-button rounded-full p-1.5"
              data-testid="remove-reference"
            >
              <X className="w-3 h-3" strokeWidth={2} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm px-3 py-1.5">
              <p className="text-white/70 text-xs truncate" style={{ fontFamily: "var(--font-body)" }}>
                {referenceImage.name}
              </p>
            </div>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
              dragOver
                ? "border-white/50 bg-white/10"
                : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
            }`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            data-testid="upload-design-reference"
          >
            <Upload className="w-6 h-6 text-white/50" strokeWidth={1.5} />
            <span
              className="text-white/60 text-xs tracking-wide"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Upload Design Reference
            </span>
            <span className="text-white/30 text-xs">Drop image or click</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          data-testid="file-input"
        />
      </div>

      {/* Separator */}
      <div className="border-t border-white/10 mb-6" />

      {/* Filter Groups */}
      {Object.entries(FILTER_CONFIG).map(([key, config]) => (
        <div key={key} className="mb-5">
          <h3
            className="text-white/80 text-xs uppercase tracking-widest mb-3"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
          >
            {config.label}
          </h3>
          <div className="flex flex-wrap gap-2">
            {config.options.map((option) => (
              <button
                key={option}
                onClick={() => toggleFilter(key, option)}
                className={`rounded-full px-4 py-1.5 text-xs tracking-wide transition-all duration-300 ${
                  filters[key] === option ? "glass-pill-active" : "glass-pill"
                }`}
                style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                data-testid={`filter-${key}-${option.toLowerCase()}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Tiny reference preview if image set */}
      {referenceImage && (
        <div className="mt-4 flex items-center gap-2 text-white/40 text-xs">
          <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span style={{ fontFamily: "var(--font-body)" }}>Reference loaded</span>
        </div>
      )}
    </div>
  );
}
