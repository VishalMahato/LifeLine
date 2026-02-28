import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

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

const buildMapHtml = (helperLocation: Coords, userLocation: Coords) => {
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
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; }
    .leaflet-routing-container { display: none !important; }
    .leaflet-control-attribution { font-size: 8px !important; }
  </style>
</head>
<body>
  <div id="map"></div>

  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.min.js"></script>
  <script>
    const map = L.map('map', { zoomControl: false }).setView([${centerLat}, ${centerLng}], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    const helperMarker = L.marker([${helperLocation.latitude}, ${helperLocation.longitude}]).addTo(map);
    const userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}]).addTo(map);

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(${helperLocation.latitude}, ${helperLocation.longitude}),
        L.latLng(${userLocation.latitude}, ${userLocation.longitude})
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      lineOptions: {
        styles: [{ color: '#2F80ED', weight: 5, opacity: 0.85 }],
      },
      createMarker: function () { return null; }
    }).addTo(map);

    routingControl.on('routesfound', function (e) {
      const route = e.routes[0];
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'routeInfo',
        distance: (route.summary.totalDistance / 1000).toFixed(1) + ' km',
        duration: Math.ceil(route.summary.totalTime / 60) + ' min'
      }));
    });

    map.fitBounds([
      [${helperLocation.latitude}, ${helperLocation.longitude}],
      [${userLocation.latitude}, ${userLocation.longitude}],
    ], { padding: [44, 44] });

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
            routingControl.setWaypoints([
              L.latLng(${helperLocation.latitude}, ${helperLocation.longitude}),
              L.latLng(lat, lng),
            ]);
          }
        }

        if (payload.type === 'centerMap') {
          map.fitBounds([helperMarker.getLatLng(), userMarker.getLatLng()], { padding: [44, 44] });
        }
      } catch (error) {
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
  const { helperId, userId } = useLocalSearchParams<{
    helperId?: string | string[];
    userId?: string | string[];
  }>();

  const helperIdParam = useMemo(() => (Array.isArray(helperId) ? helperId[0] : helperId), [helperId]);
  const userIdParam = useMemo(() => (Array.isArray(userId) ? userId[0] : userId), [userId]);

  const [isLoading, setIsLoading] = useState(true);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapHtml, setMapHtml] = useState('');
  const [distance, setDistance] = useState('--');
  const [eta, setEta] = useState('--');

  const helperData = useMemo<HelperData>(
    () => ({
      id: helperIdParam || 'helper-1',
      name: 'Dr. Sarah Chen',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      rating: 4.9,
      role: 'Emergency Responder',
      rescues: 1247,
    }),
    [helperIdParam],
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

        // Mock helper location near user until live helper coordinates are available.
        const initialHelperLocation = {
          latitude: initialUserLocation.latitude + 0.007,
          longitude: initialUserLocation.longitude + 0.007,
        };

        if (!isCancelled) {
          setMapHtml(buildMapHtml(initialHelperLocation, initialUserLocation));
        }
      } catch {
        if (!isCancelled) {
          setMapHtml(buildMapHtml(defaultHelperLocation, defaultUserLocation));
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

  if (isLoading || !mapHtml) {
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
                <Text style={styles.statusLabel}>On the way</Text>
                <Text style={styles.statusValue}>{eta}</Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity style={[styles.actionButton, styles.primaryAction]}>
                <Text style={styles.primaryActionText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.secondaryAction]}>
                <Text style={styles.secondaryActionText}>Message</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.noteText}>
              Live location updates active for helper {helperData.id} and user {userIdParam || 'current-user'}.
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
  noteText: {
    color: '#6B7280',
    fontSize: hp('1.35%'),
  },
});
