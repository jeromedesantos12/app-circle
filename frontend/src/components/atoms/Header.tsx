import type { ReactNode } from "react";

export function Header({
  children,
  onClick,
}: {
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div className="pt-10 pb-5 px-5 items-center border-zinc-300 bg-zinc-900">
      <h1
        className="cursor-pointer flex items-center gap-2 text-2xl font-bold text-zinc-300"
        onClick={onClick}
      >
        {children}
      </h1>
    </div>
  );
}
