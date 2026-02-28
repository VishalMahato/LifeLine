# 🔐 LifeLine Authentication - Complete Implementation Plan

## For Backend & Frontend Developers

---

## 📊 Database Schema Structure (Updated)

```
┌─────────────────┐
│   Auth Schema   │ ← Main entry (name, email, phone, profileImage, role)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐   ┌──▼─────┐
│ User │   │ Helper │
└───┬──┘   └───┬────┘
    │          │
┌───▼─────┐    │
│ Medical │    │
└───┬─────┘    │
    │          │
┌───▼──────────▼───┐
│    Location      │
└──────────────────┘
```

### Schema Breakdown

**Auth Schema** (Common for all):

- name
- email (unique)
- phoneNumber (unique)
- profileImage
- role (user/helper)
- userId (ref → User)
- helperId (ref → Helper)
- isVerified
- isBlocked

**User Schema** (role = "user"):

- emergencyContacts[]
- locationId (ref → Location)
- medicalId (ref → Medical)
- authId (ref → Auth)

**Helper Schema** (role = "helper"):

- skills[] (from VerifySkills screen)
- credentials[] (uploaded files from VerifySkills screen)
- locationId (ref → Location)
- medicalId (ref → Medical) - optional
- authId (ref → Auth)
- availability (future feature)
- isPaid, amount (future feature)
- rating, totalHelps (future feature)
- badges, impactPoints (future feature)

**Medical Schema**:

- bloodType, allergies[], conditions[], medications[]
- height, weight, dateOfBirth
- userId (ref → User)

**Location Schema**:

- coordinates (GeoJSON)
- address, city, state
- userId or helperId

---

## 🎯 Registration Flow

### **FOR USERS:**

```
Step 1: Auth (name, email, phone, profileImage, role="user")
   ↓ Save Auth → Get authId
Step 2: Emergency Contacts (name, relationship, phone, isPrimary)
   ↓ Save User → Get userId → Update Auth.userId
Step 3: Medical (bloodType, dateOfBirth, height, weight, allergies, medications, conditions) - Optional
   ↓ Save Medical → Get medicalId → Update User.medicalId
Step 4: Location (GPS coordinates or manual address: street, city, zipCode)
   ↓ Save Location → Get locationId → Update User.locationId
   ↓
✅ Registration Complete
```

### **FOR HELPERS:**

```
Step 1: Auth (name, email, phone, profileImage, role="helper")
   ↓ Save Auth → Get authId
Step 2: Helper Skills & Credentials (skills[], credentials upload)
   ↓ Save Helper → Get helperId → Update Auth.helperId
Step 3: Medical (bloodType, dateOfBirth, height, weight, allergies, medications, conditions) - Optional
   ↓ Save Medical → Get medicalId → Update Helper.medicalId
Step 4: Location (GPS coordinates or manual address: street, city, zipCode)
   ↓ Save Location → Get locationId → Update Helper.locationId
   ↓
✅ Registration Complete
```

---

## 📱 FRONTEND Implementation

### **Step 1: UserInfo Screen** (All Users)

**Screen:** `UserInfo.tsx`

**Fields:**

```typescript
{
  name: string;
  email: string;
  phoneNumber: string;
  profileImage?: string; // Camera/Gallery upload
  role: 'user' | 'helper';
}
```

**Validation:**

- Name: Required, 2-50 characters
- Email: Required, valid format, unique
- Phone: Required, valid format, unique
- Role: Required (user or helper)
- Profile Image: Optional

**UI Elements:**

- Avatar circle with edit icon for image upload
- Text inputs with icons
- Role selection buttons (User/Helper)

**On "Next" Click:**

```javascript
// Save to state/redux
dispatch(saveAuthData({ name, email, phoneNumber, profileImage, role }));

// Call API to create Auth
const authResponse = await createAuth({ name, email, phoneNumber, profileImage, role });
dispatch(setAuthId(authResponse.authId));

// Navigate based on role
if (role === 'user') {
  navigation.navigate('EmergencyContacts');
} else {
  navigation.navigate('VerifySkills');
}
```

---

### **Step 2A: EmergencyContacts Screen** (role = "user")

**Screen:** `EmergencyContacts.tsx`

**Fields:**

```typescript
emergencyContacts: [
  {
    name: string;
    relationship: string; // 'parent' | 'spouse' | 'sibling' | 'child' | 'friend' | 'other'
    phoneNumber: string;
    isPrimary: boolean;
  }
]
```

