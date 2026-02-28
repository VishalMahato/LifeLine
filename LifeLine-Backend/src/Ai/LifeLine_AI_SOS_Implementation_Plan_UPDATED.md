# 🚑 LifeLine AI SOS Triage — Detailed Implementation Plan

**Updated based on existing codebase analysis**

---

## 📋 EXECUTIVE SUMMARY

This plan integrates AI-powered emergency triage into your **existing** LifeLine backend. We will **NOT** recreate what already exists. Instead, we'll add AI triage as a pre-step before emergency creation.

### What You Already Have ✅

- ✅ **Emergency Model** (`Emergency.model.mjs`) - Complete schema with all required fields
- ✅ **Emergency Service** (`Emergency.service.mjs`) - `createEmergency()` and `triggerSOS()` methods
- ✅ **Emergency Controller** (`Emergency.controller.mjs`) - HTTP endpoints
- ✅ **Emergency Routes** - API routing setup
- ✅ **Location tracking** - GeoJSON Point with 2dsphere indexing
- ✅ **Helper assignment** - Auto-assignment logic
- ✅ **Medical info** - bloodType, allergies, conditions, etc.

### What We Need to Add 🆕

- 🆕 **AI Triage Service** - LangGraph-based conversation flow
- 🆕 **Triage Session Management** - Temporary storage for ongoing conversations
- 🆕 **Triage API Endpoints** - `/triage/start` and `/triage/message`
- 🆕 **AI Decision Engine** - Determines if emergency should be created
- 🆕 **Integration Hook** - Connects AI decision → existing `createEmergency()`

---

## 🏗 ARCHITECTURE OVERVIEW

```
User presses SOS
    ↓
POST /api/triage/start
    ↓
AI asks questions (multi-turn)
    ↓
POST /api/triage/message (repeat)
    ↓
AI makes decision
    ↓
If emergency needed:
    → Call existing EmergencyService.triggerSOS()
    → Returns emergency ID
If minor issue:
    → Return guidance only
```

---

## 📦 FILE STRUCTURE (What to Create)

```
backend/
  src/
    Ai/
      ✅ Prompt/
          ✅ LifeLine_AI_Emergency_Triage.txt (already exists)
      
      🆕 triage/
          triageGraph.mjs          # LangGraph state machine
          triageState.mjs          # Session state definition
          triagePrompts.mjs        # AI prompts (uses your .txt file)
          triageMapper.mjs         # Maps AI output → Emergency schema
          triageService.mjs        # Main orchestrator
          triageSession.mjs        # Session storage (Redis/Memory)
          triage.controller.mjs    # HTTP handlers
          triage.routes.mjs        # Express routes
          triage.constants.mjs     # Constants
          triage.utils.mjs         # Helper functions
    
    api/
      Emergency/
        ✅ Emergency.model.mjs (NO CHANGES)
        ✅ Emergency.service.mjs (NO CHANGES)
        ✅ Emergency.controller.mjs (NO CHANGES)
        ✅ Emergency.routes.mjs (NO CHANGES)
```

---

## 🔄 DETAILED IMPLEMENTATION STEPS

---

### **PHASE 1: Dependencies & Setup**

#### Step 1.1: Install Required Packages

```bash
pnpm add @langchain/core @langchain/openai @langchain/community langgraph zod
pnpm add ioredis  # For session storage (or use in-memory for dev)
```

**Packages:**
- `@langchain/core` - Core LangChain functionality
- `@langchain/openai` - OpenAI integration
- `langgraph` - State machine for multi-turn conversations
- `zod` - Schema validation
- `ioredis` - Redis client for session storage

#### Step 1.2: Environment Variables

Add to `.env`:

```env
# AI Configuration
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=500

# Session Storage
REDIS_URL=redis://localhost:6379
SESSION_TTL=300  # 5 minutes

# Triage Settings
MAX_TRIAGE_QUESTIONS=6
TRIAGE_TIMEOUT_SECONDS=300
```

