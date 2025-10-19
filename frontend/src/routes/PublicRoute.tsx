import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Loading } from "../components/atoms";
import { Navigate, Outlet } from "react-router-dom";
import { verifyToken } from "../redux/slices/token";
import type { AppDispatch, RootState } from "../redux/store";

export function PublicRoute() {
  const { status, data } = useSelector((state: RootState) => state.token);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (status === "idle") dispatch(verifyToken());
  }, [dispatch, data, status]);

  if (status === "loading") return <Loading>Auth checking...</Loading>;
  if (status === "succeeded") return <Navigate to="/" replace />;
  return <Outlet />;
}
