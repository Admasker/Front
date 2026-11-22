import type { Asset, Project, RenderJob, User, UserRole, Campaign, CreatorProfile, Workspace, CampaignApplication } from "@/shared/types";
export class ApiError extends Error { constructor(message: string, public status: number) { super(message); } }
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${url}`, options);
  const data = await response.json() as { error?: string };
  if (!response.ok) throw new ApiError(data.error || "요청을 처리하지 못했습니다.", response.status);
  return data as T;
}
type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;
export const api = {
  campaigns: (query = "") => request<{ campaigns: Campaign[] }>(`/campaigns${query ? `?${query}` : ""}`),
  createCampaign: (input: Omit<Campaign, "id" | "status" | "createdAt" | "applicationCount">) => request<{ campaign: Campaign }>("/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
  closeCampaign: (id: string, status: "open" | "closed") => request<{ campaign: Campaign }>(`/campaigns/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
  creators: (query = "") => request<{ creators: CreatorProfile[] }>(`/creators${query ? `?${query}` : ""}`),
  profile: () => request<{ profile: CreatorProfile | null }>("/profile"),
  saveProfile: (profile: Omit<CreatorProfile, "id" | "updatedAt">) => request<{ profile: CreatorProfile }>("/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) }),
  apply: (id: string, message: string) => request<{ application: CampaignApplication }>(`/campaigns/${id}/applications`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) }),
  decide: (id: string, status: "accepted" | "declined") => request<{ application: CampaignApplication }>(`/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
  workspace: () => request<Workspace>("/workspace"),
  login: (email: string, password: string) => request<{ user: User }>("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) }),
  register: (email: string, password: string, displayName: string, role: UserRole = "creator") => request<{ user: User }>("/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, displayName, role }) }),
  logout: () => request<{ ok: boolean }>("/auth/logout", { method: "POST" }),
  session: () => request<{ user: User | null; rendererAvailable: boolean }>("/session"),
  projects: () => request<{ projects: Project[] }>("/projects"),
  create: (project: ProjectInput) => request<{ project: Project }>("/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(project) }),
  update: (id: string, project: ProjectInput) => request<{ project: Project }>(`/projects/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(project) }),
  upload: (file: File, kind: "video" | "product") => {
    const form = new FormData(); form.set("file", file); form.set("kind", kind);
    return request<{ asset: Asset }>("/assets", { method: "POST", body: form });
  },
  render: (id: string) => request<{ job: RenderJob }>(`/projects/${id}/renders`, { method: "POST" }),
  job: (id: string) => request<{ job: RenderJob }>(`/renders/${id}`),
};