---

### **PHASE 2: Core AI Triage Components**

---

#### Step 2.1: Create `triageState.mjs`

**Purpose:** Define what the AI remembers during conversation

```javascript
// src/Ai/triage/triageState.mjs

export const TriageStateSchema = {
  // Session Info
  sessionId: String,
  userId: String,
  startedAt: Date,
  
  // Conversation
  messages: [
    {
      role: 'user' | 'assistant',
      content: String,
      timestamp: Date
    }
  ],
  
  // Extracted Information
  extractedInfo: {
    symptoms: [],
    consciousness: null,  // 'conscious' | 'unconscious' | 'unknown'
    breathing: null,      // 'normal' | 'difficulty' | 'not_breathing' | 'unknown'
    bleeding: null,       // 'none' | 'minor' | 'severe' | 'unknown'
    mobility: null,       // 'mobile' | 'immobile' | 'unknown'
    pain: null,          // 'none' | 'mild' | 'moderate' | 'severe' | 'unknown'
    urgency: null,       // 'critical' | 'high' | 'medium' | 'low'
    location: null,      // From device
    otherDetails: {}
  },
  
  // Decision
  decision: null,  // 'need_more_info' | 'create_emergency' | 'no_emergency'
  severity: null,  // 'critical' | 'high' | 'medium' | 'minor'
  
  // Emergency Payload (if creating)
  emergencyPayload: {
    type: null,
    title: null,
    description: null,
    priority: null,
    medicalInfo: {}
  },
  
  // Metadata
  questionCount: 0,
  lastUpdated: Date
};

export class TriageState {
  constructor(userId) {
    this.sessionId = generateSessionId();
    this.userId = userId;
    this.startedAt = new Date();
    this.messages = [];
    this.extractedInfo = {
      symptoms: [],
      consciousness: 'unknown',
      breathing: 'unknown',
      bleeding: 'unknown',
      mobility: 'unknown',
      pain: 'unknown',
      urgency: null,
      location: null,
      otherDetails: {}
    };
    this.decision = null;
    this.severity = null;
    this.emergencyPayload = {
      type: null,
      title: null,
      description: null,
      priority: null,
      medicalInfo: {}
    };
    this.questionCount = 0;
    this.lastUpdated = new Date();
  }
  
  addMessage(role, content) {
    this.messages.push({
      role,
      content,
      timestamp: new Date()
    });
    this.questionCount++;
    this.lastUpdated = new Date();
  }
  
  updateExtractedInfo(info) {
    this.extractedInfo = { ...this.extractedInfo, ...info };
    this.lastUpdated = new Date();
  }
  
  setDecision(decision, severity, payload = null) {
    this.decision = decision;
    this.severity = severity;
    if (payload) {
      this.emergencyPayload = payload;
    }
    this.lastUpdated = new Date();
  }
}

function generateSessionId() {
  return `triage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

---

#### Step 2.2: Create `triageSession.mjs`

**Purpose:** Store and retrieve triage sessions (Redis or Memory)

