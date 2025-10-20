import { Outlet } from "react-router-dom";
import { SideNavbar, SideProfile } from "../organisms";
import { BottomNavbar } from "../organisms/BottomNavbar";

export function Layout() {
  return (
    <div className="bg-zinc-950 font-plus text-sm">
      <BottomNavbar />
      <main className="min-h-screen w-full max-w-7xl mx-auto flex gap-5">
        <SideNavbar />
        <div className="w-full max-w-2xl border-x-1 border-zinc-700 flex-1">
          <Outlet />
        </div>
        <SideProfile />
      </main>
    </div>
  );
}
