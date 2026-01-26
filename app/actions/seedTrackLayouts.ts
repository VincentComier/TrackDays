"use server";

import { db } from "@/lib/db/drizzle";
import { tracks, trackLayouts } from "@/lib/db/schema";

export async function seedTrackLayouts() {
  try {
    // Récupérer tous les circuits
    const allTracks = await db.select().from(tracks);

    if (allTracks.length === 0) {
      return { success: false, error: "Aucun circuit trouvé dans la base" };
    }

    const results = [];

    for (const track of allTracks) {
      // Créer un tracé principal pour chaque circuit
      const [layout] = await db
        .insert(trackLayouts)
        .values({
          trackId: track.id,
          name: "Configuration principale",
          slug: "main",
          lengthKm: track.lengthKm,
          turnCount: track.turnCount,
          isMain: true,
        })
        .returning();

      results.push(layout);
    }

    return { success: true, layouts: results };
  } catch (error) {
    console.error("Error seeding track layouts:", error);
    return { success: false, error: "Failed to seed track layouts" };
  }
}
