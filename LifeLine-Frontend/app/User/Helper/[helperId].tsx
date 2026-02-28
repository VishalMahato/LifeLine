import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation, useRoute } from '@react-navigation/native'
import React from 'react'
import {
  Image,
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

type HelperRecord = {
  name: string
  specialization: string
  rating: number
  reviews: number
  assists: string
  avgResponse: string
  success: string
  serviceStatus: string
  availability: string
  locationLabel: string
  skills: string[]
}

const HELPERS: Record<string, HelperRecord> = {
  '1': {
    name: 'Dr. Sarah Jenkins',
    specialization: 'Certified Paramedic and Trauma Specialist',
    rating: 4.9,
    reviews: 124,
    assists: '450+',
    avgResponse: '8 min',
    success: '100%',
    serviceStatus: 'Professional Volunteer',
    availability: 'Mon-Fri, 08:00 - 20:00 (On-call)',
    locationLabel: '37.7749,-122.4194',
    skills: ['CPR Certified', 'Trauma Care', 'First Aid', 'ACLS', 'Emergency Response'],
  },
  '3': {
    name: 'James Wilson',
    specialization: 'Certified Nurse and Emergency Responder',
    rating: 4.9,
    reviews: 98,
    assists: '320+',
    avgResponse: '11 min',
    success: '98%',
    serviceStatus: 'Paid Service',
    availability: 'Daily, 07:00 - 22:00',
    locationLabel: '37.7799,-122.4149',
    skills: ['Nursing Care', 'First Aid', 'Vitals Monitoring', 'Emergency Response'],
  },
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )
}

function ServiceItem({
  icon,
  title,
  subtitle,
  rightLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap
  title: string
  subtitle: string
  rightLabel?: string
}) {
  return (
    <View style={styles.serviceRow}>
      <View style={styles.serviceLeft}>
        <View style={styles.serviceIcon}>
          <Ionicons name={icon} size={hp('2%')} color="#22C55E" />
        </View>
        <View>
          <Text style={styles.serviceTitle}>{title}</Text>
          <Text style={styles.serviceSubtitle}>{subtitle}</Text>
        </View>
      </View>

      {rightLabel ? (
        <View style={styles.freeBadge}>
          <Text style={styles.freeText}>{rightLabel}</Text>
        </View>
      ) : null}
    </View>
  )
}

export default function HelperProfileScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const helperId = String(route.params?.helperId ?? '1')
  const helper = HELPERS[helperId] ?? HELPERS['1']

  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${helper.locationLabel}`

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={hp('2.5%')} />
          </TouchableOpacity>

          <Text style={styles.navTitle}>Helper Profile</Text>

          <TouchableOpacity onPress={() => Linking.openURL(mapUrl)}>
            <Ionicons name="share-social-outline" size={hp('2.5%')} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: `https://i.pravatar.cc/200?img=${helperId}` }} style={styles.avatar} />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          </View>

          <Text style={styles.name}>{helper.name}</Text>
          <Text style={styles.specialization}>{helper.specialization}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {helper.rating} ({helper.reviews} reviews)
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatItem label="ASSISTS" value={helper.assists} />
          <StatItem label="AVG. RESP" value={helper.avgResponse} />
          <StatItem label="SUCCESS" value={helper.success} />
        </View>

        <Text style={styles.sectionTitle}>SERVICE DETAILS</Text>
        <View style={styles.card}>
          <ServiceItem
            icon="leaf"
            title="Service Status"
            subtitle={helper.serviceStatus}
            rightLabel={helper.serviceStatus === 'Professional Volunteer' ? 'FREE' : undefined}
          />

          <View style={styles.divider} />

          <ServiceItem icon="time" title="Availability" subtitle={helper.availability} />
        </View>

        <Text style={styles.sectionTitle}>EXPERTISE AND SKILLS</Text>
        <View style={styles.skillsContainer}>
          {helper.skills.map((skill) => (
            <View key={skill} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>LOCATION DETAILS</Text>
        <View style={styles.locationCard}>
          <Image
            source={{
              uri: `https://staticmap.openstreetmap.de/staticmap.php?center=${helper.locationLabel}&zoom=13&size=600x300`,
            }}
            style={styles.map}
          />

          <View style={styles.locationBottom}>
            <View>
              <Text style={styles.locationTitle}>Current Location</Text>
              <Text style={styles.locationSubtitle}>Approx. 2.5 miles from your location</Text>
            </View>

            <TouchableOpacity onPress={() => Linking.openURL(mapUrl)}>
              <Text style={styles.openMaps}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.rejectBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.rejectText}>Reject Help</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.acceptBtn}>
          <Text style={styles.acceptText}>Accept Help</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('3%'),
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  navTitle: {
    fontWeight: '700',
    fontSize: hp('2%'),
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: hp('12%'),
    height: hp('12%'),
    borderRadius: 100,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#2563EB',
    width: 22,
    height: 22,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: hp('2.4%'),
    fontWeight: '800',
    marginTop: hp('1%'),
  },
  specialization: {
    fontSize: hp('1.5%'),
    color: '#6B7280',
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  ratingText: {
    marginLeft: 5,
    fontSize: hp('1.5%'),
    color: '#374151',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp('3%'),
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontWeight: '800',
    fontSize: hp('2%'),
    color: '#2563EB',
  },
  statLabel: {
    fontSize: hp('1.2%'),
    color: '#9CA3AF',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: hp('1.4%'),
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: hp('1%'),
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: wp('4%'),
    marginBottom: hp('3%'),
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: wp('3%'),
  },
  serviceIcon: {
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 12,
    marginRight: wp('3%'),
  },
  serviceTitle: {
    fontWeight: '600',
  },
  serviceSubtitle: {
    fontSize: hp('1.3%'),
    color: '#6B7280',
  },
  freeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  freeText: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: hp('1.2%'),
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: hp('2%'),
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: hp('3%'),
  },
  skillChip: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: hp('1.3%'),
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: hp('3%'),
  },
  map: {
    width: '100%',
    height: hp('18%'),
  },
  locationBottom: {
    padding: wp('4%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationTitle: {
    fontWeight: '600',
  },
  locationSubtitle: {
    fontSize: hp('1.3%'),
    color: '#6B7280',
  },
  openMaps: {
    color: '#2563EB',
    fontWeight: '600',
  },
  bottomPadding: {
    height: hp('12%'),
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: wp('5%'),
    backgroundColor: '#fff',
  },
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: hp('1.8%'),
    borderRadius: 14,
    alignItems: 'center',
    marginRight: 10,
  },
  rejectText: {
    color: '#EF4444',
    fontWeight: '700',
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: hp('1.8%'),
    borderRadius: 14,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontWeight: '700',
  },
})
