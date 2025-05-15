import { relations } from "drizzle-orm";
import { 
  pgTable, 
  serial, 
  varchar, 
  text, 
  timestamp, 
  integer, 
  json, 
  boolean,
  doublePrecision,
  primaryKey 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: varchar("firebase_uid", { length: 128 }).notNull().unique(),
  username: varchar("username", { length: 64 }),
  email: varchar("email", { length: 256 }).notNull(),
  displayName: varchar("display_name", { length: 256 }),
  preferredLanguage: varchar("preferred_language", { length: 32 }).default("english"),
  role: varchar("role", { length: 20 }).default("user").notNull(), // 'user', 'admin', 'moderator'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// We'll define user relations after all tables are declared

// Transcriptions table
export const transcriptions = pgTable("transcriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  language: varchar("language", { length: 32 }).notNull(),
  transcription: text("transcription").notNull(),
  confidence: doublePrecision("confidence"),
  audioPath: varchar("audio_path", { length: 512 }),
  wordTimings: json("word_timings"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transcriptionsRelations = relations(transcriptions, ({ one }) => ({
  user: one(users, {
    fields: [transcriptions.userId],
    references: [users.id],
  }),
}));

// Translations table
export const translations = pgTable("translations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sourceLanguage: varchar("source_language", { length: 32 }).notNull(),
  targetLanguage: varchar("target_language", { length: 32 }).notNull(),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  audioPath: varchar("audio_path", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const translationsRelations = relations(translations, ({ one }) => ({
  user: one(users, {
    fields: [translations.userId],
    references: [users.id],
  }),
}));

// Text-to-Speech table
export const textToSpeechItems = pgTable("text_to_speech_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  language: varchar("language", { length: 32 }).notNull(),
  text: text("text").notNull(),
  audioPath: varchar("audio_path", { length: 512 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const textToSpeechRelations = relations(textToSpeechItems, ({ one }) => ({
  user: one(users, {
    fields: [textToSpeechItems.userId],
    references: [users.id],
  }),
}));

// Speech-to-Speech table
export const speechToSpeechItems = pgTable("speech_to_speech_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  originalLanguage: varchar("original_language", { length: 32 }).notNull(),
  translatedLanguage: varchar("translated_language", { length: 32 }).notNull(),
  originalText: text("original_text").notNull(),
  translatedText: text("translated_text").notNull(),
  originalAudioPath: varchar("original_audio_path", { length: 512 }).notNull(),
  translatedAudioPath: varchar("translated_audio_path", { length: 512 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const speechToSpeechRelations = relations(speechToSpeechItems, ({ one }) => ({
  user: one(users, {
    fields: [speechToSpeechItems.userId],
    references: [users.id],
  }),
}));

// User stats table
export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  totalTranscriptions: integer("total_transcriptions").default(0).notNull(),
  totalTranslations: integer("total_translations").default(0).notNull(),
  totalTextToSpeech: integer("total_text_to_speech").default(0).notNull(),
  totalSpeechToSpeech: integer("total_speech_to_speech").default(0).notNull(),
  transcriptionTimeSeconds: integer("transcription_time_seconds").default(0).notNull(),
  mostUsedLanguage: varchar("most_used_language", { length: 32 }),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, {
    fields: [userStats.userId],
    references: [users.id],
  }),
}));

// Define insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  firebaseUid: true,
  email: true,
  displayName: true,
  preferredLanguage: true,
  username: true,
  role: true,
});

export const insertTranscriptionSchema = createInsertSchema(transcriptions).pick({
  userId: true,
  language: true,
  transcription: true,
  confidence: true,
  audioPath: true,
  wordTimings: true,
});

export const insertTranslationSchema = createInsertSchema(translations).pick({
  userId: true,
  sourceLanguage: true,
  targetLanguage: true,
  originalText: true,
  translatedText: true,
  audioPath: true,
});

export const insertTextToSpeechSchema = createInsertSchema(textToSpeechItems).pick({
  userId: true,
  language: true,
  text: true,
  audioPath: true,
});

export const insertSpeechToSpeechSchema = createInsertSchema(speechToSpeechItems).pick({
  userId: true,
  originalLanguage: true,
  translatedLanguage: true,
  originalText: true,
  translatedText: true,
  originalAudioPath: true,
  translatedAudioPath: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).pick({
  userId: true,
  totalTranscriptions: true,
  totalTranslations: true,
  totalTextToSpeech: true,
  totalSpeechToSpeech: true,
  transcriptionTimeSeconds: true,
  mostUsedLanguage: true,
});

// Define types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTranscription = z.infer<typeof insertTranscriptionSchema>;
export type Transcription = typeof transcriptions.$inferSelect;

export type InsertTranslation = z.infer<typeof insertTranslationSchema>;
export type Translation = typeof translations.$inferSelect;

export type InsertTextToSpeech = z.infer<typeof insertTextToSpeechSchema>;
export type TextToSpeech = typeof textToSpeechItems.$inferSelect;

export type InsertSpeechToSpeech = z.infer<typeof insertSpeechToSpeechSchema>;
export type SpeechToSpeech = typeof speechToSpeechItems.$inferSelect;

export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type UserStats = typeof userStats.$inferSelect;

// User Ratings table
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  featureType: varchar("feature_type", { length: 32 }).notNull(), // 'transcription', 'translation', 'tts', 'sts', 'general'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
}));

// System logs table for admin panel
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  level: varchar("level", { length: 10 }).notNull(), // 'ERROR', 'WARN', 'INFO', 'DEBUG'
  component: varchar("component", { length: 50 }).notNull(),
  message: text("message").notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  feature: varchar("feature", { length: 50 }),
  metadata: json("metadata"),
});

// Analytics aggregation table
export const analyticsDailyTable = pgTable("analytics_daily", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().unique(),
  totalTranscriptions: integer("total_transcriptions").default(0).notNull(),
  totalTranslations: integer("total_translations").default(0).notNull(),
  totalTts: integer("total_tts").default(0).notNull(),
  totalSts: integer("total_sts").default(0).notNull(),
  avgResponseTimeMs: integer("avg_response_time_ms"),
  errorCount: integer("error_count").default(0).notNull(),
  activeUsers: integer("active_users").default(0).notNull(),
  mostUsedLanguage: varchar("most_used_language", { length: 32 }),
  mostUsedLanguagePair: json("most_used_language_pair"),
});

