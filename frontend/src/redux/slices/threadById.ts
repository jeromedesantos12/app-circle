import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getThreadById } from "../../queries/thread";
import type { ThreadType } from "../../types";

export const fetchThreadById = createAsyncThunk(
  "thread/fetchThreadById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getThreadById(id);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      throw err;
    }
  }
);

const threadByIdSlice = createSlice({
  name: "threadById",
  initialState: {
    data: null as ThreadType | null,
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    removeThread: (state) => {
      state.data = null;
    },
    setRepliesCount: (
      state,
      action: PayloadAction<{ threadId: string; count: number }>
    ) => {
      if (state.data && state.data.id === action.payload.threadId) {
        state.data.number_of_replies = action.payload.count;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchThreadById.pending, (state) => {
        state.status = "loading";
        state.data = null;
        state.error = null;
      })
      .addCase(
        fetchThreadById.fulfilled,
        (state, action: PayloadAction<ThreadType>) => {
          state.data = action.payload;
          state.status = "succeeded";
        }
      )
      .addCase(fetchThreadById.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || (action.error.message as string);
      });
  },
});

export const { removeThread, setRepliesCount } = threadByIdSlice.actions;
export default threadByIdSlice.reducer;
