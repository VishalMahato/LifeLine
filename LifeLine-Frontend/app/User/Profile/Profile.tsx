import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { router } from 'expo-router'
import React from 'react'
import {
  Image,
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

type ProfileItem = {
  icon: string
  title: string
  subtitle?: string
  onPress?: () => void
}

type ItemCardProps = {
  item: ProfileItem
}

function ItemCard({ item }: ItemCardProps) {
  return (
    <TouchableOpacity style={styles.item} onPress={item.onPress}>
      <View style={styles.itemLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={item.icon as any} size={hp('2.2%')} color="#1E73E8" />
        </View>

        <View>
          <Text style={styles.itemTitle}>{item.title}</Text>
          {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
        </View>
      </View>

      <Ionicons name="chevron-forward" size={hp('2.2%')} color="#9CA3AF" />
    </TouchableOpacity>
  )
}

export default function Profile() {
  const navigation = useNavigation<any>()

  const personalInfoItems: ProfileItem[] = [
    {
      icon: 'person',
      title: 'Account Details',
      onPress: () => navigation.navigate('AccountDetails'),
    },
    { icon: 'location', title: 'Saved Addresses' },
  ]

  const safetyItems: ProfileItem[] = [
    {
      icon: 'medkit',
      title: 'Medical Profile',
      onPress: () =>
        router.push({
          pathname: '/(global)/MedicalProfile/[medical_Id]',
          params: { medical_Id: '25' },
        }),
    },
    { icon: 'people', title: 'Emergency Contacts' },
  ]

  const activityItems: ProfileItem[] = [
    {
      icon: 'time',
      title: 'Emergency History',
      subtitle: '2 active alerts last month',
    },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/200?img=32' }}
            style={styles.avatar}
          />
          <View style={styles.verifiedIcon}>
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        </View>

        <Text style={styles.name}>Alex Johnson</Text>
        <Text style={styles.phone}>+1 555-0123</Text>

        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={hp('1.8%')} color="#1E73E8" />
          <Text style={styles.verifiedText}>Verified Identity</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>
      {personalInfoItems.map((item) => (
        <ItemCard key={item.title} item={item} />
      ))}

      <Text style={styles.sectionTitle}>SAFETY & HEALTH</Text>
      {safetyItems.map((item) => (
        <ItemCard key={item.title} item={item} />
      ))}

      <Text style={styles.sectionTitle}>ACTIVITY</Text>
      {activityItems.map((item) => (
        <ItemCard key={item.title} item={item} />
      ))}

      <TouchableOpacity style={styles.signOut}>
        <Ionicons name="log-out-outline" size={20} color="#9CA3AF" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>LifeLine v2.4.1 (Build 890)</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: hp('4%'),
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: hp('12%'),
    height: hp('12%'),
    borderRadius: 100,
  },
  verifiedIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E73E8',
    width: hp('3%'),
    height: hp('3%'),
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: hp('2.4%'),
    fontWeight: '800',
    marginTop: hp('1.5%'),
  },
  phone: {
    fontSize: hp('1.7%'),
    color: '#6B7280',
    marginBottom: hp('1%'),
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('2%'),
    backgroundColor: '#E0F2FE',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('0.6%'),
    borderRadius: 20,
  },
  verifiedText: {
    color: '#1E73E8',
    fontWeight: '600',
    fontSize: hp('1.4%'),
  },
  sectionTitle: {
    marginTop: hp('3%'),
    marginBottom: hp('1%'),
    paddingHorizontal: wp('6%'),
    fontSize: hp('1.3%'),
    fontWeight: '700',
    color: '#9CA3AF',
  },
  item: {
    backgroundColor: '#fff',
    marginHorizontal: wp('4%'),
    padding: wp('4%'),
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
    elevation: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp('3%'),
  },
  iconBox: {
    width: hp('5%'),
    height: hp('5%'),
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: hp('1.4%'),
    color: '#6B7280',
  },
  signOut: {
    marginTop: hp('4%'),
    alignItems: 'center',
    gap: wp('2%'),
  },
  signOutText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: hp('1.2%'),
    color: '#D1D5DB',
    marginTop: hp('2%'),
    marginBottom: hp('4%'),
  },
})
