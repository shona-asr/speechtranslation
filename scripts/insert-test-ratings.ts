
import { db } from "../server/db";
import { ratings } from "../shared/schema";

async function insertTestRatings() {
  try {
    // Insert test ratings
    await db.insert(ratings).values([
      {
        userId: 1,
        rating: 5,
        comment: "Excellent transcription accuracy!",
        featureType: "transcription",
        createdAt: new Date()
      },
      {
        userId: 2,
        rating: 4,
        comment: "Translation works great but could be faster",
        featureType: "translation",
        createdAt: new Date()
      },
      {
        userId: 3,
        rating: 5,
        comment: "Text to speech sounds very natural",
        featureType: "text-to-speech",
        createdAt: new Date()
      }
    ]);

    console.log("Test ratings inserted successfully!");
  } catch (error) {
    console.error("Error inserting test ratings:", error);
  } finally {
    process.exit();
  }
}

insertTestRatings();
