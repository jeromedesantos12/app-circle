import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getFollowers } from "../../queries/follow";
import type { FollowType } from "../../types";

export const fetchFollowers = createAsyncThunk(
  "thread/fetchFollowers",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getFollowers(id);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      throw err;
    }
  }
);

const followersSlice = createSlice({
  name: "followers",
  initialState: {
    data: [] as FollowType[],
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    addFollowers: (state, action: PayloadAction<FollowType>) => {
      state.data.unshift(action.payload);
    },
    removeFollowers: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollowers.pending, (state) => {
        state.status = "loading";
        state.data = [];
        state.error = null;
      })
      .addCase(
        fetchFollowers.fulfilled,
        (state, action: PayloadAction<FollowType[]>) => {
          state.data = action.payload;
          state.status = "succeeded";
        }
      )
      .addCase(fetchFollowers.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || (action.error.message as string);
      });
  },
});

export const { addFollowers, removeFollowers } = followersSlice.actions;
export default followersSlice.reducer;
