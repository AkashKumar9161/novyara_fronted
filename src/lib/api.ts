
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://akashkumar01.pythonanywhere.com";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

export interface BrandNameRequest {
  business_idea: string;
  industry: string;
  style: "modern" | "premium" | "creative" | "minimal" | "professional";
}

export interface GeneratedBrand {
  name: string;
  meaning: string;
  tagline: string;
}

export interface BrandGenerationResponse {
  business_idea: string;
  industry: string;
  style: BrandNameRequest["style"];
  brand_names: GeneratedBrand[];
}

export interface SavedBrand {
  id: number;
  name: string;
  meaning: string;
  tagline: string;
  industry: string;
  created_at: string;
}

export interface SaveBrandData {
  name: string;
  meaning: string;
  tagline: string;
  industry: string;
}

// Startup Idea types

export interface StartupIdea {
  id: number;
  idea: string;
  industry: string;
  created_at: string;
}

export interface StartupIdeaData {
  idea: string;
  industry: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorData = data as Record<string, unknown>;

    if (typeof errorData.error === "string") {
      throw new Error(errorData.error);
    }

    if (typeof errorData.detail === "string") {
      throw new Error(errorData.detail);
    }

    const message = Object.entries(errorData)
      .map(([field, errors]) => {
        const errorMessage = Array.isArray(errors)
          ? errors.join(", ")
          : typeof errors === "string"
            ? errors
            : JSON.stringify(errors);

        return `${field}: ${errorMessage}`;
      })
      .join("\n");

    throw new Error(message || "Something went wrong. Please try again.");
  }

  return data as T;
}

