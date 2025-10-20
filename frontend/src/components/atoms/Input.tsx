import { Eye, EyeClosed } from "lucide-react";
import {
  type ReactNode,
  type DetailedHTMLProps,
  type InputHTMLAttributes,
  forwardRef,
  useState,
} from "react";

type InputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  children?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ children, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    function togglePasswordVisibility() {
      setShowPassword(!showPassword);
    }
    const isPasswordType = props.type === "password";

    return (
      <div className="relative">
        <input
          {...props}
          ref={ref}
          placeholder=""
          required
          className="caret-[#04A51E] peer w-full px-4 pt-6 pb-2 bg-transparent text-zinc-300 border border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
          type={
            isPasswordType ? (showPassword ? "text" : "password") : props.type
          }
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-green-400 focus:outline-none duration-300"
          >
            {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
          </button>
        )}
        <label
          htmlFor={props.id}
          className="absolute left-4 top-2 text-sm text-zinc-300 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:text-zinc-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-green-400"
        >
          {children} <span className="text-red-500">*</span>
        </label>
      </div>
    );
  }
);
