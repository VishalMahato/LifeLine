# LifeLine Emergency System - Complete Features Documentation

**Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Author:** Senior Backend Architect

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Core Features](#core-features)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Business Logic](#business-logic)
6. [Integration Points](#integration-points)
7. [Security & Access Control](#security--access-control)
8. [Performance Optimizations](#performance-optimizations)
9. [Known Issues & Fixes](#known-issues--fixes)
10. [Testing Guidelines](#testing-guidelines)

---

## 🎯 System Overview

The Emergency System is the **core module** of LifeLine, handling:
- Real-time SOS emergency alerts
- Geospatial helper assignment
- Emergency lifecycle management
- Response time tracking
- Multi-channel notifications

### Architecture Principles

✅ **Geospatial-First**: MongoDB 2dsphere indexing for proximity searches  
✅ **Event-Driven**: Communication logs track every state change  
✅ **Scalable**: Designed for high-concurrency SOS scenarios  
✅ **Fail-Safe**: Graceful degradation when helpers unavailable  
✅ **Auditable**: Complete audit trail via communication logs  

---

## 🚀 Core Features

### 1. SOS Emergency Triggering

**Purpose:** Instant emergency alert creation with automatic helper assignment

**Flow:**
```
User presses SOS → Emergency created → Nearby helpers found → 
Notifications sent → Helpers respond → First helper assigned → 
Helper arrives → Emergency resolved
```

**Key Capabilities:**
- ✅ Automatic priority assignment (CRITICAL for SOS)
- ✅ Geospatial helper search within configurable radius
- ✅ Auto-assignment of up to N helpers (default: 3)
- ✅ Guardian notification (if enabled)
- ✅ Medical info attachment (if available)
- ✅ Location accuracy validation
- ✅ Response time tracking from trigger moment

**Endpoint:** `POST /api/emergency/sos`

**Request:**
```json
{
  "title": "Medical Emergency",
  "message": "Severe chest pain - need immediate help",
  "longitude": 77.209,
  "latitude": 28.6139,
  "address": "Connaught Place, New Delhi",
  "accuracy": 5,
  "provider": "gps",
  "medicalInfo": {
    "bloodType": "O+",
    "allergies": ["Penicillin"],
    "medicalConditions": ["Hypertension"]
  },
  "settings": {
    "autoAssignHelpers": true,
    "notifyGuardians": true,
    "maxHelpers": 3
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "SOS emergency triggered successfully",
  "data": {
    "emergency": {
      "id": "507f1f77bcf86cd799439011",
      "type": "medical",
      "status": "active",
      "priority": "critical",
      "location": {
        "coordinates": [77.209, 28.6139],
        "address": "Connaught Place, New Delhi"
      },
      "assignedHelpers": [...],
      "responseMetrics": {
        "sosTriggeredAt": "2024-01-15T10:30:00.000Z"
      }
    },
    "notificationsSent": 3
  }
}
```

---

### 2. Manual Emergency Creation

**Purpose:** Create non-SOS emergencies (less urgent situations)

**Differences from SOS:**
- User can specify priority level
- May not auto-assign helpers
- Used for planned requests or lower urgency

**Endpoint:** `POST /api/emergency`

**Request:**
```json
{
  "type": "accident",
  "title": "Car Accident",
  "description": "Minor car accident - no injuries",
  "longitude": 77.2167,
  "latitude": 28.6304,
  "address": "Ring Road, New Delhi",
  "priority": "medium"
}
```

---

### 3. Helper Assignment & Response

#### 3.1 Automatic Helper Assignment

**Algorithm:**
1. Calculate search radius based on emergency type
2. Find helpers within radius using geospatial query
3. Filter by availability status
4. Sort by distance (nearest first)
5. Assign up to `maxHelpers` count
6. Send notification to each assigned helper
7. Track assignment metrics

**Geospatial Query:**
```javascript
Emergency.find({
  'location.coordinates': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: radius // meters
    }
  },
  status: 'active'
})
```

#### 3.2 Helper Acceptance

**Endpoint:** `PUT /api/emergency/:id/accept`

**Flow:**
1. Helper receives notification
2. Helper accepts request
3. Status updated to 'accepted'
4. User notified of acceptance
5. Response metrics updated

**Business Rules:**
- ✅ Helper can only accept if status is 'requested'
- ✅ Emergency must be 'active'
- ✅ First acceptance triggers `firstHelperAcceptedAt` metric
- ✅ Communication log entry created

#### 3.3 Helper Arrival

**Endpoint:** `PUT /api/emergency/:id/arrived`

**Flow:**
1. Helper marks arrival
2. Status updated to 'arrived'
3. User notified
4. Arrival time recorded

---

### 4. Emergency Resolution

**Endpoint:** `PUT /api/emergency/:id/resolve`

**Resolution Types:**
- `completed` - Successfully resolved
- `cancelled` - User cancelled
- `timeout` - No response within timeout period
- `no_helpers` - No helpers available

**Request:**
```json
{
  "resolutionType": "completed",
  "notes": "Medical assistance provided successfully",
  "rating": 5,
  "feedback": "Helper was very professional"
}
```

**Business Logic:**
1. Validate emergency is active
2. Set status to 'resolved'
3. Record resolution details
4. Calculate total response time
5. Update helper statistics
6. Send resolution notifications
7. Trigger cleanup tasks

---

### 5. Geospatial Search

#### 5.1 Nearby Emergencies (For Helpers)

**Endpoint:** `GET /api/emergency/nearby/search`

**Query Parameters:**
- `latitude` (required)
- `longitude` (required)
- `radius` (optional, default: 5000 meters)

**Use Case:** Helpers can discover active emergencies near them

**Filters Applied:**
- ✅ Only active emergencies
- ✅ Exclude own emergencies
- ✅ Exclude already assigned emergencies
- ✅ Within specified radius

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "type": "medical",
      "priority": "critical",
      "title": "Medical Emergency",
      "location": {
        "coordinates": [77.209, 28.6139],
        "address": "Connaught Place, New Delhi",
        "distance": 1250 // meters from helper
      },
      "responseMetrics": {
        "sosTriggeredAt": "2024-01-15T10:30:00.000Z"
      }
    }
  ]
}
```

---

### 6. Emergency Retrieval & Filtering

#### 6.1 Get Single Emergency

**Endpoint:** `GET /api/emergency/:id`

**Access Control:**
- ✅ Emergency owner
- ✅ Assigned helpers
- ✅ System admins

**Populated Fields:**
- User information (name, email, phone)
- Helper information (name, email, phone)
- Full communication log
- Complete response metrics

#### 6.2 Get User's Emergencies

**Endpoint:** `GET /api/emergency/user/me`

**Query Parameters:**
- `status` - Filter by status (active, resolved, cancelled)
- `type` - Filter by type (medical, accident, fire, etc.)
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset (default: 0)

**Use Case:** User views their emergency history

---

### 7. Emergency Statistics

**Endpoint:** `GET /api/emergency/stats`

**Access:** Admin only

**Query Parameters:**
- `startDate` - ISO date string
- `endDate` - ISO date string

**Metrics Provided:**
```json
{
  "totalEmergencies": 1250,
  "resolvedEmergencies": 1180,
  "activeEmergencies": 45,
  "cancelledEmergencies": 25,
  "averageResponseTime": 420000, // milliseconds
  "resolutionRate": 94.4, // percentage
  "byType": {
    "medical": 680,
    "accident": 320,
    "fire": 120,
    "crime": 85,
    "other": 45
  },
  "byPriority": {
    "critical": 450,
    "high": 380,
    "medium": 320,
    "low": 100
  },
  "responseTimeDistribution": {
    "under5min": 580,
    "5to10min": 320,
    "10to15min": 180,
    "over15min": 170
  }
}
```

---

## 📊 Data Models

### Emergency Schema

```javascript
{
  _id: ObjectId,
  type: String, // 'medical' | 'accident' | 'fire' | 'crime' | 'natural_disaster' | 'other'
  status: String, // 'active' | 'resolved' | 'cancelled' | 'timeout'
  priority: String, // 'critical' | 'high' | 'medium' | 'low'
  title: String, // max 100 chars
  description: String, // max 500 chars
  
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number, Number], // [longitude, latitude]
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    accuracy: Number, // meters
    provider: String // 'gps' | 'network' | 'manual'
  },
  
  userId: ObjectId, // ref: 'Auth'
  
  medicalInfo: {
    bloodType: String,
    allergies: [String],
    medicalConditions: [String],
    medications: [String],
    emergencyContacts: [{
      name: String,
      phoneNumber: String,
      relationship: String
    }]
  },
  
  assignedHelpers: [{
    helperId: ObjectId, // ref: 'Auth'
    status: String, // 'requested' | 'accepted' | 'arriving' | 'arrived' | 'completed'
    assignedAt: Date,
    acceptedAt: Date,
    arrivedAt: Date,
    completedAt: Date,
    notes: String
  }],
  
  responseMetrics: {
    sosTriggeredAt: Date,
    firstHelperAssignedAt: Date,
    firstHelperAcceptedAt: Date,
    firstHelperArrivedAt: Date,
    resolvedAt: Date,
    totalHelpersRequested: Number,
    totalHelpersAccepted: Number,
    totalHelpersArrived: Number
  },
  
  communicationLog: [{
    type: String, // 'sos_sent' | 'helper_requested' | 'helper_accepted' | etc.
    message: String,
    timestamp: Date,
    actor: {
      userId: ObjectId,
      type: String // 'user' | 'helper' | 'system'
    }
  }],
  
  settings: {
    autoAssignHelpers: Boolean,
    maxHelpers: Number,
    searchRadius: Number, // meters
    timeoutMinutes: Number,
    notifyGuardians: Boolean
  },
  
  resolution: {
    resolvedBy: {
      userId: ObjectId,
      type: String
    },
    resolutionType: String, // 'completed' | 'cancelled' | 'timeout' | 'no_helpers'
    notes: String,
    rating: Number, // 1-5
    feedback: String,
    resolvedAt: Date
  },
  
  tags: [String],
  isTest: Boolean,
  expiresAt: Date, // TTL index - auto-delete after 24 hours
  
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// Geospatial index for proximity searches
{ 'location.coordinates': '2dsphere' }

// User emergencies lookup
{ userId: 1, status: 1, createdAt: -1 }

// Emergency listing and filtering
{ status: 1, priority: 1, createdAt: -1 }

// Helper assignment lookup
{ 'assignedHelpers.helperId': 1, status: 1 }

// TTL index for auto-cleanup
{ expiresAt: 1 } // expires: 0
```

---

## 🔧 Business Logic

### Priority Determination

```javascript
determinePriority(type, context) {
  const basePriorities = {
    medical: 'critical',
    accident: 'critical',
    fire: 'critical',
    crime: 'high',
    natural_disaster: 'critical',
    other: 'medium'
  };
  
  let priority = basePriorities[type];
  
  // Escalate if recurring
  if (context.isReoccurring) {
    priority = escalate(priority);
  }
  
  // Escalate if time-sensitive
  if (context.timeSensitive) {
    priority = escalate(priority);
  }
  
  return priority;
}
```

### Search Radius Calculation

```javascript
calculateSearchRadius(emergencyType, timeElapsed = 0) {
  let baseRadius = 5000; // 5km default
  
  // Type multipliers
  const multipliers = {
    critical: 1.5,
    high: 1.2,
    medium: 1.0,
    low: 0.8
  };
  
  baseRadius *= multipliers[emergencyType] || 1.0;
  
  // Expand over time (10% per minute)
  const timeMultiplier = 1 + (timeElapsed / 10);
  baseRadius *= Math.min(timeMultiplier, 3); // Max 3x
  
  return Math.min(baseRadius, 50000); // Max 50km
}
```

### Response Time Targets

```javascript
const RESPONSE_TIME_TARGETS = {
  critical: 5 * 60 * 1000,  // 5 minutes
  high: 10 * 60 * 1000,     // 10 minutes
  medium: 15 * 60 * 1000,   // 15 minutes
  low: 30 * 60 * 1000       // 30 minutes
};
```

---

## 🔗 Integration Points

### 1. Medical Module Integration

**When Emergency Created:**
```javascript
// Fetch user's medical profile
const medical = await Medical.findOne({ userId });

// Attach relevant medical info to emergency
emergency.medicalInfo = {
  bloodType: medical.bloodType,
  allergies: medical.allergies.map(a => a.substance),
  medicalConditions: medical.conditions
    .filter(c => c.status === 'active')
    .map(c => c.name),
  medications: medical.medications
    .filter(m => m.isActive)
    .map(m => m.name),
  emergencyContacts: medical.emergencyContacts
};
```

**Privacy:** Medical info only visible to:
- Emergency owner
- Accepted helpers during active emergency
- System admins

### 2. Notification Module Integration

**Notification Triggers:**
- `sos_alert` - SOS triggered
- `helper_request` - Helper assigned
- `helper_accepted` - Helper accepted
- `helper_arrived` - Helper arrived
- `emergency_resolved` - Emergency resolved
- `guardian_alert` - Guardian notified

**Channels:**
- Push notifications (mobile app)
- SMS (critical alerts)
- Email (non-urgent updates)

### 3. Helper Module Integration

**Helper Discovery:**
```javascript
// Find available helpers near emergency
const helpers = await Helper.find({
  status: 'available',
  isVerified: true,
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: radius
    }
  }
});
```

---

## 🔒 Security & Access Control

### Authentication

All endpoints require JWT authentication via middleware:
```javascript
router.use(authenticate);
```

### Authorization Matrix

| Endpoint | User (Owner) | Helper (Assigned) | Helper (Unassigned) | Admin |
|----------|--------------|-------------------|---------------------|-------|
| Create Emergency | ✅ | ❌ | ❌ | ✅ |
| View Emergency | ✅ | ✅ | ❌ | ✅ |
| Update Emergency | ✅ | ❌ | ❌ | ✅ |
| Accept Request | ❌ | ✅ | ✅ | ✅ |
| Mark Arrived | ❌ | ✅ | ❌ | ✅ |
| Resolve Emergency | ✅ | ✅ | ❌ | ✅ |
| View Nearby | ❌ | ✅ | ✅ | ✅ |
| View Statistics | ❌ | ❌ | ❌ | ✅ |

### Rate Limiting

```javascript
const RATE_LIMITS = {
  SOS_TRIGGER: {
    windowMs: 60 * 1000,  // 1 minute
    max: 3                // 3 requests max
  },
  EMERGENCY_UPDATE: {
    windowMs: 60 * 1000,
    max: 10
  },
  HELPER_RESPONSE: {
    windowMs: 60 * 1000,
    max: 5
  }
};
```

### Data Sanitization

```javascript
// Location validation
if (longitude < -180 || longitude > 180 || 
    latitude < -90 || latitude > 90) {
  throw new Error('Invalid location coordinates');
}

