"use server";

import { db } from "@/lib/db/drizzle";
import { carModels, lapTimes, trackLayouts, tracks, user as userTable } from "@/lib/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";

export async function getUserLapTimesWithFilters(
  userId: string,
  filters?: {
    trackId?: string;
    status?: "verified" | "pending" | "rejected";
    carModelId?: string;
    sortBy?: "date" | "time";
  }
) {
  try {
    const conditions = [eq(lapTimes.userId, userId)];

    if (filters?.trackId) {
      conditions.push(eq(trackLayouts.trackId, filters.trackId));
    }

    if (filters?.status) {
      conditions.push(eq(lapTimes.status, filters.status));
    }

    if (filters?.carModelId) {
      conditions.push(eq(lapTimes.carModelId, filters.carModelId));
    }

    const orderBy =
      filters?.sortBy === "time"
        ? lapTimes.timeMs
        : desc(lapTimes.drivenAt);

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
      .where(and(...conditions))
      .orderBy(orderBy);

    return { success: true, lapTimes: lapTimesData };
  } catch (error) {
    console.error("Error fetching filtered lap times:", error);
    return { success: false, error: "Failed to fetch lap times" };
  }
}

export async function getUserCarModels(userId: string) {
  try {
    const carModelsData = await db
      .selectDistinct({
        id: carModels.id,
        make: carModels.make,
        model: carModels.model,
        trim: carModels.trim,
      })
      .from(lapTimes)
      .innerJoin(carModels, eq(lapTimes.carModelId, carModels.id))
      .where(eq(lapTimes.userId, userId));

    return { success: true, carModels: carModelsData };
  } catch (error) {
    console.error("Error fetching car models:", error);
    return { success: false, error: "Failed to fetch car models" };
  }
}

export async function getUserTracks(userId: string) {
  try {
    const tracksData = await db
      .selectDistinct({
        id: tracks.id,
        name: tracks.name,
        slug: tracks.slug,
      })
      .from(lapTimes)
      .innerJoin(trackLayouts, eq(lapTimes.trackLayoutId, trackLayouts.id))
      .innerJoin(tracks, eq(trackLayouts.trackId, tracks.id))
      .where(eq(lapTimes.userId, userId));

    return { success: true, tracks: tracksData };
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return { success: false, error: "Failed to fetch tracks" };
  }
}
