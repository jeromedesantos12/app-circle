import { BellDot, TriangleAlert, X } from "lucide-react";
import { useState, type ReactNode } from "react";

export function Alert({
  children,
  variant,
}: {
  children?: ReactNode;
  variant?: string;
}) {
  const [close, setClose] = useState(false);

  return (
    <div
      className={`z-50 fixed top-5 w-full max-w-xs left-1/2 -translate-x-1/2  bg-zinc-800 p-4 rounded-xl flex flex-col gap-2 font-bold 
        ${close ? "hidden" : ""}  
        ${variant === "danger" ? "text-red-400" : "text-zinc-300"}`}
    >
      <X
        className="text-zinc-300 self-end -mb-7 p-1 rounded-full border-2 border-zinc-300 cursor-pointer z-20"
        onClick={() => setClose(true)}
      />
      <div className="flex items-center gap-2 text-lg">
        {variant === "danger" ? (
          <TriangleAlert size="20" />
        ) : (
          <BellDot size="20" />
        )}
        <h1>{variant === "danger" ? "Error!" : "Alert"}</h1>
      </div>
      <p>{children}</p>
    </div>
  );
}
