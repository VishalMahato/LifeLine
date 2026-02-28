import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import * as Location from 'expo-location'
import { router } from 'expo-router'
import { useAppSelector } from '@/src/core/store'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from '@expo/vector-icons/Ionicons'
import UniversalMap from './UniversalMap'

export type SecureLocationPayload = {
  latitude: number
  longitude: number
  address: string
  city: string
  state?: string
  zipCode?: string
}

export type SecureLocationScreenHandle = {
  handleSubmit: () => Promise<boolean>
}

type Props = {
  onSubmit?: (data: SecureLocationPayload) => Promise<void> | void
}

type LocationType = {
  latitude?: number
  longitude?: number
}

const SecureLocationScreen = forwardRef<SecureLocationScreenHandle, Props>(
  ({ onSubmit }, ref) => {
    const role = useAppSelector((state) => state.auth.userData?.role)
    const [loading, setLoading] = useState(false)
    const [location, setLocation] = useState<LocationType | null>(null)
    const [manualAddress, setManualAddress] = useState('')
    const [manualCity, setManualCity] = useState('')
    const [manualState, setManualState] = useState('')
    const [manualZip, setManualZip] = useState('')
    const [manualLat, setManualLat] = useState('')
    const [manualLng, setManualLng] = useState('')

    const stepText = role === 'helper' ? 'STEP 3 OF 3' : 'STEP 4 OF 4'

    const reverseGeocode = async (lat: number, lng: number) => {
      try {
        const [address] = await Location.reverseGeocodeAsync({
          latitude: lat,
          longitude: lng,
        })

        if (!address) {
          return
        }

        const streetPart = address.street || address.name || ''
        const housePart = address.streetNumber ? `${address.streetNumber} ` : ''

        setManualAddress(`${housePart}${streetPart}`.trim())
        setManualCity(address.city || address.district || address.subregion || '')
        setManualState(address.region || '')
        setManualZip(address.postalCode || '')
      } catch (error) {
        console.error('Reverse geocoding error:', error)
      }
    }

    const getCurrentLocation = async () => {
      try {
        setLoading(true)

        const { status } = await Location.requestForegroundPermissionsAsync()

        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Location permission is required to continue.',
          )
          return
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        })

        const latitude = loc.coords.latitude
        const longitude = loc.coords.longitude

        setLocation({ latitude, longitude })
        setManualLat(String(latitude))
        setManualLng(String(longitude))

        await reverseGeocode(latitude, longitude)
      } catch {
        Alert.alert('Error', 'Unable to fetch location')
      } finally {
        setLoading(false)
      }
    }

    const handleManualCoordChange = async () => {
      const lat = parseFloat(manualLat)
      const lng = parseFloat(manualLng)

      if (Number.isNaN(lat) || Number.isNaN(lng)) {
        return
      }

      setLocation({ latitude: lat, longitude: lng })
      await reverseGeocode(lat, lng)
    }

    const buildPayload = (): SecureLocationPayload | null => {
      const latitude = location?.latitude ?? parseFloat(manualLat)
      const longitude = location?.longitude ?? parseFloat(manualLng)

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        Alert.alert(
          'Invalid coordinates',
          'Please enter valid latitude and longitude values.',
        )
        return null
      }

      if (!manualAddress.trim() || !manualCity.trim()) {
        Alert.alert(
          'Address Required',
          'Please provide at least street address and city.',
        )
        return null
      }

      return {
        latitude,
        longitude,
        address: manualAddress.trim(),
        city: manualCity.trim(),
        state: manualState.trim() || undefined,
        zipCode: manualZip.trim() || undefined,
      }
    }

    const handleSubmit = async () => {
      const payload = buildPayload()
      if (!payload) {
        return false
      }

      try {
        if (onSubmit) {
          await onSubmit(payload)
        } else {
          const nextRoute = role === 'helper' ? '/HelperAccountReady' : '/AccountReady'
          Alert.alert('Setup Complete', 'Your location has been secured.', [
            {
              text: 'Continue',
              onPress: () => router.replace(nextRoute),
            },
          ])
        }

        return true
      } catch (error) {
        console.error('Secure location submit error:', error)
        Alert.alert('Error', 'Failed to save secure location.')
        return false
      }
    }

    useImperativeHandle(ref, () => ({
      handleSubmit,
    }))

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={hp('3%')} color="#2F80ED" />
            <Text style={styles.step}>{stepText}</Text>
          </View>

          <Text style={styles.title}>Secure Location</Text>
          <Text style={styles.subtitle}>
            LifeLine uses your location to connect you with nearby help in
            emergencies.
          </Text>

          <View style={styles.mapCard}>
            <UniversalMap
              latitude={location?.latitude}
              longitude={location?.longitude}
            />
            <View style={styles.mapOverlay}>
              <View style={styles.badge}>
                <Ionicons name="navigate" size={hp('1.4%')} color="#2F80ED" />
                <Text style={styles.badgeText}>LEAFLET MAP</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, loading && styles.btnLoading]}
            onPress={getCurrentLocation}
            disabled={loading}
          >
            <Ionicons name="locate" size={hp('2.2%')} color="#fff" />
            <Text style={styles.primaryText}>
              {loading ? 'FETCHING...' : 'USE CURRENT LOCATION'}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>MANUAL ENTRY</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={hp('2%')} color="#0A2540" />
              <Text style={styles.cardTitle}>Coordinates</Text>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>LATITUDE</Text>
                <TextInput
                  placeholder="e.g. 40.7128"
                  keyboardType="numeric"
                  style={styles.input}
                  value={manualLat}
                  onChangeText={setManualLat}
                  onEndEditing={handleManualCoordChange}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>LONGITUDE</Text>
                <TextInput
                  placeholder="e.g. -74.0060"
                  keyboardType="numeric"
                  style={styles.input}
                  value={manualLng}
                  onChangeText={setManualLng}
                  onEndEditing={handleManualCoordChange}
                />
              </View>
            </View>
          </View>

          <View style={[styles.card, { marginBottom: hp('5%') }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="home-outline" size={hp('2%')} color="#0A2540" />
              <Text style={styles.cardTitle}>Address Details</Text>
            </View>

            <Text style={styles.label}>STREET ADDRESS</Text>
            <TextInput
              placeholder="123 Safety Ave"
              style={styles.input}
              value={manualAddress}
              onChangeText={setManualAddress}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>CITY</Text>
                <TextInput
                  placeholder="New York"
                  style={styles.input}
                  value={manualCity}
                  onChangeText={setManualCity}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>STATE / REGION</Text>
                <TextInput
                  placeholder="NY"
                  style={styles.input}
                  value={manualState}
                  onChangeText={setManualState}
                />
              </View>
            </View>

            <Text style={styles.label}>ZIP CODE</Text>
            <TextInput
              placeholder="10001"
              keyboardType="numeric"
              style={styles.input}
              value={manualZip}
              onChangeText={setManualZip}
            />
          </View>

          {!onSubmit ? (
            <TouchableOpacity style={styles.nextBtn} onPress={() => void handleSubmit()}>
              <Text style={styles.nextText}>Finish Setup →</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    )
  },
)

SecureLocationScreen.displayName = 'SecureLocationScreen'

export default SecureLocationScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('3%'),
    gap: wp('2%'),
  },
  step: {
    fontSize: hp('1.4%'),
    fontWeight: '800',
    color: '#2F80ED',
    letterSpacing: 1,
  },
  title: {
    fontSize: hp('3%'),
    fontWeight: '800',
    color: '#0A2540',
    marginTop: hp('1%'),
  },
  subtitle: {
    fontSize: hp('1.7%'),
    color: '#5F6C7B',
    marginTop: hp('0.5%'),
    marginBottom: hp('3%'),
    lineHeight: hp('2.4%'),
  },
  mapCard: {
    borderRadius: hp('2%'),
    overflow: 'hidden',
    marginBottom: hp('2.5%'),
    backgroundColor: '#fff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#EAF4FF',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: hp('1.5%'),
    right: wp('4%'),
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.8%'),
    borderRadius: 20,
    gap: wp('1.5%'),
    elevation: 2,
  },
  badgeText: {
    fontSize: hp('1.2%'),
    fontWeight: '800',
    color: '#2F80ED',
    letterSpacing: 0.5,
  },
  primaryBtn: {
    flexDirection: 'row',
    gap: wp('2.5%'),
    backgroundColor: '#0B5ED7',
    paddingVertical: hp('2.2%'),
    borderRadius: hp('1.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#0B5ED7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnLoading: {
    backgroundColor: '#8A94A6',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryText: {
    color: '#fff',
    fontSize: hp('1.6%'),
    fontWeight: '800',
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hp('4%'),
    gap: wp('3%'),
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#DFE6EE',
  },
  dividerText: {
    fontSize: hp('1.3%'),
    fontWeight: '700',
    color: '#8A94A6',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: hp('2%'),
    padding: wp('5%'),
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#EEF3F8',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    marginBottom: hp('1.2%'),
  },
  cardTitle: {
    fontSize: hp('1.9%'),
    fontWeight: '700',
    color: '#0A2540',
  },
  row: {
    flexDirection: 'row',
    gap: wp('4%'),
  },
  label: {
    fontSize: hp('1.3%'),
    fontWeight: '700',
    color: '#8A94A6',
    marginBottom: hp('0.6%'),
    marginTop: hp('0.8%'),
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: hp('1%'),
    paddingHorizontal: wp('4%'),
    height: hp('5.5%'),
    fontSize: hp('1.7%'),
    borderWidth: 1,
    borderColor: '#E4EBF3',
    marginBottom: hp('1.3%'),
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
