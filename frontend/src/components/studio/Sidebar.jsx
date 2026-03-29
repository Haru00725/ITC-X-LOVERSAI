import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";

// Placeholder thumbnails — replace these URLs with actual venue/event images
const SPACE_OPTIONS = [
  {
    name: "Grand Ballroom",
    type: "BALLROOM",
    capacity: "500 guests",
    thumbnail: "https://images.unsplash.com/photo-1579254216656-3c0c16a3bdd6?w=300&h=200&fit=crop",
    angles: [
      { label: "Front View", image: "https://images.unsplash.com/photo-1579254216656-3c0c16a3bdd6?w=600&h=400&fit=crop" },
      { label: "Left View", image: "https://images.unsplash.com/photo-1579254216547-a90bea451479?w=600&h=400&fit=crop" },
      { label: "Right View", image: "https://images.unsplash.com/photo-1670529776286-f426fb7ba42c?w=600&h=400&fit=crop" },
      { label: "Stage View", image: "https://images.pexels.com/photos/30584407/pexels-photo-30584407.jpeg?auto=compress&w=600&h=400&fit=crop" },
    ],
  },
  {
    name: "Emerald Lawn",
    type: "LAWN",
    capacity: "800 guests",
    thumbnail: "https://images.unsplash.com/photo-1771276046005-9de355046e70?w=300&h=200&fit=crop",
    angles: [
      { label: "Front View", image: "https://images.unsplash.com/photo-1771276046005-9de355046e70?w=600&h=400&fit=crop" },
      { label: "Left View", image: "https://images.unsplash.com/photo-1762926628099-a27b380d94c9?w=600&h=400&fit=crop" },
      { label: "Right View", image: "https://images.unsplash.com/photo-1762926627939-a66e4fc17c2a?w=600&h=400&fit=crop" },
      { label: "Aerial View", image: "https://images.unsplash.com/photo-1771992457691-27aad49f8869?w=600&h=400&fit=crop" },
    ],
  },
  {
    name: "Imperial Banquet Hall",
    type: "BANQUET",
    capacity: "200 guests",
    thumbnail: "https://images.pexels.com/photos/19569865/pexels-photo-19569865.jpeg?auto=compress&w=300&h=200&fit=crop",
    angles: [
      { label: "Front View", image: "https://images.pexels.com/photos/19569865/pexels-photo-19569865.jpeg?auto=compress&w=600&h=400&fit=crop" },
      { label: "Left View", image: "https://images.unsplash.com/photo-1569069246867-979d76c7864d?w=600&h=400&fit=crop" },
      { label: "Right View", image: "https://images.unsplash.com/photo-1670529776286-f426fb7ba42c?w=600&h=400&fit=crop" },
      { label: "Stage View", image: "https://images.unsplash.com/photo-1579254216656-3c0c16a3bdd6?w=600&h=400&fit=crop" },
    ],
  },
  {
    name: "Marble Foyer",
    type: "FOYER",
    capacity: "150 guests",
    thumbnail: "https://images.unsplash.com/photo-1569069246867-979d76c7864d?w=300&h=200&fit=crop",
    angles: [
      { label: "Front View", image: "https://images.unsplash.com/photo-1569069246867-979d76c7864d?w=600&h=400&fit=crop" },
      { label: "Left View", image: "https://images.pexels.com/photos/19569865/pexels-photo-19569865.jpeg?auto=compress&w=600&h=400&fit=crop" },
      { label: "Right View", image: "https://images.unsplash.com/photo-1579254216547-a90bea451479?w=600&h=400&fit=crop" },
      { label: "Entrance View", image: "https://images.unsplash.com/photo-1670529776286-f426fb7ba42c?w=600&h=400&fit=crop" },
    ],
  },
  {
    name: "Sky Terrace",
    type: "ROOFTOP",
    capacity: "300 guests",
    thumbnail: "https://images.unsplash.com/photo-1771992457691-27aad49f8869?w=300&h=200&fit=crop",
    angles: [
      { label: "Front View", image: "https://images.unsplash.com/photo-1771992457691-27aad49f8869?w=600&h=400&fit=crop" },
      { label: "Left View", image: "https://images.unsplash.com/photo-1771276046005-9de355046e70?w=600&h=400&fit=crop" },
      { label: "Right View", image: "https://images.unsplash.com/photo-1762926628099-a27b380d94c9?w=600&h=400&fit=crop" },
      { label: "Panoramic View", image: "https://images.unsplash.com/photo-1762926627939-a66e4fc17c2a?w=600&h=400&fit=crop" },
    ],
  },
  {
    name: "Courtyard Garden",
    type: "COURTYARD",
    capacity: "100 guests",
    thumbnail: "https://images.unsplash.com/photo-1762926627939-a66e4fc17c2a?w=300&h=200&fit=crop",
    angles: [
      { label: "Front View", image: "https://images.unsplash.com/photo-1762926627939-a66e4fc17c2a?w=600&h=400&fit=crop" },
      { label: "Left View", image: "https://images.unsplash.com/photo-1762926628099-a27b380d94c9?w=600&h=400&fit=crop" },
      { label: "Right View", image: "https://images.unsplash.com/photo-1771276046005-9de355046e70?w=600&h=400&fit=crop" },
      { label: "Garden View", image: "https://images.unsplash.com/photo-1771992457691-27aad49f8869?w=600&h=400&fit=crop" },
    ],
  },
];

