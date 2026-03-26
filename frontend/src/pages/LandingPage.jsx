import { useNavigate } from "react-router-dom";
import { Instagram, Linkedin, Mail, ArrowDown, Sparkles } from "lucide-react";

const BG_IMAGE = "https://customer-assets.emergentagent.com/job_luxe-design-studio-2/artifacts/0opwejfb_image.png";
const LOGO_SVG = "https://customer-assets.emergentagent.com/job_luxe-design-studio-2/artifacts/jct1j2ir_msa_l_0000681.svg";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen text-white" data-testid="landing-page">
      {/* Fixed Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${BG_IMAGE})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black/35" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <div
              className="flex items-center justify-center gap-4 flex-wrap mb-8"
              data-testid="hero-headline"
            >
              <img
                src={LOGO_SVG}
                alt="Fairmont"
                className="h-14 sm:h-16 md:h-20 brightness-0 invert drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
                data-testid="fairmont-logo"
              />
              <span
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-wide"
                style={{ fontFamily: "var(--font-heading)", fontWeight: 400 }}
              >
                <span className="text-white/60 mx-2">x</span> LoversAI
              </span>
            </div>
          </div>

          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
            <p
              className="text-center text-white/70 text-base md:text-lg max-w-xl mx-auto mb-12 tracking-wide"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              Where luxury meets imagination. Design your dream wedding venue.
            </p>
          </div>

          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
            <button
              onClick={() => navigate("/studio")}
              className="glass-button rounded-full px-10 py-4 text-lg md:text-xl tracking-widest uppercase flex items-center gap-3"
              style={{ fontFamily: "var(--font-body)", fontWeight: 400 }}
              data-testid="design-vision-cta"
            >
              <Sparkles className="w-5 h-5" strokeWidth={1.5} />
              Design Your Vision
            </button>
          </div>

          <div className="opacity-0 animate-fade-in-up mt-20" style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}>
            <ArrowDown className="w-6 h-6 text-white/40 animate-bounce" strokeWidth={1} />
          </div>
        </section>

        {/* About Section */}
        <section className="px-6 py-24 flex items-center justify-center">
          <div
            className="glass-panel rounded-2xl max-w-4xl w-full p-8 md:p-12 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
            data-testid="about-section"
          >
            <h2
              className="text-3xl sm:text-4xl md:text-5xl mb-6 text-white"
              style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}
            >
              The Art of Event Design
            </h2>
            <p
              className="text-white/70 text-sm md:text-base leading-relaxed mb-6"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              LoversAI empowers wedding planners and couples to flawlessly design and visualize their
              perfect events. Our AI-powered platform transforms your creative vision into stunning,
              photorealistic venue designs — from traditional Haldi ceremonies to grand Reception halls.
            </p>
            <p
              className="text-white/70 text-sm md:text-base leading-relaxed mb-6"
              style={{ fontFamily: "var(--font-body)", fontWeight: 300 }}
            >
              In partnership with Fairmont Mumbai, we bring world-class hospitality aesthetics into
              the design process. Upload references, select your ceremony style, and let AI craft
              breathtaking moodboards for your most important celebrations.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              {["AI-Powered Design", "Moodboard Creation", "Export to PDF & PPT"].map((tag) => (
                <span
                  key={tag}
                  className="glass-pill rounded-full px-5 py-2 text-xs tracking-wider uppercase"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="glass-panel border-t border-white/10 border-l-0 border-r-0 border-b-0 rounded-none py-8 px-6"
          data-testid="footer"
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={LOGO_SVG} alt="Fairmont" className="h-8 brightness-0 invert opacity-60" />
              <span
                className="text-white/60 text-sm"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                x LoversAI
              </span>
            </div>

            <p
              className="text-white/40 text-xs tracking-wide"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Crafting dreams into reality, one venue at a time.
            </p>

            <div className="flex items-center gap-5">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors duration-300"
                data-testid="footer-linkedin"
              >
                <Linkedin className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/50 hover:text-white transition-colors duration-300"
                data-testid="footer-instagram"
              >
                <Instagram className="w-5 h-5" strokeWidth={1.5} />
              </a>
              <a
                href="mailto:hello@loversai.com"
                className="text-white/50 hover:text-white transition-colors duration-300"
                data-testid="footer-email"
              >
                <Mail className="w-5 h-5" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
