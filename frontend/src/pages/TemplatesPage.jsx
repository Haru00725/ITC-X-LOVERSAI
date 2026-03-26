import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText, Loader2, Presentation } from "lucide-react";
import axios from "axios";

const BG_IMAGE = "https://customer-assets.emergentagent.com/job_luxe-design-studio-2/artifacts/prqxmpyt_b354_ho_00_p_1024x768.jpg";
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get(`${API}/templates`);
        setTemplates(res.data.templates || []);
      } catch (err) {
        console.error("Failed to load templates", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTemplates();
  }, []);

  const handleDownload = (template) => {
    const url = `${API}/templates/download/${template.filename}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = template.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative min-h-screen text-white" data-testid="templates-page">
      {/* Fixed Background */}
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
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-6 py-4">
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
            Design Templates
          </h1>

          <button
            onClick={() => navigate("/studio")}
            className="glass-button rounded-full px-4 py-2 flex items-center gap-2 text-sm"
            style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
            data-testid="go-to-studio"
          >
            <span className="hidden sm:inline">Open Studio</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="px-6 pt-8 pb-12 text-center max-w-3xl mx-auto">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl mb-4 text-white"
            style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
          >
            Curated Templates
          </h2>
          <p
            className="text-white/60 text-sm md:text-base"
            style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          >
            Browse our collection of professionally designed event templates.
            Download and customize to match your vision.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="px-6 pb-16 max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-white/50 animate-spin" strokeWidth={1} />
            </div>
          ) : templates.length === 0 ? (
            <div className="glass-panel rounded-2xl p-12 text-center">
              <Presentation className="w-12 h-12 text-white/30 mx-auto mb-4" strokeWidth={1} />
              <p
                className="text-white/50 text-base mb-2"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}
              >
                No templates available yet
              </p>
              <p
                className="text-white/30 text-xs"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Templates will appear here once added to the collection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="glass-panel rounded-2xl overflow-hidden group transition-all duration-300 hover:border-white/40 hover:bg-white/10"
                  data-testid={`template-card-${template.id}`}
                >
                  {/* Template Preview Area */}
                  <div className="h-36 bg-white/5 flex items-center justify-center border-b border-white/10">
                    <FileText className="w-10 h-10 text-white/20" strokeWidth={1} />
                  </div>

                  {/* Template Info */}
                  <div className="p-5">
                    <span
                      className="text-white/40 text-[10px] uppercase tracking-widest"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
                    >
                      {template.category}
                    </span>
                    <h3
                      className="text-white text-base mt-1 mb-2"
                      style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
                    >
                      {template.title}
                    </h3>
                    <p
                      className="text-white/50 text-xs leading-relaxed mb-4"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
                    >
                      {template.description}
                    </p>

                    <button
                      onClick={() => handleDownload(template)}
                      className="glass-button rounded-full px-4 py-2 w-full flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                      data-testid={`download-template-${template.id}`}
                    >
                      <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Download Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
