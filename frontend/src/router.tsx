import { createBrowserRouter } from "react-router-dom";
import { PrivateRoute, PublicRoute } from "./routes";
import {
  Home,
  HomeID,
  Follows,
  Search,
  Register,
  Login,
  // Forgot,
  // Reset,
  NotFound,
} from "./pages";
import { Layout, LayoutAuth } from "./components/template";

export const router = createBrowserRouter([
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <Home /> },
          { path: "thread/:id", element: <HomeID /> },
          { path: "follows", element: <Follows /> },
          { path: "search", element: <Search /> },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <LayoutAuth />,
        children: [
          { path: "register", element: <Register /> },
          { path: "login", element: <Login /> },
          // { path: "forgot", element: <Forgot /> },
          // { path: "reset/:id", element: <Reset /> },
        ],
      },
    ],
  },

  { element: <LayoutAuth />, children: [{ path: "*", element: <NotFound /> }] },
]);
