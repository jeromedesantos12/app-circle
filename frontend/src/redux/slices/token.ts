import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getVerify } from "../../queries/user";
import type { TokenType } from "../../types";

export const verifyToken = createAsyncThunk(
  "token/verifyToken",
  async (_, { rejectWithValue }) => {
    try {
      return await getVerify();
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      throw err;
    }
  }
);

const tokenSlice = createSlice({
  name: "token",
  initialState: {
    data: null as TokenType | null,
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    setToken: (
      state,
      action: PayloadAction<{
        data: TokenType | null;
        status: string;
        error: string | null;
      }>
    ) => {
      state.data = action.payload.data;
      state.status = action.payload.status;
      state.error = action.payload.error;
    },
    clearToken: (state) => {
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyToken.pending, (state) => {
        state.status = "loading";
        state.data = null;
        state.error = null;
      })
      .addCase(
        verifyToken.fulfilled,
        (state, action: PayloadAction<TokenType>) => {
          state.data = action.payload;
          state.status = "succeeded";
        }
      )
      .addCase(verifyToken.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || (action.error.message as string);
      });
  },
});

export const { setToken, clearToken } = tokenSlice.actions;
export default tokenSlice.reducer;
