import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFollowing, removeFollowing } from "../../redux/slices/following";
import { fetchFollowers } from "../../redux/slices/followers";
import { Header } from "../atoms";
import { Following, Followers } from "../molecules";
import { io } from "socket.io-client";
import { fetchUserById } from "@/redux/slices/userById";
import { addFollows } from "@/redux/slices/follows";
import type { FollowType } from "@/types";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchCount } from "@/redux/slices/count";
import { fetchThreads } from "@/redux/slices/threads";

const socketURL: string = import.meta.env.VITE_SOCKET_URL;

export function ListFollows() {
  const { data } = useSelector((state: RootState) => state.token);
  const { data: user } = useSelector((state: RootState) => state.userById);
  const dispatch: AppDispatch = useDispatch();
  const [follows, setFollows] = useState(false);

  useEffect(() => {
    if (!data?.id) return;
    dispatch(fetchUserById(data.id));
    dispatch(fetchFollowing(data.id));
    dispatch(fetchFollowers(data.id));
  }, [dispatch, data?.id]);

  useEffect(() => {
    const socket = io(socketURL, {
      withCredentials: true,
    });
    socket.on("updateUser", () => {
      if (!user?.id) return;
      dispatch(fetchFollowing(user?.id));
      dispatch(fetchFollowers(user?.id));
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
      <div className="sticky top-0">
        <Header>Follows</Header>
        <ul className="flex justify-around gap-5 bg-zinc-900 p-5 border-b-1 border-zinc-700">
          <button
            onClick={() => setFollows(false)}
            className={`text-zinc-300 font-bold  py-2 w-full max-w-50 border-b-3 cursor-pointer ${
              follows ? "border-transparent" : "border-[#04A51E]"
            }`}
          >
            Followers
          </button>
          <button
            onClick={() => setFollows(true)}
            className={`text-zinc-300 font-bold py-2 w-full max-w-50 border-b-3 cursor-pointer ${
              follows ? "border-[#04A51E]" : "border-transparent"
            }`}
          >
            Following
          </button>
        </ul>
      </div>
      <Followers hidden={follows} />
      <Following hidden={!follows} />
    </div>
  );
}
