export type ContactCategory =
  | "Zdrowie"
  | "Motoryzacja"
  | "Dom"
  | "Szkoła i dzieci"
  | "Zwierzęta"
  | "Inne";

export interface FamilyContact {
  id: string;
  name: string;
  category: ContactCategory;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  favorite: boolean;
}
