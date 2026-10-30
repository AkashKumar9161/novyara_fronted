
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  FileText,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  deleteSavedBusinessPlan,
  generateBusinessPlan,
  getSavedBusinessPlans,
  getStartupIdeas,
  saveBusinessPlan,
  type BusinessPlan,
  type StartupIdea,
} from "../lib/api";

import "./business-plan-builder.css";

function readableTitle(value: string) {
  return value
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function PlanContent({
  value,
  depth = 0,
}: {
  value: unknown;
  depth?: number;
}) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "string" || typeof value === "number") {
    return <p className="plan-value">{String(value)}</p>;
  }

  if (typeof value === "boolean") {
    return <p className="plan-value">{value ? "Yes" : "No"}</p>;
  }

  if (Array.isArray(value)) {
    return (
      <ul className="plan-list">
        {value.map((item, index) => (
          <li key={index}>
            {typeof item === "object" && item !== null ? (
              <PlanContent value={item} depth={depth + 1} />
            ) : (
              String(item)
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, item]) =>
        item !== null &&
        item !== undefined &&
        item !== "" &&
        typeof item !== "function",
    );

    return (
      <div className={`plan-object ${depth > 0 ? "plan-object-nested" : ""}`}>
        {entries.map(([key, item]) => {
          const isNested =
            typeof item === "object" && item !== null;

          return (
            <section className="plan-section" key={key}>
              <h3>{readableTitle(key)}</h3>
              {isNested ? (
                <PlanContent value={item} depth={depth + 1} />
              ) : (
                <PlanContent value={item} depth={depth + 1} />
              )}
            </section>
          );
        })}
      </div>
    );
  }

  return null;
}

export default function BusinessPlanBuilder() {
  const navigate = useNavigate();

  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [savedPlans, setSavedPlans] = useState<BusinessPlan[]>([]);

  const [businessIdea, setBusinessIdea] = useState("");
  const [industry, setIndustry] = useState("Technology");
  const [targetAudience, setTargetAudience] = useState("");
  const [budget, setBudget] = useState("");

  const [generatedPlan, setGeneratedPlan] = useState<unknown>(null);
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);
  const [currentPlanName, setCurrentPlanName] = useState("");

  const [loadingPage, setLoadingPage] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const accessToken = sessionStorage.getItem("novyra_access");

  const loadWorkspace = useCallback(async () => {
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    setLoadingPage(true);

    try {
      const [ideaResults, planResults] = await Promise.all([
        getStartupIdeas(accessToken),
        getSavedBusinessPlans(accessToken),
      ]);

      setIdeas(ideaResults);
      setSavedPlans(planResults);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load your business planning workspace.",
      );
    } finally {
      setLoadingPage(false);
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  function chooseIdea(ideaId: string) {
    if (!ideaId) return;

    const idea = ideas.find((item) => String(item.id) === ideaId);

    if (!idea) return;

    setBusinessIdea(idea.idea);
    if (idea.industry) setIndustry(idea.industry);
    setGeneratedPlan(null);
    setCurrentPlanId(null);
    setCurrentPlanName("");
    setError("");
    setNotice("");
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    if (!businessIdea.trim()) {
      setError("Please enter your business idea first.");
      return;
    }

    setGenerating(true);
    setError("");
    setNotice("");
    setGeneratedPlan(null);
    setCurrentPlanId(null);
    setCurrentPlanName("");

    try {
      const response = await generateBusinessPlan(
        {
          business_idea: businessIdea.trim(),
          industry: industry.trim(),
          target_audience: targetAudience.trim(),
          budget: budget.trim(),
        },
        accessToken,
      );

      if (
        response.business_plan === null ||
        response.business_plan === undefined
      ) {
        throw new Error("The AI returned an empty plan. Please try again.");
      }

      setGeneratedPlan(response.business_plan);
      setNotice("Your business plan has been generated.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate the business plan.",
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!accessToken || generatedPlan === null) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const saved = await saveBusinessPlan(
        {
          business_idea: businessIdea.trim(),
          industry: industry.trim(),
          plan_data: generatedPlan,
        },
        accessToken,
      );

      setSavedPlans((previous) => [
        saved,
        ...previous.filter((item) => item.id !== saved.id),
      ]);

      setCurrentPlanId(saved.id);
      setCurrentPlanName(saved.business_idea);
      setNotice("Business plan saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save this business plan.",
      );
    } finally {
      setSaving(false);
    }
  }

  function openSavedPlan(plan: BusinessPlan) {
    setBusinessIdea(plan.business_idea);
    setIndustry(plan.industry || "Technology");
    setGeneratedPlan(plan.plan_data);
    setCurrentPlanId(plan.id);
    setCurrentPlanName(plan.business_idea);
    setError("");
    setNotice("Saved business plan opened.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(planId: number) {
    if (!accessToken) return;

    const confirmed = window.confirm(
      "Delete this saved business plan? This action cannot be undone.",
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      await deleteSavedBusinessPlan(planId, accessToken);

      setSavedPlans((previous) =>
        previous.filter((plan) => plan.id !== planId),
      );

      if (currentPlanId === planId) {
        setGeneratedPlan(null);
        setCurrentPlanId(null);
        setCurrentPlanName("");
      }

      setNotice("Saved business plan deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete this business plan.",
      );
    }
  }

  function startNewPlan() {
    setBusinessIdea("");
    setIndustry("Technology");
    setTargetAudience("");
    setBudget("");
    setGeneratedPlan(null);
    setCurrentPlanId(null);
    setCurrentPlanName("");
    setError("");
    setNotice("");
  }

  if (loadingPage) {
    return (
      <main className="plan-loading">
        <LoaderCircle size={28} className="plan-spinner" />
        <p>Preparing your planning workspace...</p>
      </main>
    );
  }

  return (
    <main className="plan-page">
      <header className="plan-topbar">
        <Link to="/dashboard" className="plan-brand">
          <span className="plan-brand-icon">
            <Sparkles size={19} />
          </span>
          <span>
            novyra<span className="plan-brand-dot">.</span>
          </span>
        </Link>

        <div className="plan-topbar-actions">
          <Link to="/idea-explorer" className="plan-back-link">
            <ArrowLeft size={16} />
            Idea Explorer
          </Link>
          <button
            type="button"
            className="plan-new-button"
            onClick={startNewPlan}
          >
            <Plus size={16} />
            New plan
          </button>
        </div>
      </header>

      <div className="plan-shell">
        <section className="plan-hero">
          <div className="plan-eyebrow">
            <Sparkles size={14} />
            AI-POWERED PLANNING
          </div>

          <h1>
            Turn your idea into
            <span> a business roadmap.</span>
          </h1>

          <p>
            Build a structured starting point for your business, from your
            target market to the steps that bring your idea to life.
          </p>

          <div className="plan-hero-meta">
            <span><Check size={14} /> Your idea, your direction</span>
            <span><Check size={14} /> Plans saved to your account</span>
          </div>
        </section>

        <div className="plan-workspace">
          <section className="plan-form-panel">
            <div className="plan-panel-heading">
              <span className="plan-panel-icon">
                <BookOpen size={20} />
              </span>
              <div>
                <h2>Define your business</h2>
                <p>Give the AI enough context to create a useful first draft.</p>
              </div>
            </div>

            {ideas.length > 0 && (
              <div className="plan-field">
                <label htmlFor="saved-idea">Start with a saved idea</label>
                <div className="plan-select-wrap">
                  <select
                    id="saved-idea"
                    defaultValue=""
                    onChange={(event) => chooseIdea(event.target.value)}
                  >
                    <option value="">Choose an idea (optional)</option>
                    {ideas.map((idea) => (
                      <option key={idea.id} value={idea.id}>
                        {idea.idea}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} />
                </div>
              </div>
            )}

            <form onSubmit={handleGenerate}>
              <div className="plan-field">
                <label htmlFor="business-idea">Business idea *</label>
                <textarea
                  id="business-idea"
                  value={businessIdea}
                  onChange={(event) => setBusinessIdea(event.target.value)}
                  placeholder="Example: An AI platform that helps small businesses manage customer support..."
                  maxLength={2000}
                  rows={5}
                  required
                />
                <span className="plan-character-count">
                  {businessIdea.length}/2000
                </span>
              </div>

              <div className="plan-field">
                <label htmlFor="business-industry">Industry *</label>
                <input
                  id="business-industry"
                  value={industry}
                  onChange={(event) => setIndustry(event.target.value)}
                  placeholder="e.g. Technology, Education, Healthcare"
                  maxLength={100}
                  required
                />
              </div>

              <div className="plan-field">
                <label htmlFor="target-audience">
                  Target audience
                  <span className="plan-optional">Optional</span>
                </label>
                <input
                  id="target-audience"
                  value={targetAudience}
                  onChange={(event) => setTargetAudience(event.target.value)}
                  placeholder="e.g. Small business owners in India"
                  maxLength={500}
                />
              </div>

              <div className="plan-field">
                <label htmlFor="business-budget">
                  Starting budget
                  <span className="plan-optional">Optional</span>
                </label>
                <input
                  id="business-budget"
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="e.g. ₹50,000 or a lean, bootstrapped budget"
                  maxLength={200}
                />
              </div>

              {error && (
                <div className="plan-message plan-error" role="alert">
                  {error}
                </div>
              )}

              {notice && (
                <div className="plan-message plan-success" role="status">
                  <Check size={16} />
                  {notice}
                </div>
              )}

              <button
                type="submit"
                className="plan-generate-button"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <LoaderCircle size={18} className="plan-spinner" />
                    Building your plan...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate business plan
                  </>
                )}
              </button>

              <p className="plan-form-footnote">
                AI-generated plans are starting points. Validate assumptions
                and research your market before investing money.
              </p>
            </form>
          </section>

          <section className="plan-result-panel">
            <div className="plan-result-header">
              <div>
                <span className="plan-section-label">YOUR ROADMAP</span>
                <h2>
                  {generatedPlan !== null
                    ? currentPlanName || "Your business plan"
                    : "Your plan will appear here"}
                </h2>
              </div>

              {generatedPlan !== null && (
                <button
                  type="button"
                  className="plan-save-button"
                  onClick={handleSave}
                  disabled={saving || currentPlanId !== null}
                >
                  {saving ? (
                    <LoaderCircle size={16} className="plan-spinner" />
                  ) : currentPlanId !== null ? (
                    <Check size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving
                    ? "Saving..."
                    : currentPlanId !== null
                      ? "Saved"
                      : "Save plan"}
                </button>
              )}
            </div>

            {generatedPlan === null ? (
              <div className="plan-empty-state">
                <div className="plan-empty-art">
                  <FileText size={35} />
                  <Sparkles size={18} />
                </div>
                <h3>Your next move starts here.</h3>
                <p>
                  Complete the form and generate a plan. Your results will
                  appear in this space.
                </p>
                <div className="plan-empty-steps">
                  <span><Check size={14} /> Business overview</span>
                  <span><Check size={14} /> Market and customer direction</span>
                  <span><Check size={14} /> Revenue and launch strategy</span>
                </div>
              </div>
            ) : (
              <div className="plan-generated-content">
                <div className="plan-generated-meta">
                  <span>{industry || "Business"}</span>
                  {budget && <span>Budget: {budget}</span>}
                </div>

                <PlanContent value={generatedPlan} />

                <button
                  type="button"
                  className="plan-regenerate-button"
                  onClick={() => {
                    setGeneratedPlan(null);
                    setCurrentPlanId(null);
                    setCurrentPlanName("");
                    setNotice("");
                  }}
                >
                  <RefreshCw size={15} />
                  Create another version
                </button>
              </div>
            )}
          </section>
        </div>

        <section className="plan-saved-section">
          <div className="plan-saved-heading">
            <div>
              <span className="plan-section-label">YOUR COLLECTION</span>
              <h2>Saved business plans</h2>
              <p>Pick up where you left off.</p>
            </div>
            <span className="plan-saved-count">{savedPlans.length} saved</span>
          </div>

          {savedPlans.length === 0 ? (
            <div className="plan-saved-empty">
              <BookOpen size={22} />
              <p>Your saved plans will appear here.</p>
            </div>
          ) : (
            <div className="plan-saved-grid">
              {savedPlans.map((plan) => (
                <article className="plan-saved-card" key={plan.id}>
                  <div className="plan-saved-card-icon">
                    <FileText size={19} />
                  </div>
                  <div className="plan-saved-card-content">
                    <h3>{plan.business_idea}</h3>
                    <p>{plan.industry || "General business"}</p>
                    {plan.created_at && (
                      <span>
                        {new Date(plan.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="plan-saved-card-actions">
                    <button
                      type="button"
                      onClick={() => openSavedPlan(plan)}
                      aria-label={`Open plan: ${plan.business_idea}`}
                      title="Open plan"
                    >
                      <BookOpen size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(plan.id)}
                      aria-label={`Delete plan: ${plan.business_idea}`}
                      title="Delete plan"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <footer className="plan-footer">
          <Link to="/dashboard">novyra<span>.</span></Link>
          <span>Build something meaningful.</span>
        </footer>
      </div>
    </main>
  );
}
