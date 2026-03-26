import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LayoutGrid } from "lucide-react";
import Sidebar from "@/components/studio/Sidebar";
import Canvas from "@/components/studio/Canvas";
import MoodboardModal from "@/components/studio/MoodboardModal";

const BG_IMAGE = "https://customer-assets.emergentagent.com/job_luxe-design-studio-2/artifacts/0opwejfb_image.png";

export default function StudioPage() {
  const navigate = useNavigate();
  const [moodboardImages, setMoodboardImages] = useState([]);
  const [showMoodboard, setShowMoodboard] = useState(false);
  const [filters, setFilters] = useState({
    function_type: null,
    space: null,
  });
  const [referenceImage, setReferenceImage] = useState(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  const handleAddToMoodboard = useCallback((imageData, prompt) => {
    setMoodboardImages((prev) => [
      ...prev,
      { image_data: imageData, prompt, filters: { ...filters }, id: crypto.randomUUID() },
    ]);
  }, [filters]);

  const handleRemoveFromMoodboard = useCallback((id) => {
    setMoodboardImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  return (
    <div className="relative h-screen w-screen overflow-hidden text-white" data-testid="studio-page">
      {/* Background with heavy blur */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(60px)",
            WebkitBackdropFilter: "blur(60px)",
            backgroundColor: "rgba(0, 0, 0, 0.55)",
          }}
        />
      </div>

      {/* Top Bar */}
      <div className="relative z-20 flex items-center justify-between px-4 md:px-6 py-3">
        <button
          onClick={() => navigate("/")}
          className="glass-button rounded-full px-4 py-2 flex items-center gap-2 text-sm"
          style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
          data-testid="back-to-home"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <h1
          className="text-xl md:text-2xl text-white/90"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}
        >
          Design Studio
        </h1>

        <button
          onClick={() => setShowMoodboard(true)}
          className="glass-button rounded-full px-4 py-2 flex items-center gap-2 text-sm"
          style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
          data-testid="view-moodboard"
          disabled={moodboardImages.length === 0}
        >
          <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Moodboard</span>
          {moodboardImages.length > 0 && (
            <span className="ml-1 bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {moodboardImages.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Layout */}
      <div className="relative z-10 h-[calc(100vh-56px)] grid grid-cols-1 md:grid-cols-12 gap-4 p-4 md:p-6 pt-0 md:pt-0" style={{ gridTemplateRows: "1fr" }}>
        {/* Sidebar */}
        <div className="col-span-1 md:col-span-3 min-h-0 h-full overflow-hidden">
          <Sidebar
            filters={filters}
            setFilters={setFilters}
            referenceImage={referenceImage}
            setReferenceImage={setReferenceImage}
            moodboardCount={moodboardImages.length}
            onViewMoodboard={() => setShowMoodboard(true)}
          />
        </div>

        {/* Main Canvas */}
        <div className="col-span-1 md:col-span-9 min-h-0 h-full">
          <Canvas
            filters={filters}
            referenceImage={referenceImage}
            sessionId={sessionId}
            onAddToMoodboard={handleAddToMoodboard}
          />
        </div>
      </div>

      {/* Moodboard Modal */}
      {showMoodboard && (
        <MoodboardModal
          images={moodboardImages}
          onClose={() => setShowMoodboard(false)}
          onRemove={handleRemoveFromMoodboard}
        />
      )}
    </div>
  );
}
