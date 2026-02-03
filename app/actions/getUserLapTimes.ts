"use server";

import { db } from "@/lib/db/drizzle";
import { lapTimes, trackLayouts, tracks, carModels } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getUserLapTimes(userId: string) {
  try {
    const lapTimesData = await db
      .select({
        id: lapTimes.id,
        timeMs: lapTimes.timeMs,
        drivenAt: lapTimes.drivenAt,
        status: lapTimes.status,
        proofUrl: lapTimes.proofUrl,
        trackLayout: {
          id: trackLayouts.id,
          name: trackLayouts.name,
        },
        track: {
          id: tracks.id,
          name: tracks.name,
          slug: tracks.slug,
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
      .innerJoin(tracks, eq(trackLayouts.trackId, tracks.id))
      .innerJoin(carModels, eq(lapTimes.carModelId, carModels.id))
      .where(eq(lapTimes.userId, userId))
      .orderBy(desc(lapTimes.drivenAt));

    return lapTimesData;
  } catch (error) {
    console.error("Error fetching user lap times:", error);
    throw new Error("Failed to fetch lap times");
  }
}
