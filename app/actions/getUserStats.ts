"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db/drizzle";
import { lapTimes, user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: FormData): Promise<void> {
  const bio = String(formData.get("bio") || "").trim();

  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (!session?.user?.id) {
      return;
    }

    await db
      .update(userTable)
      .set({
        bio: bio || null,
      })
      .where(eq(userTable.id, session.user.id));

    revalidatePath(`/profile/${session.user.id}`);
  } catch (error) {
    console.error("Error updating profile:", error);
  }
}

export async function getUserStats(userId: string) {
  try {
    const [userData] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .limit(1);

    if (!userData) {
      return null;
    }

    const lapTimesData = await db
      .select({
        id: lapTimes.id,
        timeMs: lapTimes.timeMs,
        status: lapTimes.status,
      })
      .from(lapTimes)
      .where(eq(lapTimes.userId, userId));

    const verifiedTimes = lapTimesData.filter((lt) => lt.status === "verified");
    const bestTime =
      verifiedTimes.length > 0
        ? Math.min(...verifiedTimes.map((lt) => lt.timeMs))
        : null;

    return {
      user: userData,
      stats: {
        totalTimes: lapTimesData.length,
        verifiedTimes: verifiedTimes.length,
        bestTime,
      },
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
}
