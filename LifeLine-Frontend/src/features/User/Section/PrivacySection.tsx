import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from '@expo/vector-icons/Ionicons'

const PrivacySection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Icon */}
        <View style={styles.iconWrapper}>
          <Ionicons
            name="lock-closed"
            size={hp('3%')}
            color="#2F80ED"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Bank-Grade Privacy</Text>

        {/* Description */}
        <Text style={styles.description}>
          Your location is only shared during active emergencies. All data
          is end-to-end encrypted and HIPAA compliant.
        </Text>

        {/* Badges */}
        <View style={styles.badgesRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>HIPAA</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>GDPR</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>AES-256</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default PrivacySection

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('6%'),
    marginVertical: hp('4%'),
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: hp('2.5%'),
    paddingVertical: hp('4%'),
    paddingHorizontal: wp('6%'),
    alignItems: 'center',
    elevation: 3,
  },

  iconWrapper: {
    width: hp('6%'),
    height: hp('6%'),
    borderRadius: 50,
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },

  title: {
    fontSize: hp('2.2%'),
    fontWeight: '700',
    color: '#0A2540',
    marginBottom: hp('1.2%'),
  },

  description: {
    textAlign: 'center',
    fontSize: hp('1.7%'),
    color: '#5F6C7B',
    lineHeight: hp('2.5%'),
    marginBottom: hp('3%'),
  },

  badgesRow: {
    flexDirection: 'row',
    gap: wp('3%'),
  },

  badge: {
    borderWidth: 1,
    borderColor: '#E0E6ED',
    borderRadius: hp('1%'),
    paddingVertical: hp('0.6%'),
    paddingHorizontal: wp('4%'),
    backgroundColor: '#FAFAFA',
  },

  badgeText: {
    fontSize: hp('1.4%'),
    fontWeight: '700',
    color: '#5F6C7B',
    letterSpacing: 0.5,
  },
})