```javascript
// src/Ai/triage/triageSession.mjs

import Redis from 'ioredis';

const USE_REDIS = process.env.REDIS_URL ? true : false;
const SESSION_TTL = parseInt(process.env.SESSION_TTL) || 300; // 5 minutes

// In-memory fallback
const memoryStore = new Map();

let redisClient = null;
if (USE_REDIS) {
  redisClient = new Redis(process.env.REDIS_URL);
}

export class TriageSessionManager {
  /**
   * Save triage session
   */
  static async saveSession(sessionId, state) {
    const data = JSON.stringify(state);
    
    if (USE_REDIS) {
      await redisClient.setex(
        `triage:${sessionId}`,
        SESSION_TTL,
        data
      );
    } else {
      memoryStore.set(sessionId, {
        data,
        expiresAt: Date.now() + (SESSION_TTL * 1000)
      });
    }
  }
  
  /**
   * Load triage session
   */
  static async loadSession(sessionId) {
    if (USE_REDIS) {
      const data = await redisClient.get(`triage:${sessionId}`);
      return data ? JSON.parse(data) : null;
    } else {
      const session = memoryStore.get(sessionId);
      if (!session) return null;
      
      // Check expiration
      if (Date.now() > session.expiresAt) {
        memoryStore.delete(sessionId);
        return null;
      }
      
      return JSON.parse(session.data);
    }
  }
  
  /**
   * Delete triage session
   */
  static async deleteSession(sessionId) {
    if (USE_REDIS) {
      await redisClient.del(`triage:${sessionId}`);
    } else {
      memoryStore.delete(sessionId);
    }
  }
  
  /**
   * Extend session TTL
   */
  static async extendSession(sessionId) {
    if (USE_REDIS) {
      await redisClient.expire(`triage:${sessionId}`, SESSION_TTL);
    } else {
      const session = memoryStore.get(sessionId);
      if (session) {
        session.expiresAt = Date.now() + (SESSION_TTL * 1000);
      }
    }
  }
}
```

---

#### Step 2.3: Create `triagePrompts.mjs`

**Purpose:** AI prompts aligned with your existing prompt file

```javascript
// src/Ai/triage/triagePrompts.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the main triage prompt
const MAIN_PROMPT_PATH = path.join(__dirname, '../Prompt/LifeLine_AI_Emergency_Triage.txt');
const MAIN_TRIAGE_PROMPT = fs.readFileSync(MAIN_PROMPT_PATH, 'utf-8');

/**
 * System prompt for question generation
 */
export const QUESTION_PROMPT = `
${MAIN_TRIAGE_PROMPT}

---

CURRENT CONVERSATION:
{conversationHistory}

EXTRACTED INFO SO FAR:
{extractedInfo}

TASK:
Based on the conversation and extracted info, decide next action.

Return ONLY valid JSON in one of these formats:

1. Need more info:
{
  "decision": "need_more_info",
  "question": "your next question here"
}

2. Create emergency:
{
  "decision": "create_emergency",
  "severity": "critical" | "high",
  "emergency": {
    "type": "medical" | "accident" | "fire" | "crime" | "natural_disaster" | "other",
    "title": "short title",
    "description": "clear description",
    "priority": "critical" | "high" | "medium",
    "medicalInfo": {}
  },
  "reason": "why emergency needed"
}

3. No emergency:
{
  "decision": "no_emergency",
  "severity": "minor",
  "guidance": "advice for user",
  "reason": "why no emergency"
}

RULES:
- Ask max 6 questions total
- Current question count: {questionCount}
- If critical signs detected, create emergency immediately
- If minor issue, provide guidance
- Be concise and calm
`;

/**
 * Extraction prompt to parse user input
 */
export const EXTRACTION_PROMPT = `
Extract key medical/emergency information from user's message.

USER MESSAGE:
{userMessage}

PREVIOUS EXTRACTED INFO:
{extractedInfo}

Extract and return JSON:
{
  "symptoms": ["symptom1", "symptom2"],
  "consciousness": "conscious" | "unconscious" | "unknown",
  "breathing": "normal" | "difficulty" | "not_breathing" | "unknown",
  "bleeding": "none" | "minor" | "severe" | "unknown",
  "mobility": "mobile" | "immobile" | "unknown",
  "pain": "none" | "mild" | "moderate" | "severe" | "unknown",
  "urgency": "critical" | "high" | "medium" | "low" | null,
  "otherDetails": {}
}

Only include fields mentioned in the message. Merge with previous info.
`;

/**
 * Build conversation history string
 */
export function buildConversationHistory(messages) {
  return messages
    .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n');
}

/**
 * Build extracted info string
 */
export function buildExtractedInfoString(extractedInfo) {
  return JSON.stringify(extractedInfo, null, 2);
}
```

