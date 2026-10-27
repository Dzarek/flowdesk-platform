"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  FiSearch,
  FiPlus,
  FiPhone,
  FiMail,
  FiMapPin,
  FiStar,
  FiEdit2,
  FiTrash2,
  FiX,
  FiHeart,
  FiUsers,
  FiTool,
  FiHome,
  FiBookOpen,
  FiMoreHorizontal,
} from "react-icons/fi";
import { FaUserDoctor } from "react-icons/fa6";

import { initialContacts } from "@/lib/contacts/mock-data";
import type { ContactCategory, FamilyContact } from "@/lib/contacts/types";
import Image from "next/image";
import { MdContacts } from "react-icons/md";

const categories: ContactCategory[] = [
  "Zdrowie",
  "Motoryzacja",
  "Dom",
  "Szkoła i dzieci",
  "Zwierzęta",
  "Inne",
];

const categoryStyles: Record<
  ContactCategory,
  { icon: typeof FiHeart; color: string; background: string }
> = {
  Zdrowie: {
    icon: FaUserDoctor,
    color: "#287969",
    background: "#E2F0EB",
  },
  Motoryzacja: {
    icon: FiTool,
    color: "#8A6840",
    background: "#F5EBDD",
  },
  Dom: {
    icon: FiHome,
    color: "#657B48",
    background: "#E8EEDC",
  },
  "Szkoła i dzieci": {
    icon: FiBookOpen,
    color: "#6C6BB0",
    background: "#ECEBFA",
  },
  Zwierzęta: {
    icon: FiHeart,
    color: "#B46D64",
    background: "#F8E8E4",
  },
  Inne: {
    icon: FiMoreHorizontal,
    color: "#64746D",
    background: "#E9EDE8",
  },
};

const emptyContact: Omit<FamilyContact, "id"> = {
  name: "",
  category: "Inne",
  phone: "",
  email: "",
  address: "",
  notes: "",
  favorite: false,
};

export default function ContactsPageContent() {
  const [contacts, setContacts] = useState<FamilyContact[]>(initialContacts);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    ContactCategory | "Wszystkie"
  >("Wszystkie");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<FamilyContact | null>(
    null,
  );
  const [formData, setFormData] =
    useState<Omit<FamilyContact, "id">>(emptyContact);
  const [deleteContactId, setDeleteContactId] = useState<string | null>(null);

  const filteredContacts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pl");

    return contacts
      .filter((contact) => {
        const matchesCategory =
          activeCategory === "Wszystkie" || contact.category === activeCategory;

        const matchesFavorites = !favoritesOnly || contact.favorite;

        const searchableText = [
          contact.name,
          contact.category,
          contact.phone,
          contact.email,
          contact.address,
          contact.notes,
        ]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase("pl");

        return (
          matchesCategory && matchesFavorites && searchableText.includes(query)
        );
      })
      .sort(
        (a, b) =>
          Number(b.favorite) - Number(a.favorite) ||
          a.name.localeCompare(b.name, "pl"),
      );
  }, [contacts, search, activeCategory, favoritesOnly]);

  function openAddModal() {
    setEditingContact(null);
    setFormData({ ...emptyContact });
    setIsModalOpen(true);
  }

  function openEditModal(contact: FamilyContact) {
    setEditingContact(contact);

    const { id: _id, ...contactData } = contact;
    setFormData({ ...contactData });
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingContact(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedContact = {
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone?.trim() ?? "",
      email: formData.email?.trim() ?? "",
      address: formData.address?.trim() ?? "",
      notes: formData.notes?.trim() ?? "",
    };

    if (editingContact) {
      setContacts((current) =>
        current.map((contact) =>
          contact.id === editingContact.id
            ? { ...cleanedContact, id: editingContact.id }
            : contact,
        ),
      );
    } else {
      setContacts((current) => [
        ...current,
        {
          ...cleanedContact,
          id: crypto.randomUUID(),
        },
      ]);
    }

    closeModal();
  }

  function toggleFavorite(id: string) {
    setContacts((current) =>
      current.map((contact) =>
        contact.id === id
          ? { ...contact, favorite: !contact.favorite }
          : contact,
      ),
    );
  }

  function confirmDelete() {
    if (!deleteContactId) return;

    setContacts((current) =>
      current.filter((contact) => contact.id !== deleteContactId),
    );
    setDeleteContactId(null);
  }

  const favoriteCount = contacts.filter((contact) => contact.favorite).length;

  const inputClass =
    "mt-2 w-full rounded-xl border border-[#DCE4D9] bg-[#FEFEFA] px-4 py-4 text-sm text-[#263C35] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10";

  return (
    <div className="space-y-6 pb-8">
      {/* Nagłówek */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F5F6EE] p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#E2EBD9]" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-[#E2F0EB]" />

        <div className="relative flex h-[230px] flex-col justify-center gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative z-10 max-w-xl">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#287969]">
              <MdContacts size={21} />
              <span>Znajomi i Specjaliści</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#263C35] sm:text-4xl">
              Ważne kontakty
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#839087] sm:text-base">
              Wszystkie ważne numery, adresy i informacje dla Twojej rodziny w
              jednym miejscu.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-[#52675D]">
              <span className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2">
                <FiUsers className="text-[#287969]" />
                {contacts.length} kontaktów
              </span>

              <span className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2">
                <FiStar className="text-[#B28A42]" />
                {favoriteCount} ulubionych
              </span>
            </div>
          </div>

          <Image
            src="/images/contactsHeader.svg"
            alt="Energia i instalacje domowe"
            width={400}
            height={400}
            priority
            className=" h-full  object-contain "
          />
        </div>
      </section>

      {/* Wyszukiwarka i dodawanie */}
      <section className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#839087]"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Szukaj nazwy, osoby, telefonu lub adresu..."
            aria-label="Szukaj kontaktów"
            className="w-full rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] py-3.5 pl-11 pr-4 text-sm text-[#263C35] outline-none transition placeholder:text-[#A0AAA2] focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
          />
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#287969] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#19483D]"
        >
          <FiPlus size={19} />
          Dodaj kontakt
        </button>
      </section>

      {/* Kategorie */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#263C35]">Kategorie</h2>

          <button
            type="button"
            onClick={() => setFavoritesOnly((value) => !value)}
            aria-pressed={favoritesOnly}
            className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
              favoritesOnly
                ? "bg-[#F5EBDD] text-[#8A6840]"
                : "bg-[#FEFEFA] text-[#839087] hover:bg-[#F5F6EE]"
            }`}
          >
            <FiStar size={16} />
            Ulubione
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveCategory("Wszystkie")}
            className={`shrink-0 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              activeCategory === "Wszystkie"
                ? "bg-[#287969] text-white"
                : "border border-[#DCE4D9] bg-[#FEFEFA] text-[#64746D] hover:bg-[#F5F6EE]"
            }`}
          >
            Wszystkie
          </button>

          {categories.map((category) => {
            const CategoryIcon = categoryStyles[category].icon;
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-[#287969] text-white"
                    : "border border-[#DCE4D9] bg-[#FEFEFA] text-[#64746D] hover:bg-[#F5F6EE]"
                }`}
              >
                <CategoryIcon size={16} />
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* Lista kontaktów */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#263C35]">
            {favoritesOnly
              ? "Ulubione kontakty"
              : activeCategory === "Wszystkie"
                ? "Wszystkie kontakty"
                : activeCategory}
          </h2>

          <span className="text-sm text-[#839087]">
            {filteredContacts.length} wyników
          </span>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#DCE4D9] bg-[#FEFEFA] px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E2F0EB] text-[#287969]">
              <FiSearch size={25} />
            </div>

            <h3 className="mt-4 font-semibold text-[#263C35]">
              Nie znaleziono kontaktów
            </h3>

            <p className="mt-2 text-sm text-[#839087]">
              Zmień wyszukiwanie lub wybierz inną kategorię.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("Wszystkie");
                setFavoritesOnly(false);
              }}
              className="mt-4 cursor-pointer text-sm font-semibold text-[#287969] hover:underline"
            >
              Wyczyść filtry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredContacts.map((contact) => {
              const style = categoryStyles[contact.category];
              const CategoryIcon = style.icon;

              return (
                <article
                  key={contact.id}
                  className="group rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 transition duration-200 hover:border-[#B8CCBE] hover:bg-white sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                      style={{
                        backgroundColor: style.background,
                        color: style.color,
                      }}
                    >
                      <CategoryIcon size={23} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span
                            className="inline-block rounded-lg px-2 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: style.background,
                              color: style.color,
                            }}
                          >
                            {contact.category}
                          </span>

                          <h3 className="mt-2 break-words text-base font-semibold text-[#263C35]">
                            {contact.name}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleFavorite(contact.id)}
                          aria-label={
                            contact.favorite
                              ? "Usuń z ulubionych"
                              : "Dodaj do ulubionych"
                          }
                          aria-pressed={contact.favorite}
                          className={`cursor-pointer rounded-lg p-2 transition hover:bg-[#F5F6EE] ${
                            contact.favorite
                              ? "text-[#B28A42]"
                              : "text-[#B7C0B8]"
                          }`}
                        >
                          <FiStar
                            size={19}
                            fill={contact.favorite ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2.5 border-t border-[#E8EDE5] pt-5">
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                        className="flex min-w-0 items-center gap-3 rounded-xl bg-[#F5F6EE] p-3.5 transition hover:bg-[#E8EEDC]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]">
                          <FiPhone size={18} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium text-[#839087]">
                            Telefon
                          </span>
                          <span className="mt-1 block break-all text-sm font-semibold text-[#263C35]">
                            {contact.phone}
                          </span>
                        </span>
                      </a>
                    )}

                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex min-w-0 items-center gap-3 rounded-xl bg-[#F5F6EE] p-3.5 transition hover:bg-[#E8EEDC]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]">
                          <FiMail size={18} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium text-[#839087]">
                            E-mail
                          </span>
                          <span className="mt-1 block break-all text-sm font-semibold text-[#263C35]">
                            {contact.email}
                          </span>
                        </span>
                      </a>
                    )}

                    {contact.address && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 items-center gap-3 rounded-xl bg-[#F5F6EE] p-3.5 transition hover:bg-[#E8EEDC]"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E2F0EB] text-[#287969]">
                          <FiMapPin size={18} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-medium text-[#839087]">
                            Lokalizacja
                          </span>
                          <span className="mt-1 block break-words text-sm font-semibold text-[#263C35]">
                            {contact.address}
                          </span>
                        </span>

                        <span className="shrink-0 text-xs font-medium text-[#287969]">
                          Mapa ↗
                        </span>
                      </a>
                    )}

                    {!contact.phone && !contact.email && !contact.address && (
                      <p className="rounded-xl bg-[#F5F6EE] px-4 py-5 text-center text-sm text-[#839087]">
                        Brak danych kontaktowych. Edytuj kontakt, aby je
                        uzupełnić.
                      </p>
                    )}

                    {contact.notes && (
                      <div className="mt-3 rounded-xl border border-[#DCE4D9] bg-white p-4">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#839087]">
                          Notatki
                        </p>
                        <p className="whitespace-pre-wrap text-sm leading-6 text-[#52675D]">
                          {contact.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(contact)}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#64746D] transition hover:bg-[#F5F6EE] hover:text-[#287969]"
                    >
                      <FiEdit2 size={15} />
                      Edytuj
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteContactId(contact.id)}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#B46D64] transition hover:bg-[#F8E8E4]"
                    >
                      <FiTrash2 size={15} />
                      Usuń
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Formularz dodawania / edycji */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#192D25]/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
            className="my-auto w-full max-w-xl rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] p-5 sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="contact-modal-title"
                  className="text-xl font-bold text-[#263C35]"
                >
                  {editingContact ? "Edytuj kontakt" : "Dodaj kontakt"}
                </h2>
                <p className="mt-1 text-sm text-[#839087]">
                  Uzupełnij informacje, które przydadzą się rodzinie.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Zamknij formularz"
                className="cursor-pointer rounded-xl p-2 text-[#839087] transition hover:bg-[#F5F6EE] hover:text-[#263C35]"
              >
                <FiX size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="text-sm font-medium text-[#52675D]"
                >
                  Nazwa kontaktu *
                </label>
                <input
                  id="contact-name"
                  required
                  autoFocus
                  maxLength={100}
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Np. Przychodnia rodzinna"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-category"
                  className="text-sm font-medium text-[#52675D]"
                >
                  Kategoria *
                </label>
                <select
                  id="contact-category"
                  value={formData.category}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      category: event.target.value as ContactCategory,
                    }))
                  }
                  className={inputClass}
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="text-sm font-medium text-[#52675D]"
                  >
                    Numer telefonu
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    maxLength={40}
                    value={formData.phone ?? ""}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="+48 123 456 789"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="text-sm font-medium text-[#52675D]"
                  >
                    Adres e-mail
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    maxLength={254}
                    value={formData.email ?? ""}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        email: event.target.value,
                      }))
                    }
                    placeholder="kontakt@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-address"
                  className="text-sm font-medium text-[#52675D]"
                >
                  Adres / lokalizacja
                </label>
                <input
                  id="contact-address"
                  maxLength={250}
                  value={formData.address ?? ""}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      address: event.target.value,
                    }))
                  }
                  placeholder="Ulica, numer, miejscowość"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="contact-notes"
                  className="text-sm font-medium text-[#52675D]"
                >
                  Notatki
                </label>
                <textarea
                  id="contact-notes"
                  rows={3}
                  maxLength={1000}
                  value={formData.notes ?? ""}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  placeholder="Godziny otwarcia, ważne informacje..."
                  className={`${inputClass} resize-y`}
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#F5F6EE] p-3.5">
                <input
                  type="checkbox"
                  checked={formData.favorite}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      favorite: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 cursor-pointer accent-[#287969]"
                />
                <span className="flex items-center gap-2 text-sm font-medium text-[#52675D]">
                  <FiStar size={17} className="text-[#B28A42]" />
                  Dodaj do ulubionych
                </span>
              </label>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="cursor-pointer rounded-xl border border-[#DCE4D9] px-5 py-3 text-sm font-semibold text-[#64746D] transition hover:bg-[#F5F6EE]"
                >
                  Anuluj
                </button>

                <button
                  type="submit"
                  className="cursor-pointer rounded-xl bg-[#287969] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19483D]"
                >
                  {editingContact ? "Zapisz zmiany" : "Dodaj kontakt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Potwierdzenie usunięcia */}
      {deleteContactId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#192D25]/40 p-4 backdrop-blur-sm">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-contact-title"
            className="w-full max-w-sm rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] p-6"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F8E8E4] text-[#B46D64]">
              <FiTrash2 size={22} />
            </div>

            <h2
              id="delete-contact-title"
              className="mt-4 text-lg font-bold text-[#263C35]"
            >
              Usunąć kontakt?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#839087]">
              Kontakt zostanie usunięty z aktualnej listy. Tej operacji nie
              można cofnąć.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteContactId(null)}
                className="flex-1 cursor-pointer rounded-xl border border-[#DCE4D9] px-4 py-3 text-sm font-semibold text-[#64746D] transition hover:bg-[#F5F6EE]"
              >
                Anuluj
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 cursor-pointer rounded-xl bg-[#B46D64] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#99564E]"
              >
                Usuń kontakt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
