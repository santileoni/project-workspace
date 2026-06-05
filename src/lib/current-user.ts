import { prisma } from "@/lib/prisma";

export const DEFAULT_USER_ID = "user-ana";

export async function requireCurrentUser(userId = DEFAULT_USER_ID) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      organization: true
    }
  });

  if (!user) {
    throw new Error(`Unknown user: ${userId}`);
  }

  return user;
}
