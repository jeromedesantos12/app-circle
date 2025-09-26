import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { io } from "socket.io-client";
import { Alert, Header } from "../atoms";
import { useDebounce } from "../../hooks/useDebounce";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../redux/slices/users";
import { Follow } from "../atoms/Follow";
import { fetchCount } from "../../redux/slices/count";
import { removeFollowing } from "../../redux/slices/following";
import { addFollows } from "../../redux/slices/follows";
import { fetchUserById } from "../../redux/slices/userById";
import type { AppDispatch, RootState } from "../../redux/store";
import type { FollowType, UserType } from "../../types";
import { fetchThreads } from "@/redux/slices/threads";

const socketURL: string = import.meta.env.VITE_SOCKET_URL;

export function ListUsers() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce<string>(search, 500);
  const { data } = useSelector((state: RootState) => state.token);
  const { data: user } = useSelector((state: RootState) => state.userById);
  const {
    data: users,
    status: statusUsers,
    error: errorUsers,
  } = useSelector((state: RootState) => state.users);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers(debouncedSearch));
  }, [dispatch, debouncedSearch]);

  useEffect(() => {
    if (data?.id) dispatch(fetchUserById(data.id));
  }, [dispatch, data?.id]);

  useEffect(() => {
    const socket = io(socketURL, {
      withCredentials: true,
    });
    socket.on("updateUser", (updateUser: UserType) => {
      if (user?.id !== updateUser.id) return;
      dispatch(fetchUsers(""));
    });
    socket.on(
      "deleteFollowing",
      (payload: {
        user_id: string;
        followingData: FollowType;
        targetUser: string;
      }) => {
        dispatch(fetchThreads());
        if (user?.id !== payload.user_id) return;
        dispatch(fetchCount(payload.user_id));
        dispatch(removeFollowing(payload.targetUser));
        dispatch(addFollows(payload.followingData));
      }
    );
    return () => {
      socket.disconnect();
    };
  }, [dispatch, user?.id]);

  return (
    <div className="flex flex-col w-full max-w-2xl">
      <div className="sticky top-0 w-full max-w-2xl">
        <Header>
          <form action="submit" className="flex items-center w-full">
            <Search className="text-zinc-300 absolute left-8" />
            <input
              type="text"
              placeholder="Search name or username.."
              className="bg-zinc-800 rounded-2xl pl-12 pr-20 py-3 font-normal text-sm w-full"
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </form>
        </Header>
      </div>
      <div className="p-5 shadow-lg bg-zinc-900 flex flex-col gap-5">
        {statusUsers === "failed" && (
          <div className="py-5">
            <Alert variant="danger">{errorUsers}</Alert>
          </div>
        )}
        {statusUsers === "loading" && (
          <Follow
            id={""}
            full_name={"Loading.."}
            username={".."}
            isActive={true}
            pending={true}
          />
        )}
        {users.length === 0 && (
          <div className="flex flex-col items-center py-10">
            <p className="text-zinc-300 font-bold text-xl">User not Found</p>
          </div>
        )}
        {users &&
          users.map((user: UserType) => (
            <Follow
              key={user.id}
              {...user}
              isActive={user.isFollowed}
              usr={true}
            />
          ))}
      </div>
    </div>
  );
}
