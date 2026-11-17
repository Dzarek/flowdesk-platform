import type { FamilyMember } from "@/lib/family/types";

export type FilterType = "ALL" | "ADULT" | "CHILD";

export type FamilyInvitationItem = {
  id: string;
  email: string;
  createdAt: string;
  expiresAt: string;
};

export type FamilyPageContentProps = {
  initialMembers: FamilyMember[];
  initialInvitations: FamilyInvitationItem[];
  familyName: string;
};
