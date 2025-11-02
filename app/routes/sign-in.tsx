import { signIn } from "~/lib/auth-client";
import type { Route } from "./+types/sign-in";
export default function Page({}: Route.ComponentProps) {
  return (
    <div>
      <button
        onClick={async () => {
          await signIn.social({
            provider: "google",
            callbackURL: "/app",
          });
        }}
      >
        Sign In with google
      </button>
    </div>
  );
}
