import Logo from "./Logo";
import NavMain from "./NavMain";
import ThemeToggle from "./ThemeToggle";

const AppSidebar = () => {
  return (
    <div className="w-72 h-full py-10 px-4 flex flex-col bg-emerald-950/95 justify-between">
      <Logo />
      <NavMain />
      <ThemeToggle />
    </div>
  );
};

export default AppSidebar;
