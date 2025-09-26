import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useMutation } from "@tanstack/react-query";
import { followsKeys, postFollowing } from "../../queries/follow";
import { Alert, ButtonProfile, ImgProfile } from "../atoms";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";

export function Follow({
  id,
  photo_profile,
  full_name,
  username,
  bio,
  usr,
  isActive,
  pending = false,
}: {
  id: string;
  photo_profile?: string;
  full_name?: string;
  username?: string;
  bio?: string;
  usr?: boolean;
  isActive?: boolean;
  pending?: boolean;
}) {
  const baseURL: string = import.meta.env.VITE_BASE_URL;
  const userUrl = photo_profile && `${baseURL}/uploads/${photo_profile}`;
  const { data } = useSelector((state: RootState) => state.token);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState(false);

  const { mutate, isPending, isError, error } = useMutation({
    mutationKey: followsKeys.all,
    mutationFn: () => postFollowing(id as string),
    onSuccess: () => {
      setActive(!active);
    },
  });

  function handleFollow() {
    mutate();
  }

  useEffect(() => {
    if (isActive) setActive(!active);
    if (data?.id === id) setHidden(!hidden);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex justify-between items-center gap-5">
      {isError && (
        <Alert variant="danger">
          {isAxiosError(error) && error.response && error.response.data.message}
        </Alert>
      )}
      <div className="flex gap-3 items-center">
        <ImgProfile src={userUrl} className="w-10 h-10" />
        <div className="flex flex-col gap-1">
          <div className="flex flex-col">
            <h1 className="text-zinc-300 font-bold">{full_name}</h1>
            <p className="text-zinc-500">@{username}</p>
          </div>
          {usr && <p className="text-zinc-300">{bio}</p>}
        </div>
      </div>
      <ButtonProfile
        active={active}
        hidden={hidden}
        loading={pending || isPending}
        onClick={handleFollow}
      >
        {active ? "Unfollow" : "Follow"}
      </ButtonProfile>
    </div>
  );
}
