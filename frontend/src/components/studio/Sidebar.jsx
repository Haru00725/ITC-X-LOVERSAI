import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Monitor, LayoutTemplate, ChevronDown } from "lucide-react";

const ASSET = "https://customer-assets.emergentagent.com/job_luxe-design-studio-2/artifacts";

const SPACE_OPTIONS = [
  {
    name: "Grand Terminus 1",
    type: "TERMINUS",
    thumbnail: `${ASSET}/ptw2bect_venue.jpeg`,
    angles: [
      { label: "Front View", image: `${ASSET}/ptw2bect_venue.jpeg` },
      { label: "Right View", image: `${ASSET}/a499kemh_flux-2-max-20251222_a_create_the_left_wall.jpeg` },
      { label: "Left View", image: `${ASSET}/andxd5yg_flux-2-max-20251222_a_create_the_right_wal.jpeg` },
    ],
  },
  {
    name: "Infinity Ballroom",
    type: "BALLROOM",
    thumbnail: `${ASSET}/j2xc080s_gemini-2.5-flash-image_create_the_bottom_view_of_the_venue_and_the_observer_is_on_the_top_seeing_the_bo-0.jpg`,
    angles: [
      { label: "Front View", image: `${ASSET}/j2xc080s_gemini-2.5-flash-image_create_the_bottom_view_of_the_venue_and_the_observer_is_on_the_top_seeing_the_bo-0.jpg` },
      { label: "Right View", image: `${ASSET}/labhkt6l_flux-2-max-20251222_a_create_the_right_wall.jpeg` },
      { label: "Left View", image: `${ASSET}/83g3kjla_flux-2-max-20251222_a_create_the_left_wall.jpeg` },
    ],
  },
  {
    name: "Entrance+Foyer",
    type: "FOYER",
    thumbnail: `${ASSET}/6rfb89f4_b354_ho_01_p_1024x768.jpg`,
    angles: [
      { label: "Front View", image: `${ASSET}/6rfb89f4_b354_ho_01_p_1024x768.jpg` },
      { label: "Right View", image: `${ASSET}/cqgbwl8l_flux-2-max-20251222_a_create_the_left_wall.jpeg` },
      { label: "Left View", image: `${ASSET}/0gjd2v68_flux-2-max-20251222_a_create_the_right_wal.jpeg` },
    ],
  },
  {
    name: "Madeleine de Proust",
    type: "LOUNGE",
    thumbnail: `${ASSET}/wplzju3p_WhatsApp%20Image%202026-03-24%20at%2015.01.42.jpeg`,
    angles: [
      { label: "Panoramic View", image: `${ASSET}/6ltly4jv_gemini-2.5-flash-image_create_the_top_view_and_the_observer_is_on_the_bottom_seeing_the_top_of_the_venu-0.jpg` },
      { label: "Right View", image: `${ASSET}/jr79xqi6_Gemini_Generated_Image_oc8bt1oc8bt1oc8b.png` },
      { label: "Left View", image: `${ASSET}/wplzju3p_WhatsApp%20Image%202026-03-24%20at%2015.01.42.jpeg` },
    ],
  },
  {
    name: "Aeon Ballroom",
    type: "BALLROOM",
    thumbnail: `${ASSET}/8q4dtu28_a_create_the_top_view_.png`,
    angles: [
      { label: "Panoramic View", image: `${ASSET}/8q4dtu28_a_create_the_top_view_.png` },
      { label: "Right View", image: `${ASSET}/k58vsumo_flux-2-max-20251222_a_create_the_left_wall.jpeg` },
    ],
  },
  {
    name: "Sky Terrace",
    type: "TERRACE",
    thumbnail: `${ASSET}/f1puz5nl_Gemini_Generated_Image_f1jis2f1jis2f1ji.png`,
    angles: [
      { label: "Panoramic View", image: `${ASSET}/f1puz5nl_Gemini_Generated_Image_f1jis2f1jis2f1ji.png` },
      { label: "Right View", image: `${ASSET}/d2llk445_Gemini_Generated_Image_aia9d2aia9d2aia9.png` },
      { label: "Left View", image: `${ASSET}/yv1yqe9w_Gemini_Generated_Image_nr266nr266nr266n.png` },
    ],
  },
];

