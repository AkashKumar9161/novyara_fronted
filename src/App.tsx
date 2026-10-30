
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import BusinessPlanBuilder from "./pages/BusinessPlanBuilder";
import LandingPage from "./LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BrandStudio from "./pages/BrandStudio";
import IdeaExplorer from "./pages/IdeaExplorer";
import MyStartups from "./pages/MyStartups";
import LogoStudio from "./pages/LogoStudio";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const accessToken = sessionStorage.getItem("novyra_access");

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/brand-studio"
          element={
            <ProtectedRoute>
              <BrandStudio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/idea-explorer"
          element={
            <ProtectedRoute>
              <IdeaExplorer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/business-plan"
          element={
            <ProtectedRoute>
              <BusinessPlanBuilder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-startups"
          element={
            <ProtectedRoute>
              <MyStartups />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logo-studio"
          element={
            <ProtectedRoute>
              <LogoStudio />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
