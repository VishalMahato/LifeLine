import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from '@expo/vector-icons/Ionicons'

const helpers = [
  {
    id: '1',
    name: 'Dr. Sarah K.',
    role: 'Cardiologist',
    distance: '0.2 miles',
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '2',
    name: 'Mike Johnson',
    role: 'EMT',
    distance: '0.4 miles',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '3',
    name: 'Dr. Emily R.',
    role: 'General Physician',
    distance: '0.6 miles',
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
  },
]

const VerifiedHelpersSection = () => {
  const isLargeScreen = wp("100%") >= 768;

  const renderItem = ({ item }: any) => (
    <View style={[styles.card, isLargeScreen && styles.cardLarge]}>
      <Image source={{ uri: item.image }} style={[styles.avatar, isLargeScreen && styles.avatarLarge]} />

      {/* Verified Badge */}
      <View style={styles.verifyBadge}>
        <Ionicons name="checkmark-circle" size={isLargeScreen ? hp('2.5%') : hp('2%')} color="#2F80ED" />
      </View>

      <Text style={[styles.name, isLargeScreen && styles.nameLarge]}>{item.name}</Text>
      <Text style={[styles.role, isLargeScreen && styles.roleLarge]}>{item.role}</Text>

      <View style={styles.distanceRow}>
        <Ionicons
          name="location"
          size={isLargeScreen ? hp('2%') : hp('1.6%')}
          color="#27AE60"
        />
        <Text style={[styles.distance, isLargeScreen && styles.distanceLarge]}>{item.distance}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, isLargeScreen && styles.titleLarge]}>Verified Helpers</Text>
        <TouchableOpacity>
          <Text style={[styles.viewAll, isLargeScreen && styles.viewAllLarge]}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Slider */}
      <FlatList
        data={helpers}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: wp('6%') }}
      />
    </View>
  )
}

export default VerifiedHelpersSection


const styles = StyleSheet.create({
  container: {
    paddingLeft: wp('6%'),
    paddingVertical: hp('4%'),
    backgroundColor: '#fff',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: wp('6%'),
    marginBottom: hp('3%'),
  },

  title: {
    fontSize: hp('2.6%'),
    fontWeight: '800',
    color: '#0A2540',
  },

  titleLarge: {
    fontSize: hp('3.2%'),
  },

  viewAll: {
    fontSize: hp('1.7%'),
    fontWeight: '600',
    color: '#2F80ED',
  },

  viewAllLarge: {
    fontSize: hp('2%'),
  },

  card: {
    width: wp('55%'),
    backgroundColor: '#fff',
    borderRadius: hp('2%'),
    padding: wp('5%'),
    marginRight: wp('4%'),
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },

  cardLarge: {
    width: wp('30%'),
    padding: wp('6%'),
    borderRadius: hp('2.5%'),
  },

  avatar: {
    width: hp('8%'),
    height: hp('8%'),
    borderRadius: 100,
    marginBottom: hp('1%'),
  },

  avatarLarge: {
    width: hp('10%'),
    height: hp('10%'),
  },

  verifyBadge: {
    position: 'absolute',
    top: hp('5.5%'),
    right: wp('20%'),
    backgroundColor: '#fff',
    borderRadius: 50,
  },

  name: {
    fontSize: hp('1.9%'),
    fontWeight: '700',
    color: '#0A2540',
  },

  nameLarge: {
    fontSize: hp('2.2%'),
  },

  role: {
    fontSize: hp('1.6%'),
    color: '#5F6C7B',
    marginBottom: hp('0.8%'),
  },

  roleLarge: {
    fontSize: hp('1.8%'),
  },

  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('1%'),
  },

  distance: {
    fontSize: hp('1.5%'),
    color: '#27AE60',
    fontWeight: '600',
  },

  distanceLarge: {
    fontSize: hp('1.7%'),
  },
})
