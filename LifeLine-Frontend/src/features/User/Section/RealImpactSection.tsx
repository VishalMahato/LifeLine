import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'

const RealImpactSection = () => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Title */}
        <Text style={styles.title}>Real Impact</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>10k+</Text>
            <Text style={styles.statLabel}>Lives Saved</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statValue}>2m</Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
        </View>

        {/* Quote Divider */}
        <View style={styles.horizontalDivider} />

        {/* Testimonial */}
        <Text style={styles.quote}>
          “LifeLine saved my father’s life when he collapsed at the park.
          A nearby nurse arrived in 90 seconds.”
        </Text>
      </View>
    </View>
  )
}

export default RealImpactSection

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp('6%'),
    marginVertical: hp('4%'),
  },

  card: {
    backgroundColor: '#1976E8',
    borderRadius: hp('3%'),
    paddingVertical: hp('4%'),
    paddingHorizontal: wp('6%'),
  },

  title: {
    textAlign: 'center',
    fontSize: hp('2.4%'),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: hp('3%'),
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statValue: {
    fontSize: hp('3.2%'),
    fontWeight: '800',
    color: '#FFFFFF',
  },

  statLabel: {
    fontSize: hp('1.6%'),
    color: 'rgba(255,255,255,0.85)',
    marginTop: hp('0.5%'),
  },

  divider: {
    width: 1,
    height: hp('6%'),
    backgroundColor: 'rgba(255,255,255,0.4)',
  },

  horizontalDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: hp('3%'),
  },

  quote: {
    textAlign: 'center',
    fontSize: hp('1.6%'),
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.9)',
    lineHeight: hp('2.4%'),
  },
})
