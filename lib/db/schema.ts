import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, uuid, varchar, numeric, smallint, date, integer, uniqueIndex } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const tracks = pgTable(
  "tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    
    // Identification
    name: varchar("name", { length: 150 }).notNull(),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    
    // Localisation
    country: varchar("country", { length: 80 }).notNull(),
    region: varchar("region", { length: 80 }),
    city: varchar("city", { length: 80 }),
    
    // Media & liens
    photoCoverUrl: text("photo_cover_url"),
    websiteUrl: text("website_url"),
    
    // Statut
    isActive: boolean("is_active").notNull().default(true),
    
    // Caractéristiques du circuit
    lengthKm: numeric("length_km", { precision: 5, scale: 3 }),
    turnCount: smallint("turn_count"),
    direction: varchar("direction", { length: 20 }),
    surfaceType: varchar("surface_type", { length: 30 }),
    trackType: varchar("track_type", { length: 30 }),
    
    // Altitude
    altitudeMinM: smallint("altitude_min_m"),
    altitudeMaxM: smallint("altitude_max_m"),
    
    // Historique
    openedAt: date("opened_at"),
    
    // Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("tracks_slug_idx").on(table.slug),
    index("tracks_country_idx").on(table.country),
    index("tracks_active_idx").on(table.isActive),
  ],
);

export const trackLayouts = pgTable(
  "track_layouts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trackId: uuid("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 120 }).notNull(),
    lengthKm: numeric("length_km", { precision: 5, scale: 3 }),
    turnCount: smallint("turn_count"),
    isMain: boolean("is_main").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("track_layouts_trackId_idx").on(table.trackId),
    uniqueIndex("track_layouts_trackId_slug_idx").on(table.trackId, table.slug),
  ],
);

export const carModels = pgTable(
  "car_models",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    make: varchar("make", { length: 80 }).notNull(),
    model: varchar("model", { length: 80 }).notNull(),
    trim: varchar("trim", { length: 80 }),
    yearFrom: smallint("year_from"),
    yearTo: smallint("year_to"),
    powerHp: smallint("power_hp"),
    weightKg: smallint("weight_kg"),
    drivetrain: varchar("drivetrain", { length: 10 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("car_models_make_model_idx").on(table.make, table.model)],
);

export const tireCompounds = pgTable(
  "tire_compounds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brand: varchar("brand", { length: 80 }),
    name: varchar("name", { length: 120 }).notNull(),
    type: varchar("type", { length: 20 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("tire_compounds_type_idx").on(table.type)],
);

export const conditions = pgTable(
  "conditions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weather: varchar("weather", { length: 20 }).notNull(),
    airTempC: smallint("air_temp_c"),
    trackTempC: smallint("track_temp_c"),
    humidityPct: smallint("humidity_pct"),
    windKph: smallint("wind_kph"),
    trackState: varchar("track_state", { length: 10 }),
    notes: text("notes"),
    measuredAt: timestamp("measured_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("conditions_weather_idx").on(table.weather)],
);

export const lapTimes = pgTable(
  "lap_times",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    trackLayoutId: uuid("track_layout_id")
      .notNull()
      .references(() => trackLayouts.id, { onDelete: "cascade" }),
    carModelId: uuid("car_model_id")
      .notNull()
      .references(() => carModels.id),
    tireCompoundId: uuid("tire_compound_id")
      .references(() => tireCompounds.id),
    conditionsId: uuid("conditions_id")
      .references(() => conditions.id),
    timeMs: integer("time_ms").notNull(),
    drivenAt: timestamp("driven_at").notNull().defaultNow(),
    proofUrl: text("proof_url"),
    source: varchar("source", { length: 20 }).notNull().default("manual"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    verifiedBy: text("verified_by")
      .references(() => user.id, { onDelete: "set null" }),
    verifiedAt: timestamp("verified_at"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("lap_times_trackLayout_time_idx").on(table.trackLayoutId, table.timeMs),
    index("lap_times_user_trackLayout_idx").on(table.userId, table.trackLayoutId),
    index("lap_times_carModel_idx").on(table.carModelId),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  lapTimes: many(lapTimes),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const tracksRelations = relations(tracks, ({ many }) => ({
  trackLayouts: many(trackLayouts),
}));

export const trackLayoutsRelations = relations(trackLayouts, ({ one, many }) => ({
  track: one(tracks, {
    fields: [trackLayouts.trackId],
    references: [tracks.id],
  }),
  lapTimes: many(lapTimes),
}));

export const carModelsRelations = relations(carModels, ({ many }) => ({
  lapTimes: many(lapTimes),
}));

export const tireCompoundsRelations = relations(tireCompounds, ({ many }) => ({
  lapTimes: many(lapTimes),
}));

export const conditionsRelations = relations(conditions, ({ many }) => ({
  lapTimes: many(lapTimes),
}));

export const lapTimesRelations = relations(lapTimes, ({ one }) => ({
  user: one(user, {
    fields: [lapTimes.userId],
    references: [user.id],
  }),
  trackLayout: one(trackLayouts, {
    fields: [lapTimes.trackLayoutId],
    references: [trackLayouts.id],
  }),
  carModel: one(carModels, {
    fields: [lapTimes.carModelId],
    references: [carModels.id],
  }),
  tireCompound: one(tireCompounds, {
    fields: [lapTimes.tireCompoundId],
    references: [tireCompounds.id],
  }),
  condition: one(conditions, {
    fields: [lapTimes.conditionsId],
    references: [conditions.id],
  }),
  verifier: one(user, {
    fields: [lapTimes.verifiedBy],
    references: [user.id],
  }),
}));
