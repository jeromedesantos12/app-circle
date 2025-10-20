import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Loading } from "../components/atoms";
import { useNavigate, Outlet } from "react-router-dom";
import { verifyToken } from "../redux/slices/token";
import type { AppDispatch, RootState } from "../redux/store";

export function PublicRoute() {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { status, data } = useSelector((state: RootState) => state.token);

  useEffect(() => {
    if (status === "idle") {
      dispatch(verifyToken());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (status === "succeeded" && data) {
      navigate("/");
    }
  }, [status, data, navigate]);

  if (status === "loading" || status === "idle") {
    return <Loading>Auth checking...</Loading>;
  }

  if (status === "succeeded" && !data) {
    return <Outlet />;
  }
  return <Outlet />;
}