function authHeaders(accessToken: string): HeadersInit {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

// Authentication APIs

export function registerUser(data: RegisterData) {
  return request<{ id: number; username: string; email: string }>(
    "/api/auth/register/",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function loginUser(data: LoginData) {
  return request<AuthResponse>("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getCurrentUser(accessToken: string) {
  return request<{
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  }>("/api/auth/me/", {
    headers: authHeaders(accessToken),
  });
}

// AI Brand Studio APIs

export function generateBrandNames(
  data: BrandNameRequest,
  accessToken: string,
) {
  return request<BrandGenerationResponse>("/api/branding/generate/", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(data),
  });
}

export function getSavedBrands(accessToken: string) {
  return request<SavedBrand[]>("/api/branding/saved/", {
    headers: authHeaders(accessToken),
  });
}

export function saveBrand(data: SaveBrandData, accessToken: string) {
  return request<SavedBrand>("/api/branding/saved/", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(data),
  });
}

export function deleteSavedBrand(id: number, accessToken: string) {
  return request<void>(`/api/branding/saved/${id}/`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

// Idea Explorer APIs

export function getStartupIdeas(accessToken: string) {
  return request<StartupIdea[]>("/api/startups/", {
    headers: authHeaders(accessToken),
  });
}

export function createStartupIdea(
  data: StartupIdeaData,
  accessToken: string,
) {
  return request<StartupIdea>("/api/startups/", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(data),
  });
}

export function updateStartupIdea(
  id: number,
  data: StartupIdeaData,
  accessToken: string,
) {
  return request<StartupIdea>(`/api/startups/${id}/`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(data),
  });
}

export function deleteStartupIdea(id: number, accessToken: string) {
  return request<void>(`/api/startups/${id}/`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}


export interface BusinessPlan {
  id: number;
  business_idea: string;
  industry: string;
  plan_data: unknown;
  created_at?: string;
  updated_at?: string;
}

export interface GenerateBusinessPlanData {
  business_idea: string;
  industry: string;
  target_audience?: string;
  budget?: string;
}

export interface GenerateBusinessPlanResponse {
  business_plan: unknown;
}

async function businessPlanRequest<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...authHeaders(accessToken),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.detail ||
      errorData?.error ||
      "The business plan request failed. Please try again.";

    throw new Error(
      typeof message === "string" ? message : JSON.stringify(message),
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function generateBusinessPlan(
  data: GenerateBusinessPlanData,
  accessToken: string,
): Promise<GenerateBusinessPlanResponse> {
  return businessPlanRequest<GenerateBusinessPlanResponse>(
    "/api/startups/generate-plan/",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function getSavedBusinessPlans(
  accessToken: string,
): Promise<BusinessPlan[]> {
  return businessPlanRequest<BusinessPlan[]>(
    "/api/startups/saved-plans/",
    accessToken,
  );
}

export function saveBusinessPlan(
  data: Omit<BusinessPlan, "id" | "created_at" | "updated_at">,
  accessToken: string,
): Promise<BusinessPlan> {
  return businessPlanRequest<BusinessPlan>(
    "/api/startups/saved-plans/",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function deleteSavedBusinessPlan(
  id: number,
  accessToken: string,
): Promise<void> {
  return businessPlanRequest<void>(
    `/api/startups/saved-plans/${id}/`,
    accessToken,
    { method: "DELETE" },
  );
}



export type StartupStage =
  | "idea"
  | "branding"
  | "planning"
  | "building"
  | "launch"
  | "live";

export interface StartupProject {
  id: number;
  name: string;
  description: string;
  industry: string;
  stage: StartupStage;
  idea: number | null;
  idea_title: string | null;
  brand: number | null;
  brand_name: string | null;
  business_plan: number | null;
  business_plan_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface StartupProjectData {
  name: string;
  description?: string;
  industry?: string;
  stage?: StartupStage;
  idea?: number | null;
  brand?: number | null;
  business_plan?: number | null;
}

export function getStartupProjects(accessToken: string) {
  return request<StartupProject[]>("/api/startups/projects/", {
    headers: authHeaders(accessToken),
  });
}

export function createStartupProject(
  data: StartupProjectData,
  accessToken: string,
) {
  return request<StartupProject>("/api/startups/projects/", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(data),
  });
}

export function updateStartupProject(
  id: number,
  data: Partial<StartupProjectData>,
  accessToken: string,
) {
  return request<StartupProject>(`/api/startups/projects/${id}/`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(data),
  });
}

export function deleteStartupProject(id: number, accessToken: string) {
  return request<void>(`/api/startups/projects/${id}/`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

// Logo Studio APIs

export type LogoStyle = "modern" | "minimal" | "premium" | "creative" | "professional" | "geometric" | "elegant" | "futuristic" | "playful" | "organic" | "vintage";
export type LogoSymbol = "monogram" | "orbit" | "bloom" | "mountain" | "spark" | "leaf" | "lion" | "shield" | "wave" | "flame" | "hexagon" | "globe" | "cube" | "crown" | "bolt" | "flower";
export type LogoPalette = "violet" | "ocean" | "ember" | "forest" | "mono" | "gold" | "rose" | "sunset" | "midnight" | "earth" | "citrus";

export interface LogoDesign {
  id: number;
  name: string;
  tagline: string;
  industry: string;
  style: LogoStyle;
  symbol: LogoSymbol;
  palette: LogoPalette;
  created_at: string;
  updated_at: string;
}

export interface LogoConcept {
  style: LogoStyle;
  symbol: LogoSymbol;
  palette: LogoPalette;
  tagline: string;
  reason: string;
}

export interface LogoConceptResponse {
  concepts: LogoConcept[];
  mode: "ai" | "local_fallback";
  notice?: string;
}

export function generateLogoConcepts(data: { prompt: string; name?: string; tagline?: string; industry?: string }, accessToken: string) {
  return request<LogoConceptResponse>("/api/branding/logo-concepts/", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(data),
  });
}

export type LogoDesignInput = Pick<
  LogoDesign,
  "name" | "tagline" | "industry" | "style" | "symbol" | "palette"
>;

export function getLogoDesigns(accessToken: string) {
  return request<LogoDesign[]>("/api/branding/logos/", {
    headers: authHeaders(accessToken),
  });
}

export function saveLogoDesign(data: LogoDesignInput, accessToken: string) {
  return request<LogoDesign>("/api/branding/logos/", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(data),
  });
}

export function updateLogoDesign(
  id: number,
  data: Partial<LogoDesignInput>,
  accessToken: string,
) {
  return request<LogoDesign>(`/api/branding/logos/${id}/`, {
    method: "PATCH",
    headers: authHeaders(accessToken),
    body: JSON.stringify(data),
  });
}

export function deleteLogoDesign(id: number, accessToken: string) {
  return request<void>(`/api/branding/logos/${id}/`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}
