import { Outlet } from "react-router-dom";
import { SideNavbar, SideProfile } from "../organisms";

export function Layout() {
  return (
    <div className="min-h-screen w-full flex gap-5 bg-zinc-950 font-plus text-sm border-x-1 border-zinc-700 justify-between">
      <SideNavbar />
      <Outlet />
      <SideProfile />
    </div>
  );
}
