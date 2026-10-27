import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavigationItem } from "@/types/navigation";
import {
  RiDashboardHorizontalFill,
  RiLightbulbFlashFill,
  RiSettings4Fill,
} from "react-icons/ri";
import {
  MdFamilyRestroom,
  MdOutlineContactPhone,
  MdOutlineSolarPower,
  MdSecurity,
} from "react-icons/md";
import { FaCalendarAlt, FaTasks, FaShoppingCart } from "react-icons/fa";
import { ImTable } from "react-icons/im";
import { FaUserDoctor, FaEarthAmericas, FaHouse } from "react-icons/fa6";

const mainNavigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: RiDashboardHorizontalFill,
  },
  {
    title: "Rodzina",
    href: "/rodzina",
    icon: MdFamilyRestroom,
  },
  {
    title: "Kalendarz",
    href: "/kalendarz",
    icon: FaCalendarAlt,
  },
  {
    title: "Zadania",
    href: "/zadania",
    icon: FaTasks,
  },
  {
    title: "Zakupy",
    href: "/zakupy",
    icon: FaShoppingCart,
  },
  {
    title: "Harmonogram",
    href: "/harmonogram",
    icon: ImTable,
  },
  {
    title: "Ważne kontakty",
    href: "/kontakty",
    icon: MdOutlineContactPhone,
  },
  {
    title: "Bezpieczeństwo",
    href: "/bezpieczenstwo",
    icon: MdSecurity,
  },
  {
    title: "Energia",
    href: "/energia",
    icon: MdOutlineSolarPower,
  },
  {
    title: "Podróże",
    href: "/podroze",
    icon: FaEarthAmericas,
  },
  // {
  //   title: "Ustawienia",
  //   href: "/ustawienia",
  //   icon: RiSettings4Fill,
  // },
];

const NavMain = () => {
  const pathname = usePathname();
  return (
    <ul className="flex-1 overflow-y-auto pr-3 flex flex-col gap-1 min-[1600px]:gap-2  mt-3 mb-20 text-zinc-100 tracking-wider">
      {mainNavigation.map((item) => {
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 p-4 py-2.5 hover:bg-[#31513a]/40 duration-300 rounded-lg ${pathname === item.href + "/" ? "bg-[#5b755b]" : "bg-[#31513a]/10"} `}
          >
            {<item.icon />}
            <span className="text-sm"> {item.title}</span>
          </Link>
        );
      })}
    </ul>
  );
};

export default NavMain;
