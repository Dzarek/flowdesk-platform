import { NavigationItem } from "@/types/navigation";
import {
  RiDashboardHorizontalFill,
  RiLightbulbFlashFill,
  RiSettings4Fill,
} from "react-icons/ri";
import { MdFamilyRestroom } from "react-icons/md";
import { FaCalendarAlt, FaTasks, FaShoppingCart } from "react-icons/fa";
import { ImTable } from "react-icons/im";
import { FaUserDoctor, FaEarthAmericas, FaHouse } from "react-icons/fa6";

export const mainNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: RiDashboardHorizontalFill,
  },
  {
    title: "Rodzina",
    href: "/dashboard/rodzina",
    icon: MdFamilyRestroom,
  },
  {
    title: "Kalendarz",
    href: "/dashboard/kalendarz",
    icon: FaCalendarAlt,
  },
  {
    title: "Zadania",
    href: "/dashboard/zadania",
    icon: FaTasks,
  },
  {
    title: "Zakupy",
    href: "/dashboard/zakupy",
    icon: FaShoppingCart,
  },
  {
    title: "Harmonogram",
    href: "/dashboard/harmonogram",
    icon: ImTable,
  },
  {
    title: "Zdrowie",
    href: "/dashboard/zdrowie",
    icon: FaUserDoctor,
  },
  {
    title: "Dom",
    href: "/dashboard/dom",
    icon: FaHouse,
  },
  {
    title: "Energia",
    href: "/dashboard/energia",
    icon: RiLightbulbFlashFill,
  },
  {
    title: "Podróże",
    href: "/dashboard/podroze",
    icon: FaEarthAmericas,
  },
  {
    title: "Ustawienia",
    href: "/dashboard/ustawienia",
    icon: RiSettings4Fill,
  },
];
