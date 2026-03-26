import { useState } from "react";
import { X, Download, FileText, Presentation, Loader2, Trash2 } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function MoodboardModal({ images, onClose, onRemove }) {
  const [downloading, setDownloading] = useState(null);

  const handleDownload = async (type) => {
    if (images.length === 0) return;
    setDownloading(type);

    try {
      const payload = {
        images: images.map((img) => ({
          image_data: img.image_data,
          prompt: img.prompt,
        })),
      };

      const endpoint = type === "pdf" ? "/moodboard/download-pdf" : "/moodboard/download-ppt";
      const res = await axios.post(`${API}${endpoint}`, payload, {
        responseType: "blob",
      });

      const ext = type === "pdf" ? "pdf" : "pptx";
      const mimeType =
        type === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.presentationml.presentation";

      const blob = new Blob([res.data], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moodboard.${ext}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      data-testid="moodboard-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      />

      {/* Modal Content */}
      <div className="relative z-10 glass-panel-heavy rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2
              className="text-2xl md:text-3xl text-white"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
            >
              Your Moodboard
            </h2>
            <p
              className="text-white/50 text-xs mt-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {images.length} design{images.length !== 1 ? "s" : ""} collected
            </p>
          </div>
          <button
            onClick={onClose}
            className="glass-button rounded-full p-2"
            data-testid="close-moodboard"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto glass-scroll p-6">
          {images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
              <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center">
                <Download className="w-8 h-8 text-white/30" strokeWidth={1} />
              </div>
              <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                No designs saved yet. Generate and add images to your moodboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  className="relative group rounded-xl overflow-hidden border border-white/10 bg-white/5"
                  data-testid={`moodboard-image-${i}`}
                >
                  <img
                    src={`data:image/png;base64,${img.image_data}`}
                    alt={`Design ${i + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={() => onRemove(img.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 glass-button rounded-full p-2"
                      data-testid={`remove-moodboard-${i}`}
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="p-3 border-t border-white/10">
                    <p
                      className="text-white/60 text-xs truncate"
                      style={{ fontFamily: "var(--font-body)" }}
                    >
                      {img.prompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {images.length > 0 && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
            <button
              onClick={() => handleDownload("pdf")}
              disabled={downloading === "pdf"}
              className="glass-button rounded-full px-5 py-2.5 flex items-center gap-2 text-sm uppercase tracking-wider disabled:opacity-40"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
              data-testid="download-pdf"
            >
              {downloading === "pdf" ? (
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <FileText className="w-4 h-4" strokeWidth={1.5} />
              )}
              Download PDF
            </button>
            <button
              onClick={() => handleDownload("ppt")}
              disabled={downloading === "ppt"}
              className="glass-button rounded-full px-5 py-2.5 flex items-center gap-2 text-sm uppercase tracking-wider disabled:opacity-40"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
              data-testid="download-ppt"
            >
              {downloading === "ppt" ? (
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <Presentation className="w-4 h-4" strokeWidth={1.5} />
              )}
              Download PPT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
