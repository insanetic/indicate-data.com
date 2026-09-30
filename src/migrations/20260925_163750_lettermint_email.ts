import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_forms_emails_language" AS ENUM('all', 'de', 'en');
  CREATE TYPE "public"."enum_form_submissions_locale" AS ENUM('de', 'en');
  CREATE TABLE "email_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from_address" varchar DEFAULT 'noreply@indicate-data.io' NOT NULL,
  	"from_name" varchar DEFAULT 'Indicate Data' NOT NULL,
  	"notify_to" varchar DEFAULT 'hello@indicate-data.io' NOT NULL,
  	"route" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "forms_emails" ADD COLUMN "language" "enum_forms_emails_language" DEFAULT 'all' NOT NULL;
  ALTER TABLE "form_submissions" ADD COLUMN "locale" "enum_form_submissions_locale" DEFAULT 'de';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "email_settings" CASCADE;
  ALTER TABLE "forms_emails" DROP COLUMN "language";
  ALTER TABLE "form_submissions" DROP COLUMN "locale";
  DROP TYPE "public"."enum_forms_emails_language";
  DROP TYPE "public"."enum_form_submissions_locale";`)
}
