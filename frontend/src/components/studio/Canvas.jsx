import { useState } from "react";
import { Sparkles, Download, Loader2, ImageIcon, Plus } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Helper to convert image URL to base64
const urlToBase64 = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to base64:", error);
    return null;
  }
};

export default function Canvas({ filters, referenceImage, venueImage, sessionId, selectedAngle, onAddToMoodboard, moodboardCount }) {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      console.log("=== GENERATION START ===");
      console.log("venueImage prop:", venueImage);
      console.log("selectedAngle prop:", selectedAngle);
      console.log("referenceImage prop:", referenceImage);
      console.log("filters:", filters);
      
      // Build angle context into the prompt
      let fullPrompt = prompt.trim();
      if (selectedAngle) {
        fullPrompt += `. Perspective: ${selectedAngle.angle} of ${selectedAngle.space}`;
        console.log("Selected angle:", selectedAngle.angle, selectedAngle.space);
      }

      // ROBUST: Convert venue image URL to base64 for FLUX API
      let venueImageBase64 = null;
      if (venueImage) {
        console.log("Converting venue image URL:", venueImage.substring(0, 80), "...");
        try {
          venueImageBase64 = await urlToBase64(venueImage);
          // Validate the conversion
          if (!venueImageBase64 || venueImageBase64.length < 1000) {
            console.log("Venue conversion failed or too small, trying fetch directly...");
            // Fallback: fetch directly and convert
            const response = await fetch(venueImage);
            const blob = await response.blob();
            const reader = new FileReader();
            venueImageBase64 = await new Promise((resolve, reject) => {
              reader.onloadend = () => {
                const result = reader.result;
                const base64 = result.split(",")[1];
                resolve(base64);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
          console.log("Venue converted SUCCESS:", venueImageBase64.length, "chars");
        } catch (venueErr) {
          console.error("Venue conversion error:", venueErr);
          // Last resort: skip venue image but log it
        }
      } else {
        console.log("NO venueImage provided");
      }

      // ROBUST: Convert reference image to base64
      let designImageBase64 = null;
      try {
        if (referenceImage?.data) {
          // Already base64 from file upload
          designImageBase64 = referenceImage.data;
          console.log("Design from upload:", designImageBase64.length, "chars");
        } else if (referenceImage?.thumbnailUrl) {
          // Template thumbnail - convert URL to base64
          console.log("Converting design template URL:", referenceImage.thumbnailUrl.substring(0, 80), "...");
          designImageBase64 = await urlToBase64(referenceImage.thumbnailUrl);
          if (!designImageBase64 || designImageBase64.length < 1000) {
            // Try direct fetch fallback
            const response = await fetch(referenceImage.thumbnailUrl);
            const blob = await response.blob();
            designImageBase64 = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result.split(",")[1]);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          }
          console.log("Design from template:", designImageBase64 ? "Success (" + designImageBase64.length + ")" : "Failed");
        } else if (referenceImage?.preview && !referenceImage?.data) {
          // Handle preview URL case
          console.log("Converting design preview URL...");
          designImageBase64 = await urlToBase64(referenceImage.preview);
          console.log("Design from preview:", designImageBase64 ? "Success" : "Failed");
        } else {
          console.log("NO referenceImage provided");
        }
      } catch (designErr) {
        console.error("Design conversion error:", designErr);
      }

      // LOG FINAL STATUS
      console.log("=== FINAL PAYLOAD STATUS ===");
      console.log("venue_image:", venueImageBase64 ? `✅ ${venueImageBase64.length} chars` : "❌ NOT SENT");
      console.log("design_image:", designImageBase64 ? `✅ ${designImageBase64.length} chars` : "❌ NOT SENT");
      
      // Validate before sending
      if (!venueImageBase64 && !designImageBase64) {
        setError("No images available. Please select a venue or upload a design reference.");
        setIsGenerating(false);
        return;
      }

      const payload = {
        prompt: fullPrompt,
        function_type: filters.function_type || null,
        space: filters.space || null,
        venue_image: venueImageBase64,
        design_image: designImageBase64,
        reference_image: referenceImage?.data || null,
      };

      console.log("Sending to backend with:", {
        hasVenue: !!venueImageBase64,
        hasDesign: !!designImageBase64,
        venueLength: venueImageBase64?.length || 0,
        designLength: designImageBase64?.length || 0
      });

      const res = await axios.post(`${API}/generate`, payload);

      if (res.data.success) {
        setGeneratedImage(res.data.image_data);
      } else {
        setError(res.data.error || "Failed to generate image");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${generatedImage}`;
    link.download = `design-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isGenerating) {
      handleGenerate();
    }
  };

  return (
    <div className="h-full flex flex-col gap-4" data-testid="studio-canvas">
      {/* Prompt Bar */}
      <div className="relative flex items-center w-full" data-testid="prompt-bar">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your dream venue design..."
          className="glass-input w-full rounded-full pl-6 pr-36 py-4 text-sm md:text-base"
          style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
          disabled={isGenerating}
          data-testid="prompt-input"
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="absolute right-2 glass-button rounded-full px-5 py-2.5 flex items-center gap-2 text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
          data-testid="generate-button"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
          )}
          {isGenerating ? "Generating" : "Generate"}
        </button>
      </div>

      {/* Active filters display */}
      {(filters.function_type || filters.space || selectedAngle || referenceImage || venueImage) && (
        <div className="flex items-center gap-2 flex-wrap px-1">
          <span className="text-white/40 text-xs" style={{ fontFamily: "var(--font-body)" }}>
            Active:
          </span>
          {filters.function_type && (
            <span className="glass-pill-active rounded-full px-3 py-1 text-xs">{filters.function_type}</span>
          )}
          {filters.space && (
            <span className="glass-pill-active rounded-full px-3 py-1 text-xs">{filters.space}</span>
          )}
          {selectedAngle && (
            <span className="glass-pill-active rounded-full px-3 py-1 text-xs">{selectedAngle.angle}</span>
          )}
          {venueImage && (
            <span className="glass-pill-active rounded-full px-3 py-1 text-xs flex items-center gap-1">
              <ImageIcon className="w-3 h-3" strokeWidth={1.5} /> Venue
            </span>
          )}
          {referenceImage && !venueImage && (
            <span className="glass-pill-active rounded-full px-3 py-1 text-xs flex items-center gap-1">
              <ImageIcon className="w-3 h-3" strokeWidth={1.5} /> Ref
            </span>
          )}
        </div>
      )}

      {/* Main Canvas Area */}
      <div
        className="flex-1 glass-panel rounded-2xl relative flex items-center justify-center overflow-hidden"
        data-testid="main-canvas"
      >
        {isGenerating ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white/70 animate-spin" strokeWidth={1} />
            </div>
            <p
              className="text-white/50 text-sm tracking-wide"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              Creating your vision...
            </p>
            <div className="w-48 h-1 rounded-full overflow-hidden bg-white/10">
              <div className="h-full shimmer-loading rounded-full" style={{ width: "100%" }} />
            </div>
          </div>
        ) : generatedImage ? (
          <>
            <img
              src={`data:image/png;base64,${generatedImage}`}
              alt="Generated venue design"
              className="max-w-full max-h-full object-contain rounded-lg"
              data-testid="generated-image"
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <button
                onClick={() => {
                  if (onAddToMoodboard) {
                    onAddToMoodboard(generatedImage, prompt);
                  }
                }}
                className="glass-button rounded-full px-4 py-3 flex items-center gap-2 text-sm uppercase tracking-wider"
                style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                data-testid="add-to-moodboard"
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                Add
              </button>
              <button
                onClick={handleDownload}
                className="glass-button rounded-full px-6 py-3 flex items-center gap-2 text-sm uppercase tracking-wider"
                style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
                data-testid="download-image"
              >
                <Download className="w-4 h-4" strokeWidth={1.5} />
                Download
              </button>
            </div>
          </>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-8 text-center">
            <div className="w-12 h-12 rounded-full glass-panel flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white/40" strokeWidth={1} />
            </div>
            <p className="text-white/50 text-sm" style={{ fontFamily: "var(--font-body)" }}>
              {error}
            </p>
            <button
              onClick={handleGenerate}
              className="glass-button rounded-full px-5 py-2 text-xs uppercase tracking-wider mt-2"
              data-testid="retry-generate"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 px-8 text-center">
            <div className="w-16 h-16 rounded-full glass-panel flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white/30" strokeWidth={1} />
            </div>
            <p
              className="text-white/40 text-sm tracking-wide"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              Describe your dream venue and hit Generate
            </p>
            <p className="text-white/25 text-xs" style={{ fontFamily: "var(--font-body)" }}>
              Select filters on the left for more targeted designs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
