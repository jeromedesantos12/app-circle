import type { ReactNode } from "react";

export function Button({
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
      className={`${className} px-5 py-2 font-bold rounded-full cursor-pointer duration-300 bg-[#04A51E] hover:bg-[#038318] text-zinc-300
        ${loading && "bg-zinc-700 text-zinc-500 animate-pulse"}
        ${disabled && "brightness-70 bg-[#038318]"}
      `}
      type="submit"
      disabled={loading || disabled}
      onClick={onClick}
    >
      {loading ? children + ".." : children}
    </button>
  );
}
