
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { loginUser } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const message = (
    location.state as { message?: string } | null
  )?.message;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const tokens = await loginUser({ username, password });

      sessionStorage.setItem("novyra_access", tokens.access);
      sessionStorage.setItem("novyra_refresh", tokens.refresh);

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.",
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
          <span className="auth-eyebrow">WELCOME BACK</span>
          <h1>Log in to Novyra</h1>
          <p>Pick up where your startup journey left off.</p>
        </div>

        {message && (
          <div className="auth-success" role="status">
            {message}
          </div>
        )}

        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username
            <input
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Password
            <div className="auth-password">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
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
            {loading ? "Logging in..." : "Log in"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="auth-switch">
          New to Novyra? <Link to="/register">Create an account</Link>
        </p>

        <p className="auth-terms">
          Your next big thing starts with one small step.
        </p>
      </section>

      <p className="auth-footer">A little idea can change everything.</p>
    </main>
  );
}
