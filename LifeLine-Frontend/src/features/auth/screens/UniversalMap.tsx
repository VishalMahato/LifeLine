import Ionicons from '@expo/vector-icons/Ionicons'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { WebView } from 'react-native-webview'

type Props = {
  latitude: number | undefined
  longitude: number | undefined
}

const UniversalMap = ({ latitude, longitude }: Props) => {
  const hasCoords =
    latitude !== undefined &&
    longitude !== undefined &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)

  const leafletHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
      html, body, #map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }
      .leaflet-container { background: #f0f4f8; }
      .pulse {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2px solid #fff;
        background: #0b5ed7;
        box-shadow: 0 0 0 rgba(11, 94, 215, 0.45);
        animation: pulse 1.9s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(11, 94, 215, 0.55); }
        70% { transform: scale(1); box-shadow: 0 0 0 14px rgba(11, 94, 215, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(11, 94, 215, 0); }
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      const lat = ${latitude ?? 0};
      const lng = ${longitude ?? 0};
      const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([lat, lng], 16);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      const markerIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div class='pulse'></div>",
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([lat, lng], { icon: markerIcon }).addTo(map);
    </script>
  </body>
</html>`

  return (
    <View style={styles.container}>
      {hasCoords ? (
        <WebView
          originWhitelist={['*']}
          source={{ html: leafletHtml }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
        />
      ) : (
        <View style={styles.placeholderContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="map-outline" size={hp('4.4%')} color="#2F80ED" />
          </View>
          <Text style={styles.placeholderTitle}>Awaiting Location</Text>
          <Text style={styles.placeholderText}>
            Add coordinates or use your GPS to show the map preview.
          </Text>
        </View>
      )}
    </View>
  )
}

export default UniversalMap


const styles = StyleSheet.create({
  container: {
    height: 250,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('10%'),
  },
  iconCircle: {
    width: hp('8.8%'),
    height: hp('8.8%'),
    borderRadius: hp('4.4%'),
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  placeholderTitle: {
    fontSize: hp('2.2%'),
    fontWeight: '800',
    color: '#0A2540',
    marginBottom: hp('1%'),
  },
  placeholderText: {
    fontSize: hp('1.6%'),
    color: '#5F6C7B',
    textAlign: 'center',
    lineHeight: hp('2.2%'),
  },
})
