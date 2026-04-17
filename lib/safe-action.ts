import { createSafeActionClient } from "next-safe-action"

import { auth } from "@/auth"

export class ActionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ActionError"
  }
}

export const actionClient = createSafeActionClient({
  handleServerError(e) {
    if (e instanceof ActionError) return e.message
    console.error(e)
    return "Something went wrong. Try again."
  },
})

export const authedAction = actionClient.use(async ({ next }) => {
  const session = await auth()
  if (!session?.user?.id) throw new ActionError("You must be signed in")
  return next({ ctx: { userId: session.user.id } })
})
