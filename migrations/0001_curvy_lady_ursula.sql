CREATE TABLE "car_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"make" varchar(80) NOT NULL,
	"model" varchar(80) NOT NULL,
	"trim" varchar(80),
	"year_from" smallint,
	"year_to" smallint,
	"power_hp" smallint,
	"weight_kg" smallint,
	"drivetrain" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conditions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"weather" varchar(20) NOT NULL,
	"air_temp_c" smallint,
	"track_temp_c" smallint,
	"humidity_pct" smallint,
	"wind_kph" smallint,
	"track_state" varchar(10),
	"notes" text,
	"measured_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lap_times" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"track_layout_id" uuid NOT NULL,
	"car_model_id" uuid NOT NULL,
	"tire_compound_id" uuid,
	"conditions_id" uuid,
	"time_ms" integer NOT NULL,
	"driven_at" timestamp DEFAULT now() NOT NULL,
	"proof_url" text,
	"source" varchar(20) DEFAULT 'manual' NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"verified_by" text,
	"verified_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tire_compounds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand" varchar(80),
	"name" varchar(120) NOT NULL,
	"type" varchar(20) NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "track_layouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"track_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(120) NOT NULL,
	"length_km" numeric(5, 3),
	"turn_count" smallint,
	"is_main" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lap_times" ADD CONSTRAINT "lap_times_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lap_times" ADD CONSTRAINT "lap_times_track_layout_id_track_layouts_id_fk" FOREIGN KEY ("track_layout_id") REFERENCES "public"."track_layouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lap_times" ADD CONSTRAINT "lap_times_car_model_id_car_models_id_fk" FOREIGN KEY ("car_model_id") REFERENCES "public"."car_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lap_times" ADD CONSTRAINT "lap_times_tire_compound_id_tire_compounds_id_fk" FOREIGN KEY ("tire_compound_id") REFERENCES "public"."tire_compounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lap_times" ADD CONSTRAINT "lap_times_conditions_id_conditions_id_fk" FOREIGN KEY ("conditions_id") REFERENCES "public"."conditions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lap_times" ADD CONSTRAINT "lap_times_verified_by_user_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "track_layouts" ADD CONSTRAINT "track_layouts_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "car_models_make_model_idx" ON "car_models" USING btree ("make","model");--> statement-breakpoint
CREATE INDEX "conditions_weather_idx" ON "conditions" USING btree ("weather");--> statement-breakpoint
CREATE INDEX "lap_times_trackLayout_time_idx" ON "lap_times" USING btree ("track_layout_id","time_ms");--> statement-breakpoint
CREATE INDEX "lap_times_user_trackLayout_idx" ON "lap_times" USING btree ("user_id","track_layout_id");--> statement-breakpoint
CREATE INDEX "lap_times_carModel_idx" ON "lap_times" USING btree ("car_model_id");--> statement-breakpoint
CREATE INDEX "tire_compounds_type_idx" ON "tire_compounds" USING btree ("type");--> statement-breakpoint
CREATE INDEX "track_layouts_trackId_idx" ON "track_layouts" USING btree ("track_id");--> statement-breakpoint
CREATE UNIQUE INDEX "track_layouts_trackId_slug_idx" ON "track_layouts" USING btree ("track_id","slug");--> statement-breakpoint
CREATE INDEX "tracks_country_idx" ON "tracks" USING btree ("country");--> statement-breakpoint
CREATE INDEX "tracks_active_idx" ON "tracks" USING btree ("is_active");