import type { ReactNode } from "react";

export function ButtonProfile({
  loading = false,
  active = false,
  hidden = false,
  children,
  onClick,
}: {
  loading?: boolean;
  active?: boolean;
  hidden?: boolean;
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      hidden={hidden}
      disabled={loading}
      onClick={onClick}
      className={`${loading && "animate-pulse"}
    ${
      active || loading
        ? "bg-zinc-900 text-zinc-500 border-zinc-500 "
        : " bg-zinc-900 text-zinc-300 border-zinc-300 "
    } 
      cursor-pointer max-w-fit font-bold border-2 py-1 px-3 rounded-full`}
    >
      {loading ? children + ".." : children}
    </button>
  );
}
