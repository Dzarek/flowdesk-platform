import type { Trip } from "./types";

export const mockTrips: Trip[] = [
  {
    id: "trip-croatia",
    title: "Wakacje w Chorwacji",
    description: "Rodzinny wyjazd, Adriatyk, zwiedzanie miast i wycieczki.",
    startDate: "2026-08-07",
    endDate: "2026-08-15",
    status: "COMPLETED",
    coverImage: "/images/mock-travel/croatia.jpg",
    places: [
      {
        id: "medjugorje",
        name: "Medjugorje",
        country: "Bośnia i Hercegowina",
        latitude: 43.1939,
        longitude: 17.6808,
      },
      {
        id: "plitvice",
        name: "Jeziora Plitwickie",
        country: "Chorwacja",
        latitude: 44.8654,
        longitude: 15.582,
      },
      {
        id: "omis",
        name: "Omiš",
        country: "Chorwacja",
        latitude: 43.4447,
        longitude: 16.6886,
      },
      {
        id: "trogir",
        name: "Trogir",
        country: "Chorwacja",
        latitude: 43.5164,
        longitude: 16.2502,
      },
    ],

    checklist: [
      { id: "check-1", title: "Sprawdzić ważność dokumentów", completed: true },
      { id: "check-2", title: "Zarezerwować noclegi", completed: true },
      {
        id: "check-3",
        title: "Sprawdzić ubezpieczenie podróżne",
        completed: false,
      },
      { id: "check-4", title: "Przygotować apteczkę", completed: false },
      { id: "check-5", title: "Spakować ubrania", completed: false },
      {
        id: "check-6",
        title: "Przygotować rzeczy dla dzieci",
        completed: false,
      },
    ],
  },
  {
    id: "trip-krakow",
    title: "Weekend w Krakowie",
    description: "Spacer po mieście i rodzinne odkrywanie okolicy.",
    startDate: "2026-05-01",
    endDate: "2026-05-03",
    status: "COMPLETED",
    coverImage: "/images/mock-travel/krakow.jpg",
    places: [
      {
        id: "krakow",
        name: "Kraków",
        country: "Polska",
        latitude: 50.0647,
        longitude: 19.945,
      },
      {
        id: "wieliczka",
        name: "Wieliczka",
        country: "Polska",
        latitude: 49.987,
        longitude: 20.0647,
      },
    ],
    checklist: [],
  },
  {
    id: "trip-mountains",
    title: "Rodzinny weekend w górach",
    description: "Planowany odpoczynek i spacery górskie.",
    startDate: "2027-06-11",
    endDate: "2027-06-13",
    status: "PLANNED",
    coverImage: "/images/mock-travel/mountain.jpg",
    places: [
      {
        id: "zakopane",
        name: "Zakopane",
        country: "Polska",
        latitude: 49.2992,
        longitude: 19.9496,
      },
    ],
    checklist: [],
  },
];
