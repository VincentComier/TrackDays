"use server";

import { db } from "@/lib/db/drizzle";
import { carModels, lapTimes, trackLayouts, user as userTable } from "@/lib/db/schema";
import { and, asc, eq } from "drizzle-orm";

export async function getTrackLeaderboard(trackId: string) {
  try {
    const lapTimesData = await db
      .select({
        id: lapTimes.id,
        timeMs: lapTimes.timeMs,
        drivenAt: lapTimes.drivenAt,
        status: lapTimes.status,
        trackLayout: {
          id: trackLayouts.id,
          name: trackLayouts.name,
        },
        user: {
          id: userTable.id,
          name: userTable.name,
        },
        carModel: {
          id: carModels.id,
          make: carModels.make,
          model: carModels.model,
          trim: carModels.trim,
        },
      })
      .from(lapTimes)
      .innerJoin(trackLayouts, eq(lapTimes.trackLayoutId, trackLayouts.id))
      .innerJoin(userTable, eq(lapTimes.userId, userTable.id))
      .innerJoin(carModels, eq(lapTimes.carModelId, carModels.id))
      .where(and(eq(trackLayouts.trackId, trackId), eq(lapTimes.status, "verified")))
      .orderBy(asc(lapTimes.timeMs));

    return { success: true, lapTimes: lapTimesData };
  } catch (error) {
    console.error("Error fetching track leaderboard:", error);
    return { success: false, error: "Failed to fetch leaderboard" };
  }
}
