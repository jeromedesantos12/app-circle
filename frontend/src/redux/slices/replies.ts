import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getReplies } from "../../queries/reply";
import type { ReplyType } from "../../types";

export const fetchReplies = createAsyncThunk(
  "thread/fetchReplies",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getReplies(id);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      throw err;
    }
  }
);

const repliesSlice = createSlice({
  name: "replies",
  initialState: {
    data: [] as ReplyType[],
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    addReplies: (state, action: PayloadAction<ReplyType>) => {
      state.data.unshift(action.payload);
    },
    truncateReplies: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((r) => r.thread_id !== action.payload);
    },
    removeReplies: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((r) => r.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReplies.pending, (state) => {
        state.status = "loading";
        state.data = [];
        state.error = null;
      })
      .addCase(
        fetchReplies.fulfilled,
        (state, action: PayloadAction<ReplyType[]>) => {
          state.data = action.payload;
          state.status = "succeeded";
        }
      )
      .addCase(fetchReplies.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || (action.error.message as string);
      });
  },
});

export const { addReplies, removeReplies, truncateReplies } =
  repliesSlice.actions;
export default repliesSlice.reducer;
