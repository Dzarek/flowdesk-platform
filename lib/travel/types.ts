export type TravelStatus = "PLANNED" | "COMPLETED";

export type TravelPlace = {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type TripChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
};

export type Trip = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: TravelStatus;
  coverImage: string | null;
  places: TravelPlace[];
  checklist: TripChecklistItem[];
};
