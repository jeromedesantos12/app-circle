import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Thread, ThreadAdd, ThreadInput } from "../molecules";
import { Alert, Header } from "../atoms";
import {
  removeThreads,
  addThreads,
  fetchThreads,
  updateRepliesCount,
} from "../../redux/slices/threads";
import type { AppDispatch, RootState } from "../../redux/store";
import type { ThreadType, ReplyType } from "../../types";

const socketURL: string = import.meta.env.VITE_SOCKET_URL;

export function Threads() {
  const [hide, setHide] = useState(false);
  const {
    data: threads,
    status: statusThreads,
    error: errorThreads,
  } = useSelector((state: RootState) => state.threads);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchThreads());
    const socket = io(socketURL, {
      withCredentials: true,
    });
    socket.on("updateUser", () => {
      dispatch(fetchThreads());
    });
    socket.on("newThread", (newThread: ThreadType) => {
      dispatch(addThreads(newThread));
    });
    socket.on("deleteThread", ({ id }: { id: string }) => {
      dispatch(removeThreads(id));
    });
    socket.on(
      "newReply",
      (payload: ReplyType & { thread_id: string; totalReplies: number }) => {
        dispatch(
          updateRepliesCount({
            threadId: payload.thread_id,
            count: payload.totalReplies,
          })
        );
      }
    );
    socket.on(
      "deleteReply",
      (payload: { id: string; thread_id: string; totalReplies: number }) => {
        dispatch(
          updateRepliesCount({
            threadId: payload.thread_id,
            count: payload.totalReplies,
          })
        );
      }
    );
    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  return (
    <div className="flex flex-col w-full max-w-2xl">
      <ThreadInput hide={hide} setHide={setHide} />
      <div className="sticky top-0">
        <Header>Home</Header>
        <ThreadAdd
          placeholder="What is happening?!"
          disabled={true}
          onClick={() => setHide(!hide)}
        />
      </div>
      {statusThreads === "failed" && (
        <div className="py-5">
          <Alert variant="danger">{errorThreads}</Alert>
        </div>
      )}
      {statusThreads === "loading" && (
        <Thread
          id={"00"}
          full_name={"Loading.."}
          username={".."}
          age={".."}
          content={".."}
          pending={true}
        />
      )}
      {threads &&
        threads.map((thread: ThreadType) => (
          <Thread key={thread.id} {...thread} />
        ))}
    </div>
  );
}
