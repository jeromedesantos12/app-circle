import { configureStore } from "@reduxjs/toolkit";
import {
  countReducer,
  tokenReducer,
  usersReducer,
  likesReducer,
  threadsReducer,
  followsReducer,
  followersReducer,
  followingReducer,
  repliesReducer,
  userByIdReducer,
  threadByIdReducer,
} from "./slices";

export const store = configureStore({
  reducer: {
    count: countReducer,
    token: tokenReducer,
    users: usersReducer,
    userById: userByIdReducer,
    likes: likesReducer,
    replies: repliesReducer,
    follows: followsReducer,
    followers: followersReducer,
    following: followingReducer,
    threads: threadsReducer,
    threadById: threadByIdReducer,
  },
});
console.log("STORE INIT: ", store.getState());

store.subscribe(() => {
  console.log("STORE CHANGE: ", store.getState());
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
