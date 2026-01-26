"use server";

import { db } from "@/lib/db/drizzle";
import { carModels } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";

interface CreateCarModelParams {
  make: string;
  model: string;
  trim?: string;
  yearFrom?: number;
  yearTo?: number;
  powerHp?: number;
  weightKg?: number;
  drivetrain?: "fwd" | "rwd" | "awd";
}

export async function createCarModelFromApi(params: CreateCarModelParams) {
  try {
    // Vérifier si le modèle existe déjà (même make + model + trim)
    const existing = await db
      .select()
      .from(carModels)
      .where(
        and(
          eq(carModels.make, params.make),
          eq(carModels.model, params.model),
          params.trim ? eq(carModels.trim, params.trim) : isNull(carModels.trim)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return { success: true, carModel: existing[0], existed: true };
    }

    // Créer le nouveau modèle
    const [newCarModel] = await db
      .insert(carModels)
      .values({
        make: params.make,
        model: params.model,
        trim: params.trim,
        yearFrom: params.yearFrom,
        yearTo: params.yearTo,
        powerHp: params.powerHp,
        weightKg: params.weightKg,
        drivetrain: params.drivetrain,
      })
      .returning();

    return { success: true, carModel: newCarModel, existed: false };
  } catch (error) {
    console.error("Error creating car model:", error);
    return { success: false, error: "Failed to create car model" };
  }
}

export async function getCarModels() {
  try {
    const models = await db
      .select()
      .from(carModels);
    
    return { success: true, carModels: models };
  } catch (error) {
    console.error("Error fetching car models:", error);
    return { success: false, error: "Failed to fetch car models" };
  }
}

export async function searchCarModels(query: string) {
  try {
    // Simple search - tu peux améliorer avec pg_trgm ou full-text search
    const models = await db
      .select()
      .from(carModels)
      .limit(50);

    const filtered = models.filter(m => 
      m.make.toLowerCase().includes(query.toLowerCase()) ||
      m.model.toLowerCase().includes(query.toLowerCase()) ||
      m.trim?.toLowerCase().includes(query.toLowerCase())
    );
    
    return { success: true, carModels: filtered };
  } catch (error) {
    console.error("Error searching car models:", error);
    return { success: false, error: "Failed to search car models" };
  }
}
