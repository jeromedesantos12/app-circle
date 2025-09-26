import type { ReactNode } from "react";
import { Annoyed } from "lucide-react";

export function Error({ children }: { children?: ReactNode }) {
  return (
    <h1 className="size-50 font-bold text-zinc-300 flex flex-col gap-5 justify-center items-center text-center">
      <Annoyed className="size-30" />
      {children}
    </h1>
  );
}
