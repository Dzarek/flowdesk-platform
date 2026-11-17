import { MdOutlinePerson, MdOutlineShield, MdOutlineChildCare } from "react-icons/md";
import type { FamilyMemberRole } from "@/lib/family/types";

export const roleLabels: Record<FamilyMemberRole, string> = {
  HEAD: "Głowa rodziny",
  ADULT: "Dorosły członek",
  CHILD: "Dziecko",
};

export const roleStyles: Record<FamilyMemberRole, string> = {
  HEAD: "bg-[#E2F0E7] text-[#287969]",
  ADULT: "bg-[#F7EDE4] text-[#986A4A]",
  CHILD: "bg-[#E7EEF8] text-[#5876A5]",
};

export const roleIcons = {
  HEAD: MdOutlineShield,
  ADULT: MdOutlinePerson,
  CHILD: MdOutlineChildCare,
} satisfies Record<FamilyMemberRole, typeof MdOutlinePerson>;

export function getInitials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export function formatMemberDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}
