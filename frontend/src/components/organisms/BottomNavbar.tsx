import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../atoms";
import { Heart, House, LogOut, UserRoundSearch } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearToken } from "../../redux/slices/token";
import { useMutation } from "@tanstack/react-query";
import { logoutUser, usersKeys } from "../../queries/user";
import { isAxiosError } from "axios";

export function BottomNavbar() {
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
    <div className="fixed w-full flex md:hidden justify-center bottom-0 bg-zinc-950">
      {isError && (
        <Alert variant="danger">
          {isAxiosError(error) && error.response
            ? error.response.data.message
            : error.message}
        </Alert>
      )}
      <div className="flex w-fit p-4 gap-10">
        <Link
          to="/"
          className={`text-zinc-300 font-bold text-lg flex items-center py-2 rounded-2xl hover:bg-zinc-800 duration-300`}
        >
          <House />
        </Link>
        <Link
          to="/search"
          className="text-zinc-300 font-bold text-lg flex items-center py-2 rounded-2xl hover:bg-zinc-800 duration-300"
        >
          <UserRoundSearch />
        </Link>
        <Link
          to="/follows"
          className="text-zinc-300 font-bold text-lg flex items-center py-2 rounded-2xl hover:bg-zinc-800 duration-300"
        >
          <Heart />
        </Link>
        {/* <Link
                to="/"
                className="text-zinc-300 font-bold text-lg flex items-center py-2 rounded-2xl hover:bg-zinc-800 duration-300"
              >
                <CircleUser />
              
              </Link> */}
        <button
          className={`${
            isPending ? "animate-pulse text-zinc-500" : "text-zinc-300"
          } font-bold text-lg flex w-full items-center py-2 rounded-2xl hover:bg-zinc-800 duration-300`}
          onClick={handleLogout}
          disabled={isPending}
        >
          <LogOut />
        </button>
      </div>
    </div>
  );
}
