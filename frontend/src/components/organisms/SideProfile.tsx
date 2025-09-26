import { io } from "socket.io-client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { FollowType, UserType } from "../../types";
import type { AppDispatch, RootState } from "../../redux/store";
import { fetchUserById, setUser } from "../../redux/slices/userById";
import { fetchFollows, removeFollows } from "../../redux/slices/follows";
import { fetchCount } from "../../redux/slices/count";
import { addFollowing } from "../../redux/slices/following";
import { People, Profile } from "../molecules";
import { Alert } from "../atoms";
import { fetchThreads } from "@/redux/slices/threads";

const socketURL: string = import.meta.env.VITE_SOCKET_URL;

export function SideProfile() {
  const { data } = useSelector((state: RootState) => state.token);
  const {
    data: user,
    status: statusUser,
    error: errorUser,
  } = useSelector((state: RootState) => state.userById);
  const {
    data: count,
    status: statusCount,
    error: errorCount,
  } = useSelector((state: RootState) => state.count);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!data?.id) return;
    dispatch(fetchUserById(data.id));
    dispatch(fetchFollows(data.id));
    dispatch(fetchCount(data.id));
  }, [dispatch, data?.id]);

  useEffect(() => {
    const socket = io(socketURL, {
      withCredentials: true,
    });
    socket.on("updateUser", (updateUser: UserType) => {
      if (!user?.id) return;
      dispatch(fetchFollows(user.id));
      if (user?.id !== updateUser.id) return;
      dispatch(setUser(updateUser));
    });
    socket.on(
      "postFollowing",
      (payload: {
        user_id: string;
        followingData: FollowType;
        targetUser: string;
      }) => {
        dispatch(fetchThreads());
        if (user?.id !== payload.user_id) return;
        dispatch(fetchCount(payload.user_id));
        dispatch(addFollowing(payload.followingData));
        dispatch(removeFollows(payload.targetUser));
      }
    );
    return () => {
      socket.disconnect();
    };
  }, [dispatch, user?.id]);

  return (
    <div className="w-full max-w-md">
      <div className="fixed flex w-full max-w-sm flex-col gap-5 items-center">
        {statusUser && statusCount === "failed" && (
          <div className="py-5">
            <Alert variant="danger">{errorUser}</Alert>
            <Alert variant="danger">{errorCount}</Alert>
          </div>
        )}
        {statusUser && statusCount === "loading" && (
          <Profile
            id={""}
            full_name={"Loading.."}
            username={".."}
            email={".."}
            bio={".."}
            pending={true}
          />
        )}
        {user && count && (
          <Profile
            id={user.id}
            username={user.username}
            full_name={user.full_name}
            email={user.email}
            photo_profile={user.photo_profile}
            totalFollowing={count.totalFollowing}
            totalFollowers={count.totalFollowers}
            bio={user.bio}
          />
        )}
        {user && <People id={user.id} />}
      </div>
    </div>
  );
}
