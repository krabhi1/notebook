import type { Route } from "./+types/api.auth.$";

export async function loader({ request, context: { auth } }: Route.LoaderArgs) {
  return auth.handler(request);
}

export async function action({ request, context: { auth } }: Route.ActionArgs) {
  return auth.handler(request);
}
