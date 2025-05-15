import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from 'multer';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerAdminRoutes } from './adminRoutes';
import { registerRatingsRoutes } from './ratingsRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Your API endpoint
  const API_BASE_URL = process.env.API_BASE_URL;

  // Transcribe endpoint - FormData
  app.post("/api/transcribe", upload.single('audio'), async (req, res) => {
    try {
      console.log("Received transcribe request");
      
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }
      
      const formData = new FormData();
      formData.append('audio', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      
      // Add any additional form fields
      if (req.body.language) {
        formData.append('language', req.body.language);
      }
      
      console.log("Sending request to transcription API");
      // Convert FormData to a format suitable for fetch
      const formDataBuffer = formData.getBuffer();
      const formDataHeaders = formData.getHeaders();
      
      const response = await fetch(`${API_BASE_URL}/transcribe`, {
        method: "POST",
        body: formDataBuffer,
        headers: formDataHeaders as HeadersInit,
      });
      
      if (!response.ok) {
        console.error(`Transcription API responded with status: ${response.status}`);
        return res.status(response.status).json({ 
          error: `API error: ${response.statusText}` 
        });
      }

      const data = await response.json();
      console.log("Received response from transcription API");
      res.json(data);
    } catch (error) {
      console.error("Transcribe API error:", error);
      res.status(500).json({ error: "Failed to connect to transcription service" });
    }
  });

  // Streaming transcription endpoint - FormData
  app.post("/api/transcribe_stream", upload.single('audio_chunk'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio chunk provided" });
      }
      
      const formData = new FormData();
      formData.append('audio_chunk', req.file.buffer, {
        filename: 'chunk.wav',
        contentType: req.file.mimetype,
      });
      
      // Add any additional form fields
      if (req.body.language) {
        formData.append('language', req.body.language);
      }
      
      // Convert FormData to a format suitable for fetch
      const formDataBuffer = formData.getBuffer();
      const formDataHeaders = formData.getHeaders();
      
      const response = await fetch(`${API_BASE_URL}/transcribe_stream`, {
        method: "POST",
        body: formDataBuffer,
        headers: formDataHeaders as HeadersInit,
      });
      
      if (!response.ok) {
        console.error(`Streaming API responded with status: ${response.status}`);
        return res.status(response.status).json({ 
          error: `API error: ${response.statusText}` 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Streaming transcription API error:", error);
      res.status(500).json({ error: "Failed to connect to streaming transcription service" });
    }
  });

  // Translation endpoint - JSON
  app.post("/api/translate", async (req, res) => {
    try {
      console.log("Translation request:", req.body);
      
      const response = await fetch(`${API_BASE_URL}/translate`, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        console.error(`Translation API responded with status: ${response.status}`);
        return res.status(response.status).json({ 
          error: `API error: ${response.statusText}` 
        });
      }

      const data = await response.json();
      console.log("Translation response received");
      res.json(data);
    } catch (error) {
      console.error("Translation API error:", error);
      res.status(500).json({ error: "Failed to connect to translation service" });
    }
  });

  // Text-to-Speech endpoint - JSON
  app.post("/api/text-to-speech", async (req, res) => {
    try {
      console.log("Text-to-Speech request:", req.body);
      
      const response = await fetch(`${API_BASE_URL}/text-to-speech`, {
        method: "POST",
        body: JSON.stringify(req.body),
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        console.error(`TTS API responded with status: ${response.status}`);
        return res.status(response.status).json({ 
          error: `API error: ${response.statusText}` 
        });
      }

      // TTS returns audio file directly, not JSON
      const buffer = Buffer.from(await response.arrayBuffer());
      
      res.setHeader('Content-Type', 'audio/mp3');
      res.setHeader('Content-Disposition', 'attachment; filename="speech.mp3"');
      res.send(buffer);
    } catch (error) {
      console.error("Text-to-Speech API error:", error);
      res.status(500).json({ error: "Failed to connect to text-to-speech service" });
    }
  });

  // Speech-to-Speech translation endpoint
  app.post("/api/speech-to-speech-translate", upload.single('audio'), async (req, res) => {
    try {
      console.log("Speech-to-Speech request received");
      
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }
      
      const formData = new FormData();
      formData.append('audio', req.file.buffer, {
        filename: req.file.originalname || 'audio.wav',
        contentType: req.file.mimetype,
      });
      
      // Add form fields for source and target language
      formData.append('sourceLanguage', req.body.sourceLanguage || 'auto');
      formData.append('targetLanguage', req.body.targetLanguage);
      
      console.log(`Sending S2S request to API with sourceLanguage=${req.body.sourceLanguage}, targetLanguage=${req.body.targetLanguage}`);
      
      // Convert FormData to a format suitable for fetch
      const formDataBuffer = formData.getBuffer();
      const formDataHeaders = formData.getHeaders();
      
      const response = await fetch(`${API_BASE_URL}/speech-to-speech-translate`, {
        method: "POST",
        body: formDataBuffer,
        headers: formDataHeaders as HeadersInit,
      });
      
      if (!response.ok) {
        console.error(`Speech-to-Speech API responded with status: ${response.status}`);
        return res.status(response.status).json({ 
          error: `API error: ${response.statusText}` 
        });
      }

      const data = await response.json();
      console.log("Speech-to-Speech response received");
      
      // Add response validation and debugging
      if (!data.originalText || !data.translatedText) {
        console.warn("Speech-to-Speech API response missing text fields:", data);
      }
      
      // Ensure all required fields exist
      const validatedData = {
        originalText: data.originalText || "No transcription available",
        translatedText: data.translatedText || "No translation available",
        sourceLanguage: data.sourceLanguage || req.body.sourceLanguage || "auto",
        targetLanguage: data.targetLanguage || req.body.targetLanguage,
        synthesizedAudio: data.synthesizedAudio || ""
      };
      
      res.json(validatedData);
    } catch (error) {
      console.error("Speech-to-Speech API error:", error);
      res.status(500).json({ error: "Failed to connect to speech-to-speech translation service" });
    }
  });

  // Reset context endpoint
  app.post("/api/reset_context", async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reset_context`, {
        method: "POST",
      });
      
      if (!response.ok) {
        console.error(`Reset context API responded with status: ${response.status}`);
        return res.status(response.status).json({ 
          error: `API error: ${response.statusText}` 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Reset context API error:", error);
      res.status(500).json({ error: "Failed to reset transcription context" });
    }
  });

  // Get user stats endpoint
  app.get("/api/user-stats", async (req, res) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-stats`, {
        method: "GET",
      });
      
      if (!response.ok) {
        console.error(`User stats API responded with status: ${response.status}`);
        return res.status(response.status).json({ 
          error: `API error: ${response.statusText}` 
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("User stats API error:", error);
      res.status(500).json({ error: "Failed to fetch user statistics" });
    }
  });

  // Public route for accessing documents
  app.use('/attached_assets', express.static(path.join(__dirname, '../attached_assets')));

  app.get("/api/list-docs", (req, res) => {
    const dirPath = path.join(__dirname, "../attached_assets");
    const allowedExtensions = [".pdf", ".docx", ".ppt"];

    fs.readdir(dirPath, (err, files) => {
      if (err) return res.status(500).json({ error: "Failed to list files." });

      const documents = files.filter((file) =>
        allowedExtensions.includes(path.extname(file).toLowerCase())
      );

      res.json({ documents });
    });
  });

  // Register ratings API routes
  registerRatingsRoutes(app);

  // Register admin API routes
  registerAdminRoutes(app);
  
  const httpServer = createServer(app);
  return httpServer;
}