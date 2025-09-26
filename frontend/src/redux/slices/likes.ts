import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const likesSlice = createSlice({
  name: "likes",
  initialState: {
    data: {} as Record<string, { count: number; isLiked: boolean }>,
  },
  reducers: {
    setLikes: (
      state,
      action: PayloadAction<{ threadId: string; count: number }>
    ) => {
      const { threadId, count } = action.payload;
      if (!state.data[threadId]) {
        state.data[threadId] = { count: 0, isLiked: false };
      }
      state.data[threadId].count = count;
    },
    setIsLiked: (
      state,
      action: PayloadAction<{ threadId: string; isLiked: boolean }>
    ) => {
      const { threadId, isLiked } = action.payload;
      if (!state.data[threadId]) {
        state.data[threadId] = { count: 0, isLiked: false };
      }
      state.data[threadId].isLiked = isLiked;
    },
  },
});

export const { setLikes, setIsLiked } = likesSlice.actions;
export default likesSlice.reducer;
