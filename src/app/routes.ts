import { createBrowserRouter } from "react-router";
import { BinderLayout } from "./layouts/BinderLayout";
import { Dashboard } from "./pages/Dashboard";
import { Tasks } from "./pages/Tasks";
import { Exams } from "./pages/Exams";
import { Analytics } from "./pages/Analytics";
import { Gallery } from "./pages/Gallery";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: BinderLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "tasks", Component: Tasks },
      { path: "exams", Component: Exams },
      { path: "analytics", Component: Analytics },
      { path: "gallery", Component: Gallery },
    ],
  },
]);
