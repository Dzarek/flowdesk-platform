import { mainNavigation } from "@/config/navigation";
import Link from "next/link";

const NavMain = () => {
  return (
    <ul className="p-2 flex-1 flex flex-col gap-2 my-10 text-white font-medium tracking-wider">
      {mainNavigation.map((item) => {
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-4 p-4 py-3 hover:bg-green-800 duration-300 rounded-xl"
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
