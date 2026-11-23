import Image from "next/image";
import {
  MdCalendarToday,
  MdDeleteOutline,
  MdEdit,
  MdMailOutline,
  MdOutlineAdminPanelSettings,
  MdPersonAddAlt1,
  MdCheckCircleOutline,
  MdUpgrade,
  MdPersonRemoveAlt1,
  MdChildCare,
} from "react-icons/md";

import type { FamilyMember } from "@/lib/family/types";

import {
  formatMemberDate,
  getInitials,
  roleIcons,
  roleLabels,
  roleStyles,
} from "./constants";

type Props = {
  member: FamilyMember;
  onDelete: (member: FamilyMember) => void;
  onEdit: (member: FamilyMember) => void;
  onTransfer: (member: FamilyMember) => void;
  onActivate: (member: FamilyMember) => void;
  onPromote: (member: FamilyMember) => void;
  canEdit: boolean;
  isFamilyAdmin: boolean;
  onDeactivate: (member: FamilyMember) => void;
  onDemote: (member: FamilyMember) => void;
};

function MemberAvatar({ member }: { member: FamilyMember }) {
  return (
    <div
      className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-white"
      style={{ backgroundColor: member.color }}
    >
      {member.img ? (
        <Image
          src={member.img}
          alt={`Zdjęcie profilowe: ${member.name}`}
          fill
          sizes="120px"
          className="object-cover"
        />
      ) : (
        <span className="text-2xl font-extrabold text-[#287969]">
          {getInitials(member.name)}
        </span>
      )}
    </div>
  );
}

export default function FamilyMemberCard({
  member,
  onDelete,
  onEdit,
  onTransfer,
  onActivate,
  onPromote,
  canEdit,
  isFamilyAdmin,
  onDeactivate,
  onDemote,
}: Props) {
  const RoleIcon = roleIcons[member.role];

  const isChild = member.role === "CHILD";
  const hasAccount = Boolean(member.userId);

  return (
    <article className="group min-w-0 rounded-2xl border-2 border-[#DCE4D9] bg-[#FEFEFA] p-5 transition-colors hover:border-[#B8D2C4]">
      <div className="flex items-start justify-between gap-3">
        <div className="relative z-10">
          <MemberAvatar member={member} />

          <div
            className="absolute top-1/2 -translate-y-1/2 left-10 -z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-white"
            style={{ backgroundColor: member.color, opacity: 0.3 }}
          />

          <span
            className={`absolute bottom-2 left-25 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[member.role]}`}
          >
            <RoleIcon size={15} />
            {roleLabels[member.role]}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {isFamilyAdmin && member.role === "ADULT" && (
            <button
              type="button"
              onClick={() => onTransfer(member)}
              aria-label={`Przekaż rolę głowy rodziny osobie: ${member.name}`}
              title="Przekaż rolę głowy rodziny"
              className="cursor-pointer rounded-lg p-2 text-[#839087] transition hover:bg-[#E2F0EB] hover:text-[#287969]"
            >
              <MdOutlineAdminPanelSettings size={21} />
            </button>
          )}

          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(member)}
              aria-label={`Edytuj profil: ${member.name}`}
              title="Edytuj profil"
              className="cursor-pointer rounded-lg p-2 text-[#839087] transition hover:bg-[#E2F0EB] hover:text-[#287969]"
            >
              <MdEdit size={20} />
            </button>
          )}

          {isFamilyAdmin && member.role !== "HEAD" && !member.isCurrentUser && (
            <button
              type="button"
              onClick={() => onDelete(member)}
              aria-label={`Usuń członka: ${member.name}`}
              title="Usuń członka"
              className="cursor-pointer rounded-lg p-2 text-[#839087] transition hover:bg-red-50 hover:text-red-600"
            >
              <MdDeleteOutline size={21} />
            </button>
          )}
        </div>
      </div>

      <h3 className="mt-5 truncate text-lg font-extrabold text-[#263C35]">
        {member.name}

        {member.isCurrentUser && (
          <span className="ml-2 text-xs font-medium text-[#839087]">(Ty)</span>
        )}
      </h3>

      <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-[#839087]">
        <MdMailOutline className="shrink-0" size={17} />
        <span className="truncate">{member.email ?? "Brak adresu e-mail"}</span>
      </div>

      <p className="mt-4 min-h-[60px] text-sm leading-6 text-[#718078]">
        {member.roleDescription || "Brak opisu"}
      </p>

      <div className="mt-4 flex items-center gap-2 border-t border-[#E9EEE6] pt-4 text-xs text-[#839087]">
        <MdCalendarToday size={16} />
        <span>Dołączenie: {formatMemberDate(member.joinedAt)}</span>
      </div>

      {/* Zarządzanie kontem i rolą */}
      {isFamilyAdmin && member.role !== "HEAD" && (
        <div className="mt-4 space-y-3 border-t border-[#E9EEE6] pt-4">
          {/* Dziecko bez aktywnego konta */}
          {isChild && !hasAccount && (
            <button
              type="button"
              disabled={!member.email}
              onClick={() => onActivate(member)}
              title={!member.email ? "Najpierw dodaj adres e-mail" : undefined}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#E2F0EB] px-3 py-2.5 text-sm font-semibold text-[#287969] transition hover:bg-[#D5E9E0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MdPersonAddAlt1 size={19} />
              Aktywuj konto
            </button>
          )}

          {/* Dziecko z aktywnym kontem */}
          {isChild && hasAccount && (
            <>
              <div className="flex items-center justify-center gap-2 rounded-xl bg-[#EAF3E9] px-3 py-2.5 text-sm font-semibold text-[#287969]">
                <MdCheckCircleOutline size={19} />
                Konto aktywne
              </div>

              <button
                type="button"
                onClick={() => onPromote(member)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DCE4D9] px-3 py-2.5 text-sm font-semibold text-[#38544A] transition hover:bg-[#F3F5EF]"
              >
                <MdUpgrade size={19} />
                Zmień na dorosłego
              </button>

              <button
                type="button"
                onClick={() => onDeactivate(member)}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-100 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <MdPersonRemoveAlt1 size={19} />
                Cofnij aktywację konta
              </button>
            </>
          )}

          {/* Dorosły z aktywnym kontem */}
          {!isChild && hasAccount && (
            <button
              type="button"
              onClick={() => onDemote(member)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#DCE4D9] px-3 py-2.5 text-sm font-semibold text-[#38544A] transition hover:bg-[#F3F5EF]"
            >
              <MdChildCare size={19} />
              Zmień na dziecko
            </button>
          )}
        </div>
      )}
    </article>
  );
}
