import { db } from "../server/db";
import { sql } from "drizzle-orm";

// Migration function to create tables
async function migrate() {
  console.log("Starting database migration...");

  try {
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        firebase_uid VARCHAR(128) NOT NULL UNIQUE,
        username VARCHAR(64),
        email VARCHAR(256) NOT NULL,
        display_name VARCHAR(256),
        preferred_language VARCHAR(32) DEFAULT 'english',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Created users table");

    // Create transcriptions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS transcriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        language VARCHAR(32) NOT NULL,
        transcription TEXT NOT NULL,
        confidence DOUBLE PRECISION,
        audio_path VARCHAR(512),
        word_timings JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("Created transcriptions table");

    // Create translations table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS translations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        source_language VARCHAR(32) NOT NULL,
        target_language VARCHAR(32) NOT NULL,
        original_text TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        audio_path VARCHAR(512),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("Created translations table");

    // Create text_to_speech_items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS text_to_speech_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        language VARCHAR(32) NOT NULL,
        text TEXT NOT NULL,
        audio_path VARCHAR(512),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("Created text_to_speech_items table");

    // Create speech_to_speech_items table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS speech_to_speech_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        original_language VARCHAR(32) NOT NULL,
        translated_language VARCHAR(32) NOT NULL,
        original_text TEXT NOT NULL,
        translated_text TEXT NOT NULL,
        original_audio_path VARCHAR(512),
        translated_audio_path VARCHAR(512),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("Created speech_to_speech_items table");

    // Create user_stats table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        total_transcriptions INTEGER DEFAULT 0 NOT NULL,
        total_translations INTEGER DEFAULT 0 NOT NULL,
        total_text_to_speech INTEGER DEFAULT 0 NOT NULL,
        total_speech_to_speech INTEGER DEFAULT 0 NOT NULL,
        transcription_time_seconds INTEGER DEFAULT 0 NOT NULL,
        most_used_language VARCHAR(32),
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log("Created user_stats table");

    // Insert demo user
    await db.execute(sql`
      INSERT INTO users (firebase_uid, email, username, display_name, preferred_language)
      VALUES ('demo-user-id', 'demo@example.com', 'demo', 'Demo User', 'english')
      ON CONFLICT (firebase_uid) DO NOTHING;
    `);
    console.log("Added demo user");

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrate();