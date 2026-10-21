"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  MdAdd,
  MdArrowOutward,
  MdCalendarMonth,
  MdClose,
  MdDeleteOutline,
  MdImage,
  MdLocationPin,
  MdLuggage,
  MdMap,
  MdPublic,
  MdSearch,
  MdTravelExplore,
} from "react-icons/md";
import { mockTrips } from "@/lib/travel/mock-data";
import type { Trip, TravelStatus, TripChecklistItem } from "@/lib/travel/types";
import { FaMapPin } from "react-icons/fa";
import Image from "next/image";
import { FaPersonWalkingLuggage } from "react-icons/fa6";

const TravelMap = dynamic(() => import("./TravelMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] items-center justify-center rounded-xl bg-[#F5F6EE] text-sm text-[#839087] sm:h-[440px]">
      Ładowanie mapy...
    </div>
  ),
});

type FormState = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TravelStatus;
  coverImage: string | null;
  placesText: string;
};

type PlaceSearchResult = {
  id: string;
  name: string;
  displayName: string;
  country: string;
  latitude: number;
  longitude: number;
};

const initialForm: FormState = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "PLANNED",
  coverImage: null,
  placesText: "",
};

function formatDate(date: string) {
  if (!date) return "";
  return new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function getTripPlaces(trip: Trip) {
  return trip.places.map((place) => place.name).join(", ");
}

export default function TravelPageContent() {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [scope, setScope] = useState<"WORLD" | "POLAND">("WORLD");
  const [mapFilter, setMapFilter] = useState<"ALL" | TravelStatus>("ALL");
  const [listFilter, setListFilter] = useState<"ALL" | TravelStatus>("ALL");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [newChecklistItem, setNewChecklistItem] = useState("");

  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<PlaceSearchResult[]>([]);
  const [placeSearchLoading, setPlaceSearchLoading] = useState(false);
  const [placeSearchError, setPlaceSearchError] = useState("");

  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) ?? null;

  const completedTrips = trips.filter((trip) => trip.status === "COMPLETED");

  const visitedCountries = new Set(
    completedTrips.flatMap((trip) => trip.places.map((place) => place.country)),
  );

  const visitedPlaces = new Set(
    completedTrips.flatMap((trip) => trip.places.map((place) => place.id)),
  );

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pl-PL");

    return [...trips]
      .filter((trip) =>
        listFilter === "ALL" ? true : trip.status === listFilter,
      )
      .filter((trip) => {
        if (!query) return true;

        return [trip.title, trip.description, getTripPlaces(trip)]
          .join(" ")
          .toLocaleLowerCase("pl-PL")
          .includes(query);
      })
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [trips, listFilter, search]);

  function openCreate() {
    setPlaceQuery("");
    setPlaceResults([]);
    setPlaceSearchError("");
    setEditingId(null);
    setForm({
      ...initialForm,
      startDate: new Date().toISOString().slice(0, 10),
    });
    setFormError("");
  }

  function openEdit(trip: Trip) {
    setSelectedTripId(null);
    setPlaceQuery("");
    setPlaceResults([]);
    setPlaceSearchError("");
    setEditingId(trip.id);
    setForm({
      title: trip.title,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      status: trip.status,
      coverImage: trip.coverImage,
      placesText: trip.places
        .map(
          (place) =>
            `${place.name} | ${place.country} | ${place.latitude}, ${place.longitude}`,
        )
        .join("\n"),
    });
    setFormError("");
  }

  function saveTrip() {
    if (!form) return;

    if (!form.title.trim()) {
      setFormError("Podaj nazwę podróży.");
      return;
    }

    if (!form.startDate || !form.endDate || form.endDate < form.startDate) {
      setFormError("Sprawdź daty podróży.");
      return;
    }

    const places = form.placesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [name, country, coordinates] = line
          .split("|")
          .map((part) => part.trim());

        const [latitude, longitude] = (coordinates ?? "")
          .split(",")
          .map((value) => Number(value.trim()));

        return {
          id: `place-${Date.now()}-${index}`,
          name: name ?? "",
          country: country || "Polska",
          latitude: Number.isFinite(latitude) ? latitude : 52,
          longitude: Number.isFinite(longitude) ? longitude : 19,
        };
      })
      .filter((place) => place.name);

    const updatedTrip: Trip = {
      id: editingId ?? `trip-${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      status: form.status,
      coverImage: form.coverImage,
      places,
      checklist: trips.find((trip) => trip.id === editingId)?.checklist ?? [],
    };

    setTrips((previous) =>
      editingId
        ? previous.map((trip) => (trip.id === editingId ? updatedTrip : trip))
        : [updatedTrip, ...previous],
    );

    setSelectedTripId(updatedTrip.id);
    setForm(null);
    setEditingId(null);
    setFormError("");
  }

  function deleteTrip(tripId: string) {
    setTrips((previous) => previous.filter((trip) => trip.id !== tripId));
    setSelectedTripId((current) => (current === tripId ? null : current));
  }

  function handleImage(file?: File) {
    if (!file || !form) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Wybierz plik graficzny.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Zdjęcie może mieć maksymalnie 5 MB.");
      return;
    }

    setFormError("");
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setForm((current) =>
          current
            ? { ...current, coverImage: reader.result as string }
            : current,
        );
      }
    };

    reader.readAsDataURL(file);
  }

  function toggleChecklistItem(tripId: string, itemId: string) {
    setTrips((previous) =>
      previous.map((trip) =>
        trip.id !== tripId
          ? trip
          : {
              ...trip,
              checklist: trip.checklist.map((item) =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item,
              ),
            },
      ),
    );
  }

  function addChecklistItem(tripId: string) {
    const title = newChecklistItem.trim();

    if (!title) return;

    const item: TripChecklistItem = {
      id: crypto.randomUUID(),
      title,
      completed: false,
    };

    setTrips((previous) =>
      previous.map((trip) =>
        trip.id === tripId
          ? { ...trip, checklist: [...trip.checklist, item] }
          : trip,
      ),
    );

    setNewChecklistItem("");
  }

  function deleteChecklistItem(tripId: string, itemId: string) {
    setTrips((previous) =>
      previous.map((trip) =>
        trip.id !== tripId
          ? trip
          : {
              ...trip,
              checklist: trip.checklist.filter((item) => item.id !== itemId),
            },
      ),
    );
  }

  async function searchPlaces(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = placeQuery.trim();

    if (query.length < 2) {
      setPlaceSearchError("Wpisz przynajmniej 2 znaki.");
      setPlaceResults([]);
      return;
    }

    setPlaceSearchLoading(true);
    setPlaceSearchError("");
    setPlaceResults([]);

    try {
      const response = await fetch(
        `/api/geocode?q=${encodeURIComponent(query)}`,
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Nie udało się wyszukać miejsca.");
      }

      setPlaceResults(data as PlaceSearchResult[]);

      if (data.length === 0) {
        setPlaceSearchError(
          "Nie znaleziono miejsca. Spróbuj podać nazwę i kraj.",
        );
      }
    } catch (error) {
      setPlaceSearchError(
        error instanceof Error ? error.message : "Wystąpił błąd wyszukiwania.",
      );
    } finally {
      setPlaceSearchLoading(false);
    }
  }

  function selectPlace(place: PlaceSearchResult) {
    if (!form) return;

    const placeLine =
      `${place.name} | ${place.country || "Nieznany kraj"} | ` +
      `${place.latitude}, ${place.longitude}`;

    const existingLines = form.placesText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const alreadyAdded = existingLines.some((line) => {
      const [name, country] = line.split("|").map((part) => part.trim());

      return (
        name?.toLocaleLowerCase("pl-PL") ===
          place.name.toLocaleLowerCase("pl-PL") &&
        country?.toLocaleLowerCase("pl-PL") ===
          (place.country || "Nieznany kraj").toLocaleLowerCase("pl-PL")
      );
    });

    if (alreadyAdded) {
      setPlaceSearchError("To miejsce jest już dodane do tej podróży.");
      return;
    }

    setForm({
      ...form,
      placesText: [...existingLines, placeLine].join("\n"),
    });

    setPlaceQuery("");
    setPlaceResults([]);
    setPlaceSearchError("");
  }

  return (
    <div className="space-y-6 pb-8 text-[#263C35]">
      {/* Nagłówek */}
      <section className="relative overflow-hidden rounded-3xl bg-[#F5F6EE] p-6 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-[#E2EBD9]" />
        <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-[#E2F0EB]" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between px-10">
          <Image
            src="/images/travelHeader2.svg"
            alt="tasks"
            width={300}
            height={300}
            className="h-full object-cover"
          />
          <div className="max-w-2xl absolute top-1/2 left-1/2 -translate-1/2 flex flex-col items-center">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#287969]">
              <MdLuggage size={21} />
              <span>RODZINNE WYJAZDY</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-[#19483D] sm:text-5xl">
              Nasze podróże
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-[#718078]">
              Planuj wyjazdy i zachowuj rodzinne wspomnienia.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-10 cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-[#287969] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#19483D]"
            >
              <MdAdd size={21} />
              Dodaj podróż
            </button>
          </div>

          <Image
            src="/images/travelHeader.svg"
            alt="tasks"
            width={300}
            height={300}
            className="h-full object-cover"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 mx-10">
        <div className="rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4 flex items-center justify-center gap-4">
          <FaPersonWalkingLuggage size={50} className="text-[#287969]" />
          <p className="text-lg text-[#839087]">Wszystkie podróże:</p>
          <p className="text-2xl font-extrabold">{trips.length}</p>
        </div>
        <div className="rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4 flex items-center justify-center gap-4">
          <MdPublic size={50} className="text-[#287969]" />
          <p className="text-lg text-[#839087]">Odwiedzone kraje</p>
          <p className="text-2xl font-extrabold">{visitedCountries.size}</p>
        </div>
        <div className="rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] p-4 flex items-center justify-center gap-4">
          <MdLocationPin size={50} className="text-[#287969]" />
          <p className="text-lg text-[#839087]">Odwiedzone miejsca</p>
          <p className="text-2xl font-extrabold">{visitedPlaces.size}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#DCE4D9] bg-[var(--greenBg)] text-white p-4 sm:p-5 mx-20">
        <div className="mt-2">
          <h2 className="text-xl font-semibold uppercase text-center">
            Mapa naszych podróży
          </h2>
          <p className="mt-2 text-sm text-[#b5c8bb] text-center">
            Kliknij pinezkę, aby zobaczyć miejsce i powiązany wyjazd.
          </p>
        </div>
        <div className="flex -mt-12 flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setScope("WORLD")}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${
                scope === "WORLD"
                  ? "bg-[#287969] text-white"
                  : "border border-[#DCE4D9] hover:bg-[#F5F6EE] hover:text-zinc-800"
              }`}
            >
              <MdPublic className="mr-1 inline" size={17} />
              Świat
            </button>
            <button
              type="button"
              onClick={() => setScope("POLAND")}
              className={`rounded-xl px-3 py-2 text-sm font-bold ${
                scope === "POLAND"
                  ? "bg-[#287969] text-white"
                  : "border border-[#DCE4D9] hover:bg-[#F5F6EE] hover:text-zinc-800"
              }`}
            >
              <MdMap className="mr-1 inline" size={17} />
              Polska
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-sm text-[#b5c8bb]">Pokaż:</span>
          {(
            [
              ["ALL", "Wszystkie"],
              ["COMPLETED", "Odwiedzone"],
              ["PLANNED", "Planowane"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMapFilter(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold border ${
                mapFilter === value
                  ? "bg-[#E2F0EB] text-[#19483D]"
                  : "text-[#b5c8bb] hover:bg-[#F5F6EE] hover:text-[#3e453f]"
              }`}
            >
              {label}
            </button>
          ))}
          <span className="ml-auto flex items-center gap-3 text-sm text-[#b5c8bb]">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#287969]" />
              Odwiedzone
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E8BB78]" />
              Planowane
            </span>
          </span>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl sepia-20 saturate-80 brightness-90 hover:brightness-100 duration-300">
          <TravelMap
            trips={trips}
            scope={scope}
            statusFilter={mapFilter}
            onSelectTrip={setSelectedTripId}
          />
        </div>
      </section>

      {selectedTrip && (
        <div
          className="fixed inset-0 h-screen w-screen z-[1100] flex items-center justify-center bg-[#17251F]/55 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTripId(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="trip-modal-title"
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] shadow-2xl shadow-[#17251F]/20"
          >
            {/* Nagłówek modala */}
            <div className="flex shrink-0 items-center justify-between border-b border-[#E9EDE6] px-5 py-4 sm:px-7">
              <div>
                <h2
                  id="trip-modal-title"
                  className="mt-1 text-xl font-extrabold text-[var(--greenText)]"
                >
                  Szczegóły podróży
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTripId(null)}
                aria-label="Zamknij szczegóły podróży"
                className="cursor-pointer rounded-xl p-2 text-[#65746A] transition hover:bg-[#E4EBD5] hover:text-[#19483D]"
              >
                <MdClose size={23} />
              </button>
            </div>

            {/* Przewijana zawartość */}
            <div className="overflow-y-auto">
              {/* Informacje o podróży */}
              <div className="p-5 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row">
                  {selectedTrip.coverImage ? (
                    <Image
                      src={selectedTrip.coverImage}
                      alt={`Zdjęcie z podróży: ${selectedTrip.title}`}
                      width={400}
                      height={400}
                      className="h-48 w-full rounded-2xl object-cover sm:h-44 sm:w-52"
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-[#E2F0EB] to-[#D7E6D8] sm:h-44 sm:w-52">
                      <MdTravelExplore size={48} className="text-[#287969]" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-extrabold tracking-tight text-[#263C35]">
                        {selectedTrip.title}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          selectedTrip.status === "COMPLETED"
                            ? "bg-[#E2F0EB] text-[#19483D]"
                            : "bg-[#FFF1D8] text-[#79551E]"
                        }`}
                      >
                        {selectedTrip.status === "COMPLETED"
                          ? "Odwiedzona"
                          : "Planowana"}
                      </span>
                    </div>

                    <p className="mt-3 flex items-center gap-2 text-sm text-[#65746A]">
                      <MdCalendarMonth size={18} />
                      {formatDate(selectedTrip.startDate)} –{" "}
                      {formatDate(selectedTrip.endDate)}
                    </p>

                    {selectedTrip.description && (
                      <p className="mt-3 text-sm leading-6 text-[#65746A]">
                        {selectedTrip.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-start gap-2 text-sm text-[#65746A]">
                      <FaMapPin className="mt-0.5 shrink-0 text-[#287969]" />
                      <span>
                        {getTripPlaces(selectedTrip) ||
                          "Nie dodano jeszcze miejsc."}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(selectedTrip)}
                        className="cursor-pointer rounded-xl bg-[#287969] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#19483D]"
                      >
                        Edytuj podróż
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteTrip(selectedTrip.id)}
                        className="cursor-pointer rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
                      >
                        Usuń
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista przygotowań */}
              <div className="border-t border-[#E9EDE6] bg-[#F8F9F4] px-5 py-6 sm:px-7">
                {(() => {
                  const total = selectedTrip.checklist.length;
                  const completed = selectedTrip.checklist.filter(
                    (item) => item.completed,
                  ).length;
                  const progress =
                    total === 0 ? 0 : Math.round((completed / total) * 100);

                  return (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-extrabold text-[#263C35]">
                            Lista przygotowań
                          </h3>
                          <p className="mt-1 text-sm text-[#839087]">
                            Wszystko, co warto przygotować przed wyjazdem.
                          </p>
                        </div>

                        <span className="rounded-xl bg-[#E2F0EB] px-3 py-2 text-sm font-extrabold text-[#19483D]">
                          {completed}/{total}
                        </span>
                      </div>

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#DCE4D9]">
                        <div
                          className="h-full rounded-full bg-[#287969] transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <p className="mt-2 text-xs text-[#839087]">
                        {total === 0
                          ? "Dodaj pierwszą rzecz do przygotowania."
                          : `Ukończono ${progress}% przygotowań`}
                      </p>

                      <div className="mt-5 space-y-2">
                        {selectedTrip.checklist.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-xl border border-[#DCE4D9] bg-white p-3 transition hover:border-[#B8CFC0]"
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() =>
                                toggleChecklistItem(selectedTrip.id, item.id)
                              }
                              aria-label={`Oznacz: ${item.title}`}
                              className="h-4 w-4 shrink-0 cursor-pointer accent-[#287969]"
                            />

                            <span
                              className={`min-w-0 flex-1 text-sm ${
                                item.completed
                                  ? "text-[#839087] line-through"
                                  : "text-[#263C35]"
                              }`}
                            >
                              {item.title}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                deleteChecklistItem(selectedTrip.id, item.id)
                              }
                              aria-label={`Usuń: ${item.title}`}
                              className="cursor-pointer rounded-lg p-2 text-[#839087] transition hover:bg-red-50 hover:text-red-600"
                            >
                              <MdDeleteOutline size={19} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <form
                        className="mt-4 flex flex-col gap-2 sm:flex-row"
                        onSubmit={(event) => {
                          event.preventDefault();
                          addChecklistItem(selectedTrip.id);
                        }}
                      >
                        <input
                          value={newChecklistItem}
                          onChange={(event) =>
                            setNewChecklistItem(event.target.value)
                          }
                          placeholder="Np. kupić krem z filtrem"
                          aria-label="Nowa rzecz do przygotowania"
                          className="min-w-0 flex-1 rounded-xl border border-[#DCE4D9] bg-white px-3 py-3 text-sm outline-none transition focus:border-[#287969] focus:ring-2 focus:ring-[#287969]/10"
                        />

                        <button
                          type="submit"
                          disabled={!newChecklistItem.trim()}
                          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#287969] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#19483D] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <MdAdd size={18} />
                          Dodaj pozycję
                        </button>
                      </form>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Stopka */}
            <div className="flex shrink-0 justify-end border-t border-[#E9EDE6] bg-[#FEFEFA] px-5 py-3 sm:px-7">
              <button
                type="button"
                onClick={() => setSelectedTripId(null)}
                className="cursor-pointer rounded-xl border border-[#DCE4D9] px-4 py-2.5 text-sm font-bold text-[#263C35] transition hover:bg-[#F5F6EE]"
              >
                Zamknij
              </button>
            </div>
          </section>
        </div>
      )}

      <section className="mt-20 space-y-6 px-4 sm:px-6 lg:px-10">
        {/* Nagłówek */}
        <h2 className="text-3xl font-extrabold tracking-tight text-[var(--greenText)] sm:text-4xl text-center uppercase">
          Lista podróży
        </h2>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[var(--greenText)]">
              Dziennik rodzinnych przygód
            </p>
            <p className="mt-2 text-sm leading-6 text-[#313833] sm:text-lg">
              Odkrywaj nowe miejsca, planuj kolejne wyjazdy i wracaj do
              najpiękniejszych wspomnień.
            </p>
          </div>

          <label className="flex w-full items-center gap-3 rounded-2xl border border-[#DCE4D9] bg-[#FEFEFA] px-4 py-3 transition focus-within:border-[#287969] focus-within:ring-2 focus-within:ring-[#287969]/10 lg:max-w-sm">
            <MdSearch size={21} className="shrink-0 text-[#839087]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Szukaj podróży..."
              className="w-full bg-transparent text-sm text-[#263C35] outline-none placeholder:text-[#9AA59B]"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Wyczyść wyszukiwanie"
                className="cursor-pointer rounded-lg p-1 text-[#839087] transition hover:bg-[#E4EBD5] hover:text-[#19483D]"
              >
                <MdClose size={18} />
              </button>
            )}
          </label>
        </div>

        {/* Filtry */}
        <div className="flex flex-col gap-3 border-b border-[#DCE4D9] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["ALL", "Wszystkie"],
                ["PLANNED", "Planowane"],
                ["COMPLETED", "Historia"],
              ] as const
            ).map(([value, label]) => {
              const active = listFilter === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setListFilter(value)}
                  aria-pressed={active}
                  className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 ${
                    active
                      ? "bg-[#287969] text-white shadow-sm"
                      : "border border-[#DCE4D9] bg-[#FEFEFA] text-[#65746A] hover:border-[#B8CFC0] hover:bg-[#E4EBD5]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <p className="text-sm uppercase font-medium text-[#353b37]">
            Znaleziono{" "}
            <span className="font-bold text-[#263C35]">
              {filteredTrips.length}
            </span>{" "}
            {filteredTrips.length === 1
              ? "podróż"
              : filteredTrips.length >= 2 && filteredTrips.length <= 4
                ? "podróże"
                : "podróży"}
          </p>
        </div>

        {/* Lista kart */}
        {filteredTrips.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#C9D8CA] bg-[#F5F6EE] px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E2F0EB]">
              <MdTravelExplore size={32} className="text-[#287969]" />
            </div>

            <h3 className="mt-5 text-lg font-extrabold text-[#263C35]">
              Nie znaleziono podróży
            </h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#839087]">
              Spróbuj zmienić wyszukiwanie lub wybrany filtr, aby znaleźć
              zapisane wyjazdy.
            </p>

            {(search || listFilter !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setListFilter("ALL");
                }}
                className="mt-5 cursor-pointer rounded-xl bg-[#287969] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#19483D]"
              >
                Wyczyść filtry
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip) => {
              const checklistTotal = trip.checklist.length;
              const checklistCompleted = trip.checklist.filter(
                (item) => item.completed,
              ).length;

              const checklistProgress =
                checklistTotal > 0
                  ? Math.round((checklistCompleted / checklistTotal) * 100)
                  : 0;

              return (
                <article
                  key={trip.id}
                  className="group overflow-hidden rounded-3xl border border-[#DCE4D9] bg-[#FEFEFA] transition duration-300 hover:-translate-y-1 hover:border-[#B8CFC0] hover:shadow-lg hover:shadow-[#19483D]/5"
                >
                  {/* Zdjęcie */}
                  <button
                    type="button"
                    onClick={() => setSelectedTripId(trip.id)}
                    aria-label={`Pokaż szczegóły podróży: ${trip.title}`}
                    className="relative block w-full cursor-pointer overflow-hidden text-left"
                  >
                    {trip.coverImage ? (
                      <Image
                        src={trip.coverImage}
                        alt={`Zdjęcie z podróży: ${trip.title}`}
                        width={800}
                        height={500}
                        className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-52 items-center justify-center bg-gradient-to-br from-[#E2F0EB] via-[#EDF1E7] to-[#D7E6D8] transition duration-500 group-hover:scale-[1.02]">
                        <MdTravelExplore size={48} className="text-[#287969]" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#17251F]/60 via-transparent to-[#17251F]/10" />

                    <span
                      className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md ${
                        trip.status === "COMPLETED"
                          ? "bg-[#E2F0EB]/95 text-[#19483D]"
                          : "bg-[#FFF1D8]/95 text-[#79551E]"
                      }`}
                    >
                      {trip.status === "COMPLETED"
                        ? "✓ Odwiedzona"
                        : "Planowana"}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 p-4 text-white text-shadow-sm text-shadow-black">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-white/95">
                        <MdCalendarMonth size={16} />
                        {formatDate(trip.startDate)} –{" "}
                        {formatDate(trip.endDate)}
                      </p>

                      <h3 className="mt-1 text-xl font-extrabold tracking-tight ">
                        {trip.title}
                      </h3>
                    </div>
                  </button>

                  {/* Zawartość */}
                  <div className="space-y-4 p-5">
                    <p className="line-clamp-2 min-h-10 text-sm leading-5 text-[#65746A]">
                      {trip.description || "Brak opisu podróży."}
                    </p>

                    {/* Przygotowania */}
                    {checklistTotal > 0 && (
                      <div className="rounded-2xl bg-[#F5F6EE] p-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold text-[#65746A]">
                            Przygotowania
                          </span>

                          <span className="text-xs font-extrabold text-[#287969]">
                            {checklistCompleted}/{checklistTotal}
                          </span>
                        </div>

                        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#DCE4D9]">
                          <div
                            className="h-full rounded-full bg-[#287969] transition-all"
                            style={{ width: `${checklistProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Stopka */}
                    <div className="flex items-center justify-between gap-3 border-t border-[#E9EDE6] pt-4">
                      <div className="flex min-w-0 items-center gap-2 text-sm text-[#65746A]">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E2F0EB]">
                          <FaMapPin size={16} className="text-[#287969]" />
                        </span>

                        <span className="font-semibold">
                          {trip.places.length}{" "}
                          {trip.places.length === 1
                            ? "miejsce"
                            : trip.places.length >= 2 && trip.places.length <= 4
                              ? "miejsca"
                              : "miejsc"}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedTripId(trip.id)}
                        className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-[#287969] transition hover:bg-[#E2F0EB] hover:text-[#19483D]"
                      >
                        Szczegóły
                        <MdArrowOutward
                          size={17}
                          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {form && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center overflow-y-auto bg-[#17251F]/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setForm(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="travel-form-title"
            className="my-auto max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#FEFEFA] p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#839087]">
                  ORGANIZACJA PODRÓŻY
                </p>
                <h2
                  id="travel-form-title"
                  className="mt-1 text-xl font-extrabold"
                >
                  {editingId ? "Edytuj podróż" : "Dodaj podróż"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setForm(null)}
                aria-label="Zamknij formularz"
                className="rounded-lg p-2 hover:bg-[#F5F6EE]"
              >
                <MdClose size={22} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold">
                  Nazwa podróży *
                </span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="Np. Wakacje w Chorwacji"
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                />
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold">
                    Początek *
                  </span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) =>
                      setForm({ ...form, startDate: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold">
                    Koniec *
                  </span>
                  <input
                    type="date"
                    min={form.startDate || undefined}
                    value={form.endDate}
                    onChange={(event) =>
                      setForm({ ...form, endDate: event.target.value })
                    }
                    className="w-full rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold">Status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as TravelStatus,
                    })
                  }
                  className="w-full rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                >
                  <option value="PLANNED">Planowana</option>
                  <option value="COMPLETED">Odwiedzona</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-sm font-bold">Opis</span>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Co planujecie zrobić?"
                  className="w-full resize-y rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                />
              </label>

              <div>
                <span className="mb-1.5 block text-sm font-bold">
                  Zdjęcie okładkowe
                </span>
                {form.coverImage && (
                  <img
                    src={form.coverImage}
                    alt="Podgląd okładki podróży"
                    className="mb-3 h-40 w-full rounded-xl object-cover"
                  />
                )}
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#B8C9BB] bg-[#F5F6EE] px-3 py-4 text-sm font-bold text-[#287969] hover:bg-[#E2F0EB]">
                  <MdImage size={20} />
                  {form.coverImage ? "Zmień zdjęcie" : "Wybierz zdjęcie"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => handleImage(event.target.files?.[0])}
                  />
                </label>
                <p className="mt-1.5 text-xs text-[#839087]">
                  Jedno zdjęcie na podróż, maksymalnie 5 MB.
                </p>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-bold">
                  Miejsca na mapie
                </span>

                <form onSubmit={searchPlaces} className="flex gap-2">
                  <input
                    value={placeQuery}
                    onChange={(event) => setPlaceQuery(event.target.value)}
                    placeholder="Np. Jeziora Plitwickie, Chorwacja"
                    className="min-w-0 flex-1 rounded-xl border border-[#DCE4D9] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287969]"
                  />

                  <button
                    type="submit"
                    disabled={
                      placeSearchLoading || placeQuery.trim().length < 2
                    }
                    className="shrink-0 rounded-xl bg-[#287969] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#19483D] disabled:opacity-50"
                  >
                    {placeSearchLoading ? "Szukam..." : "Szukaj"}
                  </button>
                </form>

                <p className="mt-1.5 text-xs text-[#839087]">
                  Wpisz miasto, atrakcję lub adres, a następnie wybierz właściwy
                  wynik.
                </p>

                {placeSearchError && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {placeSearchError}
                  </p>
                )}

                {placeResults.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {placeResults.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => selectPlace(place)}
                        className="block w-full rounded-xl border border-[#DCE4D9] bg-white p-3 text-left transition hover:border-[#287969] hover:bg-[#F5F6EE]"
                      >
                        <span className="block text-sm font-bold">
                          {place.name}
                        </span>
                        <span className="mt-1 block text-xs text-[#839087]">
                          {place.displayName}
                        </span>
                        <span className="mt-2 block text-xs font-bold text-[#287969]">
                          + Dodaj do podróży
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="mt-4">
                  <p className="mb-2 text-sm font-bold">
                    Dodane miejsca (
                    {
                      form.placesText.split("\n").filter((line) => line.trim())
                        .length
                    }
                    )
                  </p>

                  {form.placesText.trim() ? (
                    <div className="space-y-2">
                      {form.placesText
                        .split("\n")
                        .filter((line) => line.trim())
                        .map((line, index) => {
                          const [name, country] = line
                            .split("|")
                            .map((part) => part.trim());

                          return (
                            <div
                              key={`${line}-${index}`}
                              className="flex items-center gap-3 rounded-xl bg-[#F5F6EE] p-3"
                            >
                              <MdMap
                                size={19}
                                className="shrink-0 text-[#287969]"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold">{name}</p>
                                <p className="text-xs text-[#839087]">
                                  {country}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const lines = form.placesText
                                    .split("\n")
                                    .filter((item) => item.trim());

                                  lines.splice(index, 1);

                                  setForm({
                                    ...form,
                                    placesText: lines.join("\n"),
                                  });
                                }}
                                aria-label={`Usuń miejsce ${name}`}
                                className="rounded-lg px-2 py-1 text-sm font-bold text-red-600 hover:bg-red-50"
                              >
                                Usuń
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="rounded-xl bg-[#F5F6EE] p-3 text-sm text-[#839087]">
                      Nie dodano jeszcze żadnych miejsc.
                    </p>
                  )}
                </div>

                <p className="mt-3 text-xs text-[#839087]">
                  Dane geograficzne: © OpenStreetMap contributors ·{" "}
                  <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Informacje o licencji
                  </a>
                </p>
              </div>

              {formError && (
                <p role="alert" className="text-sm font-semibold text-red-600">
                  {formError}
                </p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-xl border border-[#DCE4D9] px-4 py-2.5 text-sm font-bold hover:bg-[#F5F6EE]"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={saveTrip}
                className="rounded-xl bg-[#287969] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#19483D]"
              >
                {editingId ? "Zapisz zmiany" : "Dodaj podróż"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
