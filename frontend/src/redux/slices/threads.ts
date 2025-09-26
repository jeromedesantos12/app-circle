import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getThreads } from "../../queries/thread";
import type { ThreadType } from "../../types";

export const fetchThreads = createAsyncThunk(
  "thread/fetchThreads",
  async (_, { rejectWithValue }) => {
    try {
      return await getThreads();
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      throw err;
    }
  }
);

const threadsSlice = createSlice({
  name: "threads",
  initialState: {
    data: [] as ThreadType[],
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    addThreads: (state, action: PayloadAction<ThreadType>) => {
      state.data.unshift(action.payload);
    },
    removeThreads: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter((t) => t.id !== action.payload);
    },
    updateRepliesCount: (
      state,
      action: PayloadAction<{ threadId: string; count: number }>
    ) => {
      state.data = state.data.map((thread) =>
        thread.id === action.payload.threadId
          ? { ...thread, number_of_replies: action.payload.count }
          : thread
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThreads.pending, (state) => {
        state.status = "loading";
        state.data = [];
        state.error = null;
      })
      .addCase(
        fetchThreads.fulfilled,
        (state, action: PayloadAction<ThreadType[]>) => {
          state.data = action.payload;
          state.status = "succeeded";
        }
      )
      .addCase(fetchThreads.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || (action.error.message as string);
      });
  },
});

export const { addThreads, removeThreads, updateRepliesCount } =
  threadsSlice.actions;
export default threadsSlice.reducer;
