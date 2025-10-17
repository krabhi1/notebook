import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  layout("routes/app/layout.tsx", [
    index("routes/app/home.tsx"),
    route("page/:pageId", "routes/app/pages/page.tsx"),
  ]),
] satisfies RouteConfig;