const EVENT_OPTIONS = [
  { name: "Ultra-Luxury Wedding", desc: "Opulent destination wedding with international luxury standards", thumbnail: "https://images.unsplash.com/photo-1579254216656-3c0c16a3bdd6?w=300&h=200&fit=crop" },
  { name: "Indian Destination Wedding", desc: "Grand Indian wedding with traditional elements and modern luxury", thumbnail: "https://images.unsplash.com/photo-1579254216547-a90bea451479?w=300&h=200&fit=crop" },
  { name: "Corporate Conference", desc: "Professional business event with modern staging and technology", thumbnail: "https://images.unsplash.com/photo-1569069246867-979d76c7864d?w=300&h=200&fit=crop" },
  { name: "Global Exhibition", desc: "International trade show or product showcase", thumbnail: "https://images.unsplash.com/photo-1670529776286-f426fb7ba42c?w=300&h=200&fit=crop" },
  { name: "Fashion Show", desc: "High-fashion runway event with dramatic staging", thumbnail: "https://images.pexels.com/photos/30584407/pexels-photo-30584407.jpeg?auto=compress&w=300&h=200&fit=crop" },
  { name: "Product Launch", desc: "Premium brand product unveiling event", thumbnail: "https://images.pexels.com/photos/19569865/pexels-photo-19569865.jpeg?auto=compress&w=300&h=200&fit=crop" },
  { name: "Cultural Festival", desc: "Vibrant cultural celebration with diverse elements", thumbnail: "https://images.unsplash.com/photo-1771276046005-9de355046e70?w=300&h=200&fit=crop" },
];

export { SPACE_OPTIONS, EVENT_OPTIONS };

export default function Sidebar({
  filters,
  setFilters,
  referenceImage,
  setReferenceImage,
  onSpaceClick,
  onHoverItem,
}) {
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

  const handleMouseMove = (e, item) => {
    const sidebar = e.currentTarget.closest("[data-testid='studio-sidebar']");
    const sidebarRect = sidebar.getBoundingClientRect();
    onHoverItem({
      ...item,
      x: sidebarRect.right + 12,
      y: Math.min(e.clientY - 60, window.innerHeight - 200),
    });
  };

  return (
    <div
      className="glass-panel rounded-2xl h-full flex flex-col p-5 overflow-y-auto glass-scroll relative"
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
      <div className="border-t border-white/10 mb-5" />

      {/* Select Space — click opens angle modal */}
      <div className="mb-5">
        <h3
          className="text-white/90 text-sm mb-1"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
        >
          Select Space
        </h3>
        <p className="text-white/40 text-xs mb-3" style={{ fontFamily: "var(--font-body)" }}>
          Click to explore angles
        </p>
        <div className="flex flex-col gap-2">
          {SPACE_OPTIONS.map((space) => (
            <button
              key={space.name}
              onClick={() => onSpaceClick(space)}
              onMouseMove={(e) => handleMouseMove(e, { thumbnail: space.thumbnail, name: space.name })}
              onMouseLeave={() => onHoverItem(null)}
              className={`text-left rounded-xl px-4 py-3 transition-all duration-300 ${
                filters.space === space.name
                  ? "glass-pill-active border-white/40"
                  : "glass-pill"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
              data-testid={`filter-space-${space.type.toLowerCase()}`}
            >
              <span className="block text-xs font-medium text-white/90">{space.name}</span>
              <span className="block text-[10px] uppercase tracking-wider text-white/40 mt-0.5">{space.type}</span>
              <span className="block text-[10px] text-white/30 mt-0.5">Capacity: {space.capacity}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-white/10 mb-5" />

      {/* Event Type — toggle filter */}
      <div className="mb-5">
        <h3
          className="text-white/90 text-sm mb-1"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
        >
          Event Type
        </h3>
        <p className="text-white/40 text-xs mb-3" style={{ fontFamily: "var(--font-body)" }}>
          Choose your occasion
        </p>
        <div className="flex flex-col gap-2">
          {EVENT_OPTIONS.map((event) => (
            <button
              key={event.name}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  function_type: prev.function_type === event.name ? null : event.name,
                }))
              }
              onMouseMove={(e) => handleMouseMove(e, { thumbnail: event.thumbnail, name: event.name })}
              onMouseLeave={() => onHoverItem(null)}
              className={`text-left rounded-xl px-4 py-3 transition-all duration-300 ${
                filters.function_type === event.name
                  ? "glass-pill-active border-white/40"
                  : "glass-pill"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
              data-testid={`filter-event-${event.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <span className="block text-xs font-medium text-white/90">{event.name}</span>
              <span className="block text-[10px] text-white/35 mt-0.5 leading-relaxed">{event.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" />

      {referenceImage && (
        <div className="mt-4 flex items-center gap-2 text-white/40 text-xs">
          <ImageIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span style={{ fontFamily: "var(--font-body)" }}>Reference loaded</span>
        </div>
      )}
    </div>
  );
}
