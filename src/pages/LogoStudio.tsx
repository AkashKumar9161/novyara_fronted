import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowLeft,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  Eye,
  Languages,
  Layers3,
  LoaderCircle,
  Palette,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import {
  deleteLogoDesign,
  getLogoDesigns,
  saveLogoDesign,
  updateLogoDesign,
  type LogoDesign,
  type LogoDesignInput,
  type LogoConcept,
  generateLogoConcepts,
} from "../lib/api";
import "./logo-studio.css";

type Style = LogoDesignInput["style"];
type SymbolType = LogoDesignInput["symbol"];
type Palette = LogoDesignInput["palette"];

const palettes: Record<Palette, { label: string; primary: string; secondary: string; accent: string; ink: string }> = {
  violet: { label: "Nova Violet", primary: "#9B8CFF", secondary: "#6D5CE8", accent: "#D9D4FF", ink: "#17142D" },
  ocean: { label: "Ocean Blue", primary: "#60D9F4", secondary: "#3287E8", accent: "#C1F5FF", ink: "#102331" },
  ember: { label: "Ember", primary: "#FFAD73", secondary: "#F06449", accent: "#FFE1C9", ink: "#2D1715" },
  forest: { label: "Forest", primary: "#76E0B0", secondary: "#2A9D78", accent: "#C8F5DD", ink: "#10251E" },
  mono: { label: "Monochrome", primary: "#F6F6FA", secondary: "#A7A7B7", accent: "#FFFFFF", ink: "#16161D" },
  gold: { label: "Black & Gold", primary: "#E9C46A", secondary: "#A87924", accent: "#FFF0B3", ink: "#17130A" },
  rose: { label: "Rose Quartz", primary: "#F2A7C3", secondary: "#B95D85", accent: "#FFE0EC", ink: "#321725" },
  sunset: { label: "Sunset", primary: "#FF8B65", secondary: "#A94DCA", accent: "#FFD77D", ink: "#351A35" },
  midnight: { label: "Midnight Neon", primary: "#55F2E5", secondary: "#7865FF", accent: "#FF67D4", ink: "#10162C" },
  earth: { label: "Earth Tones", primary: "#C49A6C", secondary: "#657153", accent: "#E8D8B8", ink: "#2C241A" },
  citrus: { label: "Citrus Pop", primary: "#D5F04D", secondary: "#F28A34", accent: "#FFF5A8", ink: "#242B14" },
};

const symbols: { value: SymbolType; label: string; description: string }[] = [
  { value: "monogram", label: "Monogram", description: "A bold first-letter mark" },
  { value: "orbit", label: "Orbit", description: "Momentum and connection" },
  { value: "bloom", label: "Bloom", description: "Growth and possibility" },
  { value: "mountain", label: "Mountain", description: "Ambition and progress" },
  { value: "spark", label: "Spark", description: "Ideas and invention" },
  { value: "leaf", label: "Leaf", description: "Nature and balance" },
  { value: "lion", label: "Lion", description: "Confidence and leadership" },
  { value: "shield", label: "Shield", description: "Trust and protection" },
  { value: "wave", label: "Wave", description: "Flow and movement" },
  { value: "flame", label: "Flame", description: "Energy and ambition" },
  { value: "hexagon", label: "Hexagon", description: "Structure and technology" },
  { value: "globe", label: "Globe", description: "Global connection" },
  { value: "cube", label: "Cube", description: "Systems and precision" },
  { value: "crown", label: "Crown", description: "Premium and authority" },
  { value: "bolt", label: "Bolt", description: "Speed and action" },
  { value: "flower", label: "Flower", description: "Warmth and creativity" },
];

const styles: { value: Style; label: string }[] = [
  { value: "modern", label: "Modern" },
  { value: "minimal", label: "Minimal" },
  { value: "premium", label: "Premium" },
  { value: "creative", label: "Creative" },
  { value: "professional", label: "Professional" },
  { value: "geometric", label: "Geometric" },
  { value: "elegant", label: "Elegant" },
  { value: "futuristic", label: "Futuristic" },
  { value: "playful", label: "Playful" },
  { value: "organic", label: "Organic" },
  { value: "vintage", label: "Vintage" },
];

const symbolGlyphs: Record<SymbolType, string> = {
  monogram: "Aa", orbit: "◎", bloom: "✿", mountain: "⌃", spark: "✦", leaf: "❧",
  lion: "♌", shield: "⬟", wave: "≋", flame: "♨", hexagon: "⬡", globe: "◎",
  cube: "◇", crown: "♛", bolt: "ϟ", flower: "✿",
};

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => {
    const entities: Record<string, string> = {
      "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;",
    };
    return entities[character];
  });
}

function symbolMarkup(symbol: SymbolType, initial: string, colors: (typeof palettes)[Palette]) {
  const common = `fill="none" stroke="url(#logoGradient)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
  if (symbol === "monogram") {
    return `<text x="96" y="112" text-anchor="middle" dominant-baseline="middle" font-family="Inter, Noto Sans, Noto Sans Devanagari, Arial, sans-serif" font-size="64" font-weight="800" fill="url(#logoGradient)">${escapeXml(initial)}</text>`;
  }
  if (symbol === "orbit") {
    return `<circle cx="96" cy="94" r="31" ${common}/><ellipse cx="96" cy="94" rx="47" ry="18" transform="rotate(-35 96 94)" ${common}/><circle cx="129" cy="64" r="7" fill="${colors.accent}"/>`;
  }
  if (symbol === "bloom") {
    return `<g fill="url(#logoGradient)"><ellipse cx="96" cy="68" rx="14" ry="27"/><ellipse cx="96" cy="120" rx="14" ry="27"/><ellipse cx="70" cy="94" rx="27" ry="14"/><ellipse cx="122" cy="94" rx="27" ry="14"/><ellipse cx="78" cy="76" rx="13" ry="25" transform="rotate(-45 78 76)"/><ellipse cx="114" cy="112" rx="13" ry="25" transform="rotate(-45 114 112)"/><circle cx="96" cy="94" r="9" fill="${colors.ink}"/></g>`;
  }
  if (symbol === "mountain") {
    return `<path d="M45 123 L78 68 L96 92 L111 77 L147 123 Z" ${common}/><path d="M68 123 L92 94 L110 123" stroke="${colors.accent}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (symbol === "spark") {
    return `<path d="M96 43 L108 81 L146 94 L108 106 L96 145 L84 106 L46 94 L84 81 Z" fill="url(#logoGradient)"/><circle cx="139" cy="55" r="6" fill="${colors.accent}"/><circle cx="51" cy="130" r="4" fill="${colors.primary}"/>`;
  }
  if (symbol === "lion") {
    return `<path d="M96 45 L111 54 L130 52 L138 72 L151 87 L141 106 L137 127 L115 133 L96 147 L77 133 L55 127 L51 106 L41 87 L54 72 L62 52 L81 54 Z" fill="url(#logoGradient)"/><path d="M76 82 L86 91 M116 82 L106 91 M82 111 Q96 121 110 111" stroke="${colors.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  }
  if (symbol === "shield") return `<path d="M96 43 L143 61 L137 103 Q127 129 96 145 Q65 129 55 103 L49 61 Z" fill="url(#logoGradient)"/><path d="M76 94 L90 108 L118 78" stroke="${colors.ink}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (symbol === "wave") return `<path d="M43 80 Q62 59 81 80 T119 80 T157 80" ${common}/><path d="M43 101 Q62 80 81 101 T119 101 T157 101" stroke="${colors.accent}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M43 122 Q62 101 81 122 T119 122 T157 122" stroke="url(#logoGradient)" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  if (symbol === "flame") return `<path d="M101 42 C108 67 140 75 137 107 C134 133 113 147 91 143 C63 138 51 114 65 91 C72 80 81 72 81 59 C96 69 101 80 100 91 C117 78 114 59 101 42 Z" fill="url(#logoGradient)"/><path d="M96 99 C109 111 104 129 91 132 C79 128 78 115 87 106" fill="${colors.accent}"/>`;
  if (symbol === "hexagon") return `<path d="M96 43 L139 68 L139 118 L96 143 L53 118 L53 68 Z" ${common}/><path d="M96 67 L119 80 L119 106 L96 119 L73 106 L73 80 Z" fill="url(#logoGradient)"/>`;
  if (symbol === "globe") return `<circle cx="96" cy="94" r="48" ${common}/><ellipse cx="96" cy="94" rx="21" ry="48" stroke="url(#logoGradient)" stroke-width="4" fill="none"/><path d="M50 94 H142 M61 70 Q96 84 131 70 M61 118 Q96 104 131 118" stroke="${colors.secondary}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  if (symbol === "cube") return `<path d="M96 43 L140 68 L140 119 L96 144 L52 119 L52 68 Z" fill="url(#logoGradient)"/><path d="M52 68 L96 94 L140 68 M96 94 V144" stroke="${colors.ink}" stroke-width="4" fill="none" stroke-linejoin="round"/>`;
  if (symbol === "crown") return `<path d="M48 65 L76 87 L96 51 L116 87 L144 65 L134 124 L58 124 Z" fill="url(#logoGradient)"/><path d="M62 136 H130" stroke="${colors.secondary}" stroke-width="7" stroke-linecap="round"/><circle cx="48" cy="61" r="6" fill="${colors.accent}"/><circle cx="96" cy="47" r="6" fill="${colors.accent}"/><circle cx="144" cy="61" r="6" fill="${colors.accent}"/>`;
  if (symbol === "bolt") return `<path d="M105 42 L60 99 H91 L80 145 L132 82 H101 Z" fill="url(#logoGradient)"/>`;
  if (symbol === "flower") return `<g fill="url(#logoGradient)"><ellipse cx="96" cy="67" rx="13" ry="26"/><ellipse cx="96" cy="121" rx="13" ry="26"/><ellipse cx="69" cy="94" rx="26" ry="13"/><ellipse cx="123" cy="94" rx="26" ry="13"/><ellipse cx="77" cy="75" rx="12" ry="23" transform="rotate(-45 77 75)"/><ellipse cx="115" cy="113" rx="12" ry="23" transform="rotate(-45 115 113)"/><circle cx="96" cy="94" r="11" fill="${colors.accent}"/></g>`;
  if (symbol === "leaf") return `<path d="M96 139 C43 116 53 68 96 57 C139 68 149 116 96 139 Z" fill="url(#logoGradient)"/><path d="M69 119 C85 101 102 86 121 73" stroke="${colors.ink}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M96 58 L96 140" stroke="${colors.accent}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  return `<path d="M96 139 C43 116 53 68 96 57 C139 68 149 116 96 139 Z" fill="url(#logoGradient)"/><path d="M69 119 C85 101 102 86 121 73" stroke="${colors.ink}" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M96 58 L96 140" stroke="${colors.accent}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
}

function makeLogoSvg(data: LogoDesignInput) {
  const colors = palettes[data.palette];
  const name = escapeXml(data.name.trim() || "Your Brand");
  const tagline = escapeXml(data.tagline.trim());
  const initial = escapeXml((data.name.trim().charAt(0) || "N").toUpperCase());
  const nameSize = data.name.trim().length > 15 ? 27 : data.name.trim().length > 10 ? 31 : 36;
  const weight = data.style === "minimal" || data.style === "elegant" ? 500 : data.style === "premium" || data.style === "vintage" ? 700 : 800;
  const letterSpacing = data.style === "premium" || data.style === "elegant" || data.style === "vintage" ? "2.1" : data.style === "minimal" ? "0.4" : data.style === "futuristic" ? "1.5" : "0.8";
  const symbol = symbolMarkup(data.symbol, initial, colors);
  const taglineMarkup = tagline
    ? `<text x="174" y="139" font-family="Inter, Noto Sans, Noto Sans Devanagari, Arial, sans-serif" font-size="13" letter-spacing="1.1" fill="${colors.secondary}">${tagline}</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240" role="img" aria-label="${name} logo"><defs><linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${colors.primary}"/><stop offset="100%" stop-color="${colors.secondary}"/></linearGradient></defs><g transform="translate(0 24)"><circle cx="96" cy="94" r="62" fill="${colors.primary}" opacity="0.08"/><circle cx="96" cy="94" r="49" fill="${colors.secondary}" opacity="0.08"/>${symbol}</g><text x="174" y="108" font-family="Inter, Noto Sans, Noto Sans Devanagari, Arial, sans-serif" font-size="${nameSize}" font-weight="${weight}" letter-spacing="${letterSpacing}" fill="${colors.ink}">${name}</text>${taglineMarkup}</svg>`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function LogoPreview({ svg, name }: { svg: string; name: string }) {
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return <img className="logo-preview-image" src={src} alt={`${name || "Your brand"} logo preview`} />;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

export default function LogoStudio() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LogoDesignInput>({
    name: "Novyra",
    tagline: "Ideas into impact",
    industry: "Technology",
    style: "modern",
    symbol: "orbit",
    palette: "violet",
  });
  const [savedDesigns, setSavedDesigns] = useState<LogoDesign[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [exportingPng, setExportingPng] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatingConcepts, setGeneratingConcepts] = useState(false);
  const [concepts, setConcepts] = useState<LogoConcept[]>([]);
  const [conceptNotice, setConceptNotice] = useState("");
  const svg = useMemo(() => makeLogoSvg(form), [form]);
  const token = sessionStorage.getItem("novyra_access");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) {
        navigate("/login", { replace: true });
        return;
      }
      setLoadingSaved(true);
      try {
        const designs = await getLogoDesigns(token);
        if (!cancelled) setSavedDesigns(designs);
      } catch (loadError) {
        if (!cancelled) setError(errorMessage(loadError));
      } finally {
        if (!cancelled) setLoadingSaved(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [navigate, token]);

  function change<K extends keyof LogoDesignInput>(key: K, value: LogoDesignInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
    setError("");
  }

  function startNew() {
    setActiveId(null);
    setForm({ name: "", tagline: "", industry: "", style: "modern", symbol: "monogram", palette: "violet" });
    setMessage("New logo design started.");
    setError("");
  }

  function loadDesign(design: LogoDesign) {
    setActiveId(design.id);
    setForm({
      name: design.name,
      tagline: design.tagline,
      industry: design.industry,
      style: design.style,
      symbol: design.symbol,
      palette: design.palette,
    });
    setMessage(`Loaded ${design.name}.`);
    setError("");
  }

  function surpriseMe() {
    const symbolIndex = symbols.findIndex((item) => item.value === form.symbol);
    const paletteKeys = Object.keys(palettes) as Palette[];
    const nextSymbol = symbols[(symbolIndex + 1) % symbols.length].value;
    const nextPalette = paletteKeys[(paletteKeys.indexOf(form.palette) + 1) % paletteKeys.length];
    setForm((current) => ({ ...current, symbol: nextSymbol, palette: nextPalette }));
    setMessage("Fresh concept applied. Keep exploring or save your design.");
    setError("");
  }

  async function handleGenerateFromPrompt() {
    if (!prompt.trim()) {
      setError("Describe the logo you want first. You can write in your preferred language.");
      return;
    }
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    setGeneratingConcepts(true);
    setError("");
    setMessage("");
    setConceptNotice("");
    try {
      const result = await generateLogoConcepts({
        prompt: prompt.trim(),
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        industry: form.industry.trim(),
      }, token);
      setConcepts(result.concepts);
      setConceptNotice(result.notice || (result.mode === "ai" ? "Your brief was interpreted by the AI art director. Choose a concept below." : "Showing built-in matches. Add OPENAI_API_KEY and available API credits for full multilingual prompt interpretation."));
      if (result.concepts[0]) {
        setMessage("Four directions are ready. Choose the concept that feels right.");
      }
    } catch (conceptError) {
      setError(errorMessage(conceptError));
    } finally {
      setGeneratingConcepts(false);
    }
  }

  
function applyConcept(concept: LogoConcept) {
  setForm((current) => ({
    ...current,
    style: concept.style,
    symbol: concept.symbol,
    palette: concept.palette,
    tagline: concept.tagline || current.tagline,
  }));

  setMessage(
    `Applied ${concept.style} concept. Check your brand name, then save your design.`
  );
  setError("");
}


  async function handleSave() {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    if (!form.name.trim()) {
      setError("Add a brand name before saving your logo.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const saved = activeId
        ? await updateLogoDesign(activeId, form, token)
        : await saveLogoDesign({ ...form, name: form.name.trim() }, token);
      setActiveId(saved.id);
      setSavedDesigns((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setMessage(activeId ? "Logo design updated." : "Logo design saved to your account.");
    } catch (saveError) {
      setError(errorMessage(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(design: LogoDesign) {
    if (!token) return;
    setDeletingId(design.id);
    setError("");
    try {
      await deleteLogoDesign(design.id, token);
      setSavedDesigns((current) => current.filter((item) => item.id !== design.id));
      if (activeId === design.id) setActiveId(null);
      setMessage(`${design.name} design deleted.`);
    } catch (deleteError) {
      setError(errorMessage(deleteError));
    } finally {
      setDeletingId(null);
    }
  }

  function downloadSvg() {
    if (!form.name.trim()) {
      setError("Add a brand name before exporting.");
      return;
    }
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), `${form.name.trim().replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}-logo.svg`);
    setMessage("SVG downloaded. It stays sharp at any size.");
    setError("");
  }

  async function downloadPng() {
    if (!form.name.trim()) {
      setError("Add a brand name before exporting.");
      return;
    }
    setExportingPng(true);
    setError("");
    try {
      const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      const image = new Image();
      image.src = url;
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Could not render this logo as a PNG."));
      });
      const canvas = document.createElement("canvas");
      canvas.width = 1280;
      canvas.height = 480;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not prepare the PNG export.");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const png = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG export failed. Please try SVG.")), "image/png");
      });
      downloadBlob(png, `${form.name.trim().replace(/[^a-z0-9-_]+/gi, "-").toLowerCase()}-logo.png`);
      URL.revokeObjectURL(url);
      setMessage("PNG downloaded with a transparent background.");
    } catch (pngError) {
      setError(errorMessage(pngError));
    } finally {
      setExportingPng(false);
    }
  }

  return (
    <main className="logo-studio-page">
      <header className="logo-studio-topbar">
        <button className="logo-back-button" onClick={() => navigate("/dashboard")} type="button">
          <ArrowLeft size={17} /> Dashboard
        </button>
        <div className="logo-topbar-brand"><span><Sparkles size={18} /></span> novyra<span className="logo-brand-dot">.</span></div>
        <div className="logo-topbar-status"><span /> LOGO STUDIO</div>
      </header>

      <div className="logo-studio-shell">
        <section className="logo-studio-heading">
          <div>
            <div className="logo-eyebrow"><WandSparkles size={15} /> BRAND IDENTITY WORKSPACE</div>
            <h1>Make your mark.</h1>
            <p>Shape a logo concept that feels like your brand. Customize it, save it, and export clean assets in seconds.</p>
          </div>
          <button className="logo-new-button" type="button" onClick={startNew}><Plus size={17} /> New design</button>
        </section>

        <div className="logo-studio-layout">
          <section className="logo-editor-panel">
            <div className="logo-panel-heading"><span className="logo-panel-icon"><Palette size={18} /></span><div><h2>Design your logo</h2><p>Start with your words, then fine-tune the result.</p></div></div>

            <div className="logo-prompt-box">
              <div className="logo-prompt-heading"><span><Sparkles size={16} /> Describe your idea</span><span className="logo-language-badge"><Languages size={13} /> Any language</span></div>
              <label className="logo-sr-only" htmlFor="logo-prompt">Describe the logo you want</label>
              <textarea id="logo-prompt" className="logo-prompt-input" maxLength={2000} rows={4} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={'Example: A premium black and gold lion logo for a luxury clothing brand\n\nउदाहरण: मेरी टेक कंपनी के लिए नीले रंग का आधुनिक लोगो बनाओ'} />
              <div className="logo-prompt-footer"><span>{prompt.length}/2000 · English, हिंदी, Hinglish and more</span><button className="logo-prompt-generate" type="button" onClick={() => void handleGenerateFromPrompt()} disabled={generatingConcepts}>{generatingConcepts ? <LoaderCircle size={15} className="logo-spin" /> : <WandSparkles size={15} />}{generatingConcepts ? "Creating concepts…" : "Generate concepts"}</button></div>
            </div>

            {concepts.length > 0 && <div className="logo-concepts-panel"><div className="logo-concepts-title"><div><span className="logo-eyebrow">PROMPT RESULTS</span><h3>Choose your direction</h3></div><span>{concepts.length} concepts</span></div>{conceptNotice && <p className="logo-concept-notice" role="status">{conceptNotice}</p>}<div className="logo-concepts-grid">{concepts.map((concept, index) => { const conceptForm: LogoDesignInput = { ...form, style: concept.style, symbol: concept.symbol, palette: concept.palette, tagline: concept.tagline || form.tagline }; return <button key={`${concept.style}-${concept.symbol}-${concept.palette}-${index}`} type="button" className={`logo-concept-card ${form.style === concept.style && form.symbol === concept.symbol && form.palette === concept.palette ? "is-current" : ""}`} onClick={() => applyConcept(concept)}><span className="logo-concept-preview"><LogoPreview svg={makeLogoSvg(conceptForm)} name={form.name} /></span><span className="logo-concept-meta"><strong>Concept {index + 1}</strong><small>{concept.style} · {concept.symbol}</small><small>{palettes[concept.palette].label}</small><em>{concept.reason}</em></span><span className="logo-concept-use">Use this concept <ChevronRight size={13} /></span></button>; })}</div></div>}

            <label className="logo-field-label" htmlFor="logo-name">Brand name <span>Required</span></label>
            <input id="logo-name" className="logo-text-input" maxLength={100} placeholder="e.g. Novyra" value={form.name} onChange={(event) => change("name", event.target.value)} />

            <label className="logo-field-label" htmlFor="logo-tagline">Tagline <span>Optional</span></label>
            <input id="logo-tagline" className="logo-text-input" maxLength={255} placeholder="A short line that says what you do" value={form.tagline} onChange={(event) => change("tagline", event.target.value)} />

            <label className="logo-field-label" htmlFor="logo-industry">Industry <span>Optional</span></label>
            <input id="logo-industry" className="logo-text-input" maxLength={100} placeholder="Technology, wellness, food..." value={form.industry} onChange={(event) => change("industry", event.target.value)} />

            <div className="logo-form-divider" />
            <div className="logo-field-label">Logo symbol</div>
            <div className="logo-symbol-grid">
              {symbols.map((symbol) => (
                <button key={symbol.value} type="button" className={`logo-symbol-option ${form.symbol === symbol.value ? "selected" : ""}`} onClick={() => change("symbol", symbol.value)} aria-pressed={form.symbol === symbol.value}>
                  <span>{symbolGlyphs[symbol.value]}</span>
                  <strong>{symbol.label}</strong>
                </button>
              ))}
            </div>

            <div className="logo-field-label logo-field-label-spaced">Color palette</div>
            <div className="logo-palette-list">
              {(Object.entries(palettes) as [Palette, (typeof palettes)[Palette]][]).map(([key, palette]) => (
                <button key={key} type="button" className={`logo-palette-option ${form.palette === key ? "selected" : ""}`} onClick={() => change("palette", key)} aria-pressed={form.palette === key}>
                  <span className="logo-palette-swatches"><i style={{ background: palette.primary }} /><i style={{ background: palette.secondary }} /><i style={{ background: palette.accent }} /></span>
                  <span>{palette.label}</span>
                  {form.palette === key && <Check size={16} />}
                </button>
              ))}
            </div>

            <div className="logo-field-label logo-field-label-spaced">Visual personality</div>
            <div className="logo-style-row">
              {styles.map((style) => <button key={style.value} type="button" className={`logo-style-chip ${form.style === style.value ? "selected" : ""}`} onClick={() => change("style", style.value)} aria-pressed={form.style === style.value}>{style.label}</button>)}
            </div>

            <button className="logo-surprise-button" type="button" onClick={surpriseMe}><RefreshCw size={16} /> Explore another concept</button>
          </section>

          <section className="logo-preview-column">
            <div className="logo-preview-card">
              <div className="logo-preview-card-head"><div><span className="logo-eyebrow">LIVE CANVAS</span><h2>Your identity, taking shape</h2></div><span className="logo-live-pill"><span /> LIVE PREVIEW</span></div>
              <div className="logo-canvas-stage"><div className="logo-canvas-grid" /><div className="logo-canvas-glow" /><div className="logo-canvas-art"><LogoPreview svg={svg} name={form.name} /></div><div className="logo-canvas-caption"><Eye size={14} /> Transparent background · Vector-based concept</div></div>
              <div className="logo-preview-actions">
                <button className="logo-primary-button" type="button" onClick={() => void handleSave()} disabled={saving}><Save size={16} /> {saving ? "Saving..." : activeId ? "Update saved design" : "Save design"}</button>
                <button className="logo-secondary-button" type="button" onClick={downloadSvg}><ArrowDownToLine size={16} /> Export SVG</button>
                <button className="logo-secondary-button" type="button" onClick={() => void downloadPng()} disabled={exportingPng}>{exportingPng ? <LoaderCircle size={16} className="logo-spin" /> : <Download size={16} />} Export PNG</button>
              </div>
              <div className="logo-export-note"><CircleHelp size={15} /><span>SVG is editable and scales without blur. PNG exports at 1280 × 480 with a transparent background.</span></div>
              {(message || error) && <div className={`logo-feedback ${error ? "is-error" : "is-success"}`} role="status">{error || message}</div>}
            </div>

            <div className="logo-saved-panel">
              <div className="logo-saved-panel-head"><div><span className="logo-eyebrow">YOUR LIBRARY</span><h2>Saved logo designs</h2></div><span className="logo-saved-count">{savedDesigns.length} {savedDesigns.length === 1 ? "design" : "designs"}</span></div>
              {loadingSaved ? <div className="logo-library-state"><LoaderCircle className="logo-spin" size={19} /> Loading your designs...</div> : savedDesigns.length === 0 ? (
                <div className="logo-library-empty"><span><Layers3 size={21} /></span><strong>Your logo library starts here</strong><p>Save a design to keep it attached to your account and revisit it later.</p><button type="button" onClick={() => setMessage("Adjust the logo and choose Save design to add it to your library.")}>How saving works <ChevronRight size={15} /></button></div>
              ) : (
                <div className="logo-saved-grid">{savedDesigns.map((design) => {
                  const designSvg = makeLogoSvg({ name: design.name, tagline: design.tagline, industry: design.industry, style: design.style, symbol: design.symbol, palette: design.palette });
                  return <article className={`logo-saved-card ${activeId === design.id ? "active" : ""}`} key={design.id}>
                    <button type="button" className="logo-saved-card-preview" onClick={() => loadDesign(design)} aria-label={`Load ${design.name} logo design`}><LogoPreview svg={designSvg} name={design.name} /></button>
                    <div className="logo-saved-card-info"><strong>{design.name}</strong><span>{palettes[design.palette].label} · {design.symbol}</span></div>
                    <div className="logo-saved-card-actions"><button type="button" onClick={() => loadDesign(design)}>Open design</button><button type="button" className="logo-delete-button" aria-label={`Delete ${design.name}`} disabled={deletingId === design.id} onClick={() => void handleDelete(design)}>{deletingId === design.id ? <LoaderCircle size={15} className="logo-spin" /> : <Trash2 size={15} />}</button></div>
                  </article>;
                })}</div>
              )}
            </div>
          </section>
        </div>

        <footer className="logo-studio-footer"><span>novyra<span className="logo-brand-dot">.</span></span><span>Built for the ones who dare to begin.</span><button type="button" onClick={() => navigate("/brand-studio")}>Back to Brand Studio <ChevronRight size={14} /></button></footer>
      </div>
    </main>
  );
}
