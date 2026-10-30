
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";

import {
  deleteSavedBrand,
  generateBrandNames,
  getSavedBrands,
  saveBrand,
  type BrandNameRequest,
  type GeneratedBrand,
  type SavedBrand,
} from "../lib/api";

import "./brand-studio.css";

const STYLE_OPTIONS: {
  value: BrandNameRequest["style"];
  label: string;
  description: string;
}[] = [
  {
    value: "modern",
    label: "Modern",
    description: "Fresh, memorable, and contemporary",
  },
  {
    value: "premium",
    label: "Premium",
    description: "Elegant and high-end",
  },
  {
    value: "creative",
    label: "Creative",
    description: "Distinctive and imaginative",
  },
  {
    value: "minimal",
    label: "Minimal",
    description: "Short, clean, and simple",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Credible and business-focused",
  },
];

export default function BrandStudio() {
  const navigate = useNavigate();

  const [businessIdea, setBusinessIdea] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle] =
    useState<BrandNameRequest["style"]>("modern");

  const [generatedBrands, setGeneratedBrands] = useState<GeneratedBrand[]>(
    [],
  );
  const [savedBrands, setSavedBrands] = useState<SavedBrand[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(true);
  const [savingName, setSavingName] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const accessToken = sessionStorage.getItem("novyra_access");

  const savedNames = useMemo(
    () => new Set(savedBrands.map((brand) => brand.name.toLowerCase())),
    [savedBrands],
  );

  const loadSavedBrands = useCallback(async () => {
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    setIsLoadingSaved(true);

    try {
      const brands = await getSavedBrands(accessToken);
      setSavedBrands(brands);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load saved brands.";
      setError(message);
    } finally {
      setIsLoadingSaved(false);
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    void loadSavedBrands();
  }, [accessToken, loadSavedBrands, navigate]);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    const cleanIdea = businessIdea.trim();
    const cleanIndustry = industry.trim();

    if (!cleanIdea || !cleanIndustry) {
      setError("Please enter both your business idea and industry.");
      return;
    }

    setError("");
    setNotice("");
    setIsGenerating(true);
    setGeneratedBrands([]);

    try {
      const result = await generateBrandNames(
        {
          business_idea: cleanIdea,
          industry: cleanIndustry,
          style,
        },
        accessToken,
      );

      setGeneratedBrands(result.brand_names);
      setNotice(
        `Generated ${result.brand_names.length} brand name ideas for your business.`,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Brand generation failed. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave(brand: GeneratedBrand) {
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    if (savedNames.has(brand.name.toLowerCase())) {
      setNotice(`${brand.name} is already in your saved brands.`);
      return;
    }

    setError("");
    setNotice("");
    setSavingName(brand.name);

    try {
      const saved = await saveBrand(
        {
          name: brand.name,
          meaning: brand.meaning,
          tagline: brand.tagline,
          industry: industry.trim(),
        },
        accessToken,
      );

      setSavedBrands((current) => {
        if (current.some((item) => item.id === saved.id)) {
          return current;
        }
        return [saved, ...current];
      });

      setNotice(`${brand.name} has been saved to your brand collection.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save this brand.",
      );
    } finally {
      setSavingName(null);
    }
  }

  async function handleDelete(brand: SavedBrand) {
    if (!accessToken) {
      navigate("/login", { replace: true });
      return;
    }

    setError("");
    setNotice("");
    setDeletingId(brand.id);

    try {
      await deleteSavedBrand(brand.id, accessToken);
      setSavedBrands((current) =>
        current.filter((item) => item.id !== brand.id),
      );
      setNotice(`${brand.name} has been removed from your saved brands.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete this brand.",
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
    <main className="brand-studio-page">
      <header className="brand-studio-topbar">
        <button
          className="bs-back-button"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} />
          <span>Dashboard</span>
        </button>

        <button
          className="bs-brand-mark"
          type="button"
          onClick={() => navigate("/")}
          aria-label="Novyra home"
        >
          <span className="bs-brand-symbol">
            <Sparkles size={19} />
          </span>
          <span>novyra</span>
        </button>

        <button
          className="bs-logout-button"
          type="button"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </header>

      <div className="bs-main">
        <section className="bs-hero">
          <div className="bs-eyebrow">
            <WandSparkles size={14} />
            <span>AI-POWERED BRAND CREATION</span>
          </div>

          <h1>
            Give your idea
            <br />
            <span>a name worth remembering.</span>
          </h1>

          <p>
            Turn your business idea into a brand identity starting point.
            Explore names, understand their meaning, and find a tagline that
            fits your vision.
          </p>
        </section>

        <section className="bs-workspace">
          <div className="bs-form-panel">
            <div className="bs-panel-heading">
              <div className="bs-heading-icon">
                <Sparkles size={19} />
              </div>
              <div>
                <h2>Tell us about your idea</h2>
                <p>A few details help shape your brand direction.</p>
              </div>
            </div>

            <form className="bs-form" onSubmit={handleGenerate}>
              <label htmlFor="business-idea">Your business idea</label>
              <textarea
                id="business-idea"
                value={businessIdea}
                onChange={(event) => setBusinessIdea(event.target.value)}
                placeholder="Example: An app that helps people discover healthy meals and local home chefs..."
                maxLength={500}
                rows={4}
                required
              />
              <div className="bs-field-meta">
                <span>Describe what your business does.</span>
                <span>{businessIdea.length}/500</span>
              </div>

              <label htmlFor="industry">Industry</label>
              <input
                id="industry"
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                placeholder="Example: Food technology"
                maxLength={100}
                required
              />

              <div className="bs-style-label">
                <label htmlFor="brand-style">Brand personality</label>
                <span>Choose one style</span>
              </div>

              <div className="bs-style-options">
                {STYLE_OPTIONS.map((option) => (
                  <button
                    className={`bs-style-option ${
                      style === option.value ? "is-selected" : ""
                    }`}
                    key={option.value}
                    type="button"
                    onClick={() => setStyle(option.value)}
                    aria-pressed={style === option.value}
                  >
                    <span className="bs-style-check">
                      {style === option.value && <Check size={12} />}
                    </span>
                    <span className="bs-style-copy">
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                  </button>
                ))}
              </div>

              {error && (
                <div className="bs-message bs-error" role="alert">
                  {error}
                </div>
              )}

              {notice && (
                <div className="bs-message bs-success" role="status">
                  {notice}
                </div>
              )}

              <button
                className="bs-generate-button"
                type="submit"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <LoaderCircle className="bs-spin" size={18} />
                    Generating brand names...
                  </>
                ) : (
                  <>
                    <WandSparkles size={18} />
                    Generate brand names
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <p className="bs-form-footnote">
                <Sparkles size={13} />
                Powered by your Novyra AI branding service
              </p>
            </form>
          </div>

          <div className="bs-results-panel">
            <div className="bs-results-heading">
              <div>
                <span className="bs-section-kicker">YOUR CREATIVE SPACE</span>
                <h2>Brand name ideas</h2>
                <p>
                  {generatedBrands.length
                    ? `${generatedBrands.length} ideas generated for you`
                    : "Your next brand could start here."}
                </p>
              </div>

              {generatedBrands.length > 0 && (
                <button
                  className="bs-regenerate-button"
                  type="button"
                  onClick={() => {
                    const form = document.querySelector<HTMLFormElement>(
                      ".bs-form",
                    );
                    form?.requestSubmit();
                  }}
                  disabled={isGenerating}
                  aria-label="Generate another set of brand names"
                  title="Generate another set"
                >
                  <RefreshCw size={16} />
                </button>
              )}
            </div>

            {isGenerating ? (
              <div className="bs-empty-state bs-loading-state">
                <span className="bs-loading-orb">
                  <Sparkles size={24} />
                </span>
                <h3>Exploring possibilities</h3>
                <p>
                  Your AI branding service is working on names and taglines.
                </p>
                <div className="bs-loading-line">
                  <span />
                </div>
              </div>
            ) : generatedBrands.length > 0 ? (
              <div className="bs-generated-grid">
                {generatedBrands.map((brand, index) => {
                  const isSaved = savedNames.has(brand.name.toLowerCase());
                  const isSaving = savingName === brand.name;

                  return (
                    <article className="bs-brand-card" key={`${brand.name}-${index}`}>
                      <div className="bs-card-topline">
                        <span className="bs-card-index">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <button
                          className={`bs-save-button ${
                            isSaved ? "is-saved" : ""
                          }`}
                          type="button"
                          onClick={() => void handleSave(brand)}
                          disabled={isSaved || isSaving}
                          aria-label={
                            isSaved
                              ? `${brand.name} already saved`
                              : `Save ${brand.name}`
                          }
                        >
                          {isSaving ? (
                            <LoaderCircle className="bs-spin" size={16} />
                          ) : isSaved ? (
                            <Check size={16} />
                          ) : (
                            <Bookmark size={16} />
                          )}
                          <span>
                            {isSaving ? "Saving" : isSaved ? "Saved" : "Save"}
                          </span>
                        </button>
                      </div>

                      <h3>{brand.name}</h3>
                      <p className="bs-brand-meaning">{brand.meaning}</p>

                      <div className="bs-tagline">
                        <span>TAGLINE</span>
                        <p>“{brand.tagline}”</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="bs-empty-state">
                <div className="bs-empty-art">
                  <div className="bs-art-ring bs-art-ring-one" />
                  <div className="bs-art-ring bs-art-ring-two" />
                  <span>
                    <WandSparkles size={28} />
                  </span>
                </div>
                <h3>Make room for a great idea.</h3>
                <p>
                  Fill in your business details and generate a collection of
                  brand names, meanings, and taglines.
                </p>
                <div className="bs-empty-chips">
                  <span>Memorable names</span>
                  <span>Brand meanings</span>
                  <span>Taglines</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="bs-saved-section">
          <div className="bs-saved-heading">
            <div>
              <span className="bs-section-kicker">YOUR COLLECTION</span>
              <h2>Saved brands</h2>
              <p>Keep your favorite ideas together as your startup evolves.</p>
            </div>
            <span className="bs-saved-count">{savedBrands.length} saved</span>
          </div>

          {isLoadingSaved ? (
            <div className="bs-saved-loading">
              <LoaderCircle className="bs-spin" size={20} />
              <span>Loading your saved brands...</span>
            </div>
          ) : savedBrands.length > 0 ? (
            <div className="bs-saved-grid">
              {savedBrands.map((brand) => (
                <article className="bs-saved-card" key={brand.id}>
                  <div className="bs-saved-card-icon">
                    <Bookmark size={17} />
                  </div>

                  <div className="bs-saved-card-content">
                    <h3>{brand.name}</h3>
                    <span className="bs-industry-tag">{brand.industry}</span>
                    <p>{brand.meaning}</p>
                    <div className="bs-saved-tagline">{brand.tagline}</div>
                  </div>

                  <button
                    className="bs-delete-button"
                    type="button"
                    onClick={() => void handleDelete(brand)}
                    disabled={deletingId === brand.id}
                    aria-label={`Delete ${brand.name}`}
                    title="Delete saved brand"
                  >
                    {deletingId === brand.id ? (
                      <LoaderCircle className="bs-spin" size={17} />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="bs-saved-empty">
              <Bookmark size={20} />
              <div>
                <strong>No saved brands yet</strong>
                <p>
                  When you find a name you like, select Save to add it here.
                </p>
              </div>
            </div>
          )}
        </section>

        <footer className="bs-footer">
          <span>novyra</span>
          <span>Build something meaningful.</span>
        </footer>
      </div>
    </main>
  );
}
