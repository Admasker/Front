export type Placement = { x: number; y: number; width: number; rotation: number; opacity: number; start: number; end: number };
export type Asset = { id: string; name: string; kind: "video" | "product" | "output"; contentType: string; size: number };
export type Project = {
  id: string; name: string; brand: string; prompt: string; videoId: string | null; productId: string | null;
  placement: Placement; createdAt: string; updatedAt: string;
};
export type RenderJob = { id: string; projectId: string; status: "queued" | "rendering" | "completed" | "failed"; progress: number; outputId: string | null; error: string | null; createdAt: string };
export const DEFAULT_PLACEMENT: Placement = { x: 0.28, y: 0.57, width: 0.13, rotation: -5, opacity: 1, start: 0, end: 3 };

export type UserRole = "creator" | "brand";
export type User = { displayName: string; email?: string; role: UserRole };
export type Campaign = {
  id: string; title: string; brand: string; description: string; category: string; platform: string;
  budget: number; deadline: string; minAudience: number; deliverable: string; status: "open" | "closed";
  applicationCount: number; createdAt: string;
};
export type CreatorProfile = {
  id: string; displayName: string; bio: string; platform: string; handle: string;
  categories: string[]; audienceSize: number; portfolioUrl: string; updatedAt: string;
};
export type CampaignApplication = {
  id: string; campaignId: string; creatorId: string; message: string; status: "pending" | "accepted" | "declined";
  createdAt: string; campaignTitle?: string; brand?: string; creatorName?: string; platform?: string; handle?: string; audienceSize?: number;
};
export type Workspace = { role: UserRole; campaigns: Campaign[]; applications: CampaignApplication[]; profile: CreatorProfile | null };
