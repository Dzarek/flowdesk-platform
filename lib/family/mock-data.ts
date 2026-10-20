import type { FamilyMember } from "./types";

export const mockFamilyMembers: FamilyMember[] = [
  {
    id: "member-1",
    name: "Jarek",
    email: "jarek@example.com",
    role: "HEAD",
    img: "/images/mock-family/facet2.jpg",
    color: "#DCEBDD",
    joinedAt: "2024-01-10",
    isCurrentUser: true,
  },
  {
    id: "member-2",
    name: "Anna",
    email: "anna@example.com",
    role: "ADULT",
    img: "/images/mock-family/kobieta.jpg",
    color: "#F2E4D9",
    joinedAt: "2024-01-10",
  },
  {
    id: "member-3",
    name: "Ola",
    email: "ola@example.com",
    role: "CHILD",
    img: "/images/mock-family/dziewczyna.jpg",
    color: "#DFE8F5",
    joinedAt: "2024-01-10",
  },
  {
    id: "member-4",
    name: "Michał",
    email: "michal@example.com",
    role: "CHILD",
    img: "/images/mock-family/chłopiec.jpg",
    color: "#EDE2F4",
    joinedAt: "2024-01-10",
  },
];
