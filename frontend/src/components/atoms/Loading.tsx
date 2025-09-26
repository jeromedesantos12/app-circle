import UseAnimations from "react-useanimations";
import infinity from "react-useanimations/lib/infinity";
import type { ReactNode } from "react";

export function Loading({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 font-plus text-sm">
      <div className="text-zinc-300 flex flex-col items-center gap-2 font-bold animate-pulse text-center">
        <UseAnimations strokeColor="#d4d4d8" animation={infinity} />
        <p>{children}</p>
      </div>
    </div>
  );
}
