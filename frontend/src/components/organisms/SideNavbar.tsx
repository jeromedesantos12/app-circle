import { Link } from "react-router-dom";
import { Alert, Logo } from "../atoms";
import { Heart, House, LogOut, UserRoundSearch } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearToken } from "../../redux/slices/token";
import { useMutation } from "@tanstack/react-query";
import { logoutUser, usersKeys } from "../../queries/user";
import { isAxiosError } from "axios";

export function SideNavbar() {
  const dispatch = useDispatch();
  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: usersKeys.all,
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(clearToken());
    },
  });

  function handleLogout() {
    mutate();
  }

  return (
    <div className="hidden md:block flex-shrink-0 lg:w-64 md:w-48">
      <div className="sticky top-0 z-30 px-3 lg:px-10 py-10 h-screen flex flex-col justify-between">
        <div>
          {isError && (
            <Alert variant="danger">
              {isAxiosError(error) && error.response
                ? error.response.data.message
                : error.message}
            </Alert>
          )}
          <div className="flex flex-col gap-y-8">
            <Logo className="text-5xl hidden lg:block" />
            <div className="flex flex-col gap-5">
              <Link
                to="/"
                className={`text-zinc-300 font-bold text-lg flex items-center gap-2 lg:px-10 px-8 py-2 rounded-2xl hover:bg-zinc-800 duration-300`}
              >
                <House />
                <p className="hidden lg:block">Home</p>
              </Link>
              <Link
                to="/search"
                className="text-zinc-300 font-bold text-lg flex items-center gap-2 lg:px-10 px-8 py-2 rounded-2xl hover:bg-zinc-800 duration-300"
              >
                <UserRoundSearch />
                <p className="hidden lg:block">Search</p>
              </Link>
              <Link
                to="/follows"
                className="text-zinc-300 font-bold text-lg flex items-center gap-2 lg:px-10 px-8 py-2 rounded-2xl hover:bg-zinc-800 duration-300"
              >
                <Heart />
                <p className="hidden lg:block">Follows</p>
              </Link>
            </div>
          </div>
        </div>
        <div className="w-fit">
          <button
            className={`${
              isPending ? "animate-pulse text-zinc-500" : "text-zinc-300"
            } font-bold text-lg flex w-full items-center gap-2 lg:px-10 px-8 py-2 rounded-2xl hover:bg-zinc-800 duration-300`}
            onClick={handleLogout}
            disabled={isPending}
          >
            <LogOut />
            <p className="hidden lg:block">
              {isPending ? "Logging out..." : "Logout"}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