// String length limits
title: { maxlength: 100 }
description: { maxlength: 500 }

// Enum validation
type: { enum: ['medical', 'accident', 'fire', 'crime', 'natural_disaster', 'other'] }
status: { enum: ['active', 'resolved', 'cancelled', 'timeout'] }
priority: { enum: ['critical', 'high', 'medium', 'low'] }
```

---

## ⚡ Performance Optimizations

### 1. Database Indexes

```javascript
// Compound indexes for common queries
emergencySchema.index({ userId: 1, status: 1, createdAt: -1 });
emergencySchema.index({ status: 1, priority: 1, createdAt: -1 });

// Geospatial index
emergencySchema.index({ 'location.coordinates': '2dsphere' });

// Helper lookup
emergencySchema.index({ 'assignedHelpers.helperId': 1, status: 1 });
```

### 2. Query Optimization

```javascript
// Use lean() for read-only queries
const emergencies = await Emergency.find(query)
  .lean()
  .limit(20);

// Select only needed fields
const emergency = await Emergency.findById(id)
  .select('title description status priority location')
  .lean();

// Populate only required fields
const emergency = await Emergency.findById(id)
  .populate('userId', 'name email phoneNumber')
  .populate('assignedHelpers.helperId', 'name phoneNumber');
```

### 3. Caching Strategy

**Cache Candidates:**
- Emergency statistics (5-minute TTL)
- User's recent emergencies (1-minute TTL)
- Helper availability status (30-second TTL)

**Implementation:**
```javascript
// Redis caching example
const cacheKey = `emergency:stats:${startDate}:${endDate}`;
let stats = await redis.get(cacheKey);

