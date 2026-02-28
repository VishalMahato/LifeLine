import React, { useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from '@expo/vector-icons/Ionicons'

const Dashboard = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const holdTimeout = useRef<number | null>(null)

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start()

    holdTimeout.current = setTimeout(() => {
      Alert.alert('SOS Activated', 'Emergency signal sent!')
    }, 1500) // 1.5s hold
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start()

    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Safety Status</Text>
          <View style={styles.locationRow}>
            <Ionicons
              name="location"
              size={hp('1.8%')}
              color="#2F80ED"
            />
            <Text style={styles.locationText}>
              221B Baker St, London
            </Text>
          </View>
        </View>

        <View style={styles.gpsBadge}>
          <View style={styles.gpsDot} />
          <Text style={styles.gpsText}>GPS ACTIVE</Text>
        </View>
      </View>

      {/* SOS Button */}
      <View style={styles.sosWrapper}>
        <Animated.View
          style={[
            styles.sosButton,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.sosTouchable}
          >
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSub}>PRESS & HOLD</Text>
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.sosInfo}>
          Connecting to local emergency dispatch and nearby verified responders
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons
            name="people"
            size={hp('2.4%')}
            color="#2F80ED"
          />
          <Text style={styles.statValue}>14</Text>
          <Text style={styles.statLabel}>VERIFIED HELPERS</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons
            name="leaf"
            size={hp('2.4%')}
            color="#2F80ED"
          />
          <Text style={styles.statValue}>3</Text>
          <Text style={styles.statLabel}>ACTIVE NGOS</Text>
        </View>
      </View>

      {/* AI Assistant */}
      <TouchableOpacity style={styles.aiCard}>
        <View style={styles.aiLeft}>
          <Ionicons
            name="sparkles"
            size={hp('2.5%')}
            color="#fff"
          />
          <View>
            <Text style={styles.aiTitle}>LifeLine AI Assistant</Text>
            <Text style={styles.aiSub}>
              {'"I smell gas" or "Help with injury"'}
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={hp('2.5%')}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  )
}

export default Dashboard;                        

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp('6%'),
    paddingTop: hp('4%'),
    backgroundColor: '#F8FAFC',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: {
    fontSize: hp('2.4%'),
    fontWeight: '800',
    color: '#0A2540',
  },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    marginTop: hp('0.5%'),
  },

  locationText: {
    fontSize: hp('1.6%'),
    color: '#5F6C7B',
  },

  gpsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9F7EF',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.6%'),
    borderRadius: 20,
  },

  gpsDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: '#27AE60',
    marginRight: 6,
  },

  gpsText: {
    fontSize: hp('1.2%'),
    fontWeight: '700',
    color: '#27AE60',
  },

  sosWrapper: {
    alignItems: 'center',
    marginVertical: hp('4%'),
  },

  sosButton: {
    width: hp('22%'),
    height: hp('22%'),
    borderRadius: 200,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },

  sosTouchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  sosText: {
    fontSize: hp('4%'),
    fontWeight: '800',
    color: '#fff',
  },

  sosSub: {
    fontSize: hp('1.6%'),
    letterSpacing: 1,
    color: '#fff',
  },

  sosInfo: {
    textAlign: 'center',
    fontSize: hp('1.6%'),
    color: '#8A94A6',
    marginTop: hp('2%'),
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('3%'),
  },

  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: hp('2%'),
    paddingVertical: hp('3%'),
    alignItems: 'center',
    elevation: 3,
  },

  statValue: {
    fontSize: hp('3%'),
    fontWeight: '800',
    marginTop: hp('1%'),
  },

  statLabel: {
    fontSize: hp('1.2%'),
    color: '#8A94A6',
    marginTop: hp('0.5%'),
  },

  aiCard: {
    marginTop: hp('4%'),
    backgroundColor: '#1E73E8',
    borderRadius: hp('2%'),
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('5%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  aiLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('3%'),
  },

  aiTitle: {
    color: '#fff',
    fontWeight: '700',
  },

  aiSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: hp('1.4%'),
  },
})
