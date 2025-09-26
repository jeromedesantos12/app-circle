import { Heart, MessageSquareText } from "lucide-react";
import { useEffect, type MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { Alert, ImgProfile } from "../atoms";
import { ButtonTrash } from "../atoms";
import { likesKeys, postLike } from "../../queries/like";
import { deleteThread, threadsKeys } from "../../queries/thread";
import type { AppDispatch, RootState } from "../../redux/store";
import { setIsLiked, setLikes } from "../../redux/slices/likes";

const socketURL: string = import.meta.env.VITE_SOCKET_URL;

export function Thread({
  id,
  photo_profile,
  full_name,
  username,
  age,
  content,
  image,
  isLiked,
  number_of_likes,
  number_of_replies,
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
  isLiked?: boolean;
  number_of_likes?: number | null;
  number_of_replies?: number | null;
  created_by?: string;
  pending?: boolean;
}) {
  const navigate = useNavigate();
  const {
    mutate: mutateLike,
    isPending: isPendingLike,
    isError: isErrorLike,
    error: errorLike,
  } = useMutation({
    mutationKey: likesKeys.all,
    mutationFn: () => postLike(id as string),
  });
  const {
    mutate: mutateDel,
    isPending: isPendingDel,
    isError: isErrorDel,
    error: errorDel,
  } = useMutation<void, Error, string>({
    mutationKey: threadsKeys.all,
    mutationFn: (id: string) => deleteThread(id),
  });
  const baseURL: string = import.meta.env.VITE_BASE_URL;
  const userUrl = photo_profile && `${baseURL}/uploads/${photo_profile}`;
  const threadUrl = image ? `${baseURL}/uploads/${image}` : "";
  const { data } = useSelector((state: RootState) => state.token);
  const likeData = useSelector((state: RootState) => state.likes.data[id]) ?? {
    count: number_of_likes,
    isLiked,
  };
  const likesCount = likeData.count;
  const likes = likeData.isLiked;
  const dispatch: AppDispatch = useDispatch();

  function handleDelete(id: string) {
    mutateDel(id);
  }

  function handleToggleLike(e: MouseEvent<SVGSVGElement>) {
    e.stopPropagation();
    mutateLike();
  }

  function handleCardClick() {
    if (!pending) {
      navigate(`/thread/${id}`);
    }
  }

  useEffect(() => {
    if (!number_of_likes) return;
    dispatch(setLikes({ threadId: id, count: number_of_likes }));
    dispatch(setIsLiked({ threadId: id, isLiked: isLiked ?? false }));
  }, [dispatch, id, number_of_likes, isLiked]);

  useEffect(() => {
    const socket = io(socketURL, {
      withCredentials: true,
    });
    socket.on(
      "newLike",
      (payload: { thread_id: string; count: number; user_id: string }) => {
        if (payload.thread_id !== id) return;
        dispatch(
          setLikes({ threadId: payload.thread_id, count: payload.count })
        );
        if (payload.user_id === data?.id) {
          dispatch(setIsLiked({ threadId: payload.thread_id, isLiked: true }));
        }
      }
    );
    socket.on(
      "deleteLike",
      (payload: { thread_id: string; count: number; user_id: string }) => {
        if (payload.thread_id !== id) return;
        dispatch(
          setLikes({ threadId: payload.thread_id, count: payload.count })
        );
        if (payload.user_id === data?.id) {
          dispatch(setIsLiked({ threadId: payload.thread_id, isLiked: false }));
        }
      }
    );
    return () => {
      socket.disconnect();
    };
  }, [data?.id, dispatch, id]);

  return (
    <div
      onClick={handleCardClick}
      className={`border-b-1 p-5 border-zinc-700 shadow-lg bg-zinc-900 flex gap-5 cursor-pointer ${
        pending && "brightness-50 animate-pulse"
      }`}
    >
      {isErrorDel && (
        <Alert variant="danger">
          {isAxiosError(errorDel) &&
            errorDel.response &&
            errorDel.response.data.message}
        </Alert>
      )}
      {isErrorLike && (
        <Alert variant="danger">
          {isAxiosError(errorLike) &&
            errorLike.response &&
            errorLike.response.data.message}
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
              to={threadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              <img
                src={threadUrl}
                alt={`Image of ${threadUrl}`}
                className="w-full rounded-xl"
              />
            </Link>
          )}
        </div>
        <div className="flex gap-5">
          <button className="flex items-center gap-2" disabled={isPendingLike}>
            <Heart
              className={`cursor-pointer text-zinc-500 ${
                likes && "fill-zinc-500"
              }
              `}
              onClick={handleToggleLike}
            />
            <p className="text-sm text-zinc-500">{likesCount}</p>
          </button>
          <div className="flex items-center gap-2">
            <MessageSquareText className="text-zinc-500" />
            <p className="text-sm text-zinc-500">{number_of_replies} Replies</p>
          </div>
        </div>
      </div>
      {data && data.id === created_by && (
        <ButtonTrash
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(id);
          }}
          disabled={isPendingDel}
        />
      )}
    </div>
  );
}
