"use client";

import { useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import {
  MdAdd,
  MdCalendarToday,
  MdClose,
  MdDeleteOutline,
  MdFamilyRestroom,
  MdMailOutline,
  MdOutlineChildCare,
  MdOutlinePerson,
  MdOutlineShield,
  MdPersonAddAlt1,
  MdSearch,
  MdPeopleOutline,
} from "react-icons/md";

import type { FamilyMember, FamilyMemberRole } from "@/lib/family/types";
import { mockFamilyMembers } from "@/lib/family/mock-data";

type FilterType = "ALL" | "ADULT" | "CHILD";

const roleLabels: Record<FamilyMemberRole, string> = {
  HEAD: "Głowa rodziny",
  ADULT: "Dorosły członek",
  CHILD: "Dziecko",
};

// const roleDescriptions: Record<FamilyMemberRole, string> = {
//   HEAD: "Organizuje domowe sprawy i dba o wspólną organizację.",
//   ADULT: "Wspiera domową organizację i codzienne sprawy.",
//   CHILD: "Uczy się samodzielności i uczestniczy w życiu rodziny.",
// };

const roleStyles: Record<FamilyMemberRole, string> = {
  HEAD: "bg-[#E2F0E7] text-[#287969]",
  ADULT: "bg-[#F7EDE4] text-[#986A4A]",
  CHILD: "bg-[#E7EEF8] text-[#5876A5]",
};

const roleIcons: Record<FamilyMemberRole, typeof MdOutlinePerson> = {
  HEAD: MdOutlineShield,
  ADULT: MdOutlinePerson,
  CHILD: MdOutlineChildCare,
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function StatCard({
  icon: Icon,
  value,
  label,
  iconBg,
  iconColor,
}: {
  icon: typeof MdPeopleOutline;
  value: number;
  label: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
      >
        <Icon size={25} />
      </div>

      <div className="min-w-0">
        <p className="text-2xl font-extrabold leading-none text-[#263C35]">
          {value}
        </p>
        <p className="mt-1 text-sm text-[#839087]">{label}</p>
      </div>
    </div>
  );
}

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

function MemberCard({
  member,
  onDelete,
}: {
  member: FamilyMember;
  onDelete: (member: FamilyMember) => void;
}) {
  const RoleIcon = roleIcons[member.role];

  return (
    <article className="group min-w-0 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 transition-colors hover:border-[#B8D2C4]">
      <div className="flex items-start justify-between gap-3">
        <div className="relative z-10">
          <MemberAvatar member={member} />
          <div
            className="absolute top-1/2 -translate-y-1/2 left-10 -z-10 flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full ring-4 ring-white"
            style={{ backgroundColor: member.color, opacity: 0.3 }}
          ></div>
          <span
            className={`absolute bottom-2 left-25 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[member.role]}`}
          >
            <RoleIcon size={15} />
            {roleLabels[member.role]}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onDelete(member)}
          disabled={member.isCurrentUser}
          aria-label={`Usuń członka: ${member.name}`}
          title={
            member.isCurrentUser
              ? "Nie możesz usunąć własnego profilu"
              : "Usuń członka"
          }
          className="rounded-lg p-2 text-[#839087] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <MdDeleteOutline size={21} />
        </button>
      </div>

      <h3 className="mt-5 truncate text-lg font-extrabold text-[#263C35]">
        {member.name}
        {member.isCurrentUser && (
          <span className="ml-2 text-xs font-medium text-[#839087]">(Ty)</span>
        )}
      </h3>

      <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-[#839087]">
        <MdMailOutline className="shrink-0" size={17} />
        <span className="truncate">{member.email}</span>
      </div>

      <p className="mt-4 min-h-[60px] text-sm leading-6 text-[#718078]">
        {member.roleDescription}
      </p>

      <div className="mt-4 flex items-center gap-2 border-t border-[#E9EEE6] pt-4 text-xs text-[#839087]">
        <MdCalendarToday size={16} />
        <span>Dołączenie: {formatDate(member.joinedAt)}</span>
      </div>
    </article>
  );
}

export default function FamilyPageContent() {
  const [members, setMembers] = useState<FamilyMember[]>(mockFamilyMembers);

  const [filter, setFilter] = useState<FilterType>("ALL");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMember | null>(
    null,
  );
  const [error, setError] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADULT" | "CHILD">("ADULT");
  const [inviteMessage, setInviteMessage] = useState("");
  const [mockInvitations, setMockInvitations] = useState<
    { id: string; email: string; role: "ADULT" | "CHILD"; status: "PENDING" }[]
  >([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "ADULT" as FamilyMemberRole,
    roleDescription: "",
  });

  const adults = members.filter(
    (member) => member.role === "HEAD" || member.role === "ADULT",
  ).length;

  const children = members.filter((member) => member.role === "CHILD").length;

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pl-PL");

    return members.filter((member) => {
      const matchesFilter =
        filter === "ALL" ||
        (filter === "ADULT" &&
          (member.role === "HEAD" || member.role === "ADULT")) ||
        (filter === "CHILD" && member.role === "CHILD");

      const matchesSearch = [
        member.name,
        member.email,
        roleLabels[member.role],
      ].some((value) => value.toLocaleLowerCase("pl-PL").includes(query));

      return matchesFilter && matchesSearch;
    });
  }, [members, filter, search]);

  function openModal() {
    setForm({ name: "", email: "", role: "ADULT", roleDescription: "" });
    setPhotoPreview(null);
    setError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setError("");
  }

  function handleAddMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const roleDescription = form.roleDescription;

    if (!name || !email || !roleDescription) {
      setError("Uzupełnij imię, adres e-mail i opis.");
      return;
    }

    const emailExists = members.some(
      (member) => member.email.toLowerCase() === email,
    );

    if (emailExists) {
      setError("Członek z takim adresem e-mail już istnieje.");
      return;
    }

    const newMember: FamilyMember = {
      id: crypto.randomUUID(),
      name,
      email,
      role: form.role,
      roleDescription,
      img: photoPreview,
      color: "#E4EBD5",
      joinedAt: new Date().toLocaleDateString("sv-SE"),
    };

    setMembers((current) => [...current, newMember]);
    setFilter("ALL");
    setSearch("");
    closeModal();
  }

  function handleDeleteMember() {
    if (!memberToDelete || memberToDelete.isCurrentUser) return;

    setMembers((current) =>
      current.filter((member) => member.id !== memberToDelete.id),
    );

    setMemberToDelete(null);
  }
  function openInviteModal() {
    setInviteEmail("");
    setInviteRole("ADULT");
    setInviteMessage("");
    setIsInviteModalOpen(true);
  }

  function handleInviteMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = inviteEmail.trim().toLowerCase();

    if (!email) {
      setInviteMessage("Podaj adres e-mail.");
      return;
    }

    const existingMember = members.some(
      (member) => member.email.toLowerCase() === email,
    );

    const existingInvitation = mockInvitations.some(
      (invitation) =>
        invitation.email === email && invitation.status === "PENDING",
    );

    if (existingMember) {
      setInviteMessage("Ta osoba jest już członkiem rodziny.");
      return;
    }

    if (existingInvitation) {
      setInviteMessage("Zaproszenie dla tego adresu już istnieje.");
      return;
    }

    setMockInvitations((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        email,
        role: inviteRole,
        status: "PENDING",
      },
    ]);

    setIsInviteModalOpen(false);
  }
  return (
    <div className="space-y-7 pb-8">
      {/* Nagłówek i ilustracja */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-[#F5F6EE]">
        <div className="h-[230px] relative z-10 grid items-center gap-5 px-6  sm:px-8 lg:min-h-[330px] lg:grid-cols-2 lg:px-10">
          <div className="py-8">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#287969]">
              <MdFamilyRestroom size={20} />
              <span>Rodzina</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-[#19483D] sm:text-5xl">
              Nasza rodzina
            </h1>

            <p className="mt-4 max-w-lg text-base leading-7 text-[#718078] ">
              Wspólne obowiązki, plany i ważne chwile. Zarządzaj członkami
              rodziny i budujcie razem lepiej zorganizowany dom.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <StatCard
                icon={MdPeopleOutline}
                value={members.length}
                label="Osoby"
                iconBg="bg-[#E4EEDC]"
                iconColor="text-[#287969]"
              />
              <StatCard
                icon={MdOutlinePerson}
                value={adults}
                label="Dorosłych"
                iconBg="bg-[#FBE9E2]"
                iconColor="text-[#C86F53]"
              />
              <StatCard
                icon={MdOutlineChildCare}
                value={children}
                label="Dzieci"
                iconBg="bg-[#E4EDF8]"
                iconColor="text-[#5876A5]"
              />
            </div>
          </div>
          <div className="relative hidden h-full lg:block">
            <Image
              src="/images/family-illustration.png"
              alt="Ilustracja rodziny spędzającej wspólnie czas"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 0px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Lista członków */}
      <section className="rounded-3xl border border-[#E4E9E0] bg-[#FEFEFA] p-4 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["ALL", `Wszyscy (${members.length})`],
                ["ADULT", `Dorośli (${adults})`],
                ["CHILD", `Dzieci (${children})`],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                  filter === value
                    ? "bg-[var(--greenText)] text-white"
                    : "bg-[#F3F5EF] text-[#38544A] hover:bg-[#E8EEE5]"
                }`}
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
                onChange={(event) => setSearch(event.target.value)}
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
              <MemberCard
                key={member.id}
                member={member}
                onDelete={setMemberToDelete}
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
        {mockInvitations.length > 0 && (
          <div className="mt-6 rounded-2xl border border-[#DCE4D9] bg-[#F7F9F2] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]">
                <MdMailOutline size={22} />
              </div>

              <div>
                <h3 className="font-bold text-[#19483D]">Zaproszenia</h3>
                <p className="text-sm text-[#839087]">
                  {mockInvitations.length} oczekujących
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {mockInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E4E9E0] bg-[#FEFEFA] p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <MdMailOutline
                      size={20}
                      className="shrink-0 text-[#839087]"
                    />

                    <div className="min-w-0">
                      <p className="break-all text-sm font-semibold text-[#263C35]">
                        {invitation.email}
                      </p>
                      <p className="mt-1 text-xs text-[#839087]">
                        {invitation.role === "ADULT"
                          ? "Dorosły członek"
                          : "Dziecko"}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#F5EBDD] px-3 py-1.5 text-xs font-semibold text-[#8A6840]">
                    Oczekujące
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Panel dodawania */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={openModal}
            className="mt-6 flex w-full items-center gap-4 rounded-2xl border border-dashed border-[#BFD9C8] bg-[#F7F9F2] p-5 text-left transition hover:bg-[#EFF5EA] sm:p-6"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D8EADD] text-[#287969]">
              <MdPersonAddAlt1 size={25} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block font-bold text-[#19483D]">
                Dodaj nowego członka rodziny
              </span>
              <span className="mt-1 block text-sm text-[#839087]">
                Przygotuj rodzinę do wspólnej organizacji codziennego życia.
              </span>
            </span>
          </button>
          {/* Panel zaproszenia */}

          <button
            type="button"
            onClick={openInviteModal}
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#287969]">
                  Twoje gospodarstwo domowe
                </p>
                <h2
                  id="family-modal-title"
                  className="mt-1 text-2xl font-extrabold text-[#19483D]"
                >
                  Dodaj członka rodziny
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Zamknij"
                className="rounded-xl p-2 text-[#718078] hover:bg-[#F0F3EB]"
              >
                <MdClose size={22} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="mt-7 space-y-5">
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
                  required
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
                  <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#E4EBD5] text-[#287969]">
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
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#287969] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#19483D]"
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

                        if (!file.type.startsWith("image/")) {
                          setError("Wybierz plik graficzny.");
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
                            setPhotoPreview(reader.result);
                            setError("");
                          }
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
                        onClick={() => setPhotoPreview(null)}
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
                  htmlFor="member-role"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Rola w rodzinie
                </label>
                <select
                  id="member-role"
                  value={form.role}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      role: event.target.value as FamilyMemberRole,
                    }))
                  }
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                >
                  <option value="ADULT">Dorosły członek</option>
                  <option value="CHILD">Dziecko</option>
                </select>
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
                  required
                  maxLength={254}
                  value={form.roleDescription}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      roleDescription: event.target.value,
                    }))
                  }
                  placeholder="Planuje wycieczki, robi kanapki do pracy i szkoły."
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-3 text-[#263C35] outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
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
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#287969] px-5 py-3 text-sm font-bold text-white hover:bg-[#19483D]"
                >
                  <MdAdd size={20} />
                  Dodaj członka
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#287969]">
                  Powiększ swoją rodzinę w LifeHub
                </p>

                <h2
                  id="invite-modal-title"
                  className="mt-1 text-2xl font-extrabold text-[#19483D]"
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
                className="cursor-pointer rounded-xl p-2 text-[#718078] hover:bg-[#F0F3EB]"
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

              <div>
                <label
                  htmlFor="invite-role"
                  className="mb-2 block text-sm font-semibold text-[#38544A]"
                >
                  Rola w rodzinie
                </label>

                <select
                  id="invite-role"
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(event.target.value as "ADULT" | "CHILD")
                  }
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-4 py-4 text-[#263C35] outline-none focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                >
                  <option value="ADULT">Dorosły członek</option>
                  <option value="CHILD">Dziecko</option>
                </select>
              </div>

              {inviteMessage && (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {inviteMessage}
                </p>
              )}

              <div className="rounded-2xl bg-[#F5F6EE] p-4 text-sm leading-6 text-[#64746D]">
                <p className="font-semibold text-[#38544A]">
                  Jak to będzie działać?
                </p>
                <p className="mt-1">
                  Po wdrożeniu zaproszeń osoba otrzyma wiadomość e-mail z
                  linkiem. Na razie zapisujemy zaproszenie tylko
                  demonstracyjnie.
                </p>
              </div>

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
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#287969] px-5 py-3 text-sm font-bold text-white hover:bg-[#19483D]"
                >
                  <MdMailOutline size={20} />
                  Dodaj zaproszenie
                </button>
              </div>
            </form>
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <MdDeleteOutline size={25} />
            </div>

            <h2
              id="delete-member-title"
              className="mt-4 text-xl font-extrabold text-[#263C35]"
            >
              Usunąć członka rodziny?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#718078]">
              Czy na pewno chcesz usunąć profil{" "}
              <strong>{memberToDelete.name}</strong>? W tej wersji
              demonstracyjnej zmiana nie jest zapisywana w bazie danych.
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
                onClick={handleDeleteMember}
                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
              >
                Usuń członka
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
