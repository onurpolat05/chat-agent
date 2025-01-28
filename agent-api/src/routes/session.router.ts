import express from "express";
import { sessionService } from "../services/session.service.js";
import { agentService } from "../services/agent.service.js";
import { UserMetadata } from "../types/session.type.js";
import * as UAParser from "ua-parser-js";

// Express'in Request tipini genişletiyoruz
declare global {
  namespace Express {
    interface Request {
      agent?: any; // veya daha spesifik bir tip
    }
  }
}

const router = express.Router();

// Middleware to validate agent token
const validateAgentToken = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const token = req.headers["x-agent-token"] as string;
  if (!token) {
    res.status(401).json({ error: "Agent token is required" });
    return;
  }

  const agent = await agentService.getAgentByToken(token);
  if (!agent) {
    res.status(401).json({ error: "Invalid agent token" });
    return;
  }

  req.agent = agent;
  next();
};

// Create a new session
router.post("/", validateAgentToken, async (req, res) => {
  try {
    const agent = req.agent;
    if (!agent) {
      res.status(401).json({ error: "Agent not found" });
      return;
    }

    // Parse user agent
    const parser = new UAParser.UAParser(req.headers["user-agent"]);
    const result = parser.getResult();

    // Get user metadata from request
    const userMetadata: UserMetadata = {
      ipAddress: req.ip || "127.0.0.1",
      userAgent: req.headers["user-agent"] || "unknown",
      device: {
        type: result.device.type || "desktop",
        browser: result.browser.name || "unknown",
        os: result.os.name || "unknown",
      },
    };

    // Create session with user metadata
    const session = await sessionService.createSession(agent.id, userMetadata);
    if (!session) {
      res.status(500).json({ error: "Failed to create session" });
      return;
    }

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating session:", error);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Get sessions for an agent
router.get("/", validateAgentToken, async (req, res) => {
  try {
    const agent = req.agent;
    const sessions = await sessionService.getSessionsByAgentId(agent.id);
    res.json({ sessions });
  } catch (error) {
    console.error("Error getting sessions:", error);
    res.status(500).json({ error: "Failed to get sessions" });
  }
});

// Get session details
router.get("/:sessionId", validateAgentToken, async (req, res) => {
  try {
    const session = await sessionService.getSession(req.params.sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Verify the session belongs to the agent
    if (session.agentId !== req.agent.id) {
      res.status(403).json({ error: "Unauthorized access to session" });
      return;
    }

    res.json({ session });
  } catch (error) {
    console.error("Error getting session details:", error);
    res.status(500).json({ error: "Failed to get session details" });
  }
});

// Delete a session
router.delete("/:sessionId", validateAgentToken, async (req, res) => {
  try {
    const session = await sessionService.getSession(req.params.sessionId);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Verify the session belongs to the agent
    if (session.agentId !== req.agent.id) {
      res.status(403).json({ error: "Unauthorized access to session" });
      return;
    }

    await sessionService.deleteSession(req.params.sessionId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

export default router;
