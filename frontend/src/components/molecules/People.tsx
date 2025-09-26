import { Follow } from "../atoms/Follow";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { Alert } from "../atoms";
import type { FollowType } from "../../types";

export function People({ pending }: { id: string; pending?: boolean }) {
  const {
    data: follows,
    status: statusFollows,
    error: errorFollows,
  } = useSelector((state: RootState) => state.follows);

  return (
    <div
      className={`${
        pending && "brightness-50 animate-pulse"
      } bg-zinc-900 flex w-full flex-col rounded-2xl px-5 py-10 gap-5`}
      hidden={follows.length === 0}
    >
      <h1 className="text-zinc-300 font-bold text-xl">Suggested for you</h1>
      <div className="flex flex-col gap-5">
        {statusFollows === "failed" && (
          <div className="py-5">
            <Alert variant="danger">{errorFollows}</Alert>
          </div>
        )}
        {statusFollows === "loading" && (
          <Follow
            id={""}
            full_name={"Loading.."}
            username={".."}
            pending={true}
          />
        )}
        {follows &&
          follows.map((follow: FollowType) => (
            <Follow key={follow.id} {...follow} isActive={follow.isFollowed} />
          ))}
      </div>
    </div>
  );
}
