import { api } from "../services/api";

export const repliesKeys = {
  all: ["replies"],
};

export async function getReplies(threadId: string) {
  const response = await api.get(`/thread/${threadId}/reply`);
  return response.data.data;
}

export async function postReplies(input: FormData, threadId: string) {
  const response = await api.post(`/thread/${threadId}/reply`, input, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}

export async function deleteReply(id: string) {
  const response = await api.delete(`/reply/${id}`);
  return response.data.data;
}
