import {
  MdMailOutline,
  MdPeopleOutline,
  MdPersonAddAlt1,
  MdSearch,
} from "react-icons/md";
import type { FamilyMember } from "@/lib/family/types";
import type { FilterType, FamilyInvitationItem } from "./types";
import FamilyMemberCard from "./FamilyMemberCard";
import FamilyInvitations from "./FamilyInvitations";

type Props = {
  members: FamilyMember[];
  filteredMembers: FamilyMember[];
  adults: number;
  childrenF: number;
  filter: FilterType;
  search: string;
  invitations: FamilyInvitationItem[];
  invitationError: string;
  isPending: boolean;
  isFamilyAdmin: boolean;
  onFilterChange: (filter: FilterType) => void;
  onSearchChange: (value: string) => void;
  onDelete: (member: FamilyMember) => void;
  onEdit: (member: FamilyMember) => void;
  onTransfer: (member: FamilyMember) => void;
  canEditMember: (member: FamilyMember) => boolean;
  onRevokeInvitation: (id: string) => void;
  onAddChild: () => void;
  onInvite: () => void;
};

export default function FamilyMembersSection(props: Props) {
  const {
    members,
    filteredMembers,
    adults,
    childrenF,
    filter,
    search,
    invitations,
    invitationError,
    isPending,
    isFamilyAdmin,
    onFilterChange,
    onSearchChange,
    onDelete,
    onEdit,
    onTransfer,
    canEditMember,
    onRevokeInvitation,
    onAddChild,
    onInvite,
  } = props;
  return (
    <section className="rounded-3xl border border-[#E4E9E0] bg-[#FEFEFA] p-4 sm:p-6 py-10 xl:py-6 lg:p-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-wrap gap-2 justify-center xl:justify-start">
          {(
            [
              ["ALL", `Wszyscy (${members.length})`],
              ["ADULT", `Dorośli (${adults})`],
              ["CHILD", `Dzieci (${childrenF})`],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => onFilterChange(value)}
              className={`cursor-pointer rounded-full px-3 xl:px-5 py-3 text-sm font-semibold transition ${filter === value ? "bg-[var(--greenText)] text-white" : "bg-[#F3F5EF] text-[#38544A] hover:bg-[#E8EEE5]"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-w-0 items-center gap-2 rounded-xl border border-[#E0E6DE] bg-[#F8F9F4] px-4 sm:min-w-[250px]">
            <MdSearch className="shrink-0 text-[#718078]" size={21} />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Szukaj członka rodziny..."
              aria-label="Szukaj członka rodziny"
              className="min-w-0 bg-transparent py-3 text-sm text-[#263C35] outline-none placeholder:text-[#98A29B]"
            />
          </label>
        </div>
      </div>
      {filteredMembers.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredMembers.map((member) => (
            <FamilyMemberCard
              key={member.id}
              member={member}
              onDelete={onDelete}
              onEdit={onEdit}
              canEdit={canEditMember(member)}
              isFamilyAdmin={isFamilyAdmin}
              onTransfer={onTransfer}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-[#DCE4D9] px-5 py-12 text-center">
          <MdPeopleOutline size={36} className="text-[#839087]" />
          <p className="mt-3 font-bold text-[#263C35]">
            Nie znaleziono członków rodziny
          </p>
          <p className="mt-1 text-sm text-[#839087]">
            Zmień wyszukiwanie lub wybierz inny filtr.
          </p>
        </div>
      )}
      <FamilyInvitations
        invitations={invitations}
        error={invitationError}
        isPending={isPending}
        onRevoke={onRevokeInvitation}
      />
      <div className="flex flex-col xl:flex-row items-center mt-10 xl:gap-4">
        <button
          type="button"
          onClick={onAddChild}
          className="mt-6 flex w-full items-center gap-4 rounded-2xl border border-dashed border-[#BFD9C8] bg-[#F7F9F2] p-5 text-left transition hover:bg-[#EFF5EA] sm:p-6"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D8EADD] text-[#287969]">
            <MdPersonAddAlt1 size={25} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-[var(--greenText)]">
              Dodaj dziecko
            </span>
            <span className="mt-1 block text-sm text-[#839087]">
              Przygotuj rodzinę do wspólnej organizacji codziennego życia.
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onInvite}
          className="mt-6 flex w-full items-center gap-4 rounded-2xl border border-dashed border-[#BFD9C8] bg-[#F7F9F2] p-5 text-left transition hover:bg-[#EFF5EA] sm:p-6"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D8EADD] text-[#287969]">
            <MdMailOutline size={25} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-[#19483D]">
              Zaproś do rodziny
            </span>
            <span className="mt-1 block text-sm text-[#839087]">
              Wyślij wiadomość email z zaproszeniem do rodziny.
            </span>
          </span>
        </button>
      </div>
    </section>
  );
}
