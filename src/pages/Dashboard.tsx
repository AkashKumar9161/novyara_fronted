
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Compass,
  Layers3,
  LogOut,
  Menu,
  Palette,
  ShieldCheck,
  Sparkles,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";

import { getCurrentUser } from "../lib/api";
import "./dashboard.css";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

const tools = [
  {
    id: "brand-studio",
    number: "01",
    label: "BRAND STUDIO",
    title: "Find your brand",
    description:
      "Explore memorable startup names and start shaping your brand identity.",
    action: "Explore brand tools",
    icon: Sparkles,
    color: "purple",
  },
  {
    id: "idea-explorer",
    number: "02",
    label: "IDEA EXPLORER",
    title: "Shape your idea",
    description:
      "Organize your thoughts and develop a clearer direction for your startup.",
    action: "Explore your ideas",
    icon: Compass,
    color: "blue",
  },
  {
    id: "plan-builder",
    number: "03",
    label: "PLAN BUILDER",
    title: "Build your business plan",
    description:
      "Turn your vision into a structured plan for customers, revenue, and launch.",
    action: "Explore planning",
    icon: Layers3,
    color: "pink",
  },
  {
    id: "logo-studio",
    number: "04",
    label: "LOGO STUDIO",
    title: "Design your visual identity",
    description:
      "Create editable logo concepts, explore palettes, and export SVG or PNG assets.",
    action: "Open Logo Studio",
    icon: Palette,
    color: "purple",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const token = sessionStorage.getItem("novyra_access");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const profile = await getCurrentUser(token);

        if (!cancelled) {
          setUser(profile);
        }
      } catch {
        if (!cancelled) {
          sessionStorage.removeItem("novyra_access");
          sessionStorage.removeItem("novyra_refresh");

          navigate("/login", {
            replace: true,
            state: {
              message: "Please log in again to continue.",
            },
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function handleLogout() {
    sessionStorage.removeItem("novyra_access");
    sessionStorage.removeItem("novyra_refresh");
    navigate("/", { replace: true });
  }

  function scrollToTools() {
    setMobileMenuOpen(false);

    document.getElementById("toolkit")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  

function openTool(toolId: string) {
  setMobileMenuOpen(false);

  if (toolId === "brand-studio") {
    navigate("/brand-studio");
    return;
  }

  if (toolId === "idea-explorer") {
    navigate("/idea-explorer");
    return;
  }

  if (toolId === "plan-builder") {
    navigate("/business-plan");
    return;
  }

  if (toolId === "logo-studio") {
    navigate("/logo-studio");
    return;
  }

  document.getElementById(toolId)?.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}



  if (loading) {
    return (
      <main className="dashboard-loading">
        <div className="loading-mark">
          <Sparkles size={24} />
        </div>
        <h2>Preparing your workspace</h2>
        <p>Getting everything ready for your next big idea...</p>
        <div className="loading-track">
          <span />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="dashboard-loading">
        <Sparkles size={24} />
        <p>Redirecting to login...</p>
      </main>
    );
  }

  const displayName = user.first_name.trim() || user.username;
  const fullName =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    user.username;

  return (
    <main className="dashboard-page">
      <aside
        className={`dashboard-sidebar ${
          mobileMenuOpen ? "sidebar-open" : ""
        }`}
      >
        <Link
          to="/"
          className="dashboard-brand"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="dashboard-brand-icon">
            <Sparkles size={19} />
          </span>
          <span>
            novyra<span className="dashboard-brand-dot">.</span>
          </span>
        </Link>

        <div className="dashboard-workspace-label">
          <span className="workspace-label-dot" />
          YOUR WORKSPACE
        </div>

        <div className="dashboard-nav-label">OVERVIEW</div>

        <Link
          to="/dashboard"
          className="dashboard-nav-item active"
          onClick={() => setMobileMenuOpen(false)}
        >
          <Layers3 size={18} />
          <span>Dashboard</span>
          <span className="nav-active-indicator" />
        </Link>

        <Link
          to="/my-startups"
          className="dashboard-nav-item"
          onClick={() => setMobileMenuOpen(false)}
        >
          <BriefcaseBusiness size={18} />
          <span>My Startups</span>
        </Link>

        <button
          type="button"
          className="dashboard-nav-item"
          onClick={scrollToTools}
        >
          <Compass size={18} />
          <span>Startup ideas</span>
        </button>

        <button
          type="button"
          className="dashboard-nav-item"
          onClick={() => navigate("/brand-studio")}
        >
          <Bot size={18} />
          <span>AI tools</span>
        </button>

        <button
          type="button"
          className="dashboard-nav-item"
          onClick={() => navigate("/logo-studio")}
        >
          <Palette size={18} />
          <span>Logo Studio</span>
        </button>

        <div className="dashboard-sidebar-note">
          <div className="sidebar-note-icon">
            <WandSparkles size={17} />
          </div>
          <strong>Big idea?</strong>
          <p>Start small. Build something meaningful.</p>
          <button type="button" onClick={scrollToTools}>
            Get started <ArrowRight size={14} />
          </button>
        </div>

        <div className="dashboard-sidebar-bottom">
          <div className="dashboard-user-avatar">
            <UserRound size={19} />
          </div>

          <div className="dashboard-user-details">
            <strong>{user.username}</strong>
            <span>Novyra member</span>
          </div>

          <button
            type="button"
            className="dashboard-logout-icon"
            onClick={handleLogout}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          type="button"
          className="dashboard-mobile-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-breadcrumb">
            <button
              type="button"
              className="dashboard-mobile-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>Dashboard</strong>
          </div>

          <div className="dashboard-topbar-right">
            <span className="dashboard-secure-label">
              <ShieldCheck size={15} />
              Private workspace
            </span>
            <button
              type="button"
              className="dashboard-logout-button"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="dashboard-welcome">
            <div className="dashboard-welcome-copy">
              <span className="dashboard-eyebrow">
                <Sparkles size={14} />
                YOUR NEXT CHAPTER STARTS HERE
              </span>

              <h1>
                Welcome back, <span>{displayName}</span>
                <span className="dashboard-title-dot">.</span>
              </h1>

              <p>
                Every great company starts with an idea. Let’s figure out
                your next move.
              </p>
            </div>

            <div className="welcome-decoration" aria-hidden="true">
              <div className="welcome-decoration-ring ring-one" />
              <div className="welcome-decoration-ring ring-two" />
              <div className="welcome-decoration-core">
                <Sparkles size={28} />
              </div>
              <span className="decoration-star star-one">✦</span>
              <span className="decoration-star star-two">✧</span>
            </div>
          </section>

          <section className="dashboard-profile-card">
            <div className="dashboard-profile-icon">
              <UserRound size={24} />
            </div>

            <div className="dashboard-profile-copy">
              <span className="profile-overline">YOUR ACCOUNT</span>
              <h2>{fullName}</h2>
              <p>{user.email || "No email added"}</p>
            </div>

            <div className="dashboard-status">
              <CheckCircle2 size={15} />
              <span>Connected</span>
            </div>
          </section>

          <section className="dashboard-overview-strip">
            <div className="overview-strip-heading">
              <span className="dashboard-eyebrow">YOUR STARTUP JOURNEY</span>
              <p>A few simple steps can turn an idea into a direction.</p>
            </div>

            <div className="overview-strip-items">
              <div className="overview-strip-item">
                <span className="overview-item-icon purple">
                  <UserRound size={17} />
                </span>
                <div>
                  <strong>Account ready</strong>
                  <span>Your profile is connected</span>
                </div>
                <CheckCircle2 className="overview-check" size={17} />
              </div>

              <div className="overview-strip-item">
                <span className="overview-item-icon blue">
                  <Compass size={17} />
                </span>
                <div>
                  <strong>Choose your direction</strong>
                  <span>Start with any tool below</span>
                </div>
                <ArrowRight className="overview-next" size={17} />
              </div>
            </div>
          </section>

          <section className="dashboard-toolkit-section" id="toolkit">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-eyebrow">YOUR STARTUP TOOLKIT</span>
                <h2>What would you like to build?</h2>
                <p>
                  Choose a starting point. You can figure out the rest as you go.
                </p>
              </div>

              <span className="toolkit-count">04 TOOLS</span>
            </div>

            <div className="dashboard-tools-grid">
              {tools.map((tool) => {
                const Icon = tool.icon;

                return (
                  <article
                    className="dashboard-tool-card"
                    id={tool.id}
                    key={tool.id}
                  >
                    <div className="dashboard-tool-card-top">
                      <span className={`dashboard-tool-icon ${tool.color}`}>
                        <Icon size={22} />
                      </span>
                      <span className="dashboard-tool-number">
                        {tool.number}
                      </span>
                    </div>

                    <span className="dashboard-tool-label">{tool.label}</span>
                    <h3>{tool.title}</h3>
                    <p>{tool.description}</p>

                    <button
                      type="button"
                      className="dashboard-tool-link"
                      onClick={() => openTool(tool.id)}
                      aria-label={tool.action}
                    >
                      {tool.action}
                      <ArrowRight size={16} />
                    </button>
                  </article>
                );
              })}
            </div>

            <p className="dashboard-toolkit-note">
              <Sparkles size={14} />
              Capture startup ideas, organize them, and build your next move with Novyra.
            </p>
          </section>

          <footer className="dashboard-footer">
            <Link to="/" className="dashboard-footer-brand">
              novyra<span>.</span>
            </Link>
            <span>Built for the ones who dare to begin.</span>
            <span>Made for your next big idea.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
