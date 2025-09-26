import type { FollowType } from "@/types";
import { Follow } from "../atoms/Follow";
import { useSelector } from "react-redux";
import { Alert } from "../atoms";
import type { RootState } from "../../redux/store";

export function Following({ hidden = false }: { hidden?: boolean }) {
  const {
    data: following,
    status: statusFollowing,
    error: errorFollowing,
  } = useSelector((state: RootState) => state.following);

  return (
    <div className="bg-zinc-950 flex flex-col gap-5" hidden={hidden}>
      <div className="p-5 shadow-lg bg-zinc-900 flex flex-col gap-5">
        {statusFollowing === "failed" && (
          <div className="py-5">
            <Alert variant="danger">{errorFollowing}</Alert>
          </div>
        )}
        {statusFollowing === "loading" && (
          <Follow
            id={""}
            full_name={"Loading.."}
            username={".."}
            isActive={true}
            pending={true}
          />
        )}
        {following &&
          following.map((follow: FollowType) => (
            <Follow key={follow.id} {...follow} isActive={follow.isFollowed} />
          ))}
      </div>
    </div>
  );
}
