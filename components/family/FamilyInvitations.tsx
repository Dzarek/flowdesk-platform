import { MdClose, MdMailOutline } from "react-icons/md";
import type { FamilyInvitationItem } from "./types";

type Props = { invitations: FamilyInvitationItem[]; error: string; isPending: boolean; onRevoke: (id: string) => void };

export default function FamilyInvitations({ invitations, error, isPending, onRevoke }: Props) {
  if (!invitations.length) return null;
  return (
    <div className="mt-6 rounded-2xl border border-[#DCE4D9] bg-[#F7F9F2] p-5">
      <div className="mb-4 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]"><MdMailOutline size={22} /></div><div><h3 className="font-bold text-[#19483D]">Zaproszenia</h3><p className="text-sm text-[#839087]">{invitations.length} oczekujących</p></div></div>
      {error && <p role="alert" className="mb-3 text-sm font-medium text-red-600">{error}</p>}
      <div className="space-y-2">{invitations.map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E4E9E0] bg-[#FEFEFA] p-4">
        <div className="flex min-w-0 items-center gap-3"><MdMailOutline size={20} className="shrink-0 text-[#839087]" /><div className="min-w-0"><p className="break-all text-sm font-semibold text-[#263C35]">{invitation.email}</p><p className="mt-1 text-xs text-[#839087]">Wygasa: {new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(invitation.expiresAt))}</p></div></div>
        <div className="flex items-center gap-2"><span className="rounded-full bg-[#F5EBDD] px-3 py-1.5 text-xs font-semibold text-[#8A6840]">Oczekujące</span><button type="button" disabled={isPending} onClick={() => onRevoke(invitation.id)} title="Anuluj zaproszenie" aria-label={`Anuluj zaproszenie dla ${invitation.email}`} className="cursor-pointer rounded-lg p-2 text-[#839087] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"><MdClose size={19} /></button></div>
      </div>)}</div>
    </div>
  );
}
