import { Trash2 } from "lucide-react";
import type { MouseEvent } from "react";

export function ButtonTrash({
  onClick,
  className,
  disabled = false,
  hidden = false,
}: {
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  disabled?: boolean;
  hidden?: boolean;
}) {
  return (
    <button
      className={`${className} cursor-pointer h-fit text-zinc-500 bg-transperant border-0`}
      onClick={onClick}
      disabled={disabled}
      hidden={hidden}
    >
      <Trash2 />
    </button>
  );
}
