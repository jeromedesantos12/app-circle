import { Link } from "react-router-dom";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={`${className} text-4xl font-bold text-[#04A51E]`}>
      circle
    </Link>
  );
}
