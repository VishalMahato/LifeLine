import apiClient, { API_ENDPOINTS } from "@/src/config/api";

type LocationUpdatePayload = {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  timestamp?: string;
};

class SocketService {
  async updateLocation(payload: LocationUpdatePayload) {
    return apiClient.post(API_ENDPOINTS.LOCATION.COORDINATES, payload);
  }
}

export default new SocketService();
