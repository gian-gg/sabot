-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."STATUS" AS ENUM('not-started', 'pending', 'complete');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "agreement_content" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"agreement_id" uuid NOT NULL,
	"content" text,
	"idea_blocks" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"creator_response" text,
	"participant_response" text,
	"creator_blocks" jsonb,
	"participant_blocks" jsonb,
	"merged_at" timestamp with time zone,
	"creator_approved" boolean DEFAULT false,
	"participant_approved" boolean DEFAULT false,
	"approved_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "agreement_content" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "agreement_content" ADD CONSTRAINT "agreement_content_agreement_id_fkey" FOREIGN KEY ("agreement_id") REFERENCES "public"."agreements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agreement_content_agreement" ON "agreement_content" USING btree ("agreement_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "Users can view content of their agreements" ON "agreement_content" AS PERMISSIVE FOR SELECT TO public USING (((EXISTS ( SELECT 1
   FROM agreement_participants
  WHERE ((agreement_participants.agreement_id = agreement_content.agreement_id) AND (agreement_participants.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM agreements
  WHERE ((agreements.id = agreement_content.agreement_id) AND (agreements.creator_id = auth.uid()))))));--> statement-breakpoint
CREATE POLICY "Users can insert content for their agreements" ON "agreement_content" AS PERMISSIVE FOR INSERT TO public;--> statement-breakpoint
CREATE POLICY "Users can update content of their agreements" ON "agreement_content" AS PERMISSIVE FOR UPDATE TO public;
*/