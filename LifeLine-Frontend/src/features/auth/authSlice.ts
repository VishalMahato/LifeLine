import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

export interface UserData {
  fullName: string;
  email: string;
  mobileNumber: string;
  role: "user" | "helper";
  profileImage?: string;
}

interface EmailCheckResult {
  exists: boolean;
  authId?: string;
  role?: "user" | "helper";
  userData?: {
    name?: string;
    email?: string;
    phoneNumber?: string;
    profileImage?: string;
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
    name?: string;
    email?: string;
    phoneNumber?: string;
    role?: "user" | "helper";
    profileImage?: string;
    _id?: string;
  };
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthState {
  userData: UserData | null;
  emailExists: boolean;
  isLoading: boolean;
  error: string | null;
  authId: string | null;
}

const initialState: AuthState = {
  userData: null,
  emailExists: false,
  isLoading: false,
  error: null,
  authId: null,
};

const getApiBaseUrl = () => {
  const root = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";
  return `${root.replace(/\/$/, "")}/api/auth/v1`;
};

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: string } | undefined)
      ?.message;
    return message || fallback;
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
    const response = await axios.post(
      `${getApiBaseUrl()}/create/user/auth`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
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

        if (action.payload.exists && action.payload.userData) {
          state.userData = {
            fullName: action.payload.userData.name || "",
            email: action.payload.userData.email || "",
            mobileNumber: action.payload.userData.phoneNumber || "",
            role: action.payload.role || "user",
            profileImage: action.payload.userData.profileImage,
          };
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
          state.userData = {
            fullName: user.name || "",
            email: user.email || "",
            mobileNumber: user.phoneNumber || "",
            role: user.role || "user",
            profileImage: user.profileImage,
          };
          state.emailExists = true;
          state.authId = user._id || state.authId;
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
