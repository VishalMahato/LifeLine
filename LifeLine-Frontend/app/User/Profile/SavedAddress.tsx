import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import * as Location from 'expo-location'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import UniversalMap from '@/src/features/auth/screens/UniversalMap'

type AddressState = {
  street: string
  city: string
  state: string
  zip: string
  landmark: string
}

type GeoState = {
  latitude: number
  longitude: number
}

const DEFAULT_ADDRESS: AddressState = {
  street: '123 Maple Street',
  city: 'Springfield',
  state: 'IL',
  zip: '62704',
  landmark: 'Red door, across from Oak Park',
}

const DEFAULT_GEO: GeoState = {
  latitude: 37.7749,
  longitude: -122.4194,
}

export default function SavedAddress() {
  const navigation = useNavigation<any>()

  const [address, setAddress] = useState<AddressState>(DEFAULT_ADDRESS)
  const [geo, setGeo] = useState<GeoState>(DEFAULT_GEO)
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const getLocation = async () => {
    setLocationError(null)
    setIsUpdatingLocation(true)

    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLocationError('Location permission was denied.')
        return
      }

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      })

      const latitude = current.coords.latitude
      const longitude = current.coords.longitude
      setGeo({ latitude, longitude })

      const [resolvedAddress] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })

      setAddress((prev) => ({
        street: resolvedAddress?.street || resolvedAddress?.name || resolvedAddress?.formattedAddress || prev.street,
        city: resolvedAddress?.city || prev.city,
        state: resolvedAddress?.region || prev.state,
        zip: resolvedAddress?.postalCode || prev.zip,
        landmark: resolvedAddress?.district
          || resolvedAddress?.subregion
          || 'Updated from current GPS location',
      }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch current location.'
      setLocationError(message)
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Saved Address</Text>

        <TouchableOpacity>
          <Ionicons name="pencil" size={20} color="#1E73E8" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        <View style={styles.mapCard}>
          <UniversalMap latitude={geo.latitude} longitude={geo.longitude} />

          <TouchableOpacity
            style={styles.locationBtn}
            onPress={getLocation}
            disabled={isUpdatingLocation}
          >
            {isUpdatingLocation ? (
              <ActivityIndicator size="small" color="#1E73E8" />
            ) : (
              <Ionicons name="locate" size={18} color="#1E73E8" />
            )}
            <Text style={styles.locationText}>
              {isUpdatingLocation ? 'Updating location...' : 'Update Current Location'}
            </Text>
          </TouchableOpacity>
        </View>

        {locationError ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color="#B3261E" />
            <Text style={styles.errorText}>{locationError}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <LabelValue label="Street Address" value={address.street} />

          <View style={styles.rowSplit}>
            <View style={styles.half}>
              <LabelValue label="City" value={address.city} />
            </View>
            <View style={[styles.half, styles.dividerLeft]}>
              <LabelValue label="State" value={address.state} />
            </View>
          </View>

          <LabelValue label="ZIP Code" value={address.zip} />
          <LabelValue label="Landmark" value={address.landmark} />

          <View style={styles.notesSection}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>GPS COORDINATES</Text>
            </View>
            <Text style={styles.notesText}>
              {geo.latitude.toFixed(6)}, {geo.longitude.toFixed(6)}
            </Text>
          </View>
        </View>

        <View style={styles.encryptionBox}>
          <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
          <Text style={styles.encryptionText}>End-to-end encrypted</Text>
        </View>

        <Text style={styles.subInfo}>
          LOCATION IS SHARED ONLY DURING ACTIVE EMERGENCIES WITH VERIFIED FIRST RESPONDERS.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F4F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('6%'),
    paddingBottom: hp('2%'),
    backgroundColor: '#FFFFFF',
  },
  back: {
    color: '#1E73E8',
    fontSize: hp('1.8%'),
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: hp('2.2%'),
    fontWeight: '700',
    color: '#111827',
  },
  contentContainer: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
    paddingBottom: hp('20%'),
  },
  mapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: wp('3%'),
    marginBottom: hp('3%'),
    elevation: 4,
  },
  locationBtn: {
    position: 'absolute',
    bottom: -hp('2%'),
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.3%'),
    paddingHorizontal: wp('6%'),
    borderRadius: 12,
    elevation: 6,
  },
  locationText: {
    marginLeft: wp('2%'),
    color: '#1E73E8',
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FBCACA',
    backgroundColor: '#FEECEC',
    borderRadius: 12,
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.2%'),
    marginBottom: hp('2%'),
  },
  errorText: {
    marginLeft: wp('2%'),
    color: '#B3261E',
    fontSize: hp('1.45%'),
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: wp('5%'),
    elevation: 2,
  },
  field: {
    marginBottom: hp('2%'),
  },
  label: {
    fontSize: hp('1.3%'),
    color: '#9CA3AF',
    fontWeight: '600',
    marginBottom: hp('0.7%'),
  },
  value: {
    fontSize: hp('1.8%'),
    fontWeight: '600',
    color: '#111827',
  },
  rowSplit: {
    flexDirection: 'row',
  },
  half: {
    flex: 1,
  },
  dividerLeft: {
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    paddingLeft: wp('4%'),
  },
  notesSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: wp('4%'),
    marginTop: hp('1%'),
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesTitle: {
    fontSize: hp('1.4%'),
    fontWeight: '700',
    color: '#1E73E8',
    marginBottom: hp('1%'),
  },
  notesText: {
    fontSize: hp('1.5%'),
    color: '#374151',
    fontStyle: 'italic',
  },
  encryptionBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('4%'),
  },
  encryptionText: {
    marginLeft: wp('2%'),
    fontSize: hp('1.4%'),
    color: '#9CA3AF',
  },
  subInfo: {
    textAlign: 'center',
    fontSize: hp('1.2%'),
    color: '#9CA3AF',
    marginTop: hp('1%'),
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp('5%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelBtn: {
    flex: 0.48,
    backgroundColor: '#E5E7EB',
    paddingVertical: hp('2%'),
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontWeight: '600',
    color: '#374151',
  },
  saveBtn: {
    flex: 0.48,
    backgroundColor: '#1E73E8',
    paddingVertical: hp('2%'),
    borderRadius: 14,
    alignItems: 'center',
    elevation: 4,
  },
  saveText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
