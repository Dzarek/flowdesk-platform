import type { HomeCamera } from "./types";

export const mockCameras: HomeCamera[] = [
  {
    id: "camera-1",
    name: "Salon",
    location: "Parter",
    status: "online",
    lastSeen: "Teraz",
  },
  {
    id: "camera-2",
    name: "Wejście",
    location: "Drzwi wejściowe",
    status: "online",
    lastSeen: "Teraz",
  },
  {
    id: "camera-3",
    name: "Ogród",
    location: "Na zewnątrz",
    status: "offline",
    lastSeen: "12 minut temu",
  },
];
