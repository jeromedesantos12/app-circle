import { api } from "../services/api";

export const followsKeys = {
  all: ["follows"],
};

export async function getCount(userId: string) {
  const response = await api.get(`/count/${userId}`);
  return response.data.data;
}

export async function getFollows(userId: string) {
  const response = await api.get(`/follow/${userId}`);
  return response.data.data;
}

export async function getFollowers(userId: string) {
  const response = await api.get(`/followers/${userId}`);
  return response.data.data;
}

export async function getFollowing(userId: string) {
  const response = await api.get(`/following/${userId}`);
  return response.data.data;
}

export async function postFollowing(userId: string) {
  const response = await api.post(`/follow/${userId}`);
  return response.data.data;
}
