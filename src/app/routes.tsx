import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Venues } from "./pages/Venues";
import { Matchmaking } from "./pages/Matchmaking";
import { AuthPage } from "./components/AuthPage";
import { Profile } from "./pages/Profile";
import { Feed } from "./pages/Feed";
import { Messages } from "./pages/Messages";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "feed", Component: Feed },
      { path: "venues", Component: Venues },
      { path: "match", Component: Matchmaking },
      { path: "messages", Component: Messages },
      { path: "auth", Component: AuthPage },
      { path: "profile", Component: Profile },
    ],
  },
]);