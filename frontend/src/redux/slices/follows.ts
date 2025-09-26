import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getFollows } from "../../queries/follow";
import type { FollowType } from "../../types";

export const fetchFollows = createAsyncThunk(
  "thread/fetchFollows",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getFollows(id);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      throw err;
    }
  }
);

const followsSlice = createSlice({
  name: "follows",
  initialState: {
    data: [] as FollowType[],
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    addFollows: (state, action: PayloadAction<FollowType>) => {
      state.data.unshift(action.payload);
    },
    removeFollows: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((t) => t.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFollows.pending, (state) => {
        state.status = "loading";
        state.data = [];
        state.error = null;
      })
      .addCase(
        fetchFollows.fulfilled,
        (state, action: PayloadAction<FollowType[]>) => {
          state.data = action.payload;
          state.status = "succeeded";
        }
      )
      .addCase(fetchFollows.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || (action.error.message as string);
      });
  },
});

export const { addFollows, removeFollows } = followsSlice.actions;
export default followsSlice.reducer;