**UI Elements:**

- Dynamic list of contacts (starts with 2, can add more)
- Text inputs for name, relationship, phone
- Switch for "Primary contact"
- Add contact button
- Delete contact icon

**Validation:**

- At least 1 contact required
- All fields required for each contact
- Only one primary contact

**On "Next" Click:**

```javascript
dispatch(saveUserData({ emergencyContacts }));

// Call API to create User
const userResponse = await createUser({
  authId: authId,
  emergencyContacts
});

dispatch(setUserId(userResponse.userId));

// Update Auth with userId
await updateAuth(authId, { userId: userResponse.userId });

navigation.navigate('MedicalInfo');
```

---

### **Step 2B: VerifySkills Screen** (role = "helper")

**Screen:** `VerifySkills.tsx`

**Fields:**

```typescript
{
  skills: string[]; // Multi-select from predefined list
  credentials: File[]; // Document uploads (PDF, JPG, PNG)
}
```

**Predefined Skills List:**

- CPR Certified
- First Aid
- Registered Nurse
- EMT / Paramedic
- Medical Doctor
- Lifeguard

**UI Elements:**

- Skills chips (toggle select/deselect)
- Upload box for credentials
- File preview with remove option
- Info text about encryption and review

**Validation:**

- At least one skill selected (pre-selected: CPR Certified, First Aid)
- Credentials optional

**On "Next" Click:**

```javascript
dispatch(saveHelperData({ skills, credentials }));

// Call API to create Helper
const helperResponse = await createHelper({
  authId: authId,
  skills,
  credentials
});

dispatch(setHelperId(helperResponse.helperId));

// Update Auth with helperId
await updateAuth(authId, { helperId: helperResponse.helperId });

navigation.navigate('MedicalInfo');
```

---

### **Step 3: MedicalInfo Screen** (All Users - Optional)

**Screen:** `MedicalInfoScreen.tsx`

**Fields:**

```typescript
{
  bloodType?: string;
  dateOfBirth?: string; // mm/dd/yyyy
  height?: string; // e.g. 5'10
  weight?: string; // e.g. 160 lbs
  allergies?: string; // comma-separated
  medications?: string; // free text
  conditions?: string; // free text
}
```

**UI Elements:**

- Skip button in header
- Vital Info card: bloodType, dateOfBirth
- Physical Traits card: height, weight
- Health History card: allergies, medications, conditions
- Security info text

**Validation:**

- All fields optional
- If filled, basic format validation

**On "Next" or "Skip" Click:**

```javascript
if (hasMedicalData) {
  dispatch(saveMedicalData(medicalData));
  
  // Call API to create Medical
  const medicalResponse = await createMedical({
    userId: userId || helperId,
    ...medicalData
  });
  
  dispatch(setMedicalId(medicalResponse.medicalId));
  
  // Update User/Helper with medicalId
  await updateUser(userId, { medicalId: medicalResponse.medicalId });
}

navigation.navigate('SecureLocation');
```

---

### **Step 4: SecureLocation Screen** (All Users)

**Screen:** `SecureLocationScreen.tsx`

**Fields:**

```typescript
{
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  zipCode?: string;
}
```

**UI Elements:**

- Map preview (UniversalMap component)
- "Use Current Location" button
- Manual entry fields: street address, city, zip code
- Coordinates display when GPS used
- "OR ENTER MANUALLY" divider

**Validation:**

- Either GPS coordinates OR manual address required
- If manual, all fields required

**On "Finish" Click:**

```javascript
const locationData = location || {
  address: manualAddress,
  city: manualCity,
  zipCode: manualZip
};

dispatch(saveLocationData(locationData));

// Call API to create Location
const locationResponse = await createLocation({
  userId: userId || helperId,
  ...locationData
});

dispatch(setLocationId(locationResponse.locationId));

// Update User/Helper with locationId
await updateUser(userId, { locationId: locationResponse.locationId });

navigation.navigate('AccountReady');
```

---

### **Login Screen**

**Screen:** `Login.tsx`

**Fields:**

```typescript
{
  email: string;
  password: string;
}
```

**UI Elements:**

- Logo icon
- Email input
- Password input (secure text entry)
- "Forgot Password?" link
- Login button
- Social login buttons (Google, Apple)
- "OR CONTINUE WITH" divider

**Validation:**

- Email: Required, valid format
- Password: Required

**On Login Click:**

```javascript
const response = await login({ email, password });
if (response.success) {
  // Save token, navigate to home
}
```

