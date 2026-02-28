import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from '@expo/vector-icons/Ionicons'
import UniversalMap from './UniversalMap'

type LocationType = {
  latitude?: number
  longitude?: number
  address?: string
  city?: string
  zipCode?: string
}

const SecureLocationScreen = () => {
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState<LocationType | null>(null)
  const [manualAddress, setManualAddress] = useState('')
  const [manualCity, setManualCity] = useState('')
  const [manualZip, setManualZip] = useState('')

  const getCurrentLocation = async () => {
    try {
      setLoading(true)

      const { status } =
        await Location.requestForegroundPermissionsAsync()

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Location permission is required to continue.'
        )
        return
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      })
    } catch {
      Alert.alert('Error', 'Unable to fetch location')
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    const hasManualLocation = Boolean(
      manualAddress.trim() && manualCity.trim() && manualZip.trim()
    )

    if (!location && !hasManualLocation) {
      Alert.alert(
        'Location Required',
        'Please use your current location or fill all manual address fields.'
      )
      return
    }

    const finalLocation = location ?? {
      address: manualAddress.trim(),
      city: manualCity.trim(),
      zipCode: manualZip.trim(),
    }

    console.log('Saved Location:', finalLocation)

    Alert.alert(
      'Setup Complete',
      'Your location has been secured.',
      [
        {
          text: 'Continue',
          onPress: () => router.replace('/AccountReady'),
        },
      ]
    )
  }

  const mapUrl =
    location?.latitude != null && location?.longitude != null
      ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}&z=15&output=embed`
      : null

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Text style={styles.step}>STEP 5 OF 5</Text>

      <Text style={styles.title}>Secure Location</Text>
      <Text style={styles.subtitle}>
        LifeLine uses your location to connect you with nearby help in emergencies.
      </Text>

      {/* Universal Map */}
      <View style={styles.mapCard}>
        {mapUrl ? (
          <UniversalMap latitude={location?.latitude} longitude={location?.longitude} />
        ) : (
          <View style={[styles.map, styles.mapPlaceholder]}>
            <Ionicons
              name="map-outline"
              size={hp('4%')}
              color="#8A94A6"
            />
            <Text style={styles.placeholderText}>
              Location preview will appear here
            </Text>
          </View>
        )}

        <View style={styles.previewBadge}>
          <Text style={styles.previewText}>PREVIEW ONLY</Text>
        </View>
      </View>

      {/* Use Location */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={getCurrentLocation}
        disabled={loading}
      >
        <Ionicons name="locate" size={hp('2.2%')} color="#fff" />
        <Text style={styles.primaryText}>
          {loading ? 'Fetching location...' : 'Use Current Location'}
        </Text>
      </TouchableOpacity>

      {/* Coordinates */}
      {location && (
        <View style={styles.locationBox}>
          <Text style={styles.locationText}>
            📍 Lat: {location.latitude?.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            📍 Lng: {location.longitude?.toFixed(6)}
          </Text>
        </View>
      )}

      {/* Divider */}
      <Text style={styles.orText}>OR ENTER MANUALLY</Text>

      {/* Manual Address */}
      <View style={styles.card}>
        <Text style={styles.label}>Street Address</Text>
        <TextInput
          placeholder="123 Safety Ave"
          style={styles.input}
          value={manualAddress}
          onChangeText={setManualAddress}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>City</Text>
            <TextInput
              placeholder="New York"
              style={styles.input}
              value={manualCity}
              onChangeText={setManualCity}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Zip Code</Text>
            <TextInput
              placeholder="10001"
              keyboardType="numeric"
              style={styles.input}
              value={manualZip}
              onChangeText={setManualZip}
            />
          </View>
        </View>
      </View>

      {/* Finish */}
      <TouchableOpacity style={styles.nextBtn} onPress={handleFinish}>
        <Text style={styles.nextText}>Finish Setup →</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

export default SecureLocationScreen


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    backgroundColor: '#FAFAFA',
  },

  step: {
    marginTop: hp('3%'),
    fontSize: hp('1.4%'),
    fontWeight: '700',
    color: '#2F80ED',
  },

  title: {
    fontSize: hp('2.8%'),
    fontWeight: '800',
    color: '#0A2540',
    marginTop: hp('1%'),
  },

  subtitle: {
    fontSize: hp('1.8%'),
    color: '#5F6C7B',
    marginBottom: hp('3%'),
  },

  mapCard: {
    borderRadius: hp('1.8%'),
    overflow: 'hidden',
    marginBottom: hp('2%'),
  },

  map: {
    width: '100%',
    height: hp('22%'),
  },

  mapPlaceholder: {
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp('1%'),
  },

  placeholderText: {
    fontSize: hp('1.6%'),
    color: '#8A94A6',
    fontWeight: '600',
  },

  previewBadge: {
    position: 'absolute',
    bottom: hp('1%'),
    right: wp('4%'),
    backgroundColor: '#fff',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.6%'),
    borderRadius: 20,
  },

  previewText: {
    fontSize: hp('1.2%'),
    fontWeight: '700',
    color: '#8A94A6',
  },

  primaryBtn: {
    flexDirection: 'row',
    gap: wp('2%'),
    backgroundColor: '#0B5ED7',
    paddingVertical: hp('1.8%'),
    borderRadius: hp('1.2%'),
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryText: {
    color: '#fff',
    fontSize: hp('1.9%'),
    fontWeight: '700',
  },

  locationBox: {
    backgroundColor: '#EAF4FF',
    padding: wp('4%'),
    borderRadius: hp('1.2%'),
    marginTop: hp('2%'),
  },

  locationText: {
    fontSize: hp('1.6%'),
    fontWeight: '600',
    color: '#2F80ED',
  },

  orText: {
    textAlign: 'center',
    marginVertical: hp('3%'),
    fontSize: hp('1.4%'),
    color: '#8A94A6',
    fontWeight: '700',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: hp('2%'),
    padding: wp('5%'),
    elevation: 3,
    marginBottom: hp('4%'),
  },

  label: {
    fontSize: hp('1.3%'),
    fontWeight: '700',
    color: '#8A94A6',
    marginBottom: hp('0.6%'),
  },

  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: hp('1%'),
    paddingHorizontal: wp('4%'),
    height: hp('5.5%'),
    fontSize: hp('1.7%'),
    marginBottom: hp('1.5%'),
  },

  row: {
    flexDirection: 'row',
    gap: wp('4%'),
  },

  nextBtn: {
    backgroundColor: '#0B5ED7',
    borderRadius: hp('1.2%'),
    paddingVertical: hp('1.8%'),
    alignItems: 'center',
    marginBottom: hp('4%'),
  },

  nextText: {
    color: '#fff',
    fontSize: hp('2%'),
    fontWeight: '700',
  },
})
