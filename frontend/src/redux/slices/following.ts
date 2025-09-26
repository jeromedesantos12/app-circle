import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getFollowing } from "../../queries/follow";
import type { FollowType } from "../../types";

export const fetchFollowing = createAsyncThunk(
  "thread/fetchFollowing",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getFollowing(id);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      throw err;
    }
  }
);

const followingSlice = createSlice({
  name: "following",
  initialState: {
    data: [] as FollowType[],
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    addFollowing: (state, action: PayloadAction<FollowType>) => {
      state.data.unshift(action.payload);
    },
    removeFollowing: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowing.pending, (state) => {
        state.status = "loading";
        state.data = [];
        state.error = null;
      })
      .addCase(
        fetchFollowing.fulfilled,
        (state, action: PayloadAction<FollowType[]>) => {
          state.data = action.payload;
          state.status = "succeeded";
        }
      )
      .addCase(fetchFollowing.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || (action.error.message as string);
      });
  },
});

export const { addFollowing, removeFollowing } = followingSlice.actions;
export default followingSlice.reducer;
