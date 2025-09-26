import { api } from "../services/api";

export const likesKeys = {
  all: ["like"],
};

export async function postLike(threadId: string) {
  const response = await api.post(`/thread/${threadId}/like`);
  return response.data.data;
}

export async function deleteLike(id: string) {
  const response = await api.delete(`/like/${id}`);
  return response.data.data;
}
