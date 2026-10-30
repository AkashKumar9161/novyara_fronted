
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Compass,
  Layers3,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  WandSparkles,
  Plus,
  Trash2,
  Link2,
} from "lucide-react";
import {
  getStartupIdeas,
  getSavedBrands,
  getSavedBusinessPlans,
  getStartupProjects,
  createStartupProject,
  updateStartupProject,
  deleteStartupProject,
  type StartupProject,
  type StartupStage,
  type StartupIdea,
  type SavedBrand,
  type BusinessPlan,
} from "../lib/api";
import "./my-startups.css";

type SectionStatus = "loading" | "success" | "error";

function formatDate(value?: string) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unable to load this section.";
}

export default function MyStartups() {
  const navigate = useNavigate();

  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [brands, setBrands] = useState<SavedBrand[]>([]);
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [projects, setProjects] = useState<StartupProject[]>([]);
  const [projectsStatus, setProjectsStatus] = useState<SectionStatus>("loading");
  const [projectsError, setProjectsError] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectIndustry, setProjectIndustry] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStage, setProjectStage] = useState<StartupStage>("idea");
  const [projectIdea, setProjectIdea] = useState("");
  const [projectBrand, setProjectBrand] = useState("");
  const [projectPlan, setProjectPlan] = useState("");
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectActionError, setProjectActionError] = useState("");

  const [ideasStatus, setIdeasStatus] = useState<SectionStatus>("loading");
  const [brandsStatus, setBrandsStatus] = useState<SectionStatus>("loading");
  const [plansStatus, setPlansStatus] = useState<SectionStatus>("loading");

  const [ideasError, setIdeasError] = useState("");
  const [brandsError, setBrandsError] = useState("");
  const [plansError, setPlansError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem("novyra_access");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    async function loadIdeas() {
      setIdeasStatus("loading");
      setIdeasError("");

      try {
        const data = await getStartupIdeas(token!);
        if (!cancelled) {
          setIdeas(data);
          setIdeasStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setIdeasError(getErrorMessage(error));
          setIdeasStatus("error");
        }
      }
    }

    async function loadBrands() {
      setBrandsStatus("loading");
      setBrandsError("");

      try {
        const data = await getSavedBrands(token!);
        if (!cancelled) {
          setBrands(data);
          setBrandsStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setBrandsError(getErrorMessage(error));
          setBrandsStatus("error");
        }
      }
    }

    async function loadPlans() {
      setPlansStatus("loading");
      setPlansError("");

      try {
        const data = await getSavedBusinessPlans(token!);
        if (!cancelled) {
          setPlans(data);
          setPlansStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setPlansError(getErrorMessage(error));
          setPlansStatus("error");
        }
      }
    }

    async function loadProjects() {
      setProjectsStatus("loading");
      setProjectsError("");
      try {
        const data = await getStartupProjects(token!);
        if (!cancelled) {
          setProjects(data);
          setProjectsStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setProjectsError(getErrorMessage(error));
          setProjectsStatus("error");
        }
      }
    }

    void Promise.all([loadIdeas(), loadBrands(), loadPlans(), loadProjects()]);

    return () => {
      cancelled = true;
    };
  }, [navigate, refreshKey]);

  const totalItems = ideas.length + brands.length + plans.length;
  const completedStages = [
    ideas.length > 0,
    brands.length > 0,
    plans.length > 0,
  ].filter(Boolean).length;

  const overallLoading = [
    ideasStatus,
    brandsStatus,
    plansStatus,
    projectsStatus,
  ].some((status) => status === "loading");

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = sessionStorage.getItem("novyra_access");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setProjectSaving(true);
    setProjectActionError("");
    try {
      await createStartupProject({
        name: projectName.trim(),
        industry: projectIndustry.trim(),
        description: projectDescription.trim(),
        stage: projectStage,
        idea: projectIdea ? Number(projectIdea) : null,
        brand: projectBrand ? Number(projectBrand) : null,
        business_plan: projectPlan ? Number(projectPlan) : null,
      }, token);
      setProjectName("");
      setProjectIndustry("");
      setProjectDescription("");
      setProjectStage("idea");
      setProjectIdea("");
      setProjectBrand("");
      setProjectPlan("");
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setProjectActionError(getErrorMessage(error));
    } finally {
      setProjectSaving(false);
    }
  }

  async function handleStageChange(project: StartupProject, stage: StartupStage) {
    const token = sessionStorage.getItem("novyra_access");
    if (!token) return navigate("/login", { replace: true });
    setProjectActionError("");
    try {
      const updated = await updateStartupProject(project.id, { stage }, token);
      setProjects((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error) {
      setProjectActionError(getErrorMessage(error));
    }
  }

  async function handleDeleteProject(project: StartupProject) {
    if (!window.confirm(`Delete "${project.name}"? This removes the project workspace, not its linked idea, brand, or plan.`)) return;
    const token = sessionStorage.getItem("novyra_access");
    if (!token) return navigate("/login", { replace: true });
    setProjectActionError("");
    try {
      await deleteStartupProject(project.id, token);
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (error) {
      setProjectActionError(getErrorMessage(error));
    }
  }

  return (
    <main className="my-startups-page">
      <header className="my-startups-topbar">
        <button
          className="my-startups-brand"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <span className="my-startups-brand-icon">
            <Sparkles size={19} />
          </span>
          <span>
            novyra<span className="my-startups-brand-dot">.</span>
          </span>
        </button>

        <nav className="my-startups-nav" aria-label="Workspace navigation">
          <button type="button" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <span className="my-startups-nav-current">My Startups</span>
        </nav>

        <button
          className="my-startups-refresh"
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={overallLoading}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </header>

      <div className="my-startups-content">
        <section className="my-startups-hero">
          <div className="my-startups-hero-copy">
            <span className="my-startups-eyebrow">
              <WandSparkles size={14} />
              YOUR PRIVATE WORKSPACE
            </span>

            <h1>
              My <span>Startups</span>
            </h1>

            <p>
              One place for your ideas, brand identities, and business plans.
              Keep building your next big thing.
            </p>

            <div className="my-startups-hero-actions">
              <button
                type="button"
                className="my-startups-primary"
                onClick={() => navigate("/idea-explorer")}
              >
                Explore ideas <ArrowRight size={16} />
              </button>

              <button
                type="button"
                className="my-startups-secondary"
                onClick={() => navigate("/business-plan")}
              >
                Build a plan
              </button>
            </div>
          </div>

          <div className="my-startups-hero-art" aria-hidden="true">
            <div className="my-startups-art-orbit orbit-a" />
            <div className="my-startups-art-orbit orbit-b" />
            <div className="my-startups-art-core">
              <Sparkles size={30} />
            </div>
            <span className="my-startups-art-star star-a">✦</span>
            <span className="my-startups-art-star star-b">✧</span>
          </div>
        </section>

        <section className="my-startups-section startup-projects-section">
          <div className="my-startups-section-heading">
            <div>
              <span className="my-startups-eyebrow">YOUR STARTUP COMMAND CENTER</span>
              <h2>Startup projects</h2>
              <p>Create a workspace and connect the ideas, brands, and plans you already saved.</p>
            </div>
            <span className="startup-project-count">{projects.length} project{projects.length === 1 ? "" : "s"}</span>
          </div>

          <form className="startup-project-form" onSubmit={handleCreateProject}>
            <div className="startup-project-form-heading">
              <span className="startup-project-form-icon"><Plus size={18} /></span>
              <div><strong>Create a startup workspace</strong><p>Linked items must belong to your account.</p></div>
            </div>
            <div className="startup-project-form-grid">
              <label>
                Project name *
                <input value={projectName} onChange={(event) => setProjectName(event.target.value)} maxLength={120} required placeholder="e.g. Novyra AI Launch" />
              </label>
              <label>
                Industry
                <input value={projectIndustry} onChange={(event) => setProjectIndustry(event.target.value)} maxLength={100} placeholder="e.g. SaaS, Education" />
              </label>
              <label>
                Current stage
                <select value={projectStage} onChange={(event) => setProjectStage(event.target.value as StartupStage)}>
                  <option value="idea">Idea</option><option value="branding">Branding</option><option value="planning">Planning</option><option value="building">Building</option><option value="launch">Launch</option><option value="live">Live</option>
                </select>
              </label>
              <label>
                Link saved idea
                <select value={projectIdea} onChange={(event) => setProjectIdea(event.target.value)}>
                  <option value="">No idea linked</option>
                  {ideas.map((idea) => <option key={idea.id} value={idea.id}>{idea.idea}</option>)}
                </select>
              </label>
              <label>
                Link saved brand
                <select value={projectBrand} onChange={(event) => setProjectBrand(event.target.value)}>
                  <option value="">No brand linked</option>
                  {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                </select>
              </label>
              <label>
                Link business plan
                <select value={projectPlan} onChange={(event) => setProjectPlan(event.target.value)}>
                  <option value="">No plan linked</option>
                  {plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.business_idea}</option>)}
                </select>
              </label>
              <label className="startup-project-description">
                Short description
                <textarea value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} rows={3} maxLength={2000} placeholder="What are you building, and what should happen next?" />
              </label>
            </div>
            {projectActionError && <p className="startup-project-error" role="alert">{projectActionError}</p>}
            <button className="my-startups-primary startup-project-submit" type="submit" disabled={projectSaving}>
              {projectSaving ? <LoaderCircle className="my-startups-spinner" size={16} /> : <Plus size={16} />}
              {projectSaving ? "Creating workspace..." : "Create startup project"}
            </button>
          </form>

          {projectsStatus === "loading" ? <LoadingMessage /> :
           projectsStatus === "error" ? <ErrorMessage message={projectsError} onRetry={() => setRefreshKey((key) => key + 1)} /> :
           projects.length === 0 ? (
             <EmptyState icon={<BriefcaseBusiness size={22} />} title="Your first startup workspace is waiting" description="Create a project above, then link your saved idea, brand, and business plan." action="Explore ideas" onClick={() => navigate("/idea-explorer")} />
           ) : (
             <div className="my-startups-card-grid startup-project-card-grid">
               {projects.map((project) => (
                 <article className="my-startups-item-card startup-project-card" key={project.id}>
                   <div className="my-startups-item-top">
                     <span className="my-startups-item-icon stat-purple"><BriefcaseBusiness size={19} /></span>
                     <span className="my-startups-item-type">STARTUP PROJECT</span>
                   </div>
                   <h3>{project.name}</h3>
                   <p>{project.description || project.industry || "Your startup workspace"}</p>
                   <div className="startup-project-stage-row">
                     <label htmlFor={`stage-${project.id}`}>Stage</label>
                     <select id={`stage-${project.id}`} value={project.stage} onChange={(event) => void handleStageChange(project, event.target.value as StartupStage)}>
                       <option value="idea">Idea</option><option value="branding">Branding</option><option value="planning">Planning</option><option value="building">Building</option><option value="launch">Launch</option><option value="live">Live</option>
                     </select>
                   </div>
                   <div className="startup-project-links">
                     <span><Link2 size={13} /> {project.idea_title || "No idea linked"}</span>
                     <span><Sparkles size={13} /> {project.brand_name || "No brand linked"}</span>
                     <span><BookOpen size={13} /> {project.business_plan_title || "No plan linked"}</span>
                   </div>
                   <div className="my-startups-item-footer">
                     <span><CalendarDays size={14} /> Updated {formatDate(project.updated_at)}</span>
                     <button type="button" className="startup-project-delete" onClick={() => void handleDeleteProject(project)}><Trash2 size={14} /> Delete</button>
                   </div>
                 </article>
               ))}
             </div>
           )}
        </section>

        <section className="my-startups-stats" aria-label="Workspace summary">
          <article className="my-startups-stat">
            <span className="my-startups-stat-icon stat-purple">
              <Compass size={19} />
            </span>
            <span className="my-startups-stat-label">Saved ideas</span>
            <strong>{ideasStatus === "success" ? ideas.length : "—"}</strong>
          </article>

          <article className="my-startups-stat">
            <span className="my-startups-stat-icon stat-blue">
              <Sparkles size={19} />
            </span>
            <span className="my-startups-stat-label">Saved brands</span>
            <strong>{brandsStatus === "success" ? brands.length : "—"}</strong>
          </article>

          <article className="my-startups-stat">
            <span className="my-startups-stat-icon stat-pink">
              <BookOpen size={19} />
            </span>
            <span className="my-startups-stat-label">Business plans</span>
            <strong>{plansStatus === "success" ? plans.length : "—"}</strong>
          </article>

          <article className="my-startups-stat my-startups-stat-progress">
            <span className="my-startups-stat-icon stat-green">
              <CheckCircle2 size={19} />
            </span>
            <span className="my-startups-stat-label">Tools explored</span>
            <strong>{completedStages}/3</strong>
          </article>
        </section>

        <section className="my-startups-section">
          <div className="my-startups-section-heading">
            <div>
              <span className="my-startups-eyebrow">YOUR WORK IN PROGRESS</span>
              <h2>Workspace overview</h2>
              <p>
                {overallLoading
                  ? "Loading your saved work..."
                  : `${totalItems} saved item${totalItems === 1 ? "" : "s"} across your workspace.`}
              </p>
            </div>

            {overallLoading && (
              <LoaderCircle className="my-startups-spinner" size={21} />
            )}
          </div>

          <div className="my-startups-stage-track">
            <div className={`my-startups-stage ${ideas.length ? "stage-done" : ""}`}>
              <span className="my-startups-stage-number">
                {ideas.length ? <CheckCircle2 size={16} /> : "01"}
              </span>
              <div>
                <strong>Idea</strong>
                <span>{ideas.length ? "Ideas saved" : "Capture your idea"}</span>
              </div>
            </div>

            <div className="my-startups-stage-line" />

            <div className={`my-startups-stage ${brands.length ? "stage-done" : ""}`}>
              <span className="my-startups-stage-number">
                {brands.length ? <CheckCircle2 size={16} /> : "02"}
              </span>
              <div>
                <strong>Branding</strong>
                <span>{brands.length ? "Brands saved" : "Shape your identity"}</span>
              </div>
            </div>

            <div className="my-startups-stage-line" />

            <div className={`my-startups-stage ${plans.length ? "stage-done" : ""}`}>
              <span className="my-startups-stage-number">
                {plans.length ? <CheckCircle2 size={16} /> : "03"}
              </span>
              <div>
                <strong>Business plan</strong>
                <span>{plans.length ? "Plans saved" : "Plan your next move"}</span>
              </div>
            </div>
          </div>
          <p className="my-startups-stage-note">
            Progress reflects saved work in each tool. Use Startup Projects above to connect your ideas, brands, and plans into a single workspace.
          </p>
        </section>

        <section className="my-startups-section">
          <div className="my-startups-section-heading">
            <div>
              <span className="my-startups-eyebrow">START WITH THE FOUNDATION</span>
              <h2>Startup ideas</h2>
              <p>Your saved ideas from Idea Explorer.</p>
            </div>
            <button
              className="my-startups-text-link"
              type="button"
              onClick={() => navigate("/idea-explorer")}
            >
              Open Idea Explorer <ArrowRight size={15} />
            </button>
          </div>

          {ideasStatus === "loading" ? (
            <LoadingMessage />
          ) : ideasStatus === "error" ? (
            <ErrorMessage message={ideasError} onRetry={() => setRefreshKey((key) => key + 1)} />
          ) : ideas.length === 0 ? (
            <EmptyState
              icon={<Compass size={22} />}
              title="Your next big idea starts here"
              description="Save an idea in Idea Explorer and it will appear here."
              action="Create an idea"
              onClick={() => navigate("/idea-explorer")}
            />
          ) : (
            <div className="my-startups-card-grid">
              {ideas.map((idea) => (
                <article className="my-startups-item-card" key={idea.id}>
                  <div className="my-startups-item-top">
                    <span className="my-startups-item-icon stat-purple">
                      <Compass size={19} />
                    </span>
                    <span className="my-startups-item-type">IDEA</span>
                  </div>
                  <h3>{idea.idea}</h3>
                  <p>{idea.industry || "Industry not specified"}</p>
                  <div className="my-startups-item-footer">
                    <span><CalendarDays size={14} /> {formatDate(idea.created_at)}</span>
                    <button type="button" onClick={() => navigate("/idea-explorer")}>
                      Open <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="my-startups-section">
          <div className="my-startups-section-heading">
            <div>
              <span className="my-startups-eyebrow">BUILD YOUR IDENTITY</span>
              <h2>Saved brands</h2>
              <p>Your brand names and identity notes from Brand Studio.</p>
            </div>
            <button
              className="my-startups-text-link"
              type="button"
              onClick={() => navigate("/brand-studio")}
            >
              Open Brand Studio <ArrowRight size={15} />
            </button>
          </div>

          {brandsStatus === "loading" ? (
            <LoadingMessage />
          ) : brandsStatus === "error" ? (
            <ErrorMessage message={brandsError} onRetry={() => setRefreshKey((key) => key + 1)} />
          ) : brands.length === 0 ? (
            <EmptyState
              icon={<Sparkles size={22} />}
              title="No saved brands yet"
              description="Generate and save a brand name to collect it here."
              action="Explore Brand Studio"
              onClick={() => navigate("/brand-studio")}
            />
          ) : (
            <div className="my-startups-card-grid">
              {brands.map((brand) => (
                <article className="my-startups-item-card" key={brand.id}>
                  <div className="my-startups-item-top">
                    <span className="my-startups-item-icon stat-blue">
                      <Sparkles size={19} />
                    </span>
                    <span className="my-startups-item-type">BRAND</span>
                  </div>
                  <h3>{brand.name}</h3>
                  <p>{brand.meaning || brand.tagline || "Saved brand identity"}</p>
                  <div className="my-startups-item-meta">
                    <span>{brand.industry || "Industry not specified"}</span>
                    {brand.tagline && <span>“{brand.tagline}”</span>}
                  </div>
                  <div className="my-startups-item-footer">
                    <span><CalendarDays size={14} /> {formatDate(brand.created_at)}</span>
                    <button type="button" onClick={() => navigate("/brand-studio")}>
                      Open <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="my-startups-section">
          <div className="my-startups-section-heading">
            <div>
              <span className="my-startups-eyebrow">TURN PLANS INTO ACTION</span>
              <h2>Business plans</h2>
              <p>Your saved plans from Business Plan Builder.</p>
            </div>
            <button
              className="my-startups-text-link"
              type="button"
              onClick={() => navigate("/business-plan")}
            >
              Open Plan Builder <ArrowRight size={15} />
            </button>
          </div>

          {plansStatus === "loading" ? (
            <LoadingMessage />
          ) : plansStatus === "error" ? (
            <ErrorMessage message={plansError} onRetry={() => setRefreshKey((key) => key + 1)} />
          ) : plans.length === 0 ? (
            <EmptyState
              icon={<BookOpen size={22} />}
              title="Your business plan belongs here"
              description="Generate and save a business plan to see it in this workspace."
              action="Build a business plan"
              onClick={() => navigate("/business-plan")}
            />
          ) : (
            <div className="my-startups-card-grid">
              {plans.map((plan) => (
                <article className="my-startups-item-card" key={plan.id}>
                  <div className="my-startups-item-top">
                    <span className="my-startups-item-icon stat-pink">
                      <BriefcaseBusiness size={19} />
                    </span>
                    <span className="my-startups-item-type">BUSINESS PLAN</span>
                  </div>
                  <h3>{plan.business_idea}</h3>
                  <p>{plan.industry || "Industry not specified"}</p>
                  <div className="my-startups-item-footer">
                    <span><CalendarDays size={14} /> {formatDate(plan.updated_at || plan.created_at)}</span>
                    <button type="button" onClick={() => navigate("/business-plan")}>
                      Open builder <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="my-startups-footer">
          <button type="button" onClick={() => navigate("/dashboard")}>
            <Layers3 size={15} /> Back to dashboard
          </button>
          <span>novyra<span className="my-startups-brand-dot">.</span> Build what comes next.</span>
        </footer>
      </div>
    </main>
  );
}

function LoadingMessage() {
  return (
    <div className="my-startups-message">
      <LoaderCircle className="my-startups-spinner" size={20} />
      <span>Loading saved items...</span>
    </div>
  );
}

function ErrorMessage({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="my-startups-message my-startups-error">
      <div>
        <strong>We couldn’t load this section.</strong>
        <p>{message}</p>
      </div>
      <button type="button" onClick={onRetry}>
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="my-startups-empty">
      <span className="my-startups-empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <button type="button" onClick={onClick}>
        {action} <ArrowRight size={15} />
      </button>
    </div>
  );
}
