import type { ReactNode } from "react";

export function ButtonDone({
  children,
  className,
  loading,
  disabled,
  onClick,
}: {
  children?: ReactNode;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="submit"
      className={`${className} bg-zinc-300 font-bold p-2 rounded-full text-zinc-900 hover:bg-zinc-500 duration-300 cursor-pointer
        
      ${loading && "bg-zinc-700 text-zinc-500 animate-pulse"}
        ${disabled && "brightness-70 bg-zinc-500"}
        `}
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading ? children + ".." : children}
    </button>
  );
}
