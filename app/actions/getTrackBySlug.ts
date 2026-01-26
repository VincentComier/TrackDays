"use server";

import { db } from "@/lib/db/drizzle";
import { tracks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getTrackBySlug(slug: string) {
  try {
    const [track] = await db
      .select()
      .from(tracks)
      .where(eq(tracks.slug, slug))
      .limit(1);

    if (!track) {
      return { success: false, error: "Track not found" };
    }

    return { success: true, track };
  } catch (error) {
    console.error("Error fetching track:", error);
    return { success: false, error: "Failed to fetch track" };
  }
}
