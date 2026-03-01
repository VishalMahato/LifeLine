import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type SosState = {
  isSOSActive: boolean;
  isLoading: boolean;
  error: string | null;
};

const initialState: SosState = {
  isSOSActive: false,
  isLoading: false,
  error: null,
};

const sosSlice = createSlice({
  name: "sos",
  initialState,
  reducers: {
    activateSos: (state) => {
      state.isSOSActive = true;
      state.error = null;
    },
    deactivateSos: (state) => {
      state.isSOSActive = false;
      state.error = null;
    },
    setSosLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSosError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  activateSos,
  deactivateSos,
  setSosLoading,
  setSosError,
} = sosSlice.actions;

export default sosSlice.reducer;