---

#### Step 2.4: Create `triageMapper.mjs`

**Purpose:** Map AI decision → Emergency schema (your existing schema)

```javascript
// src/Ai/triage/triageMapper.mjs

/**
 * Maps AI triage decision to Emergency schema format
 * Ensures compatibility with existing Emergency.model.mjs
 */
export class TriageMapper {
  /**
   * Map AI emergency payload to Emergency schema
   */
  static mapToEmergencySchema(aiPayload, userId, location) {
    return {
      // Required fields from your schema
      type: aiPayload.type || 'medical',
      title: aiPayload.title,
      description: aiPayload.description,
      priority: aiPayload.priority || 'high',
      
      // Location (from device)
      location: {
        type: 'Point',
        coordinates: [location.longitude, location.latitude],
        address: location.address,
        accuracy: location.accuracy,
        provider: location.provider || 'gps'
      },
      
      // User
      userId,
      
      // Medical info (if provided)
      medicalInfo: aiPayload.medicalInfo || {},
      
      // Settings
      settings: {
        autoAssignHelpers: true,
        notifyGuardians: true,
        maxHelpers: 3,
        searchRadius: 5000,
        timeoutMinutes: 30
      }
    };
  }
  
  /**
   * Validate emergency type
   */
  static validateEmergencyType(type) {
    const validTypes = ['medical', 'accident', 'fire', 'crime', 'natural_disaster', 'other'];
    return validTypes.includes(type) ? type : 'medical';
  }
  
  /**
   * Validate priority
   */
  static validatePriority(priority) {
    const validPriorities = ['critical', 'high', 'medium', 'low'];
    return validPriorities.includes(priority) ? priority : 'high';
  }
  
  /**
   * Generate title if missing
   */
  static generateTitle(type, extractedInfo) {
    const titleMap = {
      medical: 'Medical Emergency',
      accident: 'Accident Emergency',
      fire: 'Fire Emergency',
      crime: 'Crime Emergency',
      natural_disaster: 'Natural Disaster',
      other: 'Emergency Situation'
    };
    
    return titleMap[type] || 'Emergency Alert';
  }
  
  /**
   * Generate description from extracted info
   */
  static generateDescription(extractedInfo, aiDescription) {
    if (aiDescription) return aiDescription;
    
    const parts = [];
    
    if (extractedInfo.symptoms?.length > 0) {
      parts.push(`Symptoms: ${extractedInfo.symptoms.join(', ')}`);
    }
    
    if (extractedInfo.consciousness && extractedInfo.consciousness !== 'unknown') {
      parts.push(`Consciousness: ${extractedInfo.consciousness}`);
    }
    
    if (extractedInfo.breathing && extractedInfo.breathing !== 'unknown') {
      parts.push(`Breathing: ${extractedInfo.breathing}`);
    }
    
    if (extractedInfo.pain && extractedInfo.pain !== 'unknown') {
      parts.push(`Pain level: ${extractedInfo.pain}`);
    }
    
    return parts.length > 0 
      ? parts.join('. ') 
      : 'Emergency assistance required';
  }
}
```

---

### **PHASE 3: LangGraph Integration**

#### Step 2.5: Create `triageGraph.mjs`

**Purpose:** LangGraph state machine for conversation flow

