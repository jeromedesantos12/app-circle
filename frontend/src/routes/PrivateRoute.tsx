import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Loading } from "../components/atoms";
import { verifyToken } from "../redux/slices/token";
import type { AppDispatch, RootState } from "../redux/store";

export function PrivateRoute() {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { data, status } = useSelector((state: RootState) => state.token);

  useEffect(() => {
    if (status === "idle") {
      dispatch(verifyToken());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (status === "succeeded" && !data) {
      navigate("/login");
    }
    if (status === "failed") {
      navigate("/login");
    }
  }, [status, data, navigate]);

  if (status === "loading" || status === "idle") {
    return <Loading>Auth checking...</Loading>;
  }
  if (status === "succeeded" && data) {
    return <Outlet />;
  }
  return null;
}
