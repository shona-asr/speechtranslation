import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from 'dotenv';
import { logger } from './logger';

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
      
      // Log API requests to database for monitoring
      const isSuccess = res.statusCode >= 200 && res.statusCode < 400;
      const userId = (req as any).user?.id; // Extract user ID if available
      
      // Extract service name from the API path
      const pathParts = path.split('/');
      const service = pathParts.length > 2 ? pathParts[2] : 'general';
      
      // Log to database asynchronously (don't wait for it to complete)
      logger.logApiUsage(
        service, 
        path, 
        duration, 
        isSuccess, 
        {
          userId,
          errorMessage: !isSuccess ? capturedJsonResponse?.message || `Error ${res.statusCode}` : null,
          requestSize: req.get('content-length') ? parseInt(req.get('content-length') || '0') : 0,
          responseSize: res.get('content-length') ? parseInt(res.get('content-length') || '0') : 0
        }
      ).catch(err => console.error('Failed to log API usage:', err));
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use(async (err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log server errors (5xx) to the database
    if (status >= 500) {
      const userId = (req as any).user?.id;
      const path = req.path;
      const pathParts = path.split('/');
      const service = pathParts.length > 2 ? pathParts[2] : 'general';
      
      try {
        await logger.error(message, 'Server', {
          userId,
          feature: service,
          metadata: {
            path,
            method: req.method,
            statusCode: status,
            stack: err.stack,
            query: req.query,
            headers: {
              ...req.headers,
              // Omit potentially sensitive headers
              authorization: req.headers.authorization ? '[REDACTED]' : undefined,
              cookie: req.headers.cookie ? '[REDACTED]' : undefined
            }
          }
        });
      } catch (logError) {
        console.error('Failed to log error to database:', logError);
      }
    }
    
    res.status(status).json({ message });
    
    // Rethrow in development for better debugging
    if (process.env.NODE_ENV === 'development') {
      throw err;
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on http://localhost:${port}`);
  });
})();
