import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function TemplateRefModal({ onSelect, onClose }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${API}/templates`);
        setTemplates(res.data.templates || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleConfirm = () => {
    if (selected !== null) {
      onSelect(templates[selected]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      data-testid="template-ref-modal"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: "blur(24px) saturate(1.2)",
          WebkitBackdropFilter: "blur(24px) saturate(1.2)",
          backgroundColor: "rgba(0, 0, 0, 0.35)",
        }}
      />

      <div
        className="relative z-10 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
        style={{
          backdropFilter: "blur(32px) saturate(1.4)",
          WebkitBackdropFilter: "blur(32px) saturate(1.4)",
          background: "rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl text-white" style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}>
              Select Template Reference
            </h2>
            <p className="text-white/50 text-xs mt-1" style={{ fontFamily: "var(--font-body)" }}>
              Choose a luxury template as your design reference
            </p>
          </div>
          <button onClick={onClose} className="glass-button rounded-full p-2" data-testid="close-template-ref">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto glass-scroll p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-white/50 animate-spin" strokeWidth={1} />
            </div>
          ) : templates.length === 0 ? (
            <p className="text-white/40 text-sm text-center py-12" style={{ fontFamily: "var(--font-body)" }}>
              No templates available yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {templates.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setSelected(i)}
                  className={`text-left rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                    selected === i
                      ? "border-white/50 shadow-[0_0_16px_rgba(255,255,255,0.15)]"
                      : "border-white/10 hover:border-white/25"
                  }`}
                  style={{ background: "rgba(255,255,255,0.04)" }}
                  data-testid={`template-ref-${t.id}`}
                >
                  <div className="relative h-28 bg-white/5 flex items-center justify-center">
                    {selected === i && (
                      <div className="absolute top-2 right-2 glass-button rounded-full p-1 bg-white/25">
                        <Check className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                      </div>
                    )}
                    <span className="text-white/20 text-xs uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
                      {t.category}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-white/90 text-xs font-medium" style={{ fontFamily: "var(--font-body)" }}>{t.title}</p>
                    <p className="text-white/40 text-[10px] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>{t.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-white/10">
          <button onClick={onClose} className="glass-button rounded-full px-5 py-2.5 text-sm uppercase tracking-wider" style={{ fontFamily: "var(--font-body)" }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected === null}
            className="glass-button rounded-full px-6 py-2.5 text-sm uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}
            data-testid="confirm-template-ref"
          >
            Use as Reference
          </button>
        </div>
      </div>
    </div>
  );
}
