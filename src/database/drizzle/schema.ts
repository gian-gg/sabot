import {
  pgTable,
  index,
  foreignKey,
  pgPolicy,
  uuid,
  text,
  jsonb,
  timestamp,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const STATUS = pgEnum('STATUS', ['not-started', 'pending', 'complete']);
export const user_role = pgEnum('user_role', ['user', 'admin']);

export const agreement_content = pgTable(
  'agreement_content',
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    agreement_id: uuid().notNull(),
    content: text(),
    idea_blocks: jsonb(),
    created_at: timestamp({ withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    updated_at: timestamp({ withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    creator_response: text(),
    participant_response: text(),
    creator_blocks: jsonb(),
    participant_blocks: jsonb(),
    merged_at: timestamp({ withTimezone: true, mode: 'string' }),
    creator_approved: boolean().default(false),
    participant_approved: boolean().default(false),
    approved_at: timestamp({ withTimezone: true, mode: 'string' }),
  },
  (table) => [
    index('idx_agreement_content_agreement').using(
      'btree',
      table.agreement_id.asc().nullsLast().op('uuid_ops')
    ),
    foreignKey({
      columns: [table.agreement_id],
      foreignColumns: [agreements.id],
      name: 'agreement_content_agreement_id_fkey',
    }).onDelete('cascade'),
    pgPolicy('Users can view content of their agreements', {
      as: 'permissive',
      for: 'select',
      to: ['public'],
      using: sql`((EXISTS ( SELECT 1
   FROM agreement_participants
  WHERE ((agreement_participants.agreement_id = agreement_content.agreement_id) AND (agreement_participants.user_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM agreements
  WHERE ((agreements.id = agreement_content.agreement_id) AND (agreements.creator_id = auth.uid())))))`,
    }),
    pgPolicy('Users can insert content for their agreements', {
      as: 'permissive',
      for: 'insert',
      to: ['public'],
    }),
    pgPolicy('Users can update content of their agreements', {
      as: 'permissive',
      for: 'update',
      to: ['public'],
    }),
  ]
);
