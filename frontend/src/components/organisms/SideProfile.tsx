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
  const { status: statusFollows } = useSelector(
    (state: RootState) => state.follows
  );
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!data?.id) return;

    if (statusUser === "idle") {
      dispatch(fetchUserById(data.id));
    }
    if (statusFollows === "idle") {
      dispatch(fetchFollows(data.id));
    }
    if (statusCount === "idle") {
      dispatch(fetchCount(data.id));
    }
  }, [dispatch, data?.id, statusUser, statusFollows, statusCount]);

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
        if (user?.id === payload.user_id) {
          dispatch(fetchCount(payload.user_id));
          dispatch(addFollowing(payload.followingData));
          dispatch(removeFollows(payload.targetUser));
        }
      }
    );
    socket.on(
      "deleteFollowing",
      (payload: { user_id: string; targetUser: string }) => {
        if (user?.id === payload.user_id) {
          dispatch(fetchCount(payload.user_id));
          dispatch(fetchFollows(payload.user_id));
        }
      }
    );
    return () => {
      socket.disconnect();
    };
  }, [dispatch, user?.id]);

  return (
    <div className="hidden lg:block w-80 flex-shrink-0">
      <div className="sticky top-0 flex w-full flex-col gap-5 items-center">
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
