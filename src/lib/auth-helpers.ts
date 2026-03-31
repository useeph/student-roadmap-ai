import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function getSessionUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return session!.user;
}

/** Returns true if the student profile belongs to the given user */
export async function profileBelongsToUser(
  profileId: string,
  userId: string
): Promise<boolean> {
  const p = await prisma.studentProfile.findUnique({
    where: { id: profileId },
    select: { userId: true },
  });
  return !!p?.userId && p.userId === userId;
}
