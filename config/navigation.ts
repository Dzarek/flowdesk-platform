import { NavigationItem } from "@/types/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BedDouble,
  SquareCheck,
  Settings,
} from "lucide-react";

export const mainNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Reservations",
    href: "/dashboard/reservations",
    icon: CalendarDays,
  },
  {
    title: "Guests",
    href: "/dashboard/guests",
    icon: Users,
  },
  {
    title: "Rooms",
    href: "/dashboard/rooms",
    icon: BedDouble,
  },
  {
    title: "Tasks",
    href: "/dashboard/tasks",
    icon: SquareCheck,
  },

  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];
