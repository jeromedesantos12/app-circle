import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Loading } from "../components/atoms";
import { verifyToken } from "../redux/slices/token";
import type { AppDispatch, RootState } from "../redux/store";

export function PrivateRoute() {
  const { status, data } = useSelector((state: RootState) => state.token);
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (!data && status !== "loading") dispatch(verifyToken());
  }, [dispatch, data, status]);

  if (status === "loading") return <Loading>Auth checking...</Loading>;
  if (status === "failed") return <Navigate to="/login" replace />;

  return <Outlet />;
}
