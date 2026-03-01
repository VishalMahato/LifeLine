import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import Ionicons from '@expo/vector-icons/Ionicons';
import axios from 'axios';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { getApiRoot } from '@/src/config/api';

type UserRole = 'helper' | 'user';
type RideType = 'driving' | 'cycling' | 'walking';

type Coords = {
  latitude: number;
  longitude: number;
};

type HelperData = {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  role: string;
  rescues: number;
};

type AuthLookupResponse = {
  data?: {
    user?: {
      _id?: string;
      id?: string;
      name?: string;
      fullName?: string;
      profileImage?: string;
    };
  };
  user?: {
    _id?: string;
    id?: string;
    name?: string;
    fullName?: string;
    profileImage?: string;
  };
};

type WebMapMessage =
  | {
      type: 'mapReady';
    }
  | {
      type: 'routeInfo';
      distance: string;
      duration: string;
    };

const defaultUserLocation: Coords = { latitude: 28.6139, longitude: 77.209 };
const defaultHelperLocation: Coords = { latitude: 28.621, longitude: 77.217 };

const toTravelMode = (type: RideType) => {
  if (type === 'cycling') return 'bicycling';
  if (type === 'walking') return 'walking';
  return 'driving';
};

const buildMapHtml = (helperLocation: Coords, userLocation: Coords, rideType: RideType) => {
  const centerLat = (helperLocation.latitude + userLocation.latitude) / 2;
  const centerLng = (helperLocation.longitude + userLocation.longitude) / 2;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css" />
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #eef2f7; }

    .marker-pin {
      width: 35px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
      border: 3px solid #ffffff;
    }

    .marker-pin span {
      transform: rotate(45deg);
      font-size: 16px;
      line-height: 1;
    }

    .helper-marker { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
    .user-marker { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }

    .leaflet-routing-container { display: none !important; }
    .leaflet-control-zoom { display: none !important; }
    .leaflet-control-attribution { font-size: 8px !important; }
  </style>
</head>
<body>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js"><\/script>
  <script>
    const map = L.map('map', { zoomControl: false, maxZoom: 19, minZoom: 3 }).setView([${centerLat}, ${centerLng}], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const createMarkerIcon = (type) =>
      L.divIcon({
        className: '',
        html:
          '<div class="marker-pin ' +
          (type === 'helper' ? 'helper-marker' : 'user-marker') +
          '"><span>' +
          (type === 'helper' ? '🚑' : '📍') +
          '</span></div>',
        iconSize: [35, 36],
        iconAnchor: [17.5, 36],
      });

    const helperMarker = L.marker([${helperLocation.latitude}, ${helperLocation.longitude}], {
      icon: createMarkerIcon('helper'),
    }).addTo(map);

    const userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}], {
      icon: createMarkerIcon('user'),
    }).addTo(map);

    const profileMap = {
      driving: 'driving',
      cycling: 'cycling',
      walking: 'walking',
    };

    const rideProfile = profileMap['${rideType}'] || 'driving';

    const routingControl = L.Routing.control({
      waypoints: [helperMarker.getLatLng(), userMarker.getLatLng()],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: false,
      lineOptions: {
        styles: [{ color: '#2563eb', weight: 6, opacity: 0.9 }],
      },
      createMarker: () => null,
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1/' + rideProfile,
      }),
    }).addTo(map);

    routingControl.on('routesfound', function (event) {
      const route = event.routes[0];
      const distanceKm = route.summary.totalDistance / 1000;
      const durationMin = Math.ceil(route.summary.totalTime / 60);

      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'routeInfo',
          distance: distanceKm.toFixed(distanceKm >= 10 ? 1 : 2) + ' km',
          duration: durationMin + ' min',
        }),
      );
    });

    map.fitBounds([helperMarker.getLatLng(), userMarker.getLatLng()], { padding: [44, 44] });
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));

    const handleMessage = function (event) {
      try {
        const raw = event && event.data ? event.data : event.nativeEvent && event.nativeEvent.data;
        const payload = JSON.parse(raw);

        if (payload.type === 'updateUserLocation') {
          const lat = Number(payload.latitude);
          const lng = Number(payload.longitude);

          if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
            userMarker.setLatLng([lat, lng]);
            routingControl.setWaypoints([helperMarker.getLatLng(), userMarker.getLatLng()]);
          }
        }

        if (payload.type === 'centerMap') {
          map.fitBounds([helperMarker.getLatLng(), userMarker.getLatLng()], { padding: [44, 44] });
        }
      } catch {
        // Ignore malformed messages
      }
    };

    document.addEventListener('message', handleMessage);
    window.addEventListener('message', handleMessage);
  </script>