// API usage tracking
export const apiUsage = pgTable("api_usage", {
  id: serial("id").primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  service: varchar("service", { length: 50 }).notNull(),
  endpoint: varchar("endpoint", { length: 100 }).notNull(),
  responseTimeMs: integer("response_time_ms"),
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  userId: integer("user_id").references(() => users.id, { onDelete: 'set null' }),
  requestSize: integer("request_size"),
  responseSize: integer("response_size"),
});

// Define insert schemas for new tables
export const insertRatingSchema = createInsertSchema(ratings).pick({
  userId: true,
  rating: true,
  comment: true,
  featureType: true,
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).pick({
  level: true,
  component: true,
  message: true,
  userId: true,
  feature: true,
  metadata: true,
});

export const insertAnalyticsDailySchema = createInsertSchema(analyticsDailyTable).pick({
  date: true,
  totalTranscriptions: true,
  totalTranslations: true,
  totalTts: true,
  totalSts: true,
  avgResponseTimeMs: true,
  errorCount: true,
  activeUsers: true,
  mostUsedLanguage: true,
  mostUsedLanguagePair: true,
});

export const insertApiUsageSchema = createInsertSchema(apiUsage).pick({
  service: true,
  endpoint: true,
  responseTimeMs: true,
  success: true,
  errorMessage: true,
  userId: true,
  requestSize: true,
  responseSize: true,
});

// Define types for new tables
export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;

export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;

export type InsertAnalyticsDaily = z.infer<typeof insertAnalyticsDailySchema>;
export type AnalyticsDaily = typeof analyticsDailyTable.$inferSelect;

export type InsertApiUsage = z.infer<typeof insertApiUsageSchema>;
export type ApiUsage = typeof apiUsage.$inferSelect;

// Define user relations after all tables are declared
export const usersRelations = relations(users, ({ many }) => ({
  transcriptions: many(transcriptions),
  translations: many(translations),
  textToSpeechItems: many(textToSpeechItems),
  speechToSpeechItems: many(speechToSpeechItems),
  ratings: many(ratings),
}));
