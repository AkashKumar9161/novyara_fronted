
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Compass,
  Lightbulb,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import {
  createStartupIdea,
  deleteStartupIdea,
  getStartupIdeas,
  updateStartupIdea,
  type StartupIdea,
} from "../lib/api";

import "./idea-explorer.css";

export default function IdeaExplorer() {
  const navigate = useNavigate();

  const [ideas, setIdeas] = useState<StartupIdea[]>([]);
  const [ideaText, setIdeaText] = useState("");
  const [industry, setIndustry] = useState("");
  const [searchText, setSearchText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const accessToken = sessionStorage.getItem("novyra_access");

  const loadIdeas = useCallback(async () => {
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getStartupIdeas(accessToken);
      setIdeas(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load your ideas.";

      if (
        message.toLowerCase().includes("token") ||
        message.toLowerCase().includes("authentication") ||
        message.toLowerCase().includes("credentials")
      ) {
        sessionStorage.removeItem("novyra_access");
        sessionStorage.removeItem("novyra_refresh");
        navigate("/login", { replace: true });
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    void loadIdeas();
  }, [loadIdeas]);

  const visibleIdeas = ideas.filter((item) => {
    const query = searchText.trim().toLowerCase();

    return (
      item.idea.toLowerCase().includes(query) ||
      item.industry.toLowerCase().includes(query)
    );
  });

  function resetForm() {
    setIdeaText("");
    setIndustry("");
    setEditingId(null);
    setError("");
    setNotice("");
  }

  function startEditing(item: StartupIdea) {
    setEditingId(item.id);
    setIdeaText(item.idea);
    setIndustry(item.industry);
    setError("");
    setNotice("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    const cleanIdea = ideaText.trim();
    const cleanIndustry = industry.trim();

    if (!cleanIdea) {
      setError("Please describe your startup idea.");
      return;
    }

    if (cleanIdea.length > 500) {
      setError("Your idea must be 500 characters or fewer.");
      return;
    }

    if (cleanIndustry.length > 100) {
      setError("Industry must be 100 characters or fewer.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const data = {
        idea: cleanIdea,
        industry: cleanIndustry,
      };

      if (editingId !== null) {
        const updated = await updateStartupIdea(
          editingId,
          data,
          accessToken,
        );

        setIdeas((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );

        setNotice("Your startup idea has been updated.");
      } else {
        const created = await createStartupIdea(data, accessToken);

        setIdeas((current) => [created, ...current]);
        setNotice("Your startup idea has been saved.");
      }

      setIdeaText("");
      setIndustry("");
      setEditingId(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save your idea. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: StartupIdea) {
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    const confirmed = window.confirm(
      `Delete this idea?\n\n"${item.idea}"\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(item.id);
    setError("");
    setNotice("");

    try {
      await deleteStartupIdea(item.id, accessToken);

      setIdeas((current) => current.filter((idea) => idea.id !== item.id));

      if (editingId === item.id) {
        resetForm();
      }

      setNotice("The idea has been deleted.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not delete the idea. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("novyra_access");
    sessionStorage.removeItem("novyra_refresh");
    navigate("/login", { replace: true });
  }

  return (
    <main className="idea-page">
      <div className="idea-orb idea-orb-one" aria-hidden="true" />
      <div className="idea-orb idea-orb-two" aria-hidden="true" />

      <header className="idea-topbar">
        <Link to="/dashboard" className="idea-brand" aria-label="Novyra dashboard">
          <span className="idea-brand-mark">
            <Sparkles size={19} />
          </span>
          <span>novyra<span className="idea-brand-dot">.</span></span>
        </Link>

        <nav className="idea-top-actions" aria-label="Main navigation">
          <Link to="/dashboard" className="idea-nav-link">
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <button type="button" className="idea-logout" onClick={handleLogout}>
            Sign out
          </button>
        </nav>
      </header>

      <div className="idea-shell">
        <section className="idea-intro">
          <div className="idea-eyebrow">
            <Compass size={15} />
            YOUR FOUNDER WORKSPACE
          </div>

          <h1>
            Every big thing
            <br />
            starts with an <span>idea.</span>
          </h1>

          <p>
            Capture the problem you want to solve, organize your startup ideas,
            and build your next move from a clear starting point.
          </p>

          <div className="idea-stats">
            <div className="idea-stat">
              <span className="idea-stat-number">{ideas.length}</span>
              <span className="idea-stat-label">Ideas saved</span>
            </div>
            <div className="idea-stat-divider" />
            <div className="idea-stat">
              <span className="idea-stat-number">{visibleIdeas.length}</span>
              <span className="idea-stat-label">Currently shown</span>
            </div>
          </div>
        </section>

        <section className="idea-workspace">
          <div className="idea-form-panel">
            <div className="idea-panel-heading">
              <div className="idea-heading-icon">
                {editingId !== null ? <Pencil size={19} /> : <Lightbulb size={20} />}
              </div>
              <div>
                <h2>{editingId !== null ? "Edit your idea" : "Capture an idea"}</h2>
                <p>
                  {editingId !== null
                    ? "Make changes to your saved idea."
                    : "Start with a problem worth solving."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="idea-form">
              <label htmlFor="startup-idea">Your startup idea</label>
              <textarea
                id="startup-idea"
                value={ideaText}
                onChange={(event) => setIdeaText(event.target.value)}
                placeholder="Example: A platform that helps small businesses manage customer support with AI..."
                maxLength={500}
                rows={5}
                required
              />
              <div className="idea-field-meta">
                <span>Explain the problem or solution in your own words.</span>
                <span>{ideaText.length}/500</span>
              </div>

              <label htmlFor="startup-industry">Industry <span>(optional)</span></label>
              <input
                id="startup-industry"
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                placeholder="e.g. SaaS, Education, Health, Fintech"
                maxLength={100}
              />

              {error && (
                <div className="idea-message idea-message-error" role="alert">
                  <X size={17} />
                  <span>{error}</span>
                </div>
              )}

              {notice && (
                <div className="idea-message idea-message-success" role="status">
                  <Check size={17} />
                  <span>{notice}</span>
                </div>
              )}

              <div className="idea-form-actions">
                <button type="submit" className="idea-primary-button" disabled={saving}>
                  {saving ? (
                    <LoaderCircle size={17} className="idea-spinner" />
                  ) : editingId !== null ? (
                    <Check size={17} />
                  ) : (
                    <Plus size={18} />
                  )}
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Save changes"
                      : "Save idea"}
                </button>

                {editingId !== null && (
                  <button
                    type="button"
                    className="idea-cancel-button"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="idea-list-panel">
            <div className="idea-list-heading">
              <div>
                <div className="idea-section-label">YOUR COLLECTION</div>
                <h2>Explore your ideas</h2>
              </div>
              <span className="idea-count-pill">{ideas.length}</span>
            </div>

            <div className="idea-search">
              <Search size={17} />
              <input
                type="search"
                aria-label="Search saved ideas"
                placeholder="Search ideas or industries..."
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
              {searchText && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchText("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {loading ? (
              <div className="idea-state">
                <LoaderCircle size={25} className="idea-spinner" />
                <p>Loading your ideas...</p>
              </div>
            ) : error && ideas.length === 0 ? (
              <div className="idea-state">
                <div className="idea-empty-icon"><Lightbulb size={23} /></div>
                <h3>We couldn't load your ideas</h3>
                <p>{error}</p>
                <button
                  type="button"
                  className="idea-secondary-button"
                  onClick={() => void loadIdeas()}
                >
                  Try again
                </button>
              </div>
            ) : visibleIdeas.length === 0 ? (
              <div className="idea-state">
                <div className="idea-empty-icon">
                  {searchText ? <Search size={23} /> : <Lightbulb size={23} />}
                </div>
                <h3>{searchText ? "No matching ideas" : "Your next big idea starts here"}</h3>
                <p>
                  {searchText
                    ? "Try another keyword or industry."
                    : "Add your first idea using the form. Your saved ideas will appear here."}
                </p>
              </div>
            ) : (
              <div className="idea-cards">
                {visibleIdeas.map((item, index) => (
                  <article className="idea-card" key={item.id}>
                    <div className="idea-card-top">
                      <span className="idea-card-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="idea-card-date">
                        {new Date(item.created_at).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3>{item.idea}</h3>

                    {item.industry ? (
                      <span className="idea-industry-tag">{item.industry}</span>
                    ) : (
                      <span className="idea-industry-muted">Industry not specified</span>
                    )}

                    <div className="idea-card-actions">
                      <button
                        type="button"
                        className="idea-edit-button"
                        onClick={() => startEditing(item)}
                        aria-label={`Edit idea: ${item.idea}`}
                      >
                        <Pencil size={15} />
                        Edit
                      </button>
                      <button
                        type="button"
                        className="idea-delete-button"
                        onClick={() => void handleDelete(item)}
                        disabled={deletingId === item.id}
                        aria-label={`Delete idea: ${item.idea}`}
                      >
                        {deletingId === item.id ? (
                          <LoaderCircle size={15} className="idea-spinner" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="idea-next-step">
          <div className="idea-next-icon"><Sparkles size={20} /></div>
          <div>
            <h3>Ready to turn an idea into a brand?</h3>
            <p>Explore names and taglines for your next venture in Brand Studio.</p>
          </div>
          <Link to="/brand-studio" className="idea-next-link">
            Open Brand Studio <ArrowUpRight size={17} />
          </Link>
        </section>

        <footer className="idea-footer">
          <span>© {new Date().getFullYear()} Novyra</span>
          <span>Build boldly. Start smart.</span>
        </footer>
      </div>
    </main>
  );
}
