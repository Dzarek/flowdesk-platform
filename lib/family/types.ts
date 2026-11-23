export type FamilyMemberRole = "HEAD" | "ADULT" | "CHILD";

export type FamilyMember = {
  id: string;
  userId: string | null;
  name: string;
  email: string | null;
  role: FamilyMemberRole;
  roleDescription: string | null;
  img: string | null;
  color: string;
  joinedAt: string;
  isCurrentUser?: boolean;
};
