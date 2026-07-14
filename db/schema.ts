import { sqliteTable, text } from "drizzle-orm/sqlite-core";
export const newsCache = sqliteTable("news_cache",{market:text("market").primaryKey(),updatedAt:text("updated_at").notNull(),payload:text("payload").notNull()});
