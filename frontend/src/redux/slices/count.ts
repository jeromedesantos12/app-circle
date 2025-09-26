import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getCount } from "../../queries/follow";
import type { CountType } from "../../types";

export const fetchCount = createAsyncThunk(
  "thread/fetchCount",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getCount(id);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      throw err;
    }
  }
);

const countSlice = createSlice({
  name: "count",
  initialState: {
    data: null as CountType | null,
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    setCount: (state, action: PayloadAction<CountType>) => {
      state.data = action.payload;
    },
    clearCount: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCount.pending, (state) => {
        state.status = "loading";
        state.data = null;
        state.error = null;
      })
      .addCase(
        fetchCount.fulfilled,
        (state, action: PayloadAction<CountType>) => {
          state.data = action.payload;
          state.status = "succeeded";
        }
      )
      .addCase(fetchCount.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || (action.error.message as string);
      });
  },
});

export const { setCount, clearCount } = countSlice.actions;
export default countSlice.reducer;
