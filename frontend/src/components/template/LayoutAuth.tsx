import { Outlet } from "react-router-dom";

export function LayoutAuth() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 font-plus text-sm">
      <Outlet />
    </div>
  );
}
