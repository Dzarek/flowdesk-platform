import { mainNavigation } from "@/config/navigation";
import Link from "next/link";

const NavMain = () => {
  return (
    <ul className="px-2 flex-1 flex flex-col gap-1 my-7 text-white tracking-wider">
      {mainNavigation.map((item) => {
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-4 py-2.5 hover:bg-emerald-900 duration-300 rounded-lg"
          >
            {<item.icon />}
            <span className="text-base"> {item.title}</span>
          </Link>
        );
      })}
    </ul>
  );
};

export default NavMain;
