import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { getUserById } from "../../queries/user";
import type { UserType } from "../../types";

export const fetchUserById = createAsyncThunk(
  "user/fetchUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      return await getUserById(id);
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        return rejectWithValue(err.response.data.message);
      }
      throw err;
    }
  }
);

const userByIdSlice = createSlice({
  name: "userById",
  initialState: {
    data: null as UserType | null,
    status: "idle",
    error: null as string | null,
  },
  reducers: {
    setUser: (state, action: PayloadAction<UserType>) => {
      state.data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.status = "loading";
        state.data = null;
        state.error = null;
      })
      .addCase(
        fetchUserById.fulfilled,
        (state, action: PayloadAction<UserType>) => {
          state.data = action.payload;
          state.status = "succeeded";
        }
      )
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as string) || (action.error.message as string);
      });
  },
});

export const { setUser } = userByIdSlice.actions;
export default userByIdSlice.reducer;
