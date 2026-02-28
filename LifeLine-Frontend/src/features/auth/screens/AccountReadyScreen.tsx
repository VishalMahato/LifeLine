import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from '@expo/vector-icons/Ionicons'

const AccountReadyScreen = () => {
  const handleGoHome = () => {
    router.replace('/Home')
  }

  const handleViewSafetyTips = () => {
    Alert.alert(
      'Safety Tips',
      'Stay aware of your surroundings and keep location access enabled for emergency support.'
    )
  }

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.iconWrapper}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <Ionicons
              name="checkmark"
              size={hp('3.5%')}
              color="#fff"
            />
          </View>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Your LifeLine account is ready.
      </Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        {"You're now connected to the nearest helpers. Feel safe, we've got you covered."}
      </Text>

      {/* Info Card */}
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <Ionicons
            name="shield-checkmark"
            size={hp('2.2%')}
            color="#2F80ED"
          />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Account Verified</Text>
          <Text style={styles.cardDesc}>
            Your identity and medical ID have been securely encrypted and stored.
          </Text>
        </View>
      </View>

      {/* Primary CTA */}
      <TouchableOpacity style={styles.primaryBtn} onPress={handleGoHome}>
        <Text style={styles.primaryText}>Go to Home</Text>
      </TouchableOpacity>

      {/* Secondary CTA */}
      <TouchableOpacity style={styles.secondaryBtn} onPress={handleViewSafetyTips}>
        <Ionicons
          name="bulb-outline"
          size={hp('2%')}
          color="#2F80ED"
        />
        <Text style={styles.secondaryText}>View Safety Tips</Text>
      </TouchableOpacity>
    </View>
  )
}

export default AccountReadyScreen



const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    justifyContent: 'center',
    backgroundColor: '#F7FAFF',
  },

  iconWrapper: {
    alignItems: 'center',
    marginBottom: hp('4%'),
  },

  iconOuter: {
    width: hp('12%'),
    height: hp('12%'),
    borderRadius: 100,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconInner: {
    width: hp('6%'),
    height: hp('6%'),
    borderRadius: 50,
    backgroundColor: '#2F80ED',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    textAlign: 'center',
    fontSize: hp('2.8%'),
    fontWeight: '800',
    color: '#0A2540',
    marginBottom: hp('1.5%'),
  },

  subtitle: {
    textAlign: 'center',
    fontSize: hp('1.8%'),
    color: '#5F6C7B',
    lineHeight: hp('2.6%'),
    marginBottom: hp('4%'),
  },

  card: {
    flexDirection: 'row',
    gap: wp('4%'),
    backgroundColor: '#fff',
    borderRadius: hp('2%'),
    padding: wp('5%'),
    elevation: 3,
    marginBottom: hp('4%'),
  },

  cardIcon: {
    width: hp('5%'),
    height: hp('5%'),
    borderRadius: hp('1.5%'),
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: hp('1.9%'),
    fontWeight: '700',
    color: '#0A2540',
    marginBottom: hp('0.4%'),
  },

  cardDesc: {
    fontSize: hp('1.6%'),
    color: '#5F6C7B',
    lineHeight: hp('2.3%'),
  },

  primaryBtn: {
    backgroundColor: '#0B5ED7',
    paddingVertical: hp('1.8%'),
    borderRadius: hp('1.2%'),
    alignItems: 'center',
    marginBottom: hp('2%'),
  },

  primaryText: {
    color: '#fff',
    fontSize: hp('2%'),
    fontWeight: '700',
  },

  secondaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: wp('2%'),
    paddingVertical: hp('1.5%'),
    borderRadius: hp('1.2%'),
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },

  secondaryText: {
    fontSize: hp('1.7%'),
    fontWeight: '600',
    color: '#2F80ED',
  },
})
