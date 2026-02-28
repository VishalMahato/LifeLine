import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

export type MedicalInfoRecord = Record<string, unknown>;

type SignupMedicalResponse = {
  data?: {
    medical?: MedicalInfoRecord | null;
  };
};

export type SaveSignupMedicalPayload = {
  authId: string;
  medicalData: MedicalInfoRecord;
};

export interface MedicalState {
  medicalInfo: MedicalInfoRecord | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: MedicalState = {
  medicalInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
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

const getAuthApiBaseUrl = () => `${getApiRoot()}/api/auth/v1`;

const errorMessage = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) {
      return message;
    }

    if (!error.response) {
      return "Unable to reach backend. Ensure server is running and EXPO_PUBLIC_API_URL points to your backend host.";
    }
  }

  return fallback;
};

export const fetchSignupMedicalInfo = createAsyncThunk<
  MedicalInfoRecord | null,
  string,
  { rejectValue: string }
>("medical/fetchSignupMedicalInfo", async (authId, { rejectWithValue }) => {
  try {
    const response = await axios.get<SignupMedicalResponse>(
      `${getAuthApiBaseUrl()}/signup/medical/${encodeURIComponent(authId)}`,
    );

    return response.data?.data?.medical ?? null;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Failed to fetch medical information"));
  }
});

export const saveSignupMedicalInfo = createAsyncThunk<
  MedicalInfoRecord,
  SaveSignupMedicalPayload,
  { rejectValue: string }
>("medical/saveSignupMedicalInfo", async ({ authId, medicalData }, { rejectWithValue }) => {
  try {
    const response = await axios.patch<SignupMedicalResponse>(
      `${getAuthApiBaseUrl()}/signup/medical/${encodeURIComponent(authId)}`,
      medicalData,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    return response.data?.data?.medical || medicalData;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Failed to save medical information"));
  }
});

const medicalSlice = createSlice({
  name: "medical",
  initialState,
  reducers: {
    clearMedicalInfo: (state) => {
      state.medicalInfo = null;
      state.isLoading = false;
      state.isSaving = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSignupMedicalInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSignupMedicalInfo.fulfilled, (state, action: PayloadAction<MedicalInfoRecord | null>) => {
        state.isLoading = false;
        state.medicalInfo = action.payload;
      })
      .addCase(fetchSignupMedicalInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch medical information";
      })
      .addCase(saveSignupMedicalInfo.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveSignupMedicalInfo.fulfilled, (state, action: PayloadAction<MedicalInfoRecord>) => {
        state.isSaving = false;
        state.medicalInfo = action.payload;
      })
      .addCase(saveSignupMedicalInfo.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || "Failed to save medical information";
      });
  },
});

export const { clearMedicalInfo } = medicalSlice.actions;
export default medicalSlice.reducer;
