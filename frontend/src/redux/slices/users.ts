import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getUsers } from "../../queries/user";
import type { UserType } from "../../types";

export const fetchUsers = createAsyncThunk(
  "thread/fetchUsers",
  async (search: string, { rejectWithValue }) => {
    try {
      return await getUsers(search);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      throw err;
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    data: [] as UserType[],
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    addUsers: (state, action: PayloadAction<UserType>) => {
      state.data.unshift(action.payload);
    },
    removeUsers: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.data = [];
        state.error = null;
      })
      .addCase(
        fetchUsers.fulfilled,
        (state, action: PayloadAction<UserType[]>) => {
          state.data = action.payload;
          state.status = "succeeded";
        }
      )
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || (action.error.message as string);
      });
  },
});

export const { addUsers, removeUsers } = usersSlice.actions;
export default usersSlice.reducer;
