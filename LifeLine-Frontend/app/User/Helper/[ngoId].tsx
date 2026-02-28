import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation, useRoute } from '@react-navigation/native'
import React from 'react'
import {
  Linking,
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

type NgoRecord = {
  name: string
  focus: string
  verified: string
  phone: string
  distance: string
  availability: string
  address: string
}

const NGOS: Record<string, NgoRecord> = {
  '2': {
    name: 'SafeHaven NGO',
    focus: 'Women Safety and Shelter',
    verified: 'Certified NGO Partner',
    phone: '+1 555-445-1010',
    distance: '1.2km away',
    availability: '24/7 Available',
    address: '220 Main Street, Downtown',
  },
  '4': {
    name: 'Red Cross Local',
    focus: 'Emergency Medical and Relief',
    verified: 'Registered Response Unit',
    phone: '+1 555-445-2020',
    distance: '2.5km away',
    availability: '24/7 Available',
    address: '18 River Road, Westside',
  },
}

export default function NgoProfileScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const ngoId = String(route.params?.ngoId ?? '2')
  const ngo = NGOS[ngoId] ?? NGOS['2']

  const dialNumber = () => Linking.openURL(`tel:${ngo.phone.replace(/\s+/g, '')}`)

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={hp('2.5%')} />
        </TouchableOpacity>
        <Text style={styles.title}>NGO Profile</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.card}>
        <Text style={styles.name}>{ngo.name}</Text>
        <Text style={styles.focus}>{ngo.focus}</Text>

        <View style={styles.badge}>
          <Ionicons name="shield-checkmark" size={16} color="#2563EB" />
          <Text style={styles.badgeText}>{ngo.verified}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <LabelValue label="Distance" value={ngo.distance} />
        <LabelValue label="Availability" value={ngo.availability} />
        <LabelValue label="Address" value={ngo.address} />
        <LabelValue label="Helpline" value={ngo.phone} />
      </View>

      <TouchableOpacity style={styles.actionBtn} onPress={dialNumber}>
        <Ionicons name="call" size={18} color="#fff" />
        <Text style={styles.actionText}>Call NGO Helpline</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function LabelValue({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('4%'),
    paddingBottom: hp('4%'),
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  title: {
    fontSize: hp('2.3%'),
    fontWeight: '700',
  },
  spacer: {
    width: hp('2.5%'),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: wp('5%'),
    marginBottom: hp('2%'),
  },
  name: {
    fontSize: hp('2.2%'),
    fontWeight: '800',
    color: '#111827',
  },
  focus: {
    fontSize: hp('1.5%'),
    color: '#4B5563',
    marginTop: hp('0.7%'),
  },
  badge: {
    marginTop: hp('1.5%'),
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    backgroundColor: '#DBEAFE',
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.7%'),
    borderRadius: 20,
  },
  badgeText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: hp('1.3%'),
  },
  field: {
    marginBottom: hp('1.8%'),
  },
  label: {
    fontSize: hp('1.3%'),
    color: '#9CA3AF',
    marginBottom: hp('0.4%'),
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  value: {
    fontSize: hp('1.7%'),
    color: '#111827',
    fontWeight: '600',
  },
  actionBtn: {
    marginTop: hp('1%'),
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: hp('1.7%'),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: wp('2%'),
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: hp('1.6%'),
  },
})
