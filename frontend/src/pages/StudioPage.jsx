import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import Sidebar from "@/components/studio/Sidebar";
import Canvas from "@/components/studio/Canvas";

const BG_IMAGE = "https://customer-assets.emergentagent.com/job_luxe-design-studio-2/artifacts/prqxmpyt_b354_ho_00_p_1024x768.jpg";

export default function StudioPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    function_type: null,
    space: null,
  });
  const [referenceImage, setReferenceImage] = useState(null);
  const [sessionId] = useState(() => crypto.randomUUID());

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
          onClick={() => navigate("/templates")}
          className="glass-button rounded-full px-4 py-2 flex items-center gap-2 text-sm"
          style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
          data-testid="go-to-templates"
        >
          <FileText className="w-4 h-4" strokeWidth={1.5} />
          <span className="hidden sm:inline">Templates</span>
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
          />
        </div>

        {/* Main Canvas */}
        <div className="col-span-1 md:col-span-9 min-h-0 h-full">
          <Canvas
            filters={filters}
            referenceImage={referenceImage}
            sessionId={sessionId}
          />
        </div>
      </div>
    </div>
  );
}
