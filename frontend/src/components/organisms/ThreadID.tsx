import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MoveLeft } from "lucide-react";
import { io } from "socket.io-client";
import { Reply, Thread, ThreadAdd } from "../molecules";
import { Alert, Header } from "../atoms";
import {
  fetchThreadById,
  removeThread,
  setRepliesCount,
} from "../../redux/slices/threadById";
import {
  fetchReplies,
  addReplies,
  removeReplies,
  truncateReplies,
} from "../../redux/slices/replies";
import type { AppDispatch, RootState } from "../../redux/store";
import type { ReplyType } from "../../types";

const socketURL: string = import.meta.env.VITE_SOCKET_URL;

export function ThreadID({ id }: { id: string }) {
  const navigate = useNavigate();
  const {
    data: threadById,
    status: statusThreadById,
    error: errorThreadById,
  } = useSelector((state: RootState) => state.threadById);
  const {
    data: replies,
    status: statusReplies,
    error: errorReplies,
  } = useSelector((state: RootState) => state.replies);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchThreadById(id));
    dispatch(fetchReplies(id));
  }, [dispatch, id]);

  useEffect(() => {
    const socket = io(socketURL, {
      withCredentials: true,
    });
    socket.on("updateUser", () => {
      dispatch(fetchThreadById(id));
      dispatch(fetchReplies(id));
    });
    socket.on("deleteThread", ({ id: deletedThreadId }: { id: string }) => {
      if (deletedThreadId !== id) return;
      dispatch(removeThread());
      dispatch(truncateReplies(deletedThreadId));
      navigate("/");
    });
    socket.on(
      "newReply",
      (payload: ReplyType & { thread_id: string; totalReplies: number }) => {
        if (payload.thread_id !== id) return;
        dispatch(addReplies(payload));
        dispatch(
          setRepliesCount({
            threadId: payload.thread_id,
            count: payload.totalReplies,
          })
        );
      }
    );
    socket.on(
      "deleteReply",
      (payload: { id: string; thread_id: string; totalReplies: number }) => {
        if (payload.thread_id !== id) return;
        dispatch(removeReplies(payload.id));
        dispatch(
          setRepliesCount({
            threadId: payload.thread_id,
            count: payload.totalReplies,
          })
        );
      }
    );
    return () => {
      socket.disconnect();
    };
  }, [dispatch, id, navigate]);

  return (
    <div className="flex flex-col w-full max-w-2xl">
      <div className="sticky top-0">
        <Header onClick={() => navigate("/")}>
          <MoveLeft size="30" />
          <p>Status</p>
        </Header>
      </div>
      {statusThreadById === "failed" && (
        <div className="py-5">
          <Alert variant="danger">{errorThreadById}</Alert>
        </div>
      )}
      {statusThreadById === "loading" && (
        <Thread
          id={"00"}
          full_name={"Loading.."}
          username={".."}
          age={".."}
          content={".."}
          pending={true}
        />
      )}
      {threadById && (
        <Thread
          id={threadById.id}
          photo_profile={threadById.photo_profile}
          full_name={threadById.full_name}
          username={threadById.username}
          age={threadById.age}
          content={threadById.content}
          image={threadById.image}
          isLiked={threadById.isLiked}
          number_of_likes={threadById.number_of_likes}
          number_of_replies={threadById.number_of_replies}
          created_by={threadById.created_by}
        />
      )}
      {threadById && (
        <ThreadAdd threadId={threadById.id} placeholder="Type your reply!" />
      )}
      {statusReplies === "failed" && (
        <div className="py-5">
          <Alert variant="danger">{errorReplies}</Alert>
        </div>
      )}
      {statusReplies === "loading" && (
        <Reply
          id={""}
          full_name={"Loading.."}
          username={".."}
          age={".."}
          content={".."}
          pending={true}
        />
      )}
      {replies &&
        replies.map((reply: ReplyType) => <Reply key={reply.id} {...reply} />)}
    </div>
  );
}