```javascript
// src/Ai/triage/triageGraph.mjs

import { ChatOpenAI } from '@langchain/openai';
import { StateGraph, END } from '@langchain/langgraph';
import { 
  QUESTION_PROMPT, 
  EXTRACTION_PROMPT,
  buildConversationHistory,
  buildExtractedInfoString 
} from './triagePrompts.mjs';

const model = new ChatOpenAI({
  modelName: process.env.AI_MODEL || 'gpt-4o-mini',
  temperature: parseFloat(process.env.AI_TEMPERATURE) || 0.3,
  maxTokens: parseInt(process.env.AI_MAX_TOKENS) || 500,
});

/**
 * Extract information from user message
 */
async function extractInformation(state) {
  const lastMessage = state.messages[state.messages.length - 1];
  
  if (lastMessage.role !== 'user') {
    return state;
  }
  
  const prompt = EXTRACTION_PROMPT
    .replace('{userMessage}', lastMessage.content)
    .replace('{extractedInfo}', JSON.stringify(state.extractedInfo));
  
  try {
    const response = await model.invoke(prompt);
    const extracted = JSON.parse(response.content);
    
    // Merge with existing extracted info
    state.extractedInfo = {
      ...state.extractedInfo,
      ...extracted,
      symptoms: [
        ...(state.extractedInfo.symptoms || []),
        ...(extracted.symptoms || [])
      ].filter((v, i, a) => a.indexOf(v) === i) // unique
    };
  } catch (error) {
    console.error('Extraction error:', error);
  }
  
  return state;
}

/**
 * Make decision and generate next question or final response
 */
async function makeDecision(state) {
  const prompt = QUESTION_PROMPT
    .replace('{conversationHistory}', buildConversationHistory(state.messages))
    .replace('{extractedInfo}', buildExtractedInfoString(state.extractedInfo))
    .replace('{questionCount}', state.questionCount.toString());
  
  try {
    const response = await model.invoke(prompt);
    const decision = JSON.parse(response.content);
    
    state.decision = decision.decision;
    state.severity = decision.severity || null;
    
    if (decision.decision === 'need_more_info') {
      state.messages.push({
        role: 'assistant',
        content: decision.question,
        timestamp: new Date()
      });
    } else if (decision.decision === 'create_emergency') {
      state.emergencyPayload = decision.emergency;
      state.messages.push({
        role: 'assistant',
        content: 'I understand the situation. Creating emergency alert now...',
        timestamp: new Date()
      });
    } else if (decision.decision === 'no_emergency') {
      state.messages.push({
        role: 'assistant',
        content: decision.guidance,
        timestamp: new Date()
      });
    }
    
  } catch (error) {
    console.error('Decision error:', error);
    // Fallback: ask a generic question
    state.decision = 'need_more_info';
    state.messages.push({
      role: 'assistant',
      content: 'Can you describe what happened?',
      timestamp: new Date()
    });
  }
  
  return state;
}

/**
 * Route to next node based on decision
 */
function routeDecision(state) {
  if (state.decision === 'need_more_info') {
    return 'continue';
  } else {
    return 'end';
  }
}

/**
 * Build the triage graph
 */
export function buildTriageGraph() {
  const workflow = new StateGraph({
    channels: {
      sessionId: null,
      userId: null,
      messages: null,
      extractedInfo: null,
      decision: null,
      severity: null,
      emergencyPayload: null,
      questionCount: null,
      lastUpdated: null
    }
  });
  
  // Add nodes
  workflow.addNode('extract', extractInformation);
  workflow.addNode('decide', makeDecision);
  
  // Add edges
  workflow.addEdge('extract', 'decide');
  workflow.addConditionalEdges(
    'decide',
    routeDecision,
    {
      continue: 'extract',
      end: END
    }
  );
  
  // Set entry point
  workflow.setEntryPoint('extract');
  
  return workflow.compile();
}
```

---

### **PHASE 4: Service Layer**

#### Step 2.6: Create `triageService.mjs`

**Purpose:** Main orchestrator - connects everything

