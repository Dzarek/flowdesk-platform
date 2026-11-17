"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  MdClose,
  MdDeleteOutline,
  MdMailOutline,
  MdOutlinePerson,
  MdOutlineAdminPanelSettings,
  MdAdd,
} from "react-icons/md";
import {
  createChild,
  updateFamilyMember,
  deleteFamilyMember,
  createFamilyInvitation,
  revokeFamilyInvitation,
  transferFamilyHead,
} from "@/app/(app)/rodzina/actions";
import type { FamilyMember, FamilyMemberRole } from "@/lib/family/types";
import { roleLabels } from "@/components/family/constants";
import FamilyHeader from "@/components/family/FamilyHeader";
import FamilyMembersSection from "@/components/family/FamilyMembersSection";
import type {
  FamilyInvitationItem,
  FamilyPageContentProps,
  FilterType,
} from "@/components/family/types";

export default function FamilyPageContent({
  initialMembers,
  initialInvitations,
  familyName,
}: FamilyPageContentProps) {
  const [members, setMembers] = useState<FamilyMember[]>(initialMembers);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const [filter, setFilter] = useState<FilterType>("ALL");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(
    null,
  );
  const [memberToTransfer, setMemberToTransfer] = useState<FamilyMember | null>(
    null,
  );

  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const [inviteMessage, setInviteMessage] = useState("");
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [invitations, setInvitations] =
    useState<FamilyInvitationItem[]>(initialInvitations);
  const [invitationError, setInvitationError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState(false);

  useEffect(() => {
    setInvitations(initialInvitations);
  }, [initialInvitations]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "ADULT" as FamilyMemberRole,
    roleDescription: "",
  });

  const adults = members.filter(
    (member) => member.role === "HEAD" || member.role === "ADULT",
  ).length;

  const childrenF = members.filter((member) => member.role === "CHILD").length;

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pl-PL");

    return members
      .filter((member) => {
        const matchesFilter =
          filter === "ALL" ||
          (filter === "ADULT" &&
            (member.role === "HEAD" || member.role === "ADULT")) ||
          (filter === "CHILD" && member.role === "CHILD");

        const matchesSearch = [
          member.name,
          member.email ?? "",
          roleLabels[member.role],
        ].some((value) => value.toLocaleLowerCase("pl-PL").includes(query));

        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => Number(b.isCurrentUser) - Number(a.isCurrentUser));
  }, [members, filter, search]);

  function openModal() {
    setEditingMember(null);
    setForm({
      name: "",
      email: "",
      role: "CHILD",
      roleDescription: "",
    });
    setPhotoPreview(null);
    setError("");
    setIsModalOpen(true);
    setSelectedAvatar(null);
    setRemoveAvatar(false);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingMember(null);
    setPhotoPreview(null);
    setError("");
    setSelectedAvatar(null);
    setRemoveAvatar(false);
  }

  async function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("roleDescription", form.roleDescription);
    formData.append("color", "#E4EBD5");

    if (selectedAvatar) {
      formData.append("avatar", selectedAvatar);
    }

    const result = await createChild(formData);

    if (!result.success) {
      setError(result.error ?? "Nie udało się dodać dziecka.");
      return;
    }

    closeModal();
    setFilter("ALL");
    setSearch("");

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDeleteMember() {
    if (!memberToDelete || memberToDelete.isCurrentUser) return;

    setError("");

    const result = await deleteFamilyMember(memberToDelete.id);

    if (!result.success) {
      setError(result.message ?? "Nie udało się usunąć profilu.");
      return;
    }

    setMemberToDelete(null);

    startTransition(() => {
      router.refresh();
    });
  }
  function openInviteModal() {
    setInviteEmail("");
    setInviteMessage("");
    setInviteSuccess(false);
    setIsInviteModalOpen(true);
  }

  async function handleInviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setInviteMessage("");
    setInviteSuccess(false);

    const result = await createFamilyInvitation(inviteEmail);

    if (!result.success) {
      setInviteMessage(result.error ?? "Nie udało się wysłać zaproszenia.");
      return;
    }

    setInviteSuccess(true);
    setInviteMessage(`Zaproszenie zostało wysłane na adres ${inviteEmail}.`);

    setInviteEmail("");

    router.refresh();
  }

  const currentUser = members.find((member) => member.isCurrentUser);
  const isFamilyAdmin = currentUser?.role === "HEAD";

  const canEditMember = (member: FamilyMember): boolean => {
    return (
      isFamilyAdmin ||
      (Boolean(member.isCurrentUser) && member.role === "ADULT")
    );
  };

  function openEditModal(member: FamilyMember) {
    if (!canEditMember(member)) return;

    setEditingMember(member);

    setForm({
      name: member.name,
      email: member.email ?? "",
      role: member.role,
      roleDescription: member.roleDescription ?? "",
    });

    setPhotoPreview(member.img);
    setSelectedAvatar(null);
    setRemoveAvatar(false);
    setIsModalOpen(true);
  }

  async function handleUpdateMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingMember || !canEditMember(editingMember)) return;

    setError("");

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("email", form.email);
    formData.append("roleDescription", form.roleDescription);
    formData.append("color", editingMember.color);
    formData.append("removeAvatar", String(removeAvatar));

    if (selectedAvatar) {
      formData.append("avatar", selectedAvatar);
    }

    const result = await updateFamilyMember(editingMember.id, formData);

    if (!result.success) {
      setError(result.error ?? "Nie udało się zaktualizować profilu.");
      return;
    }

    closeModal();

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleRevokeInvitation(invitationId: string) {
    setInvitationError("");

    const result = await revokeFamilyInvitation(invitationId);

    if (!result.success) {
      setInvitationError(result.error ?? "Nie udało się anulować zaproszenia.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  async function handleTransferHead() {
    if (!memberToTransfer || memberToTransfer.role !== "ADULT") return;

    setError("");

    const result = await transferFamilyHead(memberToTransfer.id);

    if (!result.success) {
      setError(result.message ?? "Nie udało się przekazać roli HEAD.");
      return;
    }

    setMemberToTransfer(null);

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="space-y-7 xl:pb-6">
      <FamilyHeader
        familyName={familyName}
        total={members.length}
        adults={adults}
        childrenF={childrenF}
      />

      <FamilyMembersSection
        members={members}
        filteredMembers={filteredMembers}
        adults={adults}
        childrenF={childrenF}
        filter={filter}
        search={search}
        invitations={invitations}
        invitationError={invitationError}
        isPending={isPending}
        isFamilyAdmin={isFamilyAdmin}
        onFilterChange={setFilter}
        onSearchChange={setSearch}
        onDelete={setMemberToDelete}
        onEdit={openEditModal}
        onTransfer={setMemberToTransfer}
        canEditMember={canEditMember}
        onRevokeInvitation={handleRevokeInvitation}
        onAddChild={openModal}
        onInvite={openInviteModal}
      />

      {/* Modal dodawania */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#193C32]/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="family-modal-title"
            className="my-auto w-full max-w-lg rounded-3xl bg-[#FEFEFA] p-6 shadow-xl sm:p-8"
          >
            <div className="flex flex-col-reverse xl:flex-row items-start justify-between gap-0 xl:gap-4">
              <div className="text-center xl:text-left mx-auto xl:mx-0">
                <p className="text-sm font-semibold text-[var(--greenText)]/70">
                  Twoje gospodarstwo domowe
                </p>
                <h2
                  id="family-modal-title"
                  className="mt-1 text-2xl font-extrabold text-[#19483D]"
                >
                  {editingMember ? "Edytuj profil" : "Dodaj dziecko"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Zamknij"
                className="rounded-xl ml-auto p-2 text-[#718078] hover:bg-[#F0F3EB]"
              >
                <MdClose size={22} />
              </button>
            </div>

            <form
              onSubmit={editingMember ? handleUpdateMember : handleAddMember}
              className="mt-7 space-y-5"
            >
              <div>
                <label
                  htmlFor="member-name"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Imię i nazwisko
                </label>
                <input
                  id="member-name"
                  autoFocus
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Np. Anna Kowalska"
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="member-email"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Adres e-mail
                </label>
                <input
                  id="member-email"
                  type="email"
                  maxLength={254}
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="anna@example.com"
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                />
              </div>
              <div>
                <label
                  htmlFor="member-photo"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Zdjęcie profilowe
                </label>

                <div className="flex items-center gap-4 rounded-2xl border border-dashed border-[#BFD9C8] bg-[#F7F9F2] p-4">
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E4EBD5] text-[var(--greenText)]">
                    {photoPreview ? (
                      <Image
                        src={photoPreview}
                        alt="Podgląd zdjęcia profilowego"
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <MdOutlinePerson size={36} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="member-photo"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--greenText)] px-4 py-2.5 text-xs xl:text-sm font-semibold text-white transition hover:bg-[#19483D]"
                    >
                      <MdAdd size={18} />
                      Wybierz zdjęcie
                    </label>

                    <input
                      id="member-photo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (!file) return;

                        const allowedTypes = [
                          "image/jpeg",
                          "image/png",
                          "image/webp",
                        ];

                        if (!allowedTypes.includes(file.type)) {
                          setError("Dozwolone formaty zdjęć: JPG, PNG i WebP.");
                          event.target.value = "";
                          return;
                        }

                        if (file.size > 5 * 1024 * 1024) {
                          setError("Zdjęcie może mieć maksymalnie 5 MB.");
                          event.target.value = "";
                          return;
                        }

                        const reader = new FileReader();

                        reader.onload = () => {
                          if (typeof reader.result === "string") {
                            setSelectedAvatar(file);
                            setPhotoPreview(reader.result);
                            setRemoveAvatar(false);
                            setError("");
                          }
                        };

                        reader.onerror = () => {
                          setError("Nie udało się odczytać zdjęcia.");
                        };

                        reader.readAsDataURL(file);
                      }}
                    />

                    <p className="mt-2 text-xs leading-5 text-[#839087]">
                      JPG, PNG lub WebP. Maksymalnie 5 MB.
                    </p>

                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoPreview(null);
                          setSelectedAvatar(null);
                          setRemoveAvatar(true);

                          const input = document.getElementById(
                            "member-photo",
                          ) as HTMLInputElement | null;

                          if (input) input.value = "";
                        }}
                        className="mt-1 cursor-pointer text-xs font-semibold text-[#B46D64] hover:underline"
                      >
                        Usuń zdjęcie
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="member-roleDescription"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Krótki opis
                </label>
                <textarea
                  id="member-roleDescription"
                  maxLength={254}
                  value={form.roleDescription}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      roleDescription: event.target.value,
                    }))
                  }
                  placeholder="Planuje wycieczki, robi kanapki do pracy i szkoły."
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10 text-sm xl:text-base"
                />
              </div>
              {error && (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#DCE4D9] px-5 py-3 text-sm font-semibold text-[#38544A] hover:bg-[#F5F6EE]"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 items-center justify-center gap-2 rounded-xl bg-[var(--greenText)] px-5 py-3 text-sm font-bold text-white hover:bg-[#19483D]"
                >
                  {isPending
                    ? "Zapisywanie..."
                    : editingMember
                      ? "Zapisz zmiany"
                      : "Dodaj dziecko"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      {isInviteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#193C32]/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsInviteModalOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-modal-title"
            className="my-auto w-full max-w-lg rounded-3xl bg-[#FEFEFA] p-6 shadow-xl sm:p-8"
          >
            <div className="flex flex-col-reverse xl:flex-row items-start justify-between gap-0 xl:gap-4">
              <div className="text-center xl:text-left">
                <p className="text-sm font-semibold text-[var(--greenText)]/70">
                  Powiększ swoją rodzinę w LifeHub
                </p>

                <h2
                  id="invite-modal-title"
                  className="mt-1 text-2xl font-extrabold text-[var(--greenText)]"
                >
                  Zaproś do rodziny
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#839087]">
                  Dorosły członek będzie mógł utworzyć własne konto i dołączyć
                  do wspólnych danych rodzinnych.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                aria-label="Zamknij"
                className="cursor-pointer rounded-xl ml-auto p-2 text-[#718078] hover:bg-[#F0F3EB]"
              >
                <MdClose size={22} />
              </button>
            </div>

            <form onSubmit={handleInviteMember} className="mt-7 space-y-5">
              <div>
                <label
                  htmlFor="invite-email"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Adres e-mail zapraszanej osoby
                </label>

                <input
                  id="invite-email"
                  type="email"
                  required
                  maxLength={254}
                  value={inviteEmail}
                  onChange={(event) => {
                    setInviteEmail(event.target.value);
                    setInviteMessage("");
                  }}
                  placeholder="anna@example.com"
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-4 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                />
              </div>

              {inviteMessage && (
                <p
                  role={inviteSuccess ? "status" : "alert"}
                  className={`text-sm font-medium ${
                    inviteSuccess ? "text-[#287969]" : "text-red-600"
                  }`}
                >
                  {inviteMessage}
                </p>
              )}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="cursor-pointer rounded-xl border border-[#DCE4D9] px-5 py-3 text-sm font-semibold text-[#38544A] hover:bg-[#F5F6EE]"
                >
                  Anuluj
                </button>

                <button
                  type="submit"
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--greenText)] px-5 py-3 text-sm font-bold text-white hover:bg-[#19483D]"
                >
                  <MdMailOutline size={20} />
                  Dodaj zaproszenie
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Potwierdzenie przekazania roli HEAD */}
      {memberToTransfer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#193C32]/40 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="transfer-head-title"
            className="w-full max-w-md rounded-3xl bg-[#FEFEFA] p-6 shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2F0EB] text-[var(--greenText)]">
              <MdOutlineAdminPanelSettings size={26} />
            </div>

            <h2
              id="transfer-head-title"
              className="mt-4 text-xl font-extrabold text-[#263C35] text-center xl:text-left"
            >
              Przekazać rolę głowy rodziny?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#718078]">
              Czy na pewno chcesz przekazać rolę ADMINISTRATORA RODZINY osobie{" "}
              <strong>{memberToTransfer.name}</strong>?
            </p>

            <div className="mt-4 rounded-xl border border-[#DCE4D9] bg-[#F5F6EE] p-4">
              <p className="text-sm font-semibold text-[#38544A]">
                Co się zmieni?
              </p>

              <ul className="mt-2 space-y-2 text-sm leading-5 text-[#718078]">
                <li>
                  • Wybrana osoba otrzyma uprawnienia ADMINISTRATORA RODZINY.
                </li>
                <li>• Ty zachowasz konto i profil jako DOROSŁY.</li>
                <li>
                  • Utracisz uprawnienia do zarządzania rodziną jako
                  ADMINISTRATOR RODZINY.
                </li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setMemberToTransfer(null)}
                className="cursor-pointer disabled:cursor-not-allowed rounded-xl border border-[#DCE4D9] px-4 py-3 text-sm font-semibold text-[#38544A] hover:bg-[#F5F6EE]"
              >
                Anuluj
              </button>

              <button
                type="button"
                disabled={isPending}
                onClick={handleTransferHead}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 rounded-xl bg-[var(--greenText)] px-4 py-3 text-sm font-bold text-white hover:bg-[#19483D]"
              >
                {isPending ? "Przekazywanie..." : "Potwierdź przekazanie"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Potwierdzenie usunięcia */}
      {memberToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#193C32]/40 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-member-title"
            className="w-full max-w-md rounded-3xl bg-[#FEFEFA] p-6 shadow-xl"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-800">
              <MdDeleteOutline size={25} />
            </div>

            <h2
              id="delete-member-title"
              className="mt-4 text-xl font-extrabold text-[#263C35] text-center xl:text-left"
            >
              Usunąć członka rodziny?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#718078]">
              Czy na pewno chcesz usunąć profil{" "}
              <strong>{memberToDelete.name}</strong>? Tej operacji nie można
              cofnąć. Konto członka zostanie całkowicie usunięte.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="rounded-xl border border-[#DCE4D9] px-4 py-3 text-sm font-semibold text-[#38544A]"
              >
                Anuluj
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDeleteMember}
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 rounded-xl bg-red-800 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
              >
                {isPending ? "Usuwanie..." : "Usuń członka"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
