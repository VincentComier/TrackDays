"use server";

import { db } from "@/lib/db/drizzle";
import { trackLayouts, tracks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getTrackLayoutsByTrack(trackId: string) {
  try {
    const layouts = await db
      .select()
      .from(trackLayouts)
      .where(eq(trackLayouts.trackId, trackId));
    
    return { success: true, layouts };
  } catch (error) {
    console.error("Error fetching track layouts:", error);
    return { success: false, error: "Failed to fetch track layouts" };
  }
}

export async function getAllTrackLayoutsWithTrack() {
  try {
    const layouts = await db
      .select({
        id: trackLayouts.id,
        name: trackLayouts.name,
        trackId: trackLayouts.trackId,
        trackName: tracks.name,
      })
      .from(trackLayouts)
      .leftJoin(tracks, eq(trackLayouts.trackId, tracks.id));

    return { success: true, layouts };
  } catch (error) {
    console.error("Error fetching all track layouts:", error);
    return { success: false, error: "Failed to fetch track layouts" };
  }
}
