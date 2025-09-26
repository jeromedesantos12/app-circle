import { X } from "lucide-react";
import type { MouseEvent } from "react";

export function ImgPreview({
  onClick,
  src,
  alt,
}: {
  onClick: (e: MouseEvent<SVGSVGElement>) => void;
  src: string;
  alt: string;
}) {
  return (
    <div className="max-w-fit flex flex-col relative">
      <X
        className="text-zinc-300 cursor-pointer absolute top-2 right-2 rounded-full p-1 bg-zinc-900/30 hover:bg-zinc-900/50 duration-300"
        onClick={onClick}
      />
      <img src={src} alt={alt} className="rounded-xl object-cover" />
    </div>
  );
}