**Social Login:**

- Google OAuth
- Apple Sign In

---

### **Account Ready Screen**

**Screen:** `AccountReadyScreen.tsx`

**UI Elements:**

- Success checkmark icon
- "Your LifeLine account is ready" title
- Subtitle text
- Account verified card
- "Go to Home" primary button
- "View Safety Tips" secondary button

---

```typescript
// src/store/slices/authSlice.ts

interface AuthState {
  // Step tracking
  currentStep: number;
  isComplete: boolean;
  
  // Auth data (Step 1)
  authId?: string;
  name: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  role: 'user' | 'helper';
  
  // User data (Step 2 - role="user")
  userId?: string;
  emergencyContacts?: EmergencyContact[];
  
  // Helper data (Step 2 - role="helper")
  helperId?: string;
  helperDetails?: {
    skills: string[];
    credentials: Credential[];
    availability: Availability;
    isPaid: boolean;
    amount?: number;
  };
  
  // Medical data (Step 3 - users only)
  medicalId?: string;
  medicalDetails?: MedicalInfo;
  
  // Location data (Step 4 - all)
  locationId?: string;
  locationDetails?: LocationInfo;
}

// Actions
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    saveAuthData(state, action) { },
    saveUserData(state, action) { },
    saveHelperData(state, action) { },
    saveMedicalData(state, action) { },
    saveLocationData(state, action) { },
    autoFillUserData(state, action) { },
    setAuthId(state, action) { },
    setUserId(state, action) { },
    setHelperId(state, action) { },
    setMedicalId(state, action) { },
    setLocationId(state, action) { },
    completeRegistration(state) { },
    nextStep(state) { },
    previousStep(state) { },
  },
});
```

---

## 🖥️ BACKEND Implementation

### **Auth Service** (`Auth.service.mjs`)

```javascript
class AuthService {
  /**
   * Step 1: Create Auth record
   */
  async createAuth(data) {
    const { name, email, phoneNumber, profileImage, role } = data;
    
    // Check if email exists
    const existingAuth = await Auth.findOne({ email });
    if (existingAuth) {
      throw new Error('Email already registered');
    }
    
    // Create Auth record
    const auth = await Auth.create({
      name,
      email,
      phoneNumber,
      profileImage,
      role,
    });
    
    return { authId: auth._id, role: auth.role };
  }

  /**
   * Check if email exists and fetch all related data
   */
  async checkEmail(email) {
    const auth = await Auth.findOne({ email });
    
    if (!auth) {
      return { exists: false };
    }
    
    // Email exists → Fetch all related data
    let userData = { auth };
    
    if (auth.role === 'user' && auth.userId) {
      const user = await User.findById(auth.userId);
      userData.user = user;
      
      if (user.medicalId) {
        const medical = await Medical.findById(user.medicalId);
        userData.medical = medical;
      }
      
      if (user.locationId) {
        const location = await Location.findById(user.locationId);
        userData.location = location;
      }
    } else if (auth.role === 'helper' && auth.helperId) {
      const helper = await Helper.findById(auth.helperId);
      userData.helper = helper;
      
      if (helper.locationId) {
        const location = await Location.findById(helper.locationId);
        userData.location = location;
      }
    }
    
    return { exists: true, data: userData };
  }

  /**
   * Update Auth with userId or helperId
   */
  async updateAuth(authId, updates) {
    const auth = await Auth.findByIdAndUpdate(authId, updates, { new: true });
    return auth;
  }
}
```

### **User Service** (`User.service.mjs`)

```javascript
class UserService {
  /**
   * Step 2: Create User record
   */
  async createUser(data) {
    const { authId, emergencyContacts } = data;
    
    const user = await User.create({
      authId,
      emergencyContacts,
    });
    
    return { userId: user._id };
  }

  /**
   * Update User with medicalId or locationId
   */
  async updateUser(userId, updates) {
    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    return user;
  }
}
```

### **Helper Service** (`Helper.service.mjs`)

```javascript
class HelperService {
  /**
   * Step 2: Create Helper record
   */
  async createHelper(data) {
    const { authId, skills, credentials, availability, isPaid, amount } = data;
    
    const helper = await Helper.create({
      authId,
      skills,
      credentials,
      availability,
      isPaid,
      amount,
    });
    
    return { helperId: helper._id };
  }

  /**
   * Update Helper with locationId
   */
  async updateHelper(helperId, updates) {
    const helper = await Helper.findByIdAndUpdate(helperId, updates, { new: true });
    return helper;
  }
}
```