```javascript
// src/Ai/triage/triageService.mjs

import { TriageState } from './triageState.mjs';
import { TriageSessionManager } from './triageSession.mjs';
import { buildTriageGraph } from './triageGraph.mjs';
import { TriageMapper } from './triageMapper.mjs';
import EmergencyService from '../../api/Emergency/Emergency.service.mjs';

const MAX_QUESTIONS = parseInt(process.env.MAX_TRIAGE_QUESTIONS) || 6;

export class TriageService {
  /**
   * Start new triage session
   */
  static async startTriage(userId, initialMessage = null) {
    try {
      // Create new state
      const state = new TriageState(userId);
      
      // Add initial message if provided
      if (initialMessage) {
        state.addMessage('user', initialMessage);
      }
      
      // Run graph to get first question
      const graph = buildTriageGraph();
      const result = await graph.invoke(state);
      
      // Save session
      await TriageSessionManager.saveSession(result.sessionId, result);
      
      // Get last assistant message
      const lastMessage = result.messages
        .filter(m => m.role === 'assistant')
        .pop();
      
      return {
        success: true,
        data: {
          sessionId: result.sessionId,
          question: lastMessage?.content || 'What happened? Please describe your situation.',
          questionCount: result.questionCount
        }
      };
    } catch (error) {
      throw new Error(`Failed to start triage: ${error.message}`);
    }
  }
  
  /**
   * Process user message in ongoing triage
   */
  static async processMessage(sessionId, userMessage, location = null) {
    try {
      // Load session
      let state = await TriageSessionManager.loadSession(sessionId);
      
      if (!state) {
        throw new Error('Triage session not found or expired');
      }
      
      // Add user message
      state.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });
      state.questionCount++;
      
      // Store location if provided
      if (location) {
        state.extractedInfo.location = location;
      }
      
      // Check max questions
      if (state.questionCount >= MAX_QUESTIONS && !state.decision) {
        // Force decision
        state.decision = 'create_emergency';
        state.severity = 'high';
        state.emergencyPayload = {
          type: 'medical',
          title: 'Emergency Assistance Required',
          description: TriageMapper.generateDescription(state.extractedInfo, null),
          priority: 'high',
          medicalInfo: {}
        };
      } else {
        // Run graph
        const graph = buildTriageGraph();
        state = await graph.invoke(state);
      }
      
      // Save updated session
      await TriageSessionManager.saveSession(sessionId, state);
      
      // Handle decision
      if (state.decision === 'create_emergency') {
        // Create emergency using existing service
        const emergencyData = TriageMapper.mapToEmergencySchema(
          state.emergencyPayload,
          state.userId,
          state.extractedInfo.location || {}
        );
        
        const emergency = await EmergencyService.triggerSOS(
          emergencyData,
          state.userId
        );
        
        // Clean up session
        await TriageSessionManager.deleteSession(sessionId);
        
        return {
          success: true,
          decision: 'emergency_created',
          data: {
            emergency: emergency.data.emergency,
            message: 'Emergency alert created. Help is on the way.'
          }
        };
      } else if (state.decision === 'no_emergency') {
        // Get guidance message
        const guidanceMessage = state.messages
          .filter(m => m.role === 'assistant')
          .pop();
        
        // Clean up session
        await TriageSessionManager.deleteSession(sessionId);
        
        return {
          success: true,
          decision: 'no_emergency',
          data: {
            guidance: guidanceMessage?.content,
            severity: state.severity
          }
        };
      } else {
        // Continue conversation
        const nextQuestion = state.messages
          .filter(m => m.role === 'assistant')
          .pop();
        
        return {
          success: true,
          decision: 'continue',
          data: {
            question: nextQuestion?.content,
            questionCount: state.questionCount,
            extractedInfo: state.extractedInfo
          }
        };
      }
    } catch (error) {
      throw new Error(`Failed to process message: ${error.message}`);
    }
  }
  
  /**
   * Get triage session status
   */
  static async getSessionStatus(sessionId) {
    try {
      const state = await TriageSessionManager.loadSession(sessionId);
      
      if (!state) {
        return {
          success: false,
          message: 'Session not found or expired'
        };
      }
      
      return {
        success: true,
        data: {
          sessionId: state.sessionId,
          questionCount: state.questionCount,
          decision: state.decision,
          extractedInfo: state.extractedInfo,
          messages: state.messages
        }
      };
    } catch (error) {
      throw new Error(`Failed to get session status: ${error.message}`);
    }
  }
  
  /**
   * Cancel triage session
   */
  static async cancelTriage(sessionId) {
    try {
      await TriageSessionManager.deleteSession(sessionId);
      
      return {
        success: true,
        message: 'Triage session cancelled'
      };
    } catch (error) {
      throw new Error(`Failed to cancel triage: ${error.message}`);
    }
  }
}
```

