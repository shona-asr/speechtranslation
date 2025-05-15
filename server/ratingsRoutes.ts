import express from 'express';
import { storage } from "./storage";

export const registerRatingsRoutes = (app: express.Express) => {
  // Create a new rating
  app.post("/api/ratings", async (req, res) => {
    try {
      console.log('Backend: Received rating request:', req.body);
      const { userId, featureType, rating, comment } = req.body;
      
      if (!featureType || !rating) {
        console.log('Backend: Missing required fields:', { featureType, rating });
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Set userId to null if not provided
      const actualUserId = userId || null;
      console.log('Backend: Processing with userId:', actualUserId);
      
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
      
      console.log('Backend: Attempting to save rating to database');
      const newRating = await storage.createRating({
        userId: actualUserId,
        featureType,
        rating,
        comment: comment || null
      });
      
      console.log('Backend: Rating saved successfully:', newRating);
      return res.status(201).json(newRating);
    } catch (error) {
      console.error("Backend: Error creating rating:", error);
      return res.status(500).json({ error: "Failed to save rating" });
    }
  });
  
  // Get ratings (with optional filters)
  app.get("/api/ratings", async (req, res) => {
    try {
      const { userId, featureType, limit } = req.query;
      let ratings;
      
      if (userId && featureType) {
        // Filter by both user and feature
        ratings = await storage.getRatingsByUser(Number(userId), Number(limit) || 50);
        ratings = ratings.filter(r => r.featureType === featureType);
      } else if (userId) {
        // Filter by user only
        ratings = await storage.getRatingsByUser(Number(userId), Number(limit) || 50);
      } else if (featureType) {
        // Filter by feature only
        ratings = await storage.getRatingsByFeature(featureType as string, Number(limit) || 50);
      } else {
        // Get all ratings
        ratings = await storage.getRatings(Number(limit) || 50);
      }
      
      return res.json(ratings);
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return res.status(500).json({ error: "Failed to fetch ratings" });
    }
  });
  
  // Get average rating for a feature
  app.get("/api/ratings/average/:featureType", async (req, res) => {
    try {
      const { featureType } = req.params;
      
      if (!featureType) {
        return res.status(400).json({ error: "Feature type is required" });
      }
      
      const average = await storage.getAverageRatingByFeature(featureType);
      return res.json({ featureType, average });
    } catch (error) {
      console.error("Error fetching average rating:", error);
      return res.status(500).json({ error: "Failed to fetch average rating" });
    }
  });
};