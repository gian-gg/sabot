import { relations } from 'drizzle-orm/relations';
import { agreements, agreement_content } from './schema';

export const agreement_contentRelations = relations(
  agreement_content,
  ({ one }) => ({
    agreement: one(agreements, {
      fields: [agreement_content.agreement_id],
      references: [agreements.id],
    }),
  })
);

export const agreementsRelations = relations(agreements, ({ many }) => ({
  agreement_contents: many(agreement_content),
}));
