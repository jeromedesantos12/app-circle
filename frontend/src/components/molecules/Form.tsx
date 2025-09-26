import type { ReactNode, FormEvent } from "react";
import { Logo } from "../atoms";

export function Form({
  children,
  title,
  onSubmit,
}: {
  children?: ReactNode;
  title?: string;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="w-full max-w-xs flex flex-col gap-3"
      action="submit"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-3">
        <Logo />
        <h2 className="text-2xl font-bold text-zinc-300">{title}</h2>
      </div>
      {children}
    </form>
  );
}
