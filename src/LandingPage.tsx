
import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  ChevronDown,
  Command,
  Compass,
  Layers3,
  Menu,
  Sparkles,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

import "./index.css";

const features = [
  {
    number: "01",
    icon: Sparkles,
    title: "Find your brand",
    description:
      "Discover memorable brand names, define your identity, and create a brand that stands out.",
    tag: "BRAND STUDIO",
  },
  {
    number: "02",
    icon: Compass,
    title: "Validate your idea",
    description:
      "Turn your early thoughts into a structured business concept with a clear direction.",
    tag: "IDEA EXPLORER",
  },
  {
    number: "03",
    icon: Layers3,
    title: "Build your business plan",
    description:
      "Generate a practical roadmap covering your audience, revenue model, MVP, and launch.",
    tag: "PLAN BUILDER",
  },
];

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <nav className="navbar">
        <a href="#home" className="brand" onClick={closeMenu}>
          <span className="brand-mark">
            <Command size={21} strokeWidth={2.3} />
          </span>
          <span>
            novyra<span className="brand-period">.</span>
          </span>
        </a>

        <button
          className="mobile-menu-button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          <a href="#features" onClick={closeMenu}>Platform</a>
          <a href="#process" onClick={closeMenu}>How it works</a>
          <a href="#about" onClick={closeMenu}>Our vision</a>
          <a href="#workspace" className="nav-cta" onClick={closeMenu}>
            Get started <ArrowUpRight size={16} />
          </a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-glow" />

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="announcement">
            <span className="announcement-dot" />
            YOUR IDEA DESERVES A REAL SHOT
            <ArrowUpRight size={13} />
          </div>

          <h1>
            From <span className="muted-word">just an idea</span>
            <br />
            to <span className="gradient-text">your next big thing.</span>
          </h1>

          <p className="hero-description">
            Meet your AI-powered startup co-pilot. Find your brand,
            shape your business plan, and take your first steps toward
            building something real.
          </p>

          <div className="hero-actions">
            <a href="#workspace" className="button-primary">
              Start building free <ArrowRight size={18} />
            </a>
            <a href="#features" className="button-secondary">
              Explore the platform <ChevronDown size={16} />
            </a>
          </div>

          <div className="hero-proof">
            <span className="proof-icon"><Check size={14} /></span>
            Built for first-time founders
            <span className="proof-divider" />
            <span className="proof-icon"><Check size={14} /></span>
            From idea to action
          </div>
        </motion.div>

        <motion.div
          className="preview-card"
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="preview-top">
            <div className="preview-title">
              <span className="preview-icon">
                <WandSparkles size={17} />
              </span>
              <div>
                <strong>Your startup canvas</strong>
                <span>YOUR NEXT CHAPTER STARTS HERE</span>
              </div>
            </div>
            <span className="live-indicator">AI READY</span>
          </div>

          <div className="preview-body">
            <div className="preview-label">LET'S BUILD SOMETHING</div>
            <h3>What's your big idea?</h3>
            <p>
              A little idea today could become something extraordinary
              tomorrow.
            </p>

            <div className="idea-example">
              <span className="idea-symbol"><Bot size={19} /></span>
              <div>
                <strong>AI for ambitious founders</strong>
                <span>Technology · Early stage</span>
              </div>
              <ArrowUpRight size={17} className="idea-arrow" />
            </div>

            <div className="preview-progress">
              <div className="progress-label">
                <span>YOUR STARTUP JOURNEY</span>
                <span>READY TO BEGIN</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" />
              </div>
            </div>

            <a href="#workspace" className="preview-action">
              Explore your possibilities <ArrowRight size={16} />
            </a>
          </div>

          <div className="preview-footer">
            <span><Zap size={13} /> Powered by AI</span>
            <span>YOUR IDEA. YOUR FUTURE.</span>
          </div>
        </motion.div>

        <div className="hero-bottom-note">
          <span className="note-line" />
          LESS GUESSWORK. MORE BUILDING.
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <span className="eyebrow">YOUR STARTUP TOOLKIT</span>
          <h2>Everything starts <span>somewhere.</span></h2>
          <p>
            You bring the ambition. Novyra helps you figure out what comes next.
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                className="feature-card"
                key={feature.number}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
              >
                <div className="feature-card-top">
                  <span className="feature-icon"><Icon size={21} /></span>
                  <span className="feature-number">{feature.number}</span>
                </div>
                <span className="feature-tag">{feature.tag}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <a href="#workspace" className="feature-link">
                  Explore feature <ArrowRight size={16} />
                </a>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="process-section" id="process">
        <div className="process-copy">
          <span className="eyebrow">A CLEARER WAY FORWARD</span>
          <h2>Big ambitions.<br /><span>Smarter first steps.</span></h2>
          <p>
            Starting a business can feel overwhelming. Break the journey
            into manageable steps, understand your options, and move forward
            with a plan.
          </p>
          <a href="#workspace" className="button-primary">
            Meet your co-pilot <ArrowRight size={18} />
          </a>
        </div>

        <div className="process-steps">
          {[
            ["01", "Share your idea", "Tell Novyra what you want to build."],
            ["02", "Shape your vision", "Explore branding and business planning."],
            ["03", "Plan your launch", "Turn generated insights into next steps."],
          ].map(([number, title, description]) => (
            <div className="process-step" key={number}>
              <span className="step-number">{number}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <ArrowUpRight size={18} className="step-arrow" />
            </div>
          ))}
        </div>
      </section>

      <section className="workspace-cta" id="workspace">
        <div className="cta-orb"><Sparkles size={28} /></div>
        <span className="eyebrow">YOUR NEXT CHAPTER</span>
        <h2>Your idea is worth exploring.</h2>
        <p>
          Let's start turning that idea into a real plan.
          Your startup journey begins with one step.
        </p>
        <button
          className="button-primary"
          onClick={() => window.location.href = "/register"}
        >
          Create your account <ArrowRight size={18} />
        </button>
        <span className="cta-note">YOUR AMBITION, WITH A LITTLE MORE CLARITY.</span>
      </section>

      <footer className="footer" id="about">
        <a href="#home" className="brand footer-brand">
          <span className="brand-mark"><Command size={19} /></span>
          <span>novyra<span className="brand-period">.</span></span>
        </a>
        <p>Built for the ones who dare to begin.</p>
        <span className="footer-copy">© {new Date().getFullYear()} Novyra</span>
      </footer>
    </main>
  );
}

export default LandingPage;