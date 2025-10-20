import { Link, useNavigate } from "react-router-dom";
import { Alert, Logo } from "../atoms";
import { Heart, House, LogOut, UserRoundSearch } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearToken } from "../../redux/slices/token";
import { useMutation } from "@tanstack/react-query";
import { logoutUser, usersKeys } from "../../queries/user";
import { isAxiosError } from "axios";

export function SideNavbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: usersKeys.all,
    mutationFn: logoutUser,
    onSuccess: () => {
      dispatch(clearToken());
      navigate("/login");
    },
  });

  function handleLogout() {
    mutate();
  }

  return (
    <div className="hidden md:block">
      <div className="sticky top-0 z-30 px-5 xl:px-10 py-10 h-screen flex flex-col gap-15">
        {isError && (
          <Alert variant="danger">
            {isAxiosError(error) && error.response
              ? error.response.data.message
              : error.message}
          </Alert>
        )}
        <div className="flex flex-col gap-10">
          <Logo className="text-5xl hidden xl:block" />
          <div className="flex flex-col flex-1 gap-5">
            <Link
              to="/"
              className={`text-zinc-300 font-bold text-lg flex items-center gap-2  px-8 py-2 rounded-2xl hover:bg-zinc-800 duration-300`}
            >
              <House />
              <p className="hidden xl:block">Home</p>
            </Link>
            <Link
              to="/search"
              className="text-zinc-300 font-bold text-lg flex items-center gap-2  px-8 py-2 rounded-2xl hover:bg-zinc-800 duration-300"
            >
              <UserRoundSearch />
              <p className="hidden xl:block">Search</p>
            </Link>
            <Link
              to="/follows"
              className="text-zinc-300 font-bold text-lg flex items-center gap-2  px-8 py-2 rounded-2xl hover:bg-zinc-800 duration-300"
            >
              <Heart />
              <p className="hidden xl:block">Follows</p>
            </Link>
            {/* <Link
                to="/"
                className="text-zinc-300 font-bold text-lg flex items-center gap-2 px-10 py-2 rounded-2xl hover:bg-zinc-800 duration-300"
              >
                <CircleUser />
                <p className="hidden xl:block">Profile</p>
              </Link> */}
          </div>
          <div className="w-fit">
            <button
              className={`${
                isPending ? "animate-pulse text-zinc-500" : "text-zinc-300"
              } font-bold text-lg flex w-full items-center gap-2 px-8 py-2 rounded-2xl hover:bg-zinc-800 duration-300`}
              onClick={handleLogout}
              disabled={isPending}
            >
              <LogOut />
              <p className="hidden xl:block">
                {isPending ? "Logging out..." : "Logout"}
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