---

### **PHASE 5: API Layer**

#### Step 2.7: Create `triage.controller.mjs`

```javascript
// src/Ai/triage/triage.controller.mjs

import { TriageService } from './triageService.mjs';

export class TriageController {
  /**
   * Start triage session
   * POST /api/triage/start
   */
  static async startTriage(req, res) {
    try {
      const userId = req.user.id;
      const { initialMessage } = req.body;
      
      const result = await TriageService.startTriage(userId, initialMessage);
      
      res.status(201).json(result);
    } catch (error) {
      console.error('Start triage error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start triage',
        error: error.message
      });
    }
  }
  
  /**
   * Process user message
   * POST /api/triage/message
   */
  static async processMessage(req, res) {
    try {
      const { sessionId, message, location } = req.body;
      
      if (!sessionId || !message) {
        return res.status(400).json({
          success: false,
          message: 'sessionId and message are required'
        });
      }
      
      const result = await TriageService.processMessage(
        sessionId,
        message,
        location
      );
      
      res.json(result);
    } catch (error) {
      console.error('Process message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process message',
        error: error.message
      });
    }
  }
  
  /**
   * Get session status
   * GET /api/triage/session/:sessionId
   */
  static async getSessionStatus(req, res) {
    try {
      const { sessionId } = req.params;
      
      const result = await TriageService.getSessionStatus(sessionId);
      
      res.json(result);
    } catch (error) {
      console.error('Get session status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get session status',
        error: error.message
      });
    }
  }
  
  /**
   * Cancel triage
   * DELETE /api/triage/session/:sessionId
   */
  static async cancelTriage(req, res) {
    try {
      const { sessionId } = req.params;
      
      const result = await TriageService.cancelTriage(sessionId);
      
      res.json(result);
    } catch (error) {
      console.error('Cancel triage error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel triage',
        error: error.message
      });
    }
  }
}
```

---

#### Step 2.8: Create `triage.routes.mjs`

```javascript
// src/Ai/triage/triage.routes.mjs

import express from 'express';
import { TriageController } from './triage.controller.mjs';
import { authMiddleware } from '../../middleware/auth.middleware.mjs'; // Adjust path

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Start triage session
router.post('/start', TriageController.startTriage);

// Process message
router.post('/message', TriageController.processMessage);

// Get session status
router.get('/session/:sessionId', TriageController.getSessionStatus);

// Cancel session
router.delete('/session/:sessionId', TriageController.cancelTriage);

export default router;
```

---

### **PHASE 6: Integration**

#### Step 2.9: Register Routes in `server.mjs`

```javascript
// src/server.mjs

import triageRoutes from './Ai/triage/triage.routes.mjs';

// ... existing code ...

// Register triage routes
app.use('/api/triage', triageRoutes);

// ... existing emergency routes ...
```

---

## 🧪 TESTING PLAN

### Test Case 1: Critical Emergency (Chest Pain)

```bash
# Start triage
POST /api/triage/start
{
  "initialMessage": "I have severe chest pain"
}

# Response:
{
  "success": true,
  "data": {
    "sessionId": "triage_...",
    "question": "Are you able to breathe normally?",
    "questionCount": 1
  }
}

# Continue
POST /api/triage/message
{
  "sessionId": "triage_...",
  "message": "No, difficulty breathing",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "Connaught Place, New Delhi"
  }
}

# Response (Emergency Created):
{
  "success": true,
  "decision": "emergency_created",
  "data": {
    "emergency": {
      "id": "...",
      "type": "medical",
      "priority": "critical",
      ...
    },
    "message": "Emergency alert created. Help is on the way."
  }
}
```

