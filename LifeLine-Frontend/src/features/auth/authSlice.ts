import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

export interface UserData {
  fullName: string;
  email: string;
  mobileNumber: string;
  role: "user" | "helper";
  profileImage?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface EmailCheckResult {
  exists: boolean;
  authId?: string;
  role?: "user" | "helper";
  userData?: {
    _id?: string;
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    mobileNumber?: string;
    role?: "user" | "helper";
    profileImage?: string;
    dateOfBirth?: string;
    gender?: string;
  };
}

interface CreateUserAuthResult {
  success?: boolean;
  message?: string;
  data?: {
    authId?: string;
  };
}

interface LoginResult {
  user?: {
    id?: string;
    name?: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    mobileNumber?: string;
    role?: "user" | "helper";
    profileImage?: string;
    dateOfBirth?: string;
    gender?: string;
    _id?: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

const mapUserToState = (
  user: LoginResult["user"] | EmailCheckResult["userData"] | undefined,
  fallbackRole: "user" | "helper" = "user",
): UserData | null => {
  if (!user) {
    return null;
  }

  return {
    fullName: user.name || user.fullName || "",
    email: user.email || "",
    mobileNumber: user.phoneNumber || user.mobileNumber || "",
    role: user.role || fallbackRole,
    profileImage: user.profileImage,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
  };
};

export interface AuthState {
  userData: UserData | null;
  emailExists: boolean;
  isLoading: boolean;
  error: string | null;
  authId: string | null;
  userId: string | null;
}

const initialState: AuthState = {
  userData: null,
  emailExists: false,
  isLoading: false,
  error: null,
  authId: null,
  userId: null,
};

const getExpoHost = () => {
  const hostUri =
    (Constants.expoConfig as { hostUri?: string } | undefined)?.hostUri ||
    (Constants.manifest as { debuggerHost?: string } | undefined)?.debuggerHost ||
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } })
      .manifest2?.extra?.expoGo?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(":")[0] || null;
};

const getApiRoot = () => {
  const envRoot = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envRoot) {
    return envRoot.replace(/\/$/, "");
  }

  const expoHost = getExpoHost();
  if (expoHost) {
    return `http://${expoHost}:5000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }

  return "http://localhost:5000";
};

const getApiBaseUrl = () => `${getApiRoot()}/api/auth/v1`;

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;
    if (message) {
      return message;
    }

    if (!error.response) {
      return "Unable to reach backend. Ensure server is running and EXPO_PUBLIC_API_URL points to your backend host.";
    }
  }
  return fallback;
};

export const checkEmailExists = createAsyncThunk<
  EmailCheckResult,
  string,
  { rejectValue: string }
>("auth/checkEmailExists", async (email, { rejectWithValue }) => {
  try {
    const response = await axios.get<{ data: EmailCheckResult }>(
      `${getApiBaseUrl()}/check-email/${encodeURIComponent(email)}`,
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Failed to check email"));
  }
});

export const createUserAuth = createAsyncThunk<
  CreateUserAuthResult,
  FormData,
  { rejectValue: string }
>("auth/createUserAuth", async (formData, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${getApiBaseUrl()}/create/user/auth`, formData);
    return response.data;
  } catch (error) {
    return rejectWithValue(
      errorMessage(error, "Failed to create user auth record"),
    );
  }
});

export const loginUser = createAsyncThunk<
  LoginResult,
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post<{ data: LoginResult }>(
      `${getApiBaseUrl()}/login`,
      credentials,
      {
        headers: { "Content-Type": "application/json" },
      },
    );
    return response.data.data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Failed to login"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<UserData>) => {
      state.userData = action.payload;
    },
    updateUserData: (state, action: PayloadAction<Partial<UserData>>) => {
      if (state.userData) {
        state.userData = { ...state.userData, ...action.payload };
      }
    },
    clearUserData: (state) => {
      state.userData = null;
      state.emailExists = false;
      state.authId = null;
      state.userId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkEmailExists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkEmailExists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.emailExists = action.payload.exists;
        state.authId = action.payload.authId || null;
        state.userId = action.payload.userData?._id
          || action.payload.userData?.id
          || state.userId;

        if (action.payload.exists && action.payload.userData) {
          state.userData = mapUserToState(
            action.payload.userData,
            action.payload.role || "user",
          );
        } else if (!action.payload.exists) {
          state.userData = null;
        }
      })
      .addCase(checkEmailExists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to check email";
      })
      .addCase(createUserAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUserAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.authId = action.payload?.data?.authId || state.authId;
      })
      .addCase(createUserAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create user auth record";
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const user = action.payload.user;
        if (user) {
          state.userData = mapUserToState(user, user.role || "user");
          state.emailExists = true;
          state.authId = user._id || state.authId;
          state.userId = user._id || user.id || state.userId;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to login";
      });
  },
});

export const { setUserData, updateUserData, clearUserData, clearError } =
  authSlice.actions;
export default authSlice.reducer;