if (!stats) {
  stats = await Emergency.getStatistics(startDate, endDate);
  await redis.setex(cacheKey, 300, JSON.stringify(stats));
}
```

### 4. Pagination

```javascript
// Efficient pagination with cursor-based approach
const emergencies = await Emergency.find({
  _id: { $lt: lastSeenId },
  status: 'active'
})
.sort({ _id: -1 })
.limit(20);
```

---

## 🐛 Known Issues & Fixes

### Issue 1: Route Conflict - `/user/me` vs `/:id`

**Problem:**
```javascript
router.get('/:id', EmergencyController.getEmergency);
router.get('/user/me', EmergencyController.getUserEmergencies);
```

Express matches `/user/me` to `/:id` route first, treating "user" as an ID.

**Fix:**
```javascript
// Place specific routes BEFORE parameterized routes
router.get('/user/me', EmergencyController.getUserEmergencies);
router.get('/:id', EmergencyController.getEmergency);
```

**Status:** ⚠️ **NEEDS FIX** - Update `Emergency.routes.mjs`

---

### Issue 2: Missing Validation in `triggerSOS`

**Problem:**
No validation for required location fields in SOS endpoint.

**Fix:**
```javascript
static async triggerSOS(req, res) {
  try {
    // Add validation
    if (!req.body.longitude || !req.body.latitude) {
      return res.status(400).json({
        success: false,
        message: 'Location coordinates are required for SOS'
      });
    }
    
    if (!req.body.address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required for SOS'
      });
    }
    
    // ... rest of code
  }
}
```

**Status:** ⚠️ **NEEDS FIX** - Update `Emergency.controller.mjs`

---

### Issue 3: Helper Assignment Returns Empty Array

**Problem:**
`findNearbyAvailableHelpers()` is a stub returning empty array.

**Current Code:**
```javascript
static async findNearbyAvailableHelpers(longitude, latitude, radius, limit) {
  // This would integrate with Helper service
  // For now, return mock data
  return [];
}
```

**Fix:**
```javascript
static async findNearbyAvailableHelpers(longitude, latitude, radius, limit) {
  // Import Helper model
  const Helper = await import('../Helper/Helper.model.mjs');
  
  return Helper.find({
    status: 'available',
    isVerified: true,
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: radius
      }
    }
  })
  .limit(limit)
  .lean();
}
```

**Status:** ⚠️ **NEEDS IMPLEMENTATION** - Requires Helper model integration

---

### Issue 4: No Timeout Handling

**Problem:**
Emergencies don't auto-timeout after configured period.

**Fix:**
Add background job or cron:
```javascript
// Add to server startup
import cron from 'node-cron';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  const timeoutThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30 min ago
  
  const timedOutEmergencies = await Emergency.find({
    status: 'active',
    createdAt: { $lt: timeoutThreshold },
    'assignedHelpers.status': { $ne: 'accepted' }
  });
  
  for (const emergency of timedOutEmergencies) {
    emergency.status = 'timeout';
    emergency.resolution = {
      resolutionType: 'timeout',
      notes: 'Emergency timed out - no helper response',
      resolvedAt: new Date()
    };
    await emergency.save();
  }
});
```

**Status:** ⚠️ **NEEDS IMPLEMENTATION**

---

### Issue 5: Communication Log Missing Timestamps

**Problem:**
Communication log entries may not have consistent timestamp handling.

**Fix:**
Already handled in schema with default:
```javascript
timestamp: {
  type: Date,
  default: Date.now
}
```

**Status:** ✅ **RESOLVED**

---

## 🧪 Testing Guidelines

### Unit Tests

```javascript
describe('EmergencyService', () => {
  describe('triggerSOS', () => {
    it('should create emergency with critical priority', async () => {
      const result = await EmergencyService.triggerSOS(sosData, userId);
      expect(result.data.priority).toBe('critical');
    });
    
    it('should auto-assign helpers when enabled', async () => {
      const result = await EmergencyService.triggerSOS(sosData, userId);
      expect(result.data.assignedHelpers.length).toBeGreaterThan(0);
    });
  });
});
```

### Integration Tests

```javascript
describe('Emergency API', () => {
  it('POST /api/emergency/sos - should trigger SOS', async () => {
    const response = await request(app)
      .post('/api/emergency/sos')
      .set('Authorization', `Bearer ${token}`)
      .send(sosData);
      
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

### Load Tests

```javascript
// Test concurrent SOS triggers
for (let i = 0; i < 100; i++) {
  Promise.all([
    triggerSOS(user1),
    triggerSOS(user2),
    triggerSOS(user3)
  ]);
}
```

---

## 📈 Monitoring & Metrics

### Key Metrics to Track

1. **Response Times**
   - Time to first helper assignment
   - Time to first helper acceptance
   - Time to first helper arrival
   - Total resolution time

2. **Success Rates**
   - % of emergencies with helper assigned
   - % of emergencies resolved successfully
   - % of emergencies timed out

3. **System Health**
   - SOS trigger rate
   - Active emergencies count
   - Helper availability rate
   - Notification delivery rate

### Alerting Thresholds

- ⚠️ Average response time > 10 minutes
- ⚠️ Helper assignment failure rate > 20%
- 🚨 Active emergencies > 100
- 🚨 SOS trigger rate > 50/minute

---

## 🎯 Future Enhancements

1. **Real-time Updates**
   - WebSocket integration for live status updates
   - Real-time helper location tracking

2. **Advanced Matching**
   - Helper skill-based matching
   - Language preference matching
   - Historical success rate weighting

3. **Predictive Analytics**
   - Emergency hotspot prediction
   - Helper demand forecasting
   - Optimal helper positioning

4. **Enhanced Privacy**
   - End-to-end encryption for medical data
   - Granular privacy controls
   - GDPR compliance features

---

**End of Documentation**

For questions or clarifications, contact the backend team.
