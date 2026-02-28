import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import React, { useMemo, useState } from 'react'
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

type RequestTab = 'All' | 'Helpers' | 'NGOs'
type SupportType = 'helper' | 'ngo'

type SupportItem = {
  id: string
  name: string
  role: string
  distance: string
  rating?: string
  availability?: string
  badge: string
  badgeColor: string
  badgeTextColor: string
  type: SupportType
}

const SUPPORT_DATA: SupportItem[] = [
  {
    id: '1',
    name: 'Dr. Sarah Smith',
    role: 'General Physician',
    distance: '450m away',
    rating: '4.8',
    badge: 'FREE SERVICE',
    badgeColor: '#DCFCE7',
    badgeTextColor: '#16A34A',
    type: 'helper',
  },
  {
    id: '2',
    name: 'SafeHaven NGO',
    role: 'Women Safety and Shelter',
    distance: '1.2km away',
    availability: '24/7 Available',
    badge: 'CERTIFIED',
    badgeColor: '#DBEAFE',
    badgeTextColor: '#2563EB',
    type: 'ngo',
  },
  {
    id: '3',
    name: 'James Wilson',
    role: 'Certified Nurse',
    distance: '850m away',
    rating: '4.9',
    badge: 'PAID SERVICE',
    badgeColor: '#F3F4F6',
    badgeTextColor: '#6B7280',
    type: 'helper',
  },
  {
    id: '4',
    name: 'Red Cross Local',
    role: 'Emergency Medical',
    distance: '2.5km away',
    badge: 'NGO',
    badgeColor: '#FEE2E2',
    badgeTextColor: '#EF4444',
    type: 'ngo',
  },
]

export default function RequestHelpScreen() {
  const navigation = useNavigation<any>()
  const [activeTab, setActiveTab] = useState<RequestTab>('All')

  const filteredData = useMemo(() => {
    if (activeTab === 'All') {
      return SUPPORT_DATA
    }

    return SUPPORT_DATA.filter((item) => {
      if (activeTab === 'Helpers') {
        return item.type === 'helper'
      }

      return item.type === 'ngo'
    })
  }, [activeTab])

  const openProfile = (item: SupportItem) => {
    if (item.type === 'helper') {
      navigation.navigate('HelperProfile', { helperId: item.id })
      return
    }

    navigation.navigate('NgoProfile', { ngoId: item.id })
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Request Help</Text>

      <Text style={styles.subtitle}>
        Choose a verified medical professional or trusted organization near your
        location to receive immediate assistance.
      </Text>

      <View style={styles.tabs}>
        {(['All', 'Helpers', 'NGOs'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredData.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Image
              source={{ uri: `https://i.pravatar.cc/150?img=${item.id}` }}
              style={styles.avatar}
            />

            <View style={styles.cardBody}>
              <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name}</Text>

                <View style={[styles.badge, { backgroundColor: item.badgeColor }]}>
                  <Text style={[styles.badgeText, { color: item.badgeTextColor }]}>
                    {item.badge}
                  </Text>
                </View>
              </View>

              <Text style={styles.role}>{item.role}</Text>

              <View style={styles.metaRow}>
                <View style={styles.greenDot} />
                <Text style={styles.metaText}>{item.distance}</Text>

                {item.rating ? (
                  <>
                    <Ionicons
                      name="star"
                      size={hp('1.8%')}
                      color="#F59E0B"
                      style={styles.ratingIcon}
                    />
                    <Text style={styles.metaText}>{item.rating}</Text>
                  </>
                ) : null}

                {item.availability ? (
                  <Text style={styles.availabilityText}>• {item.availability}</Text>
                ) : null}
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.profileBtn} onPress={() => openProfile(item)}>
            <Text style={styles.profileBtnText}>View Profile</Text>
          </TouchableOpacity>
        </View>
      ))}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: hp('8.5%'),
    backgroundColor: '#F3F4F6',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('5.2%'),
    paddingBottom: hp('8%'),
  },
  title: {
    fontSize: hp('2.6%'),
    fontWeight: '800',
    color: '#111827',
    marginBottom: hp('1%'),
  },
  subtitle: {
    fontSize: hp('1.6%'),
    color: '#6B7280',
    marginTop: hp('1%'),
    marginBottom: hp('3%'),
    lineHeight: hp('2.5%'),
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: hp('1.5%'),
    marginBottom: hp('3%'),
    padding: hp('0.5%'),
  },
  tab: {
    flex: 1,
    paddingVertical: hp('1.5%'),
    alignItems: 'center',
    borderRadius: hp('1.2%'),
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.2%') },
    shadowOpacity: 0.1,
    shadowRadius: hp('0.5%'),
    elevation: 2,
  },
  tabText: {
    fontWeight: '600',
    color: '#6B7280',
    fontSize: hp('1.6%'),
  },
  activeTabText: {
    color: '#2563EB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: hp('2.5%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.2%') },
    shadowOpacity: 0.1,
    shadowRadius: hp('0.5%'),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: hp('6%'),
    height: hp('6%'),
    borderRadius: hp('3%'),
    marginRight: wp('3%'),
  },
  cardBody: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('0.5%'),
  },
  name: {
    fontWeight: '700',
    fontSize: hp('1.8%'),
    color: '#111827',
    flex: 1,
  },
  role: {
    fontSize: hp('1.4%'),
    color: '#6B7280',
    marginTop: hp('0.5%'),
    marginBottom: hp('1%'),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: hp('1.3%'),
    color: '#6B7280',
    marginLeft: wp('1%'),
  },
  availabilityText: {
    fontSize: hp('1.3%'),
    color: '#6B7280',
    marginLeft: wp('2%'),
  },
  ratingIcon: {
    marginLeft: wp('2%'),
  },
  greenDot: {
    width: hp('1%'),
    height: hp('1%'),
    borderRadius: hp('0.5%'),
    backgroundColor: '#22C55E',
  },
  badge: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: hp('2%'),
    marginLeft: wp('2%'),
  },
  badgeText: {
    fontSize: hp('1.1%'),
    fontWeight: '700',
  },
  profileBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: hp('1.5%'),
    borderRadius: hp('1.5%'),
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  profileBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: hp('1.6%'),
  },
  bottomSpacer: {
    height: hp('6%'),
  },
})
