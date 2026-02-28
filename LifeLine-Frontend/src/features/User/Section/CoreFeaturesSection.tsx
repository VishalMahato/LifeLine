import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from '@expo/vector-icons/Ionicons'

const features = [
  {
    icon: 'flash',
    title: 'One-Tap SOS',
    desc: 'Instant activation without unlocking.',
  },
  {
    icon: 'navigate',
    title: 'Live Tracking',
    desc: 'Real-time location sharing.',
  },
  {
    icon: 'medical',
    title: 'Medical ID',
    desc: 'Share vital info automatically.',
  },
  {
    icon: 'shield-checkmark',
    title: 'Vetted Helpers',
    desc: 'Background checked professionals.',
  },
]

const CoreFeaturesSection = () => {
  const isLargeScreen = wp("100%") >= 768;
  const isExtraLargeScreen = wp("100%") >= 1024;

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={[styles.title, isLargeScreen && styles.titleLarge]}>Core Features</Text>

      {/* Grid */}
      <View style={[styles.grid, isExtraLargeScreen && styles.gridExtraLarge]}>
        {features.map((item, index) => (
          <View key={index} style={[styles.card, isLargeScreen && styles.cardLarge]}>
            <View style={styles.iconBox}>
              <Ionicons
                name={item.icon as any}
                size={isLargeScreen ? hp('3%') : hp('2.6%')}
                color="#2F80ED"
              />
            </View>

            <Text style={[styles.cardTitle, isLargeScreen && styles.cardTitleLarge]}>{item.title}</Text>
            <Text style={[styles.cardDesc, isLargeScreen && styles.cardDescLarge]}>{item.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default CoreFeaturesSection


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('5%'),
    marginTop: hp('8%'),
    backgroundColor: '#fff',
  },

  title: {
    fontSize: hp('2.8%'),
    fontWeight: '800',
    color: '#0A2540',
    marginBottom: hp('3%'),
  },

  titleLarge: {
    fontSize: hp('3.5%'),
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: hp('3%'),
  },

  gridExtraLarge: {
    justifyContent: 'center',
    gap: wp('2%'),
  },

  card: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: hp('2%'),
    padding: wp('5%'),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },

  cardLarge: {
    width: '22%',
    padding: wp('6%'),
    borderRadius: hp('2.5%'),
  },

  iconBox: {
    width: hp('5%'),
    height: hp('5%'),
    borderRadius: hp('1.5%'),
    backgroundColor: '#EAF4FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('1.8%'),
  },

  cardTitle: {
    fontSize: hp('1.9%'),
    fontWeight: '700',
    color: '#0A2540',
    marginBottom: hp('0.6%'),
  },

  cardTitleLarge: {
    fontSize: hp('2.2%'),
  },

  cardDesc: {
    fontSize: hp('1.6%'),
    color: '#5F6C7B',
    lineHeight: hp('2.3%'),
  },

  cardDescLarge: {
    fontSize: hp('1.8%'),
    lineHeight: hp('2.5%'),
  },
})