const EVENT_OPTIONS = [
  { name: "Ultra-Luxury Wedding", desc: "Opulent destination wedding with international luxury standards", thumbnail: "/Assets/Ultra-Luxury.jpg" },
  { name: "Indian Destination Wedding", desc: "Grand Indian wedding with traditional elements and modern luxury", thumbnail: "/Assets/Destination-wedding.jpg" },
  { name: "Corporate Conference", desc: "Professional business event with modern staging and technology", thumbnail: "/Assets/Corparate.jpg" },
  { name: "Global Exhibition", desc: "International trade show or product showcase", thumbnail: "/Assets/Gloabal-Exhibiton.jpg" },
  { name: "Fashion Show", desc: "High-fashion runway event with dramatic staging", thumbnail: "/Assets/Fashion-Show.jpg" },
  { name: "Product Launch", desc: "Premium brand product unveiling event", thumbnail: "/Assets/Product-Launch.jpg" },
  { name: "Cultural Festival", desc: "Vibrant cultural celebration with diverse elements", thumbnail: "/Assets/Cultural-Festival.jpg" },
];

export { SPACE_OPTIONS, EVENT_OPTIONS };

export default function Sidebar({
  filters,
  setFilters,
  referenceImage,
  setReferenceImage,
  onSpaceClick,
  onHoverItem,
  onOpenTemplateRef,
}) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result.split(",")[1];
      setReferenceImage({ data: base64, preview: e.target.result, name: file.name });
    };
    reader.readAsDataURL(file);
    setShowUploadMenu(false);
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
      onMouseLeave={() => onHoverItem(null)}
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
            <img src={referenceImage.preview} alt="Reference" className="w-full h-32 object-cover" />
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
          <div className="relative">
            {/* Upload button — click shows dropdown */}
            <button
              onClick={() => setShowUploadMenu((v) => !v)}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`w-full border-2 border-dashed rounded-xl p-5 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                dragOver
                  ? "border-white/50 bg-white/10"
                  : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
              }`}
              data-testid="upload-design-reference"
            >
              <Upload className="w-5 h-5 text-white/50" strokeWidth={1.5} />
              <span className="text-white/60 text-xs tracking-wide" style={{ fontFamily: "var(--font-body)" }}>
                Upload Design Reference
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${showUploadMenu ? "rotate-180" : ""}`} strokeWidth={1.5} />
            </button>

            {/* Dropdown menu */}
            {showUploadMenu && (
              <div
                className="mt-2 rounded-xl overflow-hidden"
                style={{
                  backdropFilter: "blur(24px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(24px) saturate(1.4)",
                  background: "rgba(0, 0, 0, 0.3)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
                }}
                data-testid="upload-menu"
              >
                <button
                  onClick={() => { fileInputRef.current?.click(); setShowUploadMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors duration-200"
                  data-testid="upload-from-computer"
                >
                  <Monitor className="w-4 h-4 text-white/60" strokeWidth={1.5} />
                  <div>
                    <span className="block text-white/90 text-xs font-medium" style={{ fontFamily: "var(--font-body)" }}>Upload from Computer</span>
                    <span className="block text-white/40 text-[10px]" style={{ fontFamily: "var(--font-body)" }}>Browse your files</span>
                  </div>
                </button>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} />
                <button
                  onClick={() => { onOpenTemplateRef(); setShowUploadMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors duration-200"
                  data-testid="take-template-reference"
                >
                  <LayoutTemplate className="w-4 h-4 text-white/60" strokeWidth={1.5} />
                  <div>
                    <span className="block text-white/90 text-xs font-medium" style={{ fontFamily: "var(--font-body)" }}>Take Template Reference</span>
                    <span className="block text-white/40 text-[10px]" style={{ fontFamily: "var(--font-body)" }}>Select from luxury templates</span>
                  </div>
                </button>
              </div>
            )}
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

      {/* Select Space */}
      <div className="mb-5">
        <h3 className="text-white/90 text-sm mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}>
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
                filters.space === space.name ? "glass-pill-active border-white/40" : "glass-pill"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
              data-testid={`filter-space-${space.name.toLowerCase().replace(/[\s+]/g, "-")}`}
            >
              <span className="block text-xs font-medium text-white/90">{space.name}</span>
              <span className="block text-[10px] uppercase tracking-wider text-white/40 mt-0.5">{space.type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="border-t border-white/10 mb-5" />

      {/* Event Type */}
      <div className="mb-5">
        <h3 className="text-white/90 text-sm mb-1" style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}>
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
                filters.function_type === event.name ? "glass-pill-active border-white/40" : "glass-pill"
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
