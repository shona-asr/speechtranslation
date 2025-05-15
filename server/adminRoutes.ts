import express from 'express';
import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Create middleware to check for admin role
export const checkAdminRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) {
      console.log('No authorization header present');
      return res.status(401).json({ error: "Unauthorized - No auth header" });
    }
    
    // Get the Firebase UID from Authorization header
    const firebaseUid = req.headers.authorization;
    console.log('Attempting to authorize user with firebaseUid:', firebaseUid);
    
    // For demo purposes, support both numeric IDs (for testing) and Firebase UIDs
    let user;
    
    // First try to get user by Firebase UID
    user = await storage.getUserByFirebaseUid(firebaseUid);
    
    // Fallback to get user by ID if Firebase UID lookup fails and the value is numeric
    if (!user && !isNaN(parseInt(firebaseUid))) {
      user = await storage.getUser(parseInt(firebaseUid));
    }
    
    console.log('Found user:', user);
    
    // *** FOR DEVELOPMENT/DEMO PURPOSES ONLY ***
    // If no user is found in the database for the provided Firebase UID,
    // create a temporary admin user for this request to allow development
    if (!user) {
      console.log('Creating temporary admin user for development');
      user = {
        id: 999,
        firebaseUid: firebaseUid,
        email: 'admin@example.com',
        username: 'admin',
        displayName: 'Admin User',
        role: 'admin',
        preferredLanguage: 'english',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } else if (user.email === 'admin@example.com') {
      // For demo purposes, always allow admin@example.com to have admin access
      user.role = 'admin';
    }
    
    if (user.role !== 'admin') {
      console.log('User found but not admin:', user.role);
      return res.status(403).json({ error: "Forbidden - Admin access required" });
    }
    
    // Add user to request for use in route handlers
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Error in admin authentication:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
};

export const registerAdminRoutes = (app: express.Express) => {
  // Admin system logs endpoint
  app.get("/api/admin/logs", checkAdminRole, async (req, res) => {
    try {
      const { level, limit } = req.query;
      const logs = await storage.getSystemLogs(
        Number(limit) || 100, 
        level ? String(level) : undefined
      );
      
      return res.json(logs);
    } catch (error) {
      console.error("Error fetching system logs:", error);
      return res.status(500).json({ error: "Failed to fetch system logs" });
    }
  });
  
  // Admin log creation endpoint
  app.post("/api/admin/logs", checkAdminRole, async (req, res) => {
    try {
      const { message, level, component, feature, metadata } = req.body;
      
      if (!message || !level || !component) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      
      const log = await storage.logSystemEvent({
        message,
        level,
        component,
        userId: (req as any).user?.id || null,
        feature: feature || null,
        metadata: metadata || null
      });
      
      return res.status(201).json(log);
    } catch (error) {
      console.error("Error creating system log:", error);
      return res.status(500).json({ error: "Failed to create system log" });
    }
  });
  
  // Admin analytics endpoints
  app.get("/api/admin/analytics/daily", checkAdminRole, async (req, res) => {
    try {
      const { start, end } = req.query;
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (start) {
        startDate = new Date(String(start));
      }
      
      if (end) {
        endDate = new Date(String(end));
      }
      
      const analytics = await storage.getAnalyticsDailySnapshots(startDate, endDate);
      return res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  
  // Admin API usage stats
  app.get("/api/admin/api-usage", checkAdminRole, async (req, res) => {
    try {
      const { start, end } = req.query;
      let startDate: Date | undefined;
      let endDate: Date | undefined;
      
      if (start) {
        startDate = new Date(String(start));
      }
      
      if (end) {
        endDate = new Date(String(end));
      }
      
      const usageStats = await storage.getApiUsageStats(startDate, endDate);
      return res.json(usageStats);
    } catch (error) {
      console.error("Error fetching API usage stats:", error);
      return res.status(500).json({ error: "Failed to fetch API usage stats" });
    }
  });
  
  // Admin user management
  app.get("/api/admin/users", checkAdminRole, async (req, res) => {
    try {
      const { role } = req.query;
      
      if (role) {
        const users = await storage.getUsersWithRole(String(role));
        return res.json(users);
      } else {
        // Return all users (this should be paginated in a real application)
        const users: any[] = [];
        for (let i = 1; i <= 20; i++) {
          const user = await storage.getUser(i);
          if (user) {
            users.push(user);
          }
        }
        return res.json(users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // Admin dashboard summary statistics
  app.get("/api/admin/dashboard/summary", checkAdminRole, async (req, res) => {
    try {
      // Get total number of users (this should use a more efficient query in production)
      const adminUsers = await storage.getUsersWithRole('admin');
      const regularUsers = await storage.getUsersWithRole('user');
      
      // Get recent ratings
      const recentRatings = await storage.getRatings(10);
      
      // Get average ratings by feature
      const transcriptionRating = await storage.getAverageRatingByFeature('transcription');
      const translationRating = await storage.getAverageRatingByFeature('translation');
      const ttsRating = await storage.getAverageRatingByFeature('textToSpeech');
      const stsRating = await storage.getAverageRatingByFeature('speechToSpeech');
      
      // Get recent system logs
      const recentErrors = await storage.getSystemLogs(5, 'ERROR');
      
      return res.json({
        userCounts: {
          total: adminUsers.length + regularUsers.length,
          admins: adminUsers.length,
          regular: regularUsers.length
        },
        ratings: {
          recent: recentRatings,
          averages: {
            transcription: transcriptionRating,
            translation: translationRating,
            textToSpeech: ttsRating,
            speechToSpeech: stsRating
          }
        },
        recentErrors
      });
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      return res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  });

  // Update user role endpoint
  app.patch("/api/admin/users/:userId/role", checkAdminRole, async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role || !['admin', 'user', 'moderator'].includes(role)) {
        return res.status(400).json({ error: "Invalid role specified" });
      }

      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user role
      user.role = role;
      await storage.updateUser(user);

      return res.json({ message: "Role updated successfully", user });
    } catch (error) {
      console.error("Error updating user role:", error);
      return res.status(500).json({ error: "Failed to update user role" });
    }
  });
};