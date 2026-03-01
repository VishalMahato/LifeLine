import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import apiClient, { API_ENDPOINTS } from "@/src/config/api";

export type LocationParams = {
  id?: string;
  userId: string;
  coordinates: [number, number]; // [lng, lat]
  address?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  placeType?: string;
  provider?: string;
  accuracy?: number;
  isVerified?: boolean;
  isActive?: boolean;
  lastUpdated?: string;
};

type LocationApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type LocationState = {
  locations: LocationParams[];
  currentLocation: LocationParams | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: LocationState = {
  locations: [],
  currentLocation: null,
  isLoading: false,
  error: null,
};

const parseError = (error: unknown, fallback: string) => {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) {
      return message;
    }

    if (!error.response) {
      return "Unable to reach backend. Check EXPO_PUBLIC_API_URL and server status.";
    }
  }

  return fallback;
};

export const fetchUserLocations = createAsyncThunk<
  LocationParams[],
  string,
  { rejectValue: string }
>("location/fetchUserLocations", async (userId, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<LocationApiResponse<LocationParams[]>>(
      API_ENDPOINTS.LOCATION.USER(userId),
    );

    return response.data.data || [];
  } catch (error) {
    return rejectWithValue(parseError(error, "Failed to fetch locations"));
  }
});

export const createLocation = createAsyncThunk<
  LocationParams,
  Omit<LocationParams, "id">,
  { rejectValue: string }
>("location/createLocation", async (payload, { rejectWithValue }) => {
  try {
    const response = await apiClient.post<LocationApiResponse<LocationParams>>(
      API_ENDPOINTS.LOCATION.BASE,
      payload,
    );

    return response.data.data;
  } catch (error) {
    return rejectWithValue(parseError(error, "Failed to create location"));
  }
});

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearLocationError: (state) => {
      state.error = null;
    },
    resetLocationState: (state) => {
      state.locations = [];
      state.currentLocation = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserLocations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserLocations.fulfilled, (state, action: PayloadAction<LocationParams[]>) => {
        state.isLoading = false;
        state.locations = action.payload;
        state.currentLocation = action.payload[0] || null;
      })
      .addCase(fetchUserLocations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch locations";
      })
      .addCase(createLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createLocation.fulfilled, (state, action: PayloadAction<LocationParams>) => {
        state.isLoading = false;
        const existingIndex = state.locations.findIndex((item) => item.id === action.payload.id);
        if (existingIndex >= 0) {
          state.locations[existingIndex] = action.payload;
        } else {
          state.locations.unshift(action.payload);
        }
        state.currentLocation = action.payload;
      })
      .addCase(createLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create location";
      });
  },
});

export const { clearLocationError, resetLocationState } = locationSlice.actions;
export default locationSlice.reducer;
