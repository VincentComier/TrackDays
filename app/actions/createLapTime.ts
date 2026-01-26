"use server";

import { db } from "@/lib/db/drizzle";
import { lapTimes } from "@/lib/db/schema";

interface CreateLapTimeParams {
  userId: string;
  trackLayoutId: string;
  carModelId: string;
  timeMs: number;
  drivenAt: Date;
  tireCompoundId?: string;
  conditionsId?: string;
  proofUrl?: string;
  source?: "transponder" | "official_timing" | "gps" | "manual";
}

export async function createLapTime(params: CreateLapTimeParams) {
  try {
    const [newLapTime] = await db
      .insert(lapTimes)
      .values({
        userId: params.userId,
        trackLayoutId: params.trackLayoutId,
        carModelId: params.carModelId,
        timeMs: params.timeMs,
        drivenAt: params.drivenAt,
        tireCompoundId: params.tireCompoundId,
        conditionsId: params.conditionsId,
        proofUrl: params.proofUrl,
        source: params.source || "manual",
        status: "pending",
      })
      .returning();

    return { success: true, lapTime: newLapTime };
  } catch (error) {
    console.error("Error creating lap time:", error);
    return { success: false, error: "Failed to create lap time" };
  }
}
