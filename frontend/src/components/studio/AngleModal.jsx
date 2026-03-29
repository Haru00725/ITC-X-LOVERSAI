import { useState, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function AngleModal({ space, onSelect, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const scrollRef = useRef(null);

  if (!space) return null;

  const scrollBy = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 320, behavior: "smooth" });
    }
  };

  const handleConfirm = () => {
    if (selectedIndex !== null) {
      const angle = space.angles[selectedIndex];
      onSelect(space, angle);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="angle-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(24px) saturate(1.2)",
          WebkitBackdropFilter: "blur(24px) saturate(1.2)",
          backgroundColor: "rgba(0, 0, 0, 0.35)",
        }}
      />

      {/* Modal Content */}
      <div
        className="relative z-10 rounded-2xl w-full max-w-4xl flex flex-col overflow-hidden"
        style={{
          backdropFilter: "blur(32px) saturate(1.4)",
          WebkitBackdropFilter: "blur(32px) saturate(1.4)",
          background: "rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        }}
        data-testid="angle-modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2
              className="text-2xl md:text-3xl text-white"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
            >
              {space.name}
            </h2>
            <p
              className="text-white/50 text-xs mt-1"
              style={{ fontFamily: "var(--font-body)" }}
            >
              {space.type} &middot; {space.capacity} &mdash; Select an angle to generate from
            </p>
          </div>
          <button
            onClick={onClose}
            className="glass-button rounded-full p-2"
            data-testid="close-angle-modal"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Carousel */}
        <div className="relative px-6 py-8">
          {/* Left arrow */}
          <button
            onClick={() => scrollBy(-1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 glass-button rounded-full p-2"
            data-testid="angle-scroll-left"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>

          {/* Scrollable track */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto glass-scroll scroll-smooth px-6"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {space.angles.map((angle, i) => (
              <div
                key={angle.label}
                onClick={() => setSelectedIndex(i)}
                className={`flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                  selectedIndex === i
                    ? "border-white/60 shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-[1.02]"
                    : "border-white/10 hover:border-white/30"
                }`}
                style={{ width: 280, scrollSnapAlign: "center" }}
                data-testid={`angle-option-${i}`}
              >
                <div className="relative">
                  <img
                    src={angle.image}
                    alt={angle.label}
                    className="w-full h-44 object-cover"
                  />
                  {selectedIndex === i && (
                    <div className="absolute top-3 right-3 glass-button rounded-full p-1.5 bg-white/30">
                      <Check className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                  )}
                </div>
                <div className="p-3" style={{ background: "rgba(255, 255, 255, 0.04)" }}>
                  <p
                    className="text-white/90 text-xs font-medium tracking-wide text-center"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {angle.label}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scrollBy(1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 glass-button rounded-full p-2"
            data-testid="angle-scroll-right"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="glass-button rounded-full px-5 py-2.5 text-sm uppercase tracking-wider"
            style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
            data-testid="angle-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedIndex === null}
            className="glass-button rounded-full px-6 py-2.5 text-sm uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            data-testid="angle-confirm"
          >
            Select Angle & Generate
          </button>
        </div>
      </div>
    </div>
  );
}
