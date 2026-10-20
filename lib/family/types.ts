export type FamilyMemberRole = "HEAD" | "ADULT" | "CHILD";

export type FamilyMember = {
  id: string;
  name: string;
  email: string;
  role: FamilyMemberRole;
  img: string | null;
  color: string;
  joinedAt: string;
  isCurrentUser?: boolean;
};