</body>
</html>`;
};

const MapScreen = () => {
  const router = useRouter();
  const webViewRef = useRef<WebView | null>(null);
  const { helperId, userId, role } = useLocalSearchParams<{
    helperId?: string | string[];
    userId?: string | string[];
    role?: string | string[];
  }>();

  const helperIdParam = useMemo(() => (Array.isArray(helperId) ? helperId[0] : helperId), [helperId]);
  const userIdParam = useMemo(() => (Array.isArray(userId) ? userId[0] : userId), [userId]);
  const roleParam = useMemo(() => (Array.isArray(role) ? role[0] : role), [role]);
  const myRole: UserRole = roleParam === 'helper' ? 'helper' : 'user';

  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [distance, setDistance] = useState('--');
  const [eta, setEta] = useState('--');
  const [rideType, setRideType] = useState<RideType>('driving');
  const [userLocation, setUserLocation] = useState<Coords>(defaultUserLocation);
  const [helperLocation, setHelperLocation] = useState<Coords>(defaultHelperLocation);

  const [helperData, setHelperData] = useState<HelperData>({
    id: helperIdParam || 'helper-1',
    name: 'Dr. Sarah Chen',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 4.9,
    role: 'Emergency Responder',
    rescues: 1247,
  });

  useEffect(() => {
    if (!helperIdParam) {
      return;
    }

    setHelperData((previous) => ({
      ...previous,
      id: helperIdParam,
    }));
  }, [helperIdParam]);

  const getUserById = useCallback(async () => {
    if (!userIdParam) {
      return null;
    }

    const response = await axios.get<AuthLookupResponse>(
      `${getApiRoot()}/api/auth/v1/getUserById/${encodeURIComponent(userIdParam)}`,
    );

    return response.data?.data?.user || response.data?.user || null;
  }, [userIdParam]);

  useEffect(() => {
    let isMounted = true;

    const syncRemoteUserProfile = async () => {
      if (!userIdParam) {
        return;
      }

      try {
        const user = await getUserById();
        if (!user || !isMounted) {
          return;
        }

        setHelperData((previous) => ({
          ...previous,
          id: user._id || user.id || previous.id,
          name: user.fullName || user.name || previous.name,
          avatar: user.profileImage || previous.avatar,
        }));
      } catch (error) {
        console.error('Failed to fetch user data', error);
      }
    };

    void syncRemoteUserProfile();

    return () => {
      isMounted = false;
    };
  }, [getUserById, userIdParam]);

  const mapHtml = useMemo(
    () => buildMapHtml(helperLocation, userLocation, rideType),
    [helperLocation, userLocation, rideType],
  );

  useEffect(() => {
    let isCancelled = false;

    const initialize = async () => {
      try {
        let initialUserLocation = defaultUserLocation;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const current = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          initialUserLocation = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          };
        }

        const initialHelperLocation = {
          latitude: initialUserLocation.latitude + 0.007,
          longitude: initialUserLocation.longitude + 0.007,
        };

        if (!isCancelled) {
          setUserLocation(initialUserLocation);
          setHelperLocation(initialHelperLocation);
        }
      } catch {
        if (!isCancelled) {
          setUserLocation(defaultUserLocation);
          setHelperLocation(defaultHelperLocation);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isCancelled = true;
    };
  }, [helperIdParam, userIdParam]);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startWatcher = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        },
        (position) => {
          const current = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          setUserLocation(current);

          if (isMapReady) {
            webViewRef.current?.postMessage(
              JSON.stringify({
                type: 'updateUserLocation',
                latitude: current.latitude,
                longitude: current.longitude,
              }),
            );
          }
        },
      );
    };

    startWatcher();

    return () => {
      subscription?.remove();
    };
  }, [isMapReady]);

  const handleWebViewMessage = useCallback((event: WebViewMessageEvent) => {
    try {
      const payload = JSON.parse(event.nativeEvent.data) as WebMapMessage;

      if (payload.type === 'mapReady') {
        setIsMapReady(true);
        return;
      }

      if (payload.type === 'routeInfo') {
        setDistance(payload.distance);
        setEta(payload.duration);
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, []);

  const handleCenterMap = () => {
    webViewRef.current?.postMessage(JSON.stringify({ type: 'centerMap' }));
  };

  const handleRideTypePress = (type: RideType) => {
    if (type === rideType) {
      return;
    }

    setIsMapReady(false);
    setRideType(type);
  };

  const openExternalNavigation = async () => {
    const destination = myRole === 'helper' ? userLocation : helperLocation;
    const origin = myRole === 'helper' ? helperLocation : userLocation;

    const googleUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&travelmode=${toTravelMode(rideType)}`;
    const appleUrl = `http://maps.apple.com/?saddr=${origin.latitude},${origin.longitude}&daddr=${destination.latitude},${destination.longitude}&dirflg=${rideType === 'walking' ? 'w' : 'd'}`;

    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL(appleUrl);
        return;
      }

      await Linking.openURL(googleUrl);
    } catch {
      await Linking.openURL(googleUrl);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
        <Text style={styles.loadingText}>Preparing live map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: mapHtml }}
        style={StyleSheet.absoluteFill}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        geolocationEnabled
        onMessage={handleWebViewMessage}
        scrollEnabled={false}
        bounces={false}
      />

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topControls}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#0A2540" />
          </TouchableOpacity>

          <View style={styles.metricsPill}>
            <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={16} color="#2F80ED" />
              <Text style={styles.metricValue}>{eta}</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Ionicons name="navigate-outline" size={16} color="#2F80ED" />
              <Text style={styles.metricValue}>{distance}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.iconButton} onPress={handleCenterMap}>
            <Ionicons name="locate" size={20} color="#0A2540" />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomCardWrap}>
          <View style={styles.helperCard}>
            <View style={styles.helperRow}>
              <Image source={{ uri: helperData.avatar }} style={styles.avatar} />
              <View style={styles.helperInfo}>
                <Text style={styles.helperName}>{helperData.name}</Text>
                <Text style={styles.helperRole}>{helperData.role}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {helperData.rating} • {helperData.rescues} rescues
                  </Text>
                </View>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusLabel}>
                  {myRole === 'helper' ? 'Navigate to user' : 'Helper arriving'}
                </Text>
                <Text style={styles.statusValue}>{eta}</Text>
              </View>
            </View>

            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeButton, rideType === 'driving' && styles.modeButtonActive]}
                onPress={() => handleRideTypePress('driving')}
              >
                <Ionicons
                  name="car-outline"
                  size={16}
                  color={rideType === 'driving' ? '#FFFFFF' : '#0A2540'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, rideType === 'cycling' && styles.modeButtonActive]}
                onPress={() => handleRideTypePress('cycling')}
              >
                <Ionicons
                  name="bicycle-outline"
                  size={16}
                  color={rideType === 'cycling' ? '#FFFFFF' : '#0A2540'}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeButton, rideType === 'walking' && styles.modeButtonActive]}
                onPress={() => handleRideTypePress('walking')}
              >
                <Ionicons
                  name="walk-outline"
                  size={16}
                  color={rideType === 'walking' ? '#FFFFFF' : '#0A2540'}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                <Text style={styles.primaryActionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]}>
                <Text style={styles.secondaryActionText}>Message</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.navigateButton} onPress={openExternalNavigation}>
              <Ionicons name="navigate" size={16} color="#FFFFFF" />
              <Text style={styles.navigateText}>Open navigation</Text>
            </TouchableOpacity>

            <Text style={styles.noteText}>
              {myRole === 'helper'
                ? `Live location updates active for your route to user ${userIdParam || 'current-user'}.`
                : `Live location updates active for helper ${helperData.id} and user ${userIdParam || 'current-user'}.`}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: hp('1.2%'),
  },
  loadingText: {
    color: '#5F6C7B',
    fontSize: hp('1.7%'),
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topControls: {
    marginTop: hp('1%'),
    paddingHorizontal: wp('4%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: hp('5.2%'),
    height: hp('5.2%'),
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  metricsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: wp('3.2%'),
    paddingVertical: hp('1%'),
    elevation: 3,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.2%'),
  },
  metricValue: {
    color: '#0A2540',
    fontSize: hp('1.6%'),
    fontWeight: '700',
  },
  metricDivider: {
    width: 1,
    height: hp('2%'),
    backgroundColor: '#DDE4EE',
    marginHorizontal: wp('2.6%'),
  },
  bottomCardWrap: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2.4%'),
  },
  helperCard: {
    borderRadius: hp('1.8%'),
    backgroundColor: '#FFFFFF',
    padding: wp('4.5%'),
    elevation: 4,
    gap: hp('1.3%'),
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: hp('6%'),
    height: hp('6%'),
    borderRadius: 999,
    backgroundColor: '#EAF4FF',
  },
  helperInfo: {
    flex: 1,
    marginLeft: wp('3%'),
  },
  helperName: {
    color: '#0A2540',
    fontSize: hp('1.9%'),
    fontWeight: '700',
  },
  helperRole: {
    color: '#5F6C7B',
    fontSize: hp('1.5%'),
    marginTop: hp('0.2%'),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1.2%'),
    marginTop: hp('0.5%'),
  },
  ratingText: {
    color: '#5F6C7B',
    fontSize: hp('1.4%'),
    fontWeight: '600',
  },
  statusBadge: {
    borderRadius: hp('1%'),
    backgroundColor: '#EAF8EF',
    paddingHorizontal: wp('2.4%'),
    paddingVertical: hp('0.6%'),
    alignItems: 'center',
  },
  statusLabel: {
    color: '#1F7A3D',
    fontSize: hp('1.1%'),
    fontWeight: '600',
  },
  statusValue: {
    color: '#1B5E20',
    fontSize: hp('1.6%'),
    fontWeight: '800',
  },
  modeRow: {
    flexDirection: 'row',
    gap: wp('2%'),
  },
  modeButton: {
    width: hp('4.2%'),
    height: hp('4.2%'),
    borderRadius: hp('1%'),
    backgroundColor: '#EEF3F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#0B5ED7',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: wp('3%'),
  },
  actionButton: {
    flex: 1,
    borderRadius: hp('1.2%'),
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('1.35%'),
  },
  primaryAction: {
    backgroundColor: '#0B5ED7',
  },
  secondaryAction: {
    backgroundColor: '#EEF3F9',
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: hp('1.65%'),
    fontWeight: '700',
  },
  secondaryActionText: {
    color: '#0A2540',
    fontSize: hp('1.65%'),
    fontWeight: '700',
  },
  navigateButton: {
    borderRadius: hp('1.2%'),
    backgroundColor: '#0B5ED7',
    paddingVertical: hp('1.35%'),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: wp('1.8%'),
  },
  navigateText: {
    color: '#FFFFFF',
    fontSize: hp('1.6%'),
    fontWeight: '700',
  },
  noteText: {
    color: '#6B7280',
    fontSize: hp('1.35%'),
  },
});
