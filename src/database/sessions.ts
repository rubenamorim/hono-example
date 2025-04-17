import { sql } from 'drizzle-orm';
import { pgTable, timestamp, uuid, text, index } from 'drizzle-orm/pg-core';

import { usersTable } from './users';

export const sessionsTable = pgTable(
    'sessions',
    {
        id: uuid('id').notNull().primaryKey(),
        userId: uuid('user_id')
            .notNull()
            .references(() => usersTable.id, { onDelete: 'cascade' }),
        createdAt: timestamp('created_at', { mode: 'string' })
            .notNull()
            .default(sql`(now() AT TIME ZONE 'UTC')`),
        updatedAt: timestamp('updated_at', { mode: 'string' })
            .notNull()
            .default(sql`(now() AT TIME ZONE 'UTC')`),
        token: text('token').unique().notNull(),
        refreshToken: text('refresh_token').unique().notNull(),
        expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    },
    (table) => {
        return {
            userIdIdx: index('idx_sessions_user_id').on(table.userId),
            expiresAtIdx: index('idx_sessions_expires_at').on(table.expiresAt),
        };
    },
);
