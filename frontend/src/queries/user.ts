import { api } from "../services/api";

export const usersKeys = {
  all: ["users"],
};

export async function getVerify() {
  const response = await api.get("/verify");
  return response.data.data;
}

export async function loginUser(input: {
  emailOrUsername: string;
  password: string;
}) {
  const response = await api.post("/login", input);
  return response.data.data;
}

export async function registerUser(input: {
  full_name: string;
  email: string;
  password: string;
}) {
  const response = await api.post("/register", input);
  return response.data.data;
}

export async function forgotUser(input: { email: string }) {
  const response = await api.post("/forgot", input);
  return response.data.data;
}

export async function logoutUser() {
  const response = await api.post("/logout");
  return response.data.data;
}

export async function resetUser(id: string, input: { password: string }) {
  const response = await api.put(`/reset/${id}`, input);
  return response.data.data;
}

export async function getUsers(search: string) {
  const response = await api.get("/user", {
    params: {
      search,
    },
  });
  return response.data.data;
}

export async function getUserById(id: string) {
  const response = await api.get(`/user/${id}`);
  return response.data.data;
}

export async function updateUser(id: string, input: FormData) {
  const response = await api.put(`/user/${id}`, input, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
}
