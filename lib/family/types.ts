export type FamilyMemberRole = "HEAD" | "ADULT" | "CHILD";

export type FamilyMember = {
  id: string;
  name: string;
  email: string | null;
  role: FamilyMemberRole;
  roleDescription: string | null;
  img: string | null;
  color: string;
  joinedAt: string;
  isCurrentUser?: boolean;
};
