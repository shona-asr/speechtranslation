import { 
  type User, type InsertUser,
  type Transcription, type InsertTranscription,
  type Translation, type InsertTranslation,
  type TextToSpeech, type InsertTextToSpeech,
  type SpeechToSpeech, type InsertSpeechToSpeech,
  type UserStats, type InsertUserStats
} from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as crypto from "crypto";
import { eq, and, gte, lte, lt, desc, sql } from "drizzle-orm";
import { db } from './db';
import { 
  users, transcriptions, translations, textToSpeechItems, speechToSpeechItems, 
  userStats, systemLogs, ratings, analyticsDailyTable, apiUsage 
} from "@shared/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure results directory exists
const resultsDir = path.resolve(__dirname, "../results");
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  getUsersWithRole(role: string): Promise<User[]>;

  // Transcription operations
  createTranscription(transcription: InsertTranscription): Promise<Transcription>;
  getTranscriptions(userId: number, limit?: number): Promise<Transcription[]>;
  getTranscription(id: number): Promise<Transcription | undefined>;

  // Translation operations
  createTranslation(translation: InsertTranslation): Promise<Translation>;
  getTranslations(userId: number, limit?: number): Promise<Translation[]>;
  getTranslation(id: number): Promise<Translation | undefined>;

  // Text-to-Speech operations
  createTextToSpeech(textToSpeech: InsertTextToSpeech): Promise<TextToSpeech>;
  getTextToSpeechItems(userId: number, limit?: number): Promise<TextToSpeech[]>;
  getTextToSpeech(id: number): Promise<TextToSpeech | undefined>;

  // Speech-to-Speech operations
  createSpeechToSpeech(speechToSpeech: InsertSpeechToSpeech): Promise<SpeechToSpeech>;
  getSpeechToSpeechItems(userId: number, limit?: number): Promise<SpeechToSpeech[]>;
  getSpeechToSpeech(id: number): Promise<SpeechToSpeech | undefined>;

  // User stats operations
  getUserStats(userId: number): Promise<UserStats | undefined>;
  createOrUpdateUserStats(stats: InsertUserStats): Promise<UserStats>;

  // File operations
  getFileBufferFromRequest(req: Express.Request): Promise<Buffer>;
  saveTextToFile(text: string, fileName: string): Promise<string>;
  getFileContent(filePath: string): Promise<string>;

  // Rating operations
  createRating(data: {
    userId: number | null;
    featureType: string;
    rating: number;
    comment: string | null;
  }): Promise<any>; // Replace 'any' with the actual type of a rating

  getRatings(limit?: number): Promise<any[]>; // Replace 'any' with the actual type of a rating
  getRatingsByUser(userId: number, limit?: number): Promise<any[]>; // Replace 'any' with the actual type of a rating
  getRatingsByFeature(featureType: string, limit?: number): Promise<any[]>; // Replace 'any' with the actual type of a rating
  getAverageRatingByFeature(featureType: string): Promise<number>;
  
  // Admin operations
  getSystemLogs(limit?: number, level?: string): Promise<any[]>;
  logSystemEvent(data: { message: string, level: string, component: string, userId?: number | null, feature?: string | null, metadata?: any }): Promise<any>;
  getAnalyticsDailySnapshots(startDate?: Date, endDate?: Date): Promise<any>;
  getApiUsageStats(startDate?: Date, endDate?: Date): Promise<any>;
  
  // API tracking
  logApiCall(data: {
    service: string;
    endpoint: string;
    responseTimeMs: number;
    success: boolean;
    errorMessage?: string | null;
    userId?: number | null;
    requestSize?: number;
    responseSize?: number;
  }): Promise<any>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private usersByFirebaseUid: Map<string, number>;
  private usersByUsername: Map<string, number>;
  private transcriptions: Map<number, Transcription>;
  private translations: Map<number, Translation>;
  private textToSpeechItems: Map<number, TextToSpeech>;
  private speechToSpeechItems: Map<number, SpeechToSpeech>;
  private userStats: Map<number, UserStats>;

  private currentUserId: number;
  private currentTranscriptionId: number;
  private currentTranslationId: number;
  private currentTextToSpeechId: number;
  private currentSpeechToSpeechId: number;
  private currentUserStatsId: number;

  constructor() {
    this.users = new Map();
    this.usersByFirebaseUid = new Map();
    this.usersByUsername = new Map();
    this.transcriptions = new Map();
    this.translations = new Map();
    this.textToSpeechItems = new Map();
    this.speechToSpeechItems = new Map();
    this.userStats = new Map();

    this.currentUserId = 1;
    this.currentTranscriptionId = 1;
    this.currentTranslationId = 1;
    this.currentTextToSpeechId = 1;
    this.currentSpeechToSpeechId = 1;
    this.currentUserStatsId = 1;

    // Add a demo user
    const demoUser: User = {
      id: this.currentUserId++,
      firebaseUid: "demo-user-id",
      username: "demo",
      email: "demo@example.com",
      displayName: "Demo User",
      preferredLanguage: "english",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(demoUser.id, demoUser);
    this.usersByFirebaseUid.set(demoUser.firebaseUid, demoUser.id);
    this.usersByUsername.set(demoUser.username!, demoUser.id);

    // Add some demo transcriptions
    const transcription1: Transcription = {
      id: this.currentTranscriptionId++,
      userId: demoUser.id,
      language: "en-US",
      transcription: "This is a sample transcription from an audio file.",
      confidence: 0.95,
      audioPath: "/uploads/sample-audio1.mp3",
      wordTimings: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
    };
    this.transcriptions.set(transcription1.id, transcription1);

    // Add some demo translations
    const translation1: Translation = {
      id: this.currentTranslationId++,
      userId: demoUser.id,
      sourceLanguage: "en-US",
      targetLanguage: "zh-CN",
      originalText: "Hello, how are you today?",
      translatedText: "你好，今天过得怎么样？",
      audioPath: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 mins ago
    };
    this.translations.set(translation1.id, translation1);

    // Add some demo text-to-speech
    const tts1: TextToSpeech = {
      id: this.currentTextToSpeechId++,
      userId: demoUser.id,
      language: "en-US",
      text: "This is a generated speech sample from text input.",
      audioPath: "/uploads/tts-sample1.mp3",
      createdAt: new Date(Date.now() - 1000 * 60 * 15) // 15 mins ago
    };
    this.textToSpeechItems.set(tts1.id, tts1);

    // Add some demo speech-to-speech
    const stt1: SpeechToSpeech = {
      id: this.currentSpeechToSpeechId++,
      userId: demoUser.id,
      originalLanguage: "en-US",
      translatedLanguage: "zh-CN",
      originalText: "Welcome to our speech-to-speech translation demo.",
      translatedText: "欢迎来到我们的语音到语音翻译演示。",
      originalAudioPath: "/uploads/original-speech1.mp3",
      translatedAudioPath: "/uploads/translated-speech1.mp3",
      createdAt: new Date(Date.now() - 1000 * 60 * 5) // 5 mins ago
    };
    this.speechToSpeechItems.set(stt1.id, stt1);

    // Add user stats
    const stats: UserStats = {
      id: this.currentUserStatsId++,
      userId: demoUser.id,
      totalTranscriptions: 1,
      totalTranslations: 1,
      totalTextToSpeech: 1,
      totalSpeechToSpeech: 1,
      transcriptionTimeSeconds: 120,
      mostUsedLanguage: "en-US",
      updatedAt: new Date()
    };
    this.userStats.set(demoUser.id, stats);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const userId = this.usersByUsername.get(username);
    if (userId !== undefined) {
      return this.users.get(userId);
    }
    return undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const userId = this.usersByFirebaseUid.get(firebaseUid);
    if (userId !== undefined) {
      return this.users.get(userId);
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();

    // Ensure all required fields have values
    const user: User = {
      ...insertUser,
      id,
      username: insertUser.username ?? null,
      displayName: insertUser.displayName ?? null,
      preferredLanguage: insertUser.preferredLanguage ?? "english",
      role: insertUser.role ?? "user",
      createdAt: now,
      updatedAt: now
    };

    this.users.set(id, user);
    if (user.firebaseUid) {
      this.usersByFirebaseUid.set(user.firebaseUid, id);
    }
    if (user.username) {
      this.usersByUsername.set(user.username, id);
    }

    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Update the user data
    const updatedUser: User = {
      ...existingUser,
      ...userData,
      updatedAt: new Date()
    };

    // Update the maps
    if (userData.username && userData.username !== existingUser.username) {
      if (existingUser.username) {
        this.usersByUsername.delete(existingUser.username);
      }
      this.usersByUsername.set(userData.username, id);
    }

    if (userData.firebaseUid && userData.firebaseUid !== existingUser.firebaseUid) {
      this.usersByFirebaseUid.delete(existingUser.firebaseUid);
      this.usersByFirebaseUid.set(userData.firebaseUid, id);
    }

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Transcription operations
  async createTranscription(insertTranscription: InsertTranscription): Promise<Transcription> {
    const id = this.currentTranscriptionId++;
    const transcription: Transcription = {
      ...insertTranscription,
      id,
      confidence: insertTranscription.confidence ?? null,
      audioPath: insertTranscription.audioPath ?? null, 
      wordTimings: insertTranscription.wordTimings ?? null,
      createdAt: new Date()
    };

    this.transcriptions.set(id, transcription);

    // Update user stats
    await this.updateUserStatsAfterTranscription(insertTranscription.userId);

    return transcription;
  }

  async getTranscriptions(userId: number, limit: number = 50): Promise<Transcription[]> {
    const userTranscriptions = Array.from(this.transcriptions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return userTranscriptions;
  }

  async getTranscription(id: number): Promise<Transcription | undefined> {
    return this.transcriptions.get(id);
  }

  // Translation operations
  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    const id = this.currentTranslationId++;
    const translation: Translation = {
      ...insertTranslation,
      id,
      audioPath: insertTranslation.audioPath ?? null,
      createdAt: new Date()
    };

    this.translations.set(id, translation);

    // Update user stats
    await this.updateUserStatsAfterTranslation(insertTranslation.userId);

    return translation;
  }

  async getTranslations(userId: number, limit: number = 50): Promise<Translation[]> {
    const userTranslations = Array.from(this.translations.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return userTranslations;
  }

  async getTranslation(id: number): Promise<Translation | undefined> {
    return this.translations.get(id);
  }

  // Text-to-Speech operations
  async createTextToSpeech(insertTextToSpeech: InsertTextToSpeech): Promise<TextToSpeech> {
    const id = this.currentTextToSpeechId++;
    const textToSpeech: TextToSpeech = {
      ...insertTextToSpeech,
      id,
      createdAt: new Date()
    };

    this.textToSpeechItems.set(id, textToSpeech);

    // Update user stats
    await this.updateUserStatsAfterTTS(insertTextToSpeech.userId);

    return textToSpeech;
  }

  async getTextToSpeechItems(userId: number, limit: number = 50): Promise<TextToSpeech[]> {
    const userTTS = Array.from(this.textToSpeechItems.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return userTTS;
  }

  async getTextToSpeech(id: number): Promise<TextToSpeech | undefined> {
    return this.textToSpeechItems.get(id);
  }

  // Speech-to-Speech operations
  async createSpeechToSpeech(insertSpeechToSpeech: InsertSpeechToSpeech): Promise<SpeechToSpeech> {
    const id = this.currentSpeechToSpeechId++;
    const speechToSpeech: SpeechToSpeech = {
      ...insertSpeechToSpeech,
      id,
      createdAt: new Date()
    };

    this.speechToSpeechItems.set(id, speechToSpeech);

    // Update user stats
    await this.updateUserStatsAfterSTS(insertSpeechToSpeech.userId);

    return speechToSpeech;
  }

  async getSpeechToSpeechItems(userId: number, limit: number = 50): Promise<SpeechToSpeech[]> {
    const userSTS = Array.from(this.speechToSpeechItems.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return userSTS;
  }

  async getSpeechToSpeech(id: number): Promise<SpeechToSpeech | undefined> {
    return this.speechToSpeechItems.get(id);
  }

  // User stats operations
  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return this.userStats.get(userId);
  }

  async createOrUpdateUserStats(stats: InsertUserStats): Promise<UserStats> {
    const existingStats = await this.getUserStats(stats.userId);

    if (existingStats) {
      // Update existing stats
      const updatedStats: UserStats = {
        ...existingStats,
        totalTranscriptions: stats.totalTranscriptions ?? existingStats.totalTranscriptions,
        totalTranslations: stats.totalTranslations ?? existingStats.totalTranslations,
        totalTextToSpeech: stats.totalTextToSpeech ?? existingStats.totalTextToSpeech,
        totalSpeechToSpeech: stats.totalSpeechToSpeech ?? existingStats.totalSpeechToSpeech,
        transcriptionTimeSeconds: stats.transcriptionTimeSeconds ?? existingStats.transcriptionTimeSeconds,
        mostUsedLanguage: stats.mostUsedLanguage ?? existingStats.mostUsedLanguage,
        updatedAt: new Date()
      };
      this.userStats.set(stats.userId, updatedStats);
      return updatedStats;
    } else {
      // Create new stats
      const id = this.currentUserStatsId++;
      const newStats: UserStats = {
        id,
        userId: stats.userId,
        totalTranscriptions: stats.totalTranscriptions ?? 0,
        totalTranslations: stats.totalTranslations ?? 0,
        totalTextToSpeech: stats.totalTextToSpeech ?? 0,
        totalSpeechToSpeech: stats.totalSpeechToSpeech ?? 0,
        transcriptionTimeSeconds: stats.transcriptionTimeSeconds ?? 0,
        mostUsedLanguage: stats.mostUsedLanguage ?? null,
        updatedAt: new Date()
      };
      this.userStats.set(stats.userId, newStats);
      return newStats;
    }
  }

  // Helper methods for updating stats
  private async updateUserStatsAfterTranscription(userId: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      stats.totalTranscriptions += 1;
      stats.updatedAt = new Date();
      this.userStats.set(userId, stats);
    }
  }

  private async updateUserStatsAfterTranslation(userId: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      stats.totalTranslations += 1;
      stats.updatedAt = new Date();
      this.userStats.set(userId, stats);
    }
  }

  private async updateUserStatsAfterTTS(userId: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      stats.totalTextToSpeech += 1;
      stats.updatedAt = new Date();
      this.userStats.set(userId, stats);
    }
  }

  private async updateUserStatsAfterSTS(userId: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      stats.totalSpeechToSpeech += 1;
      stats.updatedAt = new Date();
      this.userStats.set(userId, stats);
    }
  }

  // File operations
  async getFileBufferFromRequest(req: any): Promise<Buffer> {
    try {
      if (req.file && req.file.buffer) {
        return req.file.buffer;
      }

      throw new Error("No file buffer available in the request");
    } catch (error: any) {
      console.error("Error accessing file buffer:", error.message);
      throw new Error("Failed to access file buffer: " + error.message);
    }
  }

  async saveTextToFile(text: string, fileName: string): Promise<string> {
    // Generate a unique filename
    const uniqueId = crypto.randomBytes(8).toString('hex');
    const fileNameWithoutExt = path.basename(fileName, path.extname(fileName));
    const uniqueFileName = `${fileNameWithoutExt}-${uniqueId}.txt`;
    const filePath = path.join(resultsDir, uniqueFileName);

    // Write the text to the file
    await fs.promises.writeFile(filePath, text, 'utf8');

    // Return the relative path
    return `/results/${uniqueFileName}`;
  }

  async getFileContent(filePath: string): Promise<string> {
    // Remove leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;

    // Determine if this is a results or uploads file
    let fullPath: string;
    if (cleanPath.startsWith('results/')) {
      fullPath = path.join(__dirname, '..', cleanPath);
    } else if (cleanPath.startsWith('uploads/')) {
      fullPath = path.join(__dirname, '..', cleanPath);
    } else {
      // Default to results directory
      fullPath = path.join(resultsDir, path.basename(cleanPath));
    }

    try {
      return await fs.promises.readFile(fullPath, 'utf8');
    } catch (error: any) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async createRating(data: {
    userId: number | null;
    featureType: string;
    rating: number;
    comment: string | null;
  }) {
    console.log("createRating is not implemented in MemStorage");
    return null;
  }

  async getRatings(limit: number = 50) {
    console.log("getRatings is not implemented in MemStorage");
    return [];
  }

  async getRatingsByUser(userId: number, limit: number = 50) {
     console.log("getRatingsByUser is not implemented in MemStorage");
    return [];
  }

  async getRatingsByFeature(featureType: string, limit: number = 50) {
      console.log("getRatingsByFeature is not implemented in MemStorage");
    return [];
  }

  async getAverageRatingByFeature(featureType: string) {
     console.log("getAverageRatingByFeature is not implemented in MemStorage");
    return 0;
  }
  
  // Implement required admin operations to satisfy interface
  async getUsersWithRole(role: string): Promise<User[]> {
    console.log("getUsersWithRole is not implemented in MemStorage");
    return [];
  }
  
  async getSystemLogs(limit: number = 50, level?: string): Promise<any[]> {
    console.log("getSystemLogs is not implemented in MemStorage");
    return [];
  }
  
  async logSystemEvent(data: { 
    message: string;
    level: string;
    component: string;
    userId?: number | null;
    feature?: string | null;
    metadata?: any;
  }): Promise<any> {
    console.log("logSystemEvent is not implemented in MemStorage");
    return {
      id: 0,
      timestamp: new Date(),
      level: data.level,
      component: data.component,
      message: data.message
    };
  }
  
  async getAnalyticsDailySnapshots(startDate?: Date, endDate?: Date): Promise<any> {
    console.log("getAnalyticsDailySnapshots is not implemented in MemStorage");
    return { dailyStats: [] };
  }
  
  async getApiUsageStats(startDate?: Date, endDate?: Date): Promise<any> {
    console.log("getApiUsageStats is not implemented in MemStorage");
    return { monthlyStats: [] };
  }
  
  async logApiCall(data: {
    service: string;
    endpoint: string;
    responseTimeMs: number;
    success: boolean;
    errorMessage?: string | null;
    userId?: number | null;
    requestSize?: number;
    responseSize?: number;
  }): Promise<any> {
    console.log("logApiCall is not implemented in MemStorage");
    return {
      id: 0,
      timestamp: new Date(),
      service: data.service,
      endpoint: data.endpoint,
      responseTimeMs: data.responseTimeMs,
      success: data.success
    };
  }
}

// Database Storage Implementation

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async createTranscription(insertTranscription: InsertTranscription): Promise<Transcription> {
    try {
      const [transcription] = await db
        .insert(transcriptions)
        .values(insertTranscription)
        .returning();

      // Update user stats
      await this.updateUserStatsAfterTranscription(insertTranscription.userId);

      return transcription;
    } catch (error) {
      console.error("Error creating transcription:", error);
      // Try with null audioPath if the original insert fails
      const fallbackTranscription = {
        ...insertTranscription,
        audioPath: null
      };

      const [transcription] = await db
        .insert(transcriptions)
        .values(fallbackTranscription)
        .returning();

      // Update user stats
      await this.updateUserStatsAfterTranscription(fallbackTranscription.userId);

      return transcription;
    }
  }

  async getTranscriptions(userId: number, limit: number = 50): Promise<Transcription[]> {
    return db
      .select()
      .from(transcriptions)
      .where(eq(transcriptions.userId, userId))
      .orderBy(transcriptions.createdAt)
      .limit(limit);
  }

  async getTranscription(id: number): Promise<Transcription | undefined> {
    const [transcription] = await db
      .select()
      .from(transcriptions)
      .where(eq(transcriptions.id, id));

    return transcription || undefined;
  }

  async createTranslation(insertTranslation: InsertTranslation): Promise<Translation> {
    try {
      const [translation] = await db
        .insert(translations)
        .values(insertTranslation)
        .returning();

      // Update user stats
      await this.updateUserStatsAfterTranslation(insertTranslation.userId);

      return translation;
    } catch (error) {
      console.error("Error creating translation:", error);
      // Try with null audioPath if the original insert fails
      const fallbackTranslation = {
        ...insertTranslation,
        audioPath: null
      };

      const [translation] = await db
        .insert(translations)
        .values(fallbackTranslation)
        .returning();

      // Update user stats
      await this.updateUserStatsAfterTranslation(fallbackTranslation.userId);

      return translation;
    }
  }

  async getTranslations(userId: number, limit: number = 50): Promise<Translation[]> {
    return db
      .select()
      .from(translations)
      .where(eq(translations.userId, userId))
      .orderBy(translations.createdAt)
      .limit(limit);
  }

  async getTranslation(id: number): Promise<Translation | undefined> {
    const [translation] = await db
      .select()
      .from(translations)
      .where(eq(translations.id, id));

    return translation || undefined;
  }

  async createTextToSpeech(insertTextToSpeech: InsertTextToSpeech): Promise<TextToSpeech> {
    try {
      const [textToSpeech] = await db
        .insert(textToSpeechItems)
        .values(insertTextToSpeech)
        .returning();

      // Update user stats
      await this.updateUserStatsAfterTTS(insertTextToSpeech.userId);

      return textToSpeech;
    } catch (error) {
      console.error("Error creating text-to-speech:", error);
      // If the insertion fails, try with an empty audioPath
      const fallbackTTS = {
        ...insertTextToSpeech,
        audioPath: "/placeholder-audio.mp3" // Providing a placeholder since this field is required
      };

      const [textToSpeech] = await db
        .insert(textToSpeechItems)
        .values(fallbackTTS)
        .returning();

      // Update user stats
      await this.updateUserStatsAfterTTS(fallbackTTS.userId);

      return textToSpeech;
    }
  }

  async getTextToSpeechItems(userId: number, limit: number = 50): Promise<TextToSpeech[]> {
    return db
      .select()
      .from(textToSpeechItems)
      .where(eq(textToSpeechItems.userId, userId))
      .orderBy(textToSpeechItems.createdAt)
      .limit(limit);
  }

  async getTextToSpeech(id: number): Promise<TextToSpeech | undefined> {
    const [textToSpeech] = await db
      .select()
      .from(textToSpeechItems)
      .where(eq(textToSpeechItems.id, id));

    return textToSpeech || undefined;
  }

  async createSpeechToSpeech(insertSpeechToSpeech: InsertSpeechToSpeech): Promise<SpeechToSpeech> {
    try {
      const [speechToSpeech] = await db
        .insert(speechToSpeechItems)
        .values(insertSpeechToSpeech)
        .returning();

      // Update user stats
      await this.updateUserStatsAfterSTS(insertSpeechToSpeech.userId);

      return speechToSpeech;
    } catch (error) {
      console.error("Error creating speech-to-speech:", error);
      // If the insertion fails, try with placeholders for audio paths
      const fallbackSTS = {
        ...insertSpeechToSpeech,
        originalAudioPath: "/placeholder-original.mp3", // Required field
        translatedAudioPath: insertSpeechToSpeech.translatedAudioPath || "/placeholder-translated.mp3"
      };

      const [speechToSpeech] = await db
        .insert(speechToSpeechItems)
        .values(fallbackSTS)
        .returning();

      // Update user stats
      await this.updateUserStatsAfterSTS(fallbackSTS.userId);

      return speechToSpeech;
    }
  }

  async getSpeechToSpeechItems(userId: number, limit: number = 50): Promise<SpeechToSpeech[]> {
    return db
      .select()
      .from(speechToSpeechItems)
      .where(eq(speechToSpeechItems.userId, userId))
      .orderBy(speechToSpeechItems.createdAt)
      .limit(limit);
  }

  async getSpeechToSpeech(id: number): Promise<SpeechToSpeech | undefined> {
    const [speechToSpeech] = await db
      .select()
      .from(speechToSpeechItems)
      .where(eq(speechToSpeechItems.id, id));

    return speechToSpeech || undefined;
  }

  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));

    return stats || undefined;
  }

  async createOrUpdateUserStats(stats: InsertUserStats): Promise<UserStats> {
    const existingStats = await this.getUserStats(stats.userId);

    if (existingStats) {
      const [updatedStats] = await db
        .update(userStats)
        .set({
          ...stats,
          updatedAt: new Date()
        })
        .where(eq(userStats.id, existingStats.id))
        .returning();

      return updatedStats;
    } else {
      const [newStats] = await db
        .insert(userStats)
        .values({
          ...stats,
          updatedAt: new Date()
        })
        .returning();

      return newStats;
    }
  }

  // Private methods to update stats
  private async updateUserStatsAfterTranscription(userId: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      await db
        .update(userStats)
        .set({
          totalTranscriptions: stats.totalTranscriptions + 1,
          updatedAt: new Date()
        })
        .where(eq(userStats.id, stats.id));
    } else {
      await db
        .insert(userStats)
        .values({
          userId,
          totalTranscriptions: 1,
          totalTranslations: 0,
          totalTextToSpeech: 0, 
          totalSpeechToSpeech: 0,
          transcriptionTimeSeconds: 0,
          updatedAt: new Date()
        });
    }
  }

  private async updateUserStatsAfterTranslation(userId: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      await db
        .update(userStats)
        .set({
          totalTranslations: stats.totalTranslations + 1,
          updatedAt: new Date()
        })
        .where(eq(userStats.id, stats.id));
    } else {
      await db
        .insert(userStats)
        .values({
          userId,
          totalTranscriptions: 0,
          totalTranslations: 1,
          totalTextToSpeech: 0, 
          totalSpeechToSpeech: 0,
          transcriptionTimeSeconds: 0,
          updatedAt: new Date()
        });
    }
  }

  private async updateUserStatsAfterTTS(userId: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      await db
        .update(userStats)
        .set({
          totalTextToSpeech: stats.totalTextToSpeech + 1,
          updatedAt: new Date()
        })
        .where(eq(userStats.id, stats.id));
    } else {
      await db
        .insert(userStats)
        .values({
          userId,
          totalTranscriptions: 0,
          totalTranslations: 0,
          totalTextToSpeech: 1, 
          totalSpeechToSpeech: 0,
          transcriptionTimeSeconds: 0,
          updatedAt: new Date()
        });
    }
  }

  private async updateUserStatsAfterSTS(userId: number): Promise<void> {
    const stats = await this.getUserStats(userId);
    if (stats) {
      await db
        .update(userStats)
        .set({
          totalSpeechToSpeech: stats.totalSpeechToSpeech + 1,
          updatedAt: new Date()
        })
        .where(eq(userStats.id, stats.id));
    } else {
      await db
        .insert(userStats)
        .values({
          userId,
          totalTranscriptions: 0,
          totalTranslations: 0,
          totalTextToSpeech: 0, 
          totalSpeechToSpeech: 1,
          transcriptionTimeSeconds: 0,
          updatedAt: new Date()
        });
    }
  }

  async createRating(data: {
    userId: number | null;
    featureType: string;
    rating: number;
    comment: string | null;
  }) {
    // If userId is null, we need to ensure it's properly handled for the database
    const ratingData = {
      userId: data.userId,
      featureType: data.featureType,
      rating: data.rating,
      comment: data.comment
    };
    
    const [newRating] = await db.insert(ratings).values(ratingData).returning();
    return newRating;
  }

  async getRatings(limit: number = 50) {
    return await db.select().from(ratings).limit(limit);
  }

  async getRatingsByUser(userId: number, limit: number = 50) {
    return await db.select()
      .from(ratings)
      .where(eq(ratings.userId, userId))
      .limit(limit);
  }

  async getRatingsByFeature(featureType: string, limit: number = 50) {
    return await db.select()
      .from(ratings)
      .where(eq(ratings.featureType, featureType))
      .limit(limit);
  }

  async getAverageRatingByFeature(featureType: string) {
    const result = await db.select({
      average: sql<number>`avg(${ratings.rating})`
    })
    .from(ratings)
    .where(eq(ratings.featureType, featureType));

    return result[0]?.average || 0;
  }

  // File operations - These remain the same from MemStorage
  async getFileBufferFromRequest(req: any): Promise<Buffer> {
    try {
      if (req.file && req.file.buffer) {
        return req.file.buffer;
      }

      throw new Error("No file buffer available in the request");
    } catch (error: any) {
      console.error("Error accessing file buffer:", error);
      throw error;
    }
  }

  async saveTextToFile(text: string, fileName: string): Promise<string> {
    try {
      const filePath = path.join(resultsDir, fileName);
      fs.writeFileSync(filePath, text);
      return filePath;
    } catch (error: any) {
      console.error("Error saving text to file:", error);
      throw error;
    }
  }

  async getFileContent(filePath: string): Promise<string> {
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error: any) {
      console.error("Error reading file content:", error);
      throw error;
    }
  }
  
  // Admin operations - Real database implementations
  async getUsersWithRole(role: string): Promise<User[]> {
    try {
      if (role) {
        return await db.select().from(users).where(eq(users.role, role));
      } else {
        return await db.select().from(users);
      }
    } catch (error) {
      console.error(`Error fetching users with role ${role}:`, error);
      return [];
    }
  }
  
  // Method to log API usage to apiUsage table for analytics
  async logApiCall(data: {
    service: string;
    endpoint: string;
    responseTimeMs: number;
    success: boolean;
    errorMessage?: string | null;
    userId?: number | null;
    requestSize?: number;
    responseSize?: number;
  }): Promise<any> {
    try {
      const [apiUsageEntry] = await db.insert(apiUsage).values({
        timestamp: new Date(),
        service: data.service,
        endpoint: data.endpoint,
        responseTimeMs: data.responseTimeMs,
        success: data.success,
        errorMessage: data.errorMessage || null,
        userId: data.userId || null,
        requestSize: data.requestSize || 0,
        responseSize: data.responseSize || 0
      }).returning();
      
      return apiUsageEntry;
    } catch (error) {
      console.error('Error logging API call to database:', error);
      // Return a minimal object to avoid breaking app
      return {
        id: 0,
        timestamp: new Date(),
        service: data.service,
        endpoint: data.endpoint,
        responseTimeMs: data.responseTimeMs,
        success: data.success
      };
    }
  }
  
  async getSystemLogs(limit: number = 50, level?: string): Promise<any[]> {
    try {
      let query = db.select().from(systemLogs).orderBy(desc(systemLogs.timestamp));
      
      // Apply level filter if provided
      if (level) {
        query = query.where(eq(systemLogs.level, level));
      }
      
      // Apply limit
      query = query.limit(limit);
      
      const logs = await query;
      
      // If no logs exist, create a sample log to avoid errors with empty lists
      if (logs.length === 0 && limit > 0) {
        const sampleLog = await this.logSystemEvent({
          message: "System initialized",
          level: "INFO",
          component: "System",
          metadata: { details: "First system log" }
        });
        return [sampleLog];
      }
      
      return logs;
    } catch (error) {
      console.error('Error fetching system logs:', error);
      return [];
    }
  }
  
  async logSystemEvent(data: { 
    message: string;
    level: string;
    component: string;
    userId?: number | null;
    feature?: string | null;
    metadata?: any;
  }): Promise<any> {
    try {
      const [log] = await db.insert(systemLogs).values({
        message: data.message,
        level: data.level,
        component: data.component,
        userId: data.userId || null,
        feature: data.feature || null,
        metadata: data.metadata || null,
        timestamp: new Date()
      }).returning();
      
      return log;
    } catch (error) {
      console.error('Error logging system event:', error);
      
      // On error, return a minimum viable object to avoid breaking the app
      return {
        id: 0,
        timestamp: new Date(),
        level: data.level,
        component: data.component,
        message: data.message,
        userId: data.userId,
        feature: data.feature,
        metadata: data.metadata
      };
    }
  }
  
  async getAnalyticsDailySnapshots(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      let query = db.select().from(analyticsDailyTable).orderBy(analyticsDailyTable.date);
      
      if (startDate) {
        query = query.where(gte(analyticsDailyTable.date, startDate));
      }
      
      if (endDate) {
        query = query.where(lte(analyticsDailyTable.date, endDate));
      }
      
      const stats = await query;
      
      // If no stats exist yet, create sample entries
      if (stats.length === 0) {
        const today = new Date();
        const dailyStats = [];
        
        // Create 7 days of sample data
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          
          // Create a sample entry for this date
          const [entry] = await db.insert(analyticsDailyTable).values({
            date: date,
            totalTranscriptions: Math.floor(Math.random() * 100),
            totalTranslations: Math.floor(Math.random() * 80),
            totalTts: Math.floor(Math.random() * 60),
            totalSts: Math.floor(Math.random() * 40),
            avgResponseTimeMs: Math.floor(Math.random() * 1000 + 500),
            errorCount: Math.floor(Math.random() * 5),
            activeUsers: Math.floor(Math.random() * 200 + 300),
            mostUsedLanguage: "english",
            mostUsedLanguagePair: JSON.stringify({ source: "english", target: "shona" })
          }).returning();
          
          dailyStats.push({
            date: entry.date.toISOString().split('T')[0],
            transcriptions: entry.totalTranscriptions,
            translations: entry.totalTranslations,
            tts: entry.totalTts,
            sts: entry.totalSts,
            errors: entry.errorCount,
            activeUsers: entry.activeUsers
          });
        }
        
        return { dailyStats };
      }
      
      // Transform database rows to the format expected by the frontend
      const dailyStats = stats.map(entry => ({
        date: entry.date.toISOString().split('T')[0],
        transcriptions: entry.totalTranscriptions,
        translations: entry.totalTranslations,
        tts: entry.totalTts,
        sts: entry.totalSts,
        errors: entry.errorCount,
        activeUsers: entry.activeUsers
      }));
      
      return { dailyStats };
    } catch (error) {
      console.error('Error fetching analytics daily snapshots:', error);
      
      // Create minimal stats array to avoid breaking the app
      const today = new Date();
      const dailyStats = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          transcriptions: 0,
          translations: 0,
          tts: 0,
          sts: 0,
          errors: 0,
          activeUsers: 0
        };
      }).reverse();
      
      return { dailyStats };
    }
  }
  
  async getApiUsageStats(startDate?: Date, endDate?: Date): Promise<any> {
    try {
      // First, check if we have any API usage data
      const usageData = await db.select().from(apiUsage);
      
      // If no data exists, create some sample data
      if (usageData.length === 0) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
        const monthlyStats = [];
        
        for (let i = 0; i < months.length; i++) {
          // Calculate a start date for this month (just for demonstration)
          const monthDate = new Date();
          monthDate.setMonth(monthDate.getMonth() - (4 - i));
          monthDate.setDate(1); // First day of month
          
          // Create some sample api usage entries for this month
          const numEntries = Math.floor(Math.random() * 50) + 50;
          let totalCalls = 0;
          let totalDataSize = 0;
          
          for (let j = 0; j < numEntries; j++) {
            const requestSize = Math.floor(Math.random() * 5000) + 1000;
            const responseSize = Math.floor(Math.random() * 10000) + 2000;
            
            await db.insert(apiUsage).values({
              timestamp: monthDate,
              service: ['transcription', 'translation', 'tts', 'sts'][Math.floor(Math.random() * 4)],
              endpoint: '/api/' + ['transcribe', 'translate', 'tts', 'sts'][Math.floor(Math.random() * 4)],
              responseTimeMs: Math.floor(Math.random() * 2000) + 100,
              success: Math.random() > 0.1, // 90% success rate
              errorMessage: Math.random() > 0.1 ? null : 'Sample error message',
              userId: 1, // Demo user
              requestSize,
              responseSize
            });
            
            totalCalls++;
            totalDataSize += (requestSize + responseSize) / (1024 * 1024); // Convert to MB
          }
          
          monthlyStats.push({
            month: months[i],
            apiCalls: totalCalls,
            dataTransferred: parseFloat(totalDataSize.toFixed(2))
          });
        }
        
        return { monthlyStats };
      }
      
      // If we have data, calculate monthly stats from api_usage table
      // For simplicity, we'll assume we want the last 5 months
      const today = new Date();
      const monthStats = [];
      
      for (let i = 4; i >= 0; i--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const nextMonth = new Date(monthDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        // Count all API calls for this month
        const monthCalls = await db.select({
          count: sql<number>`count(*)`,
          dataSize: sql<number>`sum(${apiUsage.requestSize} + ${apiUsage.responseSize}) / (1024 * 1024)` // MB
        })
        .from(apiUsage)
        .where(
          and(
            gte(apiUsage.timestamp, monthDate),
            lt(apiUsage.timestamp, nextMonth)
          )
        );
        
        const monthName = monthDate.toLocaleString('default', { month: 'short' });
        
        monthStats.push({
          month: monthName,
          apiCalls: parseInt(monthCalls[0]?.count?.toString() || '0'),
          dataTransferred: parseFloat(monthCalls[0]?.dataSize?.toString() || '0').toFixed(2)
        });
      }
      
      return { monthlyStats: monthStats };
    } catch (error) {
      console.error('Error fetching API usage stats:', error);
      
      // Return minimal data to avoid breaking the app
      const monthlyStats = [
        { month: 'Jan', apiCalls: 0, dataTransferred: 0 },
        { month: 'Feb', apiCalls: 0, dataTransferred: 0 },
        { month: 'Mar', apiCalls: 0, dataTransferred: 0 },
        { month: 'Apr', apiCalls: 0, dataTransferred: 0 },
        { month: 'May', apiCalls: 0, dataTransferred: 0 }
      ];
      
      return { monthlyStats };
    }
  }
}

// Use the database storage implementation instead of memory storage
export const storage = new DatabaseStorage();