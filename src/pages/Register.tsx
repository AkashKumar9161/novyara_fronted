
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { registerUser } from "../lib/api";
import "../index.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await registerUser(form);
      navigate("/login", {
        state: { message: "Account created successfully. Please log in." },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link to="/" className="auth-logo">
        <span className="auth-logo-icon">
          <Sparkles size={19} />
        </span>
        novyra<span>.</span>
      </Link>

      <section className="auth-card">
        <div className="auth-heading">
          <span className="auth-eyebrow">YOUR NEXT CHAPTER</span>
          <h1>Create your account</h1>
          <p>Start turning your idea into something remarkable.</p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-name-row">
            <label>
              First name
              <input
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Akash"
                autoComplete="given-name"
              />
            </label>

            <label>
              Last name
              <input
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Kumar"
                autoComplete="family-name"
              />
            </label>
          </div>

          <label>
            Username
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Choose a username"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <div className="auth-password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        <p className="auth-terms">
          By creating an account, you agree to use Novyra responsibly.
        </p>
      </section>

      <p className="auth-footer">A little idea can change everything.</p>
    </main>
  );
}
