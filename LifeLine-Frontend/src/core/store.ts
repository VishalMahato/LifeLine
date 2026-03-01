import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "@/src/features/auth/authSlice";
import medicalReducer from "@/src/features/auth/medicalSlice";
import locationReducer from "@/src/features/auth/locationSlice";
import sosReducer from "@/src/features/SOS/sos.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    medical: medicalReducer,
    location: locationReducer,
    sos: sosReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