### Test Case 2: Minor Issue (Headache)

```bash
POST /api/triage/start
{
  "initialMessage": "I have a headache"
}

# AI asks questions...

# Final response:
{
  "success": true,
  "decision": "no_emergency",
  "data": {
    "guidance": "Rest, drink water, and take mild pain relief if needed. Seek care if pain worsens.",
    "severity": "minor"
  }
}
```

---

## 📊 INTEGRATION FLOW DIAGRAM

```
┌─────────────────┐
│  User SOS Press │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ POST /triage/start  │
│ Creates session     │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ AI asks question    │
│ Returns sessionId   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────────┐
│ User answers            │
│ POST /triage/message    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ AI extracts info        │
│ Makes decision          │
└────────┬────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────────┐
│ Minor  │ │ Critical         │
│ Issue  │ │ Emergency        │
└────┬───┘ └────┬─────────────┘
     │          │
     │          ▼
     │    ┌──────────────────────────┐
     │    │ EmergencyService         │
     │    │ .triggerSOS()            │
     │    │ (EXISTING CODE)          │
     │    └────┬─────────────────────┘
     │         │
     │         ▼
     │    ┌──────────────────────────┐
     │    │ Emergency Created        │
     │    │ Helpers Assigned         │
     │    │ Notifications Sent       │
     │    └──────────────────────────┘
     │
     ▼
┌──────────────────┐
│ Guidance Only    │
│ No Emergency     │
└──────────────────┘
```

---

## 🎯 KEY INTEGRATION POINTS

### 1. **No Changes to Existing Emergency System**
- ✅ `Emergency.model.mjs` - Unchanged
- ✅ `Emergency.service.mjs` - Unchanged
- ✅ `Emergency.controller.mjs` - Unchanged
- ✅ Helper assignment logic - Unchanged
- ✅ Notification system - Unchanged

### 2. **AI Triage as Pre-Step**
- AI triage runs BEFORE emergency creation
- Only creates emergency if AI decides it's necessary
- Uses existing `EmergencyService.triggerSOS()` method
- Passes properly formatted data matching your schema

### 3. **Data Flow**
```
AI Decision → TriageMapper → Emergency Schema → EmergencyService.triggerSOS()
```

---

## 🚀 DEPLOYMENT CHECKLIST

- [ ] Install dependencies (`pnpm add ...`)
- [ ] Add environment variables to `.env`
- [ ] Create all files in `src/Ai/triage/`
- [ ] Register routes in `server.mjs`
- [ ] Test with Postman/cURL
- [ ] Test critical emergency flow
- [ ] Test minor issue flow
- [ ] Test session timeout
- [ ] Test max questions limit
- [ ] Deploy to staging
- [ ] Monitor AI costs
- [ ] Deploy to production

---

## 💰 COST ESTIMATION

**Using GPT-4o-mini:**
- ~$0.15 per 1M input tokens
- ~$0.60 per 1M output tokens

**Per triage session (avg 4 questions):**
- Input: ~2000 tokens
- Output: ~400 tokens
- Cost: ~$0.0006 per session

**1000 sessions/day = ~$0.60/day = $18/month**

Very affordable! 🎉

---

## 📝 SUMMARY

This plan:
1. ✅ Uses your **existing** Emergency schema, service, and controller
2. ✅ Adds AI triage as a **separate module**
3. ✅ Integrates via `EmergencyService.triggerSOS()`
4. ✅ No modifications to existing emergency code
5. ✅ Clean separation of concerns
6. ✅ Production-ready architecture
7. ✅ Cost-effective
8. ✅ Scalable

**Next Steps:**
1. Install dependencies
2. Create files in order (State → Session → Prompts → Mapper → Graph → Service → Controller → Routes)
3. Test each component
4. Integrate with frontend

Ready to implement! 🚀