### **Medical Service** (`Medical.service.mjs`)

```javascript
class MedicalService {
  /**
   * Step 3: Create Medical record
   */
  async createMedical(data) {
    const { userId, bloodType, allergies, conditions, medications, notes, bloodDonation } = data;
    
    const medical = await Medical.create({
      userId,
      bloodType,
      allergies,
      conditions,
      medications,
      notes,
      bloodDonation,
    });
    
    return { medicalId: medical._id };
  }
}
```

### **Location Service** (`Location.service.mjs`)

```javascript
class LocationService {
  /**
   * Step 4: Create Location record
   */
  async createLocation(data) {
    const { userId, helperId, type, coordinates, address, city, state, zipCode, buildingName, floor, apartmentUnit, landmark, emergencyAccessNotes, provider } = data;
    
    const location = await Location.create({
      userId,
      helperId,
      type,
      coordinates,
      address,
      city,
      state,
      zipCode,
      buildingName,
      floor,
      apartmentUnit,
      landmark,
      emergencyAccessNotes,
      provider,
    });
    
    return { locationId: location._id };
  }
}
```

---

## 📡 API Endpoints Summary

### **Auth Endpoints**

```
POST   /api/auth/signup-step1        → Create Auth
GET    /api/auth/check-email/:email  → Check if email exists
PATCH  /api/auth/:authId              → Update Auth with userId/helperId
POST   /api/auth/login                → Login with email/password
POST   /api/auth/social-login         → Social login (Google/Apple)
POST   /api/auth/forgot-password      → Send reset password email
POST   /api/auth/reset-password       → Reset password with token
```

### **User Endpoints**

```
POST   /api/users                     → Create User
PATCH  /api/users/:userId             → Update User
GET    /api/users/:userId             → Get User
```

### **Helper Endpoints**

```
POST   /api/helpers                   → Create Helper
PATCH  /api/helpers/:helperId         → Update Helper
GET    /api/helpers/:helperId         → Get Helper
```

### **Medical Endpoints**

```
POST   /api/medical                   → Create Medical
PATCH  /api/medical/:medicalId        → Update Medical
GET    /api/medical/:medicalId        → Get Medical
```

### **Location Endpoints**

```
POST   /api/locations                 → Create Location
PATCH  /api/locations/:locationId     → Update Location
GET    /api/locations/:locationId     → Get Location
```

---

## ✅ Implementation Checklist

### **Backend**

- [ ] Create all schemas (Auth, User, Helper, Medical, Location)
- [ ] Create all services (Auth, User, Helper, Medical, Location)
- [ ] Create all controllers
- [ ] Create all routes
- [ ] Add validation middleware
- [ ] Test all APIs with Postman

### **Frontend**

- [ ] Setup Redux Toolkit with authSlice
- [ ] Create UserInfo screen (name, email, phone, role, profile image)
- [ ] Create EmergencyContacts screen (dynamic contacts list)
- [ ] Create VerifySkills screen (skills selection, credentials upload)
- [ ] Create MedicalInfo screen (optional medical data)
- [ ] Create SecureLocation screen (GPS or manual address)
- [ ] Create Login screen (email/password + social login)
- [ ] Create AccountReady screen (completion screen)
- [ ] Implement conditional navigation based on role
- [ ] Add form validation for all screens
- [ ] Add progress indicator in SignUp component
- [ ] Implement forgot password flow
- [ ] Test full user registration flow
- [ ] Test full helper registration flow
- [ ] Test login flow

---

## 🎯 Testing Scenarios

1. **New User Registration**
   - UserInfo → EmergencyContacts → MedicalInfo (optional) → SecureLocation
   - Verify data in Auth, User, Medical (if provided), Location schemas

2. **New Helper Registration**
   - UserInfo → VerifySkills → MedicalInfo (optional) → SecureLocation
   - Verify data in Auth, Helper, Medical (if provided), Location schemas

3. **Skip Medical Step**
   - Register as user or helper
   - Skip medical info in MedicalInfo screen
   - Complete registration without medical data

4. **Login Flow**
   - Login with email/password
   - Social login with Google/Apple
   - Forgot password flow

5. **Emergency Contacts**
   - Add multiple contacts
   - Set primary contact
   - Delete contacts
   - Minimum 1 contact required

---

**This is the complete best implementation plan! 🚑✨**
