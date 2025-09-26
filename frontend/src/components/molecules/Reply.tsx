import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { deleteReply, repliesKeys } from "../../queries/reply";
import type { RootState } from "../../redux/store";
import { ButtonTrash, ImgProfile } from "../atoms";
import { isAxiosError } from "axios";
import { Alert } from "../atoms";

export function Reply({
  id,
  photo_profile,
  full_name,
  username,
  age,
  content,
  image,
  created_by,
  pending = false,
}: {
  id: string;
  photo_profile?: string | null;
  full_name?: string;
  username?: string | null;
  age?: string | null;
  content?: string | null;
  image?: string | null;
  created_by?: string;
  pending?: boolean;
}) {
  const baseURL: string = import.meta.env.VITE_BASE_URL;
  const userUrl = photo_profile && `${baseURL}/uploads/${photo_profile}`;
  const replyUrl = image ? `${baseURL}/uploads/${image}` : "";
  const { data } = useSelector((state: RootState) => state.userById);
  const { mutate, isPending, isError, error } = useMutation<
    void,
    Error,
    string
  >({
    mutationKey: repliesKeys.all,
    mutationFn: (id: string) => deleteReply(id),
  });

  function handleDelete(id: string) {
    mutate(id);
  }

  return (
    <div
      className={`pl-15 border-b-1 p-5 border-zinc-700 shadow-lg bg-zinc-900 flex gap-5 cursor-pointer ${
        pending && "brightness-50 animate-pulse"
      }`}
    >
      {isError && (
        <Alert variant="danger">
          {isAxiosError(error) && error.response && error.response.data.message}
        </Alert>
      )}
      <ImgProfile
        src={userUrl}
        alt={`Image of ${userUrl}`}
        className="w-10 h-10"
      />
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center gap-2">
          <div className="text-sm font-bold text-zinc-300">{full_name}</div>
          <div className="text-sm text-zinc-500">@{username}</div>
          <div className="text-sm text-zinc-500">●</div>
          <div className="text-sm text-zinc-500">{age}</div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-300 whitespace-pre-wrap">{content}</p>
          {image && (
            <Link
              to={replyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              <img
                src={replyUrl}
                alt={`Image of ${content}`}
                className="w-full rounded-xl"
              />
            </Link>
          )}
        </div>
      </div>
      {data && data.id === created_by && (
        <ButtonTrash
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(id);
          }}
          disabled={isPending}
        />
      )}
    </div>
  );
}
