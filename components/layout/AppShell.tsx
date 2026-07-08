import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";

const AppShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col">
        <AppHeader />

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
