import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Plans maintained by hand in the pricing global (source "manual") while the Subneo catalogue is
 * not live. Schema only: a new enum value cannot be used in the transaction that adds it, so
 * 20260930_121800_pricing_manual_data copies the example plans in a migration of its own.
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_subneo_pricing_manual_features_kind" AS ENUM('boolean', 'allocation', 'consumable', 'number', 'string');
  ALTER TYPE "public"."enum_subneo_pricing_source" ADD VALUE IF NOT EXISTS 'manual' BEFORE 'fixture';
  CREATE TABLE "subneo_pricing_manual_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"name" varchar
  );
  
  CREATE TABLE "subneo_pricing_manual_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"name" varchar,
  	"description" varchar,
  	"kind" "enum_subneo_pricing_manual_features_kind" DEFAULT 'boolean',
  	"group" varchar
  );
  
  CREATE TABLE "subneo_pricing_manual_plans_entitlements" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature_code" varchar,
  	"value" varchar
  );
  
  CREATE TABLE "subneo_pricing_manual_plans_feature_rates" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature_code" varchar,
  	"price" numeric,
  	"package_size" numeric
  );
  
  CREATE TABLE "subneo_pricing_manual_plans" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"code" varchar,
  	"name" varchar,
  	"family" varchar,
  	"monthly_price" numeric,
  	"yearly_price" numeric,
  	"tagline" varchar,
  	"badge" varchar,
  	"featured" boolean DEFAULT false
  );
  
  ALTER TABLE "subneo_pricing_manual_groups" ADD CONSTRAINT "subneo_pricing_manual_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_manual_features" ADD CONSTRAINT "subneo_pricing_manual_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_manual_plans_entitlements" ADD CONSTRAINT "subneo_pricing_manual_plans_entitlements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing_manual_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_manual_plans_feature_rates" ADD CONSTRAINT "subneo_pricing_manual_plans_feature_rates_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing_manual_plans"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "subneo_pricing_manual_plans" ADD CONSTRAINT "subneo_pricing_manual_plans_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."subneo_pricing"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "subneo_pricing_manual_groups_order_idx" ON "subneo_pricing_manual_groups" USING btree ("_order");
  CREATE INDEX "subneo_pricing_manual_groups_parent_id_idx" ON "subneo_pricing_manual_groups" USING btree ("_parent_id");
  CREATE INDEX "subneo_pricing_manual_features_order_idx" ON "subneo_pricing_manual_features" USING btree ("_order");
  CREATE INDEX "subneo_pricing_manual_features_parent_id_idx" ON "subneo_pricing_manual_features" USING btree ("_parent_id");
  CREATE INDEX "subneo_pricing_manual_plans_entitlements_order_idx" ON "subneo_pricing_manual_plans_entitlements" USING btree ("_order");
  CREATE INDEX "subneo_pricing_manual_plans_entitlements_parent_id_idx" ON "subneo_pricing_manual_plans_entitlements" USING btree ("_parent_id");
  CREATE INDEX "subneo_pricing_manual_plans_feature_rates_order_idx" ON "subneo_pricing_manual_plans_feature_rates" USING btree ("_order");
  CREATE INDEX "subneo_pricing_manual_plans_feature_rates_parent_id_idx" ON "subneo_pricing_manual_plans_feature_rates" USING btree ("_parent_id");
  CREATE INDEX "subneo_pricing_manual_plans_order_idx" ON "subneo_pricing_manual_plans" USING btree ("_order");
  CREATE INDEX "subneo_pricing_manual_plans_parent_id_idx" ON "subneo_pricing_manual_plans" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "subneo_pricing_manual_groups" CASCADE;
  DROP TABLE "subneo_pricing_manual_features" CASCADE;
  DROP TABLE "subneo_pricing_manual_plans_entitlements" CASCADE;
  DROP TABLE "subneo_pricing_manual_plans_feature_rates" CASCADE;
  DROP TABLE "subneo_pricing_manual_plans" CASCADE;
  ALTER TABLE "subneo_pricing" ALTER COLUMN "source" SET DATA TYPE text;
  UPDATE "subneo_pricing" SET "source" = 'fixture' WHERE "source" = 'manual';
  ALTER TABLE "subneo_pricing" ALTER COLUMN "source" SET DEFAULT 'fixture'::text;
  DROP TYPE "public"."enum_subneo_pricing_source";
  CREATE TYPE "public"."enum_subneo_pricing_source" AS ENUM('subneo', 'fixture');
  ALTER TABLE "subneo_pricing" ALTER COLUMN "source" SET DEFAULT 'fixture'::"public"."enum_subneo_pricing_source";
  ALTER TABLE "subneo_pricing" ALTER COLUMN "source" SET DATA TYPE "public"."enum_subneo_pricing_source" USING "source"::"public"."enum_subneo_pricing_source";
  DROP TYPE "public"."enum_subneo_pricing_manual_features_kind";`)
}
