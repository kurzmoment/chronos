import { getAuthUserId } from "@convex-dev/auth/server";
import { QueryCtx, MutationCtx, ActionCtx } from "../_generated/server";

export async function requireUserId(
  ctx: QueryCtx | MutationCtx | ActionCtx
) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Nejste přihlášeni");
  }
  return userId;
}
