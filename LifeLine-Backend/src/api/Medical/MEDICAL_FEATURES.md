# LifeLine Medical System - Complete Features Documentation

**Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Author:** Senior Backend Architect

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Core Features](#core-features)
3. [API Endpoints](#api-endpoints)
4. [Data Model](#data-model)
5. [Business Logic](#business-logic)
6. [Privacy & Security](#privacy--security)
7. [Integration with Emergency System](#integration-with-emergency-system)
8. [Known Issues & Fixes](#known-issues--fixes)

---

## 🎯 System Overview

The Medical System manages comprehensive health profiles for LifeLine users, providing **critical medical information** during emergencies.

### Key Capabilities

✅ **Comprehensive Health Profiles** - Blood type, allergies, conditions, medications  
✅ **Emergency Contact Management** - Multiple contacts with primary designation  
✅ **Privacy-First Design** - Medical data only visible during active emergencies  
✅ **Profile Completion Tracking** - Gamified completion percentage  
✅ **Critical Condition Flagging** - Automatic identification of life-threatening allergies/conditions  
✅ **Blood Donation Matching** - Find donors by blood type and location  

---

## 🚀 Core Features

### 1. Medical Profile Creation

**Purpose:** Create comprehensive medical profile for user

**Endpoint:** `POST /api/medical/create`

**Request:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "bloodType": "O+",
  "dateOfBirth": "1990-05-15",
  "height": {
    "value": 175,
    "unit": "cm"
  },
  "weight": {
    "value": 70,
    "unit": "kg"
  },
  "allergies": [
    {
      "substance": "Penicillin",
      "severity": "life_threatening",
      "reaction": "Anaphylaxis",
      "discoveredDate": "2015-03-20"
    }
  ],
  "conditions": [
    {
      "name": "Hypertension",
      "diagnosisDate": "2018-01-10",
      "status": "active",
      "severity": "moderate",
      "treatedBy": "Dr. Smith",
      "notes": "Controlled with medication"
    }
  ],
  "medications": [
    {
      "name": "Lisinopril",
      "dosage": "10mg",
      "frequency": "daily",
      "prescribedBy": "Dr. Smith",
      "prescriptionDate": "2018-01-10",
      "isActive": true,
      "purpose": "Blood pressure control"
    }
  ],
  "disabilities": "None",
  "organDonor": true,
  "bloodDonation": {
    "isEligible": true,
    "willingToDonate": true,
    "lastDonated": "2023-06-15"
  },
  "insurance": {
    "provider": "HealthCare Inc",
    "policyNumber": "HC123456",
    "expiryDate": "2025-12-31"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Medical information created successfully",
  "data": {
    "id": "...",
    "userId": "...",
    "bloodType": "O+",
    "completionPercentage": 85,
    "isComplete": true,
    "hasCriticalConditions": true
  }
}
```

**Business Rules:**
- ✅ One medical profile per user (enforced by unique index)
- ✅ Automatic completion percentage calculation
- ✅ Critical condition detection on save
- ✅ Age calculation from date of birth

---

### 2. Allergy Management

#### 2.1 Add Allergy

**Endpoint:** `POST /api/medical/:id/allergies`

**Request:**
```json
{
  "substance": "Peanuts",
  "severity": "severe",
  "reaction": "Hives, difficulty breathing",
  "discoveredDate": "2020-08-15"
}
```

**Severity Levels:**
- `mild` - Minor discomfort
- `moderate` - Noticeable symptoms
- `severe` - Significant reaction
- `life_threatening` - Anaphylaxis risk

#### 2.2 Update All Allergies

**Endpoint:** `PUT /api/medical/:id/allergies`

**Request:**
```json
{
  "allergies": [
    {
      "substance": "Penicillin",
      "severity": "life_threatening",
      "reaction": "Anaphylaxis"
    },
    {
      "substance": "Shellfish",
      "severity": "moderate",
      "reaction": "Hives"
    }
  ]
}
```

#### 2.3 Remove Allergy

**Endpoint:** `DELETE /api/medical/:id/allergies/:itemId`

---

### 3. Medical Condition Management

#### 3.1 Add Condition

**Endpoint:** `POST /api/medical/:id/conditions`

**Request:**
```json
{
  "name": "Type 2 Diabetes",
  "diagnosisDate": "2019-03-15",
  "status": "active",
  "severity": "moderate",
  "treatedBy": "Dr. Johnson",
  "notes": "Managed with diet and medication"
}
```

**Condition Status:**
- `active` - Currently active
- `inactive` - Not currently active
- `resolved` - Fully resolved
- `chronic` - Long-term condition

**Severity Levels:**
- `mild`
- `moderate`
- `severe`
- `critical`

#### 3.2 Update All Conditions

**Endpoint:** `PUT /api/medical/:id/conditions`

#### 3.3 Remove Condition

**Endpoint:** `DELETE /api/medical/:id/conditions/:itemId`

---

### 4. Medication Management

#### 4.1 Add Medication

**Endpoint:** `POST /api/medical/:id/medications`

**Request:**
```json
{
  "name": "Metformin",
  "dosage": "500mg",
  "frequency": "twice_daily",
  "prescribedBy": "Dr. Johnson",
  "prescriptionDate": "2019-03-15",
  "startDate": "2019-03-20",
  "isActive": true,
  "purpose": "Blood sugar control"
}
```

**Frequency Options:**
- `as_needed`
- `daily`
- `twice_daily`
- `three_times_daily`
- `four_times_daily`
- `weekly`
- `monthly`

#### 4.2 Get Active Medications

**Method:** `medicalProfile.getActiveMedications()`

Returns only medications where `isActive: true`

#### 4.3 Update All Medications

**Endpoint:** `PUT /api/medical/:id/medications`

#### 4.4 Remove Medication

**Endpoint:** `DELETE /api/medical/:id/medications/:itemId`

---

### 5. Emergency Contact Management

#### 5.1 Add Emergency Contact

**Endpoint:** `POST /api/medical/:id/emergency-contacts`

**Request:**
```json
{
  "fullName": "Jane Doe",
  "relation": "Spouse",
  "phoneNumber": "+91-9876543210",
  "isPrimary": true
}
```

**Business Rules:**
- ✅ Setting `isPrimary: true` automatically unsets other primary contacts
- ✅ Only one primary contact allowed
- ✅ Phone number validation required
- ✅ Full name and relation required

#### 5.2 Update Emergency Contact

**Endpoint:** `PUT /api/medical/:id/emergency-contacts/:contactId`

#### 5.3 Remove Emergency Contact

**Endpoint:** `DELETE /api/medical/:id/emergency-contacts/:contactId`

#### 5.4 Get All Emergency Contacts

**Endpoint:** `GET /api/medical/:id/emergency-contacts`

---

### 6. Profile Retrieval

#### 6.1 Get My Medical Profile

**Endpoint:** `GET /api/medical/profile/me`

**Access:** Authenticated user only (their own profile)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "userId": "...",
    "bloodType": "O+",
    "allergies": [...],
    "conditions": [...],
    "medications": [...],
    "emergencyContacts": [...],
    "completionPercentage": 85,
    "isComplete": true,
    "age": 33
  }
}
```

#### 6.2 Get Medical Profile by ID

**Endpoint:** `GET /api/medical/:id`

**Access Control:**
- ✅ Profile owner
- ✅ Assigned helpers during active emergency
- ✅ System admins

---

### 7. Profile Update

**Endpoint:** `PUT /api/medical/:id`

**Request:**
```json
{
  "bloodType": "A+",
  "weight": {
    "value": 72,
    "unit": "kg"
  },
  "organDonor": true
}
```

**Auto-Updates:**
- `lastUpdated` timestamp
- `completionPercentage`
- `isComplete` flag

---

## 📊 Data Model

### Medical Schema

```javascript
{
  _id: ObjectId,
  userId: ObjectId, // ref: 'User', unique index
  
  // Basic Info
  bloodType: String, // 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Unknown'
  dateOfBirth: Date,
  
  // Physical Measurements
  height: {
    value: Number, // 50-250 cm
    unit: String // 'cm' | 'ft'
  },
  weight: {
    value: Number, // 10-300 kg
    unit: String, // 'kg' | 'lbs'
    lastUpdated: Date
  },
  
  // Allergies (CRITICAL)
  allergies: [{
    substance: String, // required
    severity: String, // 'mild' | 'moderate' | 'severe' | 'life_threatening'
    reaction: String,
    discoveredDate: Date
  }],
  
  // Medical Conditions
  conditions: [{
    name: String, // required
    diagnosisDate: Date,
    status: String, // 'active' | 'inactive' | 'resolved' | 'chronic'
    severity: String, // 'mild' | 'moderate' | 'severe' | 'critical'
    treatedBy: String,
    notes: String // max 300 chars
  }],
  
  // Current Medications
  medications: [{
    name: String, // required
    dosage: String,
    frequency: String, // 'as_needed' | 'daily' | 'twice_daily' | etc.
    prescribedBy: String,
    prescriptionDate: Date,
    startDate: Date,
    isActive: Boolean,
    purpose: String
  }],
  
  // Medical History
  surgeries: [{
    name: String,
    date: Date,
    hospital: String,
    notes: String
  }],
  
  vaccinations: [{
    name: String,
    date: Date,
    nextDue: Date
  }],
  
  disabilities: String,
  
  // Emergency Contacts
  emergencyContacts: [{
    fullName: String, // required
    relation: String, // required
    phoneNumber: String, // required
    isPrimary: Boolean
  }],
  
  emergencyContactConsent: Boolean,
  
  // Organ Donation
  organDonor: Boolean,
  
  // Blood Donation
  bloodDonation: {
    isEligible: Boolean,
    lastDonated: Date,
    willingToDonate: Boolean
  },
  
  // Insurance
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expiryDate: Date
  },
  
  // Additional Info
  emergencyInfo: {
    notificationPreferences: [String],
    preferredHospital: String,
    primaryLanguage: String
  },
  
  notes: String, // max 1000 chars
  
  // Privacy
  visibleDuringEmergency: Boolean,
  
  // Metadata
  lastUpdated: Date,
  isComplete: Boolean,
  completionPercentage: Number, // 0-100
  
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// Unique user profile
{ userId: 1 } // unique

// Blood type lookup
{ bloodType: 1 }

// Blood donor search
{ 
  'bloodDonation.willingToDonate': 1,
  'bloodDonation.isEligible': 1
}

// Last updated tracking
{ lastUpdated: 1 }
```

---

## 🔧 Business Logic

### 1. Age Calculation

```javascript
medicalSchema.methods.getAge = function() {
  if (!this.dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};
```

### 2. Critical Condition Detection

```javascript
medicalSchema.methods.hasCriticalConditions = function() {
  return (
    this.allergies.some(a => a.severity === 'life_threatening') ||
    this.conditions.some(c => c.severity === 'critical')
  );
};
```

### 3. Profile Completion Calculation

```javascript
medicalSchema.methods.calculateCompletion = function() {
  const fields = [
    this.bloodType !== 'Unknown',
    this.allergies?.length > 0,
    this.conditions?.length > 0,
    this.medications?.length > 0,
    this.height?.value,
    this.weight?.value,
    this.dateOfBirth,
    this.insurance?.provider
  ];
  
  const completedFields = fields.filter(Boolean).length;
  this.completionPercentage = Math.round((completedFields / fields.length) * 100);
  this.isComplete = this.completionPercentage >= 70;
  
  return this.completionPercentage;
};
```

**Completion Thresholds:**
- 0-30%: Incomplete
- 31-69%: Partial
- 70-100%: Complete ✅

### 4. Blood Donor Matching

```javascript
medicalSchema.statics.findBloodDonors = async function(bloodType, location) {
  return this.find({
    bloodType: bloodType,
    'bloodDonation.willingToDonate': true,
    'bloodDonation.isEligible': true
  }).populate('userId');
};
```

**Eligibility Criteria:**
- ✅ Matching blood type
- ✅ Willing to donate
- ✅ Eligible status
- ✅ Optional: Location proximity

---

## 🔒 Privacy & Security

### Access Control Matrix

| Endpoint | Self | Helper (Active Emergency) | Helper (No Emergency) | Admin |
|----------|------|---------------------------|----------------------|-------|
| Create Profile | ✅ | ❌ | ❌ | ✅ |
| View Own Profile | ✅ | ❌ | ❌ | ✅ |
| View Other Profile | ❌ | ✅ | ❌ | ✅ |
| Update Profile | ✅ | ❌ | ❌ | ✅ |
| Delete Profile | ✅ | ❌ | ❌ | ✅ |

### Privacy Rules

1. **Default Privacy:**
   - Medical info is PRIVATE by default
   - Only visible to profile owner

2. **Emergency Visibility:**
   - When user triggers SOS
   - Medical info becomes visible to ACCEPTED helpers
   - Visibility ends when emergency resolved

3. **Selective Disclosure:**
   - `visibleDuringEmergency` flag controls visibility
   - User can opt-out of emergency sharing

4. **Data Minimization:**
   - Only share relevant medical info
   - Filter sensitive notes/details

### Data Encryption

**At Rest:**
- Database-level encryption (MongoDB)
- Sensitive fields encrypted

**In Transit:**
- HTTPS/TLS for all API calls
- No medical data in URL parameters

---

## 🔗 Integration with Emergency System

### Emergency Creation Flow

```javascript
// When emergency created
const emergency = await Emergency.create({...});

// Fetch user's medical profile
const medical = await Medical.findOne({ userId: emergency.userId });

if (medical && medical.visibleDuringEmergency) {
  // Attach relevant medical info
  emergency.medicalInfo = {
    bloodType: medical.bloodType,
    allergies: medical.allergies
      .filter(a => a.severity === 'life_threatening' || a.severity === 'severe')
      .map(a => a.substance),
    medicalConditions: medical.conditions
      .filter(c => c.status === 'active' && c.severity !== 'mild')
      .map(c => c.name),
    medications: medical.medications
      .filter(m => m.isActive)
      .map(m => `${m.name} (${m.dosage})`),
    emergencyContacts: medical.emergencyContacts
      .filter(c => c.isPrimary)
  };
  
  await emergency.save();
}
```

### Helper Access During Emergency

```javascript
// Helper accepts emergency
const emergency = await Emergency.findById(emergencyId)
  .populate('userId');

// Check if helper is assigned
const isAssigned = emergency.assignedHelpers.some(
  h => h.helperId.toString() === helperId && h.status === 'accepted'
);

if (isAssigned) {
  // Fetch medical profile
  const medical = await Medical.findOne({ userId: emergency.userId });
  
  // Return filtered medical info
  return {
    bloodType: medical.bloodType,
    criticalAllergies: medical.allergies.filter(a => 
      a.severity === 'life_threatening'
    ),
    activeConditions: medical.conditions.filter(c => 
      c.status === 'active'
    ),
    currentMedications: medical.getActiveMedications()
  };
}
```

---

## 🐛 Known Issues & Fixes

### Issue 1: Route Conflict - `/profile/me` vs `/:id`

**Problem:**
```javascript
router.get('/:id', MedicalController.getMedicalInfo);
router.get('/profile/me', MedicalController.getMyMedicalInfo);
```

Express matches `/profile/me` to `/:id` route first.

**Fix:**
```javascript
// Place specific routes BEFORE parameterized routes
router.get('/profile/me', MedicalController.getMyMedicalInfo);
router.get('/:id', MedicalController.getMedicalInfo);
```

**Status:** ⚠️ **NEEDS FIX** - Update `Medical.routes.mjs`

---

### Issue 2: Missing Service Methods

**Problem:**
Controller calls `MedicalService.getProfileCompletion()` and `MedicalService.searchMedicalInfo()` but these methods don't exist in service.

**Fix:**
Add missing methods to `Medical.service.mjs`:

```javascript
static async getProfileCompletion(medicalId) {
  const medical = await Medical.findById(medicalId);
  if (!medical) throw new Error('Medical info not found');
  
  return {
    completionPercentage: medical.completionPercentage,
    isComplete: medical.isComplete,
    missingFields: this._getMissingFields(medical)
  };
}

static async searchMedicalInfo(filters, options) {
  const query = MedicalUtils.buildSearchQuery(filters);
  const sort = MedicalUtils.buildSortOptions(options.sortBy, options.sortOrder);
  
  const total = await Medical.countDocuments(query);
  const data = await Medical.find(query)
    .sort(sort)
    .skip((options.page - 1) * options.limit)
    .limit(options.limit)
    .lean();
  
  return {
    data,
    pagination: {
      total,
      page: options.page,
      limit: options.limit,
      pages: Math.ceil(total / options.limit)
    }
  };
}

static _getMissingFields(medical) {
  const missing = [];
  if (medical.bloodType === 'Unknown') missing.push('bloodType');
  if (!medical.allergies?.length) missing.push('allergies');
  if (!medical.conditions?.length) missing.push('conditions');
  if (!medical.height?.value) missing.push('height');
  if (!medical.weight?.value) missing.push('weight');
  if (!medical.dateOfBirth) missing.push('dateOfBirth');
  return missing;
}
```

**Status:** ⚠️ **NEEDS IMPLEMENTATION**

---

### Issue 3: Validation Too Strict in Utils

**Problem:**
`validateAllergies()`, `validateConditions()`, and `validateMedications()` require ALL fields, but schema allows optional fields.

**Current Code:**
```javascript
static validateAllergies(allergies) {
  return allergies.every((allergy) => {
    return (
      allergy.substance &&
      allergy.reaction &&  // NOT required in schema
      allergy.severity &&
      allergy.discoveredDate  // NOT required in schema
    );
  });
}
```

**Fix:**
```javascript
static validateAllergies(allergies) {
  if (!Array.isArray(allergies)) return false;
  
  return allergies.every((allergy) => {
    // Only substance and severity are required
    return (
      allergy.substance &&
      typeof allergy.substance === 'string' &&
      allergy.severity &&
      Object.values(MedicalConstants.ALLERGY_SEVERITY).includes(allergy.severity)
    );
  });
}
```

**Status:** ⚠️ **NEEDS FIX** - Update `Medical.utils.mjs`

---

### Issue 4: Missing Authentication Middleware

**Problem:**
Routes don't have authentication middleware applied.

**Fix:**
Add to `Medical.routes.mjs`:

```javascript
import { authenticate } from '../../Auth/v1/Auth.middleware.mjs';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ... rest of routes
```

**Status:** ⚠️ **NEEDS FIX**

---

### Issue 5: No Authorization Check

**Problem:**
Users can access/modify other users' medical profiles.

**Fix:**
Add authorization middleware:

```javascript
// middleware/medical.authorization.mjs
export const authorizeOwnProfile = async (req, res, next) => {
  try {
    const medicalId = req.params.id;
    const userId = req.user.id;
    
    const medical = await Medical.findById(medicalId);
    if (!medical) {
      return res.status(404).json({
        success: false,
        message: 'Medical profile not found'
      });
    }
    
    // Check if user owns this profile or is admin
    if (medical.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this medical profile'
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
```

Apply to routes:
```javascript
router.get('/:id', authorizeOwnProfile, MedicalController.getMedicalInfo);
router.put('/:id', authorizeOwnProfile, MedicalController.updateMedicalInfo);
router.delete('/:id', authorizeOwnProfile, MedicalController.deleteMedicalInfo);
```

**Status:** ⚠️ **NEEDS IMPLEMENTATION**

---

## 🧪 Testing Guidelines

### Unit Tests

```javascript
describe('Medical Model', () => {
  it('should calculate age correctly', () => {
    const medical = new Medical({
      dateOfBirth: new Date('1990-05-15')
    });
    const age = medical.getAge();
    expect(age).toBeGreaterThan(30);
  });
  
  it('should detect critical conditions', () => {
    const medical = new Medical({
      allergies: [{
        substance: 'Penicillin',
        severity: 'life_threatening'
      }]
    });
    expect(medical.hasCriticalConditions()).toBe(true);
  });
  
  it('should calculate completion percentage', () => {
    const medical = new Medical({
      bloodType: 'O+',
      allergies: [{ substance: 'Peanuts', severity: 'mild' }],
      conditions: [{ name: 'Hypertension', status: 'active' }]
    });
    const completion = medical.calculateCompletion();
    expect(completion).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```javascript
describe('Medical API', () => {
  it('POST /api/medical/create - should create profile', async () => {
    const response = await request(app)
      .post('/api/medical/create')
      .set('Authorization', `Bearer ${token}`)
      .send(medicalData);
      
    expect(response.status).toBe(201);
    expect(response.body.data.bloodType).toBe('O+');
  });
  
  it('GET /api/medical/profile/me - should return own profile', async () => {
    const response = await request(app)
      .get('/api/medical/profile/me')
      .set('Authorization', `Bearer ${token}`);
      
    expect(response.status).toBe(200);
    expect(response.body.data.userId).toBe(userId);
  });
});
```

---

## 📈 Future Enhancements

1. **Health Tracking**
   - Vital signs monitoring
   - Medication adherence tracking
   - Appointment reminders

2. **AI-Powered Insights**
   - Drug interaction warnings
   - Allergy cross-reactivity alerts
   - Health risk predictions

3. **Interoperability**
   - HL7 FHIR integration
   - EHR system sync
   - Lab result imports

4. **Wearable Integration**
   - Sync with fitness trackers
   - Real-time health monitoring
   - Emergency auto-detection

---

**End of Documentation**

For questions or clarifications, contact the backend team.
